import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import classNames from 'classnames';
import net from 'net';
import { getItem, setItem ,delItem , initItem} from 'utils';
import { Toast } from 'antd-mobile';
import API_ROOT from 'apiRoot';

import List from './List';
import Edit from './Edit';

let Dom = document.body;
let AddrStatics = {};
AddrStatics = {
    addr(options){
        return new Promise((resolve, reject) => {
            const div = document.createElement('div');
            Dom.appendChild(div);
            options.show = true; // 展示;
            options.onChangeAddr= (res) => {
                ReactDOM.unmountComponentAtNode(div);//卸载组件
                Dom.removeChild(div);
                resolve(res);
                delete _global.APIS.addr;
            };
            options.onClose = () => {
                ReactDOM.unmountComponentAtNode(div);
                Dom.removeChild(div);
                reject();
                delete _global.APIS.addr;
            };
            /*异步请求数据，不放入redux*/
            let param = {};
            Toast.loading(null, 0);
            net.ajax({
                url: API_ROOT['_ADDR_GET_LIST'],
                type: 'GET',
                param,
                success: (res) => {
                    Toast.hide();
                    options.data = initItem(res);
                    _global.APIS.addr = div; //路由变化清理页面
                    return ReactDOM.render(<Addr {...options} />, div);
                },
                error: (res) => {
                    reject();
                    return !1;
                }
            });
        });
    },
    popup(options){
        if (typeof options === 'string') {
            options = {
                children: options
            };
        }
        options.popup = true;
        return AddrStatics.addr(options);
    }
};
class Addr extends React.Component {
    static popup = AddrStatics.popup; //API：形式创建节点；Component：不使用则可以使用组件方式

    constructor(props,context) {
        super(props);
        this.handleType = this.handleType.bind(this);
    }
    componentWillMount(){
        const {showType} = this.props;
        this.state ={
            id:null,
            showType
        };
    }
    componentWillUnmount () {
        console.info('卸载组件');
    }
    handleType(event){
        const $this = event.target;
        const showType = Number($this.getAttribute('data-type'));
        const id = $this.getAttribute('data-id')||null;
        this.setState({
            id:id,
            showType
        });
    }
    render() {
        const {
            show,
            data,
            selectId,
            onClose,
            onChangeAddr
        } = this.props;
        const {
            itemArr,
            itemObj
        } = data;
        if (!show) {
            return null;
        }
        switch (this.state.showType) {
            case 0://列表页
                return (
                    <List onClose = {onClose}
                      itemArr = {itemArr}
                      itemObj = {itemObj}
                      selectId = {selectId}
                      onType = {this.handleType}
                      onChangeAddr = {onChangeAddr}
                    />
                );
            default://编辑地址 //新建地址
                return (
                    <Edit   onClose = {onClose} 
                            onType = {this.handleType}
                            onChangeAddr = {onChangeAddr}
                            selectId = {selectId}
                            itemData = {itemObj[this.state.id]||{}}
                    />
                );
        }
    }
}

Addr.propTypes = {

};

export default Addr;