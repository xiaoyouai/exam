import Vue from 'vue'
import Router from 'vue-router'

// 学生
import slogin from './../exam/student/slogin'
import smsgCenter from './../exam/student/smsgCenter'
import sregister from './../exam/student/sregister'
import sexamCenter from './../exam/student/sexamCenter'
import sdoExam from './../exam/student/sdoExam'


// 老师
import tlogin from './../exam/teacher/tlogin'
import tmain from './../exam/teacher/tmain'
import tregister from './../exam/teacher/tregister'

import tmypaper from './../exam/teacher/main/tmypaper'
import tscoring from './../exam/teacher/main/tscoring'
import tgardeMan from './../exam/teacher/main/tgardeMan'
import tmodifyMsg from './../exam/teacher/main/tmodifyMsg'
import tquestionHub from './../exam/teacher/main/tquestionHub'
import tcomQuestionHub from './../exam/teacher/main/tcomQuestionHub'
import taddPaper from './../exam/teacher/main/taddPaper'




Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
        // 学生
        {
            path: '/',
            name: 'slogin',
            component: slogin
        }, {
            path: '/sregister',
            name: 'sregister',
            component: sregister
        }, {
            path: '/sexamCenter',
            name: 'sexamCenter',
            component: sexamCenter
        }, {
            path: '/smsgCenter',
            name: 'smsgCenter',
            component: smsgCenter
        }, {
            path: '/sdoExam/:id', //进行考试
            name: 'sdoExam',
            component: sdoExam
        },



        // 教师
        {
            path: '/tlogin',
            name: 'tlogin',
            component: tlogin
        },
        {
            path: '/tregister',
            name: 'tregister',
            component: tregister
        }, {
            path: '/tmain',
            name: 'tmain',
            component: tmain,
            children: [{
                    path: 'tmypaper/:id',
                    name: 'tmypaper',
                    component: tmypaper
                }, {
                    path: 'tscoring/:id', //打分
                    name: 'tscoring',
                    component: tscoring
                }, {
                    path: 'tgardeMan/:id', //成绩管理
                    name: 'tgardeMan',
                    component: tgardeMan
                }, {
                    path: 'tmodifyMsg/:id',
                    name: 'tmodifyMsg',
                    component: tmodifyMsg
                }, {
                    path: 'tquestionHub/:id', //我的题库
                    name: 'tquestionHub',
                    component: tquestionHub
                }, {
                    path: 'tcomQuestionHub/:id', //公共题库
                    name: 'tcomQuestionHub',
                    component: tcomQuestionHub
                }, {
                    path: 'taddPaper/:paperId/:id', //添加试卷,paperId为-1表示添加试卷
                    name: 'taddPaper',
                    component: taddPaper
                },

            ]
        }
    ]
})