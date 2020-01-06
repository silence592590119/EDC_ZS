import axios from 'axios'; // 引入axios
//import QS from 'qs'; // 引入qs模块，用来序列化post类型的数据，后面会提到
import * as  Config from '../config/config'
import router from '../router/index'
import * as mUtils from '../utils/mUtils'

import { Loading,MessageBox } from 'element-ui';
//测试环境和正式环境服务地址配置
let baseURL = Config.default.baseURL; //测试版
//let baseURL = Config.default.productURL; //中山正式版
//let baseURL = Config.default.xianURL; //西安四院正式版
//let baseURL = Config.default.gongURL; // ..正式版 
let loadingInstance;
// 添加请求拦截器，在发送请求之前做些什么(**具体查看axios文档**)
axios.interceptors.request.use(function (config) {
  // 显示loading
  loadingInstance = Loading.service({ 
    fullscreen: true,
    background: 'rgba(0, 0, 0, 0.3)',
    spinner:'el-icon-loading',
    text:'拼命加载中...'
  });
  return config
}, function (error) {
  // 请求错误时弹框提示，或做些其他事
  return Promise.reject(error)
})
// 添加响应拦截器(**具体查看axios文档**)
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么，允许在数据返回客户端前，修改响应的数据
  // 如果只需要返回体中数据，则如下，如果需要全部，则 return response 即可
  if(response && response.status === 200){
    return response.data
  }
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error)
})
// 封装数据返回失败提示函数
function errorState (response) {
  // 隐藏loading
  loadingInstance.close();
  // 如果http状态码正常，则直接返回数据
  //console.log(response);
  if(response && response.status === 200){
    return response
  }else{
    showMessage('error',"服务器连接超时，请重新登陆！");
    return;
  }
}
// 封装数据返回成功提示函数
function successState (res) {
    // 隐藏loading
    loadingInstance.close();
    // 统一判断后端返回的错误码(错误码与后台协商而定)
    if (res.ServerCode == '200') {
        return res
    }else{
      if(res.ServerCode == '403' || res.ServerCode == '450'){
        showMessage('error',res.ServerMsg);
        return;
      }else{
          MessageBox.alert(res.ServerMsg, '温馨提示', {
            confirmButtonText: '确定',
            type:'error',
          });
      }
      return;
    }
}
function showMessage(type,message){
    MessageBox.alert(message, '温馨提示', {
      confirmButtonText: '确定',
      type:type,
      showClose:false,
      callback: action => {
        router.push('/');  
        mUtils.removeStore("token");
        mUtils.removeStore("userinfo");
        mUtils.removeStore("programinfo");
        mUtils.removeStore("programid");
      }
   });
}
// 封装axios
function apiAxios (method, url, params) {
  let httpDefault = {
    method: method,
    baseURL: baseURL,
    url: url,
    // `params` 是即将与请求一起发送的 URL 参数
    // `data` 是作为请求主体被发送的数据
    params: method === 'GET' || method === 'DELETE' ? params : null,
    data: method === 'POST' || method === 'PUT' ? params : null,
    // timeout: 10000,
  }
  if(!mUtils.isEmpty(mUtils.getStore("token"))){
    httpDefault.headers = {
      "Authorization":'Basic '+mUtils.getStore("token")    //请求头携带的token
    }
  }
  // 注意**Promise**使用(Promise首字母大写)
  return new Promise((resolve, reject) => {
    //此处的.then属于axios
    axios(httpDefault).then((res) => {
        successState(res)
        resolve(res)
    }).catch((response) => {
        errorState(response)
        reject(response)
    });
  });
}
// 输出函数getAxios、postAxios、putAxios、delectAxios，供其他文件调用
// Vue.js的插件应当有一个公开方法 install。这个方法的第一个参数是 Vue 构造器，第二个参数是一个可选的选项对象。
export default {
  install: function (Vue) {
    Vue.prototype.getAxios = (url, params) => apiAxios('GET', url, params)
    Vue.prototype.postAxios = (url, params) => apiAxios('POST', url, params)
    Vue.prototype.putAxios = (url, params) => apiAxios('PUT', url, params)
    Vue.prototype.delectAxios = (url, params) => apiAxios('DELECT', url, params)
  }
}