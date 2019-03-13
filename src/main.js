// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

import ElementUI from 'element-ui' // 加载ElementUI
import 'element-ui/lib/theme-chalk/index.css'

import VueLazyLoad from 'vue-lazyload'
import axios from 'axios'
import '../static/font-awesome/css/font-awesome.min.css' // 加载fontawesome字体
import './common/comm.css'
import * as commonFun from './common/commonFun'

Vue.use(ElementUI) // 全局使用elementUI
Vue.use(VueLazyLoad, { // 全局使用图片懒加载
    loading: 'static/loading-svg/loading-bars.svg',
    try: 1 // default 1
})

//过滤器，获得形如A、12形式
Vue.filter("paperSelection", function([value, index]) {
    if (!value) return ''
    return (index + 10).toString(36).toUpperCase() + '、' + value.toString();
})

// 深度拷贝
var deepCopy = function(p, c) {
    var c = c || {};
    for (var i in p) {
        if (typeof p[i] === 'object') {
            c[i] = (p[i].constructor === Array) ? [] : {};
            deepCopy(p[i], c[i]);
        } else {
            c[i] = p[i];
        }
    }
    return c;
}
Vue.prototype.$deepCopy = deepCopy;


Vue.prototype.$axios = axios; //设置全局使用axios方法，不然的话每个组件都要引入axios

Vue.prototype.$mySessionStorage = commonFun.mySessionStorage;
let getUserData = function() { //获取用户信息
    let sessionData = commonFun.mySessionStorage.get('currentUser', 'json') || {};
    return {
        userName: sessionData.userName,
        userId: sessionData.userId,
        grade: sessionData.grade,
        class: sessionData.class
    }
}
Vue.prototype.$getUserData = getUserData;

//登陆判断
router.beforeEach((to, from, next) => {
    let userdata = getUserData();
    if (to.path != '/' && to.path != '/404' && to.path != '/slogin' && to.path != '/sregister' && to.path != '/tlogin' && to.path != '/tregister') {
        if (!userdata.userName) {
            ElementUI.Message.error('抱歉，您还没有登录！');
            if (to.path.indexOf('s') > 0) {
                router.push({ path: '/' });
            } else {
                router.push({ path: '/tlogin' });
            }
        } else {
            next();
        }
    } else {
        next();
    }
})

Vue.config.productionTip = false



/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>'
})