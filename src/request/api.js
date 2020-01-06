export default {
    language:'CN',//公共参数  语言类型
    getDict:'/DictDetail/GetDictList',//获取字典数据
    getAllDict:'/DictDetail/GetAllDictionary',//获取元素页面级联数据
    login:'/Login/CollectionLogin',//登录接口
    getProgramList:'/Program/GetCollectProList', //项目列表
    SignOut:'/Login/QuitSystem', //退出登录
    enterProgram:'/Program/EnterProgram',//进入项目
    patiList:'/Patient/GetCollectPatiPage',//受检者列表
    followlist:'/Follow/GetCollectFollowList',//随访记录列表
    segmentlist:'/Follow/GetPatientCheckItemData',//获取段落列表
    followData:'/Follow/GetCheckItemFollowData',
    savefollow:'/Follow/SaveCollectFormData',
    getDock:'/CheckItem/GetDictSysLevelList',//获取对接系统检查项
    getAiReport:'/Follow/GetAiReport',//获取AI报告数据
}