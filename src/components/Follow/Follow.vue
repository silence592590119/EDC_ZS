<template>
  <div class="fillcontain" :style="{ height: bodyHeight + 'px' }">
    <HeadTop :msgFather="topTitle"></HeadTop>
    <dialog-bar
      :collectData="collectData"
      v-model="sendVal"
      title="采集数据列表"
      :content=this.dockHtml
      v-on:cancel="clickCancel()"
      @confirm="clickConfirm($event)"
    ></dialog-bar>
    <dialogCollect 
      :barData="barData"
      :barCode="barCode"
      v-model="barVal"
      title="采集数据列表"
      :content=this.barHtml
      v-on:cancel="clickBarCancel()"
      @confirm="clickBarConfirm($event)"
    ></dialogCollect>
    <div class="detail_box">
      <div class="table_container">
        <div class="title">{{FollowNumName}} - {{FormName}}</div>
        <div class="basicInfo">
          <div class="segmentSatus">
            <span>真实姓名：{{list.Name}}</span>
            <span class="span">已提交（ <span>{{CompleteNum}}</span> ）</span>
            <span class="span">已保存（ <span>{{PreservedNum}}</span> ）</span>
            <span class="span">未完成（ <span>{{UnfinishedNum}}</span> ）</span>
          </div>
        </div>
        <div class="tips">
          <div class="spanlist">
            <span v-for="(list,index) in semgentList"
              class="seach-all" :class="{seachchange:changeblue==index}"
              @click="changeColor(index,list)" :key="index">{{list | markSegmentName}}</span>
          </div>
        </div>
        <div class="divider"></div>
        <div class="followContent"></div>
      </div>
    </div>
    <div class="btn_list">
      <el-button type="primary" @click="saveHandle()">保存</el-button>
      <el-button type="success" @click="referhandle()">提交</el-button>
    </div>
  </div>
</template>
<script>
import jQuery from 'jquery';
import Viewer from 'viewerjs';
import datePicker from 'vue-ios-datepicker';
import 'viewerjs/dist/viewer.css';
import HeadTop from "../common/HeadTop3";
import dialogBar from "../common/dialog.vue";
import dialogCollect from "../common/dialog1.vue";
import Bus from '../../config/eventBus';
import * as mUtils from "../../utils/mUtils";
import * as setting from "../../utils/publicConfig";
import * as Api from "../../request/api";
import '../../../static/js/chosen.jquery';
let Base64 = require("js-base64").Base64;
export default {
  name: "",
  data() {
    return {
      bodyHeight: "",
      followdata: {}, //随访信息
      FollowNumName: "", //随访次数
      FormName: "", //表单名称
      list: {}, //受试者基本信息
      params: [], //段落信息
      myHtml: "",
      semgentList: [], //段落列表信息
      segmentId: "", //第一个段落的ID
      displayMode: "", //页面模式
      dictionaryData: {},
      changeblue: 0,
      status: "",
      disabled: false,
      topTitle: "",
      segNum: "",
      UnfinishedNum: 0,
      PreservedNum: 0,
      CompleteNum: 0,
      dockData: {},
      sendVal: false,
      dockHtml:"",
      collectData:"",
      barVal:false,
      barHtml:'',
      barData:'',
      barCode:'',
      laydate: window.laydate
    };
  },
  components: {
    HeadTop,
    dialogBar,
    dialogCollect
  },
  created() {
    //组件创建时，调用数据
    let that = this;
    that.followdata = mUtils.getStore("followData");
    that.FollowNumName = that.followdata.FollowNumName;
    that.FormName = that.followdata.FormName;
    that.topTitle = that.followdata.FollowTimes == 0 ? "基线表单" : "随访表单";
    that.list = mUtils.getStore("patientinfo");
    that.getDock();
  },
  mounted() {
    //组件挂载时，执行
    var that = this;
    that.bodyHeight = document.documentElement.clientHeight;
    that.getSegmentList().then(()=>{
      that.elementDictData().then(() => {
        let childData = that.dictionaryData;
        that.dictionaryData = that.dictionaryData;
        if (that.semgentList.length > 0) {
          that.getFormHtml();
        } else {
          that.showMessage("error", "当前表单无可用段落！");
        }
      });
    });
  },
  methods: {
    clickCancel() {
      //console.log("点击了取消");
    },
    clickBarCancel(){

    },
    clickConfirm(param) {
      let that = this;
      //console.log("点击了confirm");
      $(".getVal").each(function(index,item) {
        var $item = $(item), itemType,$itemParent = $item.parent();
        itemType = item.type == undefined ? $item.attr('type') : item.type;
        var $detailCode = $itemParent.attr("checkDetailDictCode"),segId = $itemParent.attr("segmentID"),EyeCode = $itemParent.attr("EyeCode");
        if(itemType != 'get_img'){
          $.each(param,function(pIndex,pItem){
              if(pItem.checkitemID == segId && pItem.distinguishEyes == EyeCode){
                mUtils.setFormVal($item, pItem[$detailCode])[itemType]();
              }else{
                $item.val("");
              }
          })
        }else{
          var _code = "";
          if(EyeCode == 'TE002') _code = '2'
          else if(EyeCode == 'TE003') _code = '1'
          else if(EyeCode == 'TE004') _code = '3'
          if(mUtils.isEmpty(_code)){
              mUtils.cm_html(param[0].imageUrl,segId,$item);
              that.$nextTick().then(()=>{
                that.initImageTools()
              })
          }else{
            if(param[0].distinguishEyes == _code){
              mUtils.cm_html(param[0].imageUrl,segId,$item); 
              that.$nextTick().then(()=>{
                that.initImageTools()
              })
            }else $item.find("ul.fileBoxYanUl").html("");
          }
        }
      })
    },
    clickBarConfirm(param) {
      let that = this;
      //console.log(that.barCode)
      that.barCode == 4?that.dataLoad(param):that.loadLisData(param);
    },
    initImageTools(){
      const ViewerDom = document.getElementById('fileImgBox');
      const viewer = new Viewer(ViewerDom, {url:"data-original"});
      viewer.destroy();
      const viewer1 = new Viewer(ViewerDom, {url:"data-original"});
    },
    //提示信息
    showMessage(type, message) {
      this.$alert(message, "温馨提示", {
        confirmButtonText: "确定",
        type: type,
        callback: action => {
          console.log(action)
        }
      });
    },
    //获取对接系统检查项目
    getDock() {
      let that = this, Params = { programId: "0", language: Api.default.language };
      that.postAxios(Api.default.getDock, Params).then(res => {
        that.dockData = res.Data;
      });
    },
    //点击段落标签页改变颜色，获取状态
    changeColor(index, item) {
      $(".followContent").animate({ scrollTop: 0 }, 0);
      this.changeblue = index;
      this.segmentId = item.Id;
      this.status = item.checkItemStatus;
      this.displayMode = item.DisplayMode;
      this.getFormHtml();
    },
    //获取段落列表
    getSegmentList() {
      let that = this;
      let Params = {
        programId: mUtils.getStore("programid"),
        followId: this.followdata.Id,
        language: Api.default.language
      };
      let segAll = that.postAxios(Api.default.segmentlist, Params).then(res => {
          let Unfinished = [],Preserved = [], Complete = [];
          if (res.Data.length > 0) {
            that.semgentList = res.Data;
            that.segmentId = res.Data[that.changeblue].Id;
            that.status = res.Data[that.changeblue].checkItemStatus;
            that.displayMode = res.Data[that.changeblue].DisplayMode;
            res.Data.forEach(function(c) {
              if (mUtils.isEmpty(c["checkItemStatus"])) Unfinished.push(c);
              if (c["checkItemStatus"] == 1) Preserved.push(c);
              if (c["checkItemStatus"] == 2) Complete.push(c);
              that.CompleteNum = Complete.length;
              that.PreservedNum = Preserved.length;
              that.UnfinishedNum = Unfinished.length;
            });
            that.segNum =that.UnfinishedNum + "-" + that.PreservedNum + "-" + that.CompleteNum;
            mUtils.setStore("segNum", that.segNum);
            setting.isHiddenButton(that.status);
          }
        }).catch(err => {
          console.log(err);
        });
      return segAll;
    },
    //保存
    saveHandle() {
      let isType = false; //isType为是否保存，区分保存和提交
      this.commonHandleData(isType);
    },
    //提交
    referhandle() {
      let isType = true;
      this.commonHandleData(isType);
    },
    //保存及提交数据
    commonHandleData(isType) {
      let that = this;
      let _eleData = JSON.parse(JSON.stringify(this.params));
      let CheckElementData = _eleData.ItemList,
      Param = {
        followId: that.followdata.Id,
        checkItemId: that.segmentId,
        programId: mUtils.getStore("programid"),
        language: Api.default.language
      };
      let arrData = [],requireArr = [],radioArr = [],dateArr = [],content = "";
      let obj = setting._$getEleData(that.displayMode,that.segmentId,CheckElementData);
      arrData = obj.arrData;requireArr = obj.requireArr;radioArr = obj.radioArr;
      Param.isSubmit = isType == true ? "2" : "1";
      Param.followDetList = arrData;
      //调用服务接口
      let msg = "";
      if (isType) msg = "提交成功";
      else msg = "保存成功";
      mUtils.requiredCheck(requireArr, that.displayMode);
      mUtils.onlyRadioCheckBox(radioArr, isType, that.displayMode); //必填项校验
      if (isType) {
        if (mUtils.requiredCheck(requireArr, that.displayMode) && mUtils.onlyRadioCheckBox(radioArr, isType, that.displayMode)) {
          that.saveFollowData(isType, Param, msg);
        } else {
          that.showMessage("error","有未通过检验的数据，请核对并修改数据后提交");
          return;
        }
      } else {
        that.saveFollowData(isType, Param, msg);
      }
    },
    //保存数据
    saveFollowData(isType, Param, msg) {
      let that = this;
      that.postAxios(Api.default.savefollow, Param).then(res => {
        if (res.ServerCode == 200) {
          that.showMessage("success", msg);
        }
        that.getSegmentList();
      }).catch(err => {
        console.log(err);
      });
    },
    //获取表单网页
    getFormHtml() {
      let that = this;
      let Params = {
        followId: that.followdata.Id,
        formId: that.followdata.FormId,
        checkItemId: that.segmentId,
        language: "CN",
        programId: mUtils.getStore("programid")
      };
      that.postAxios(Api.default.followData, Params).then(res => {
          that.params = res.Data;
          let list = JSON.parse(JSON.stringify(res.Data.ItemList));
          $.each(list, (pIndex, pItem) => {
            if (pItem.InterfaceSystemCode != 1 &&!mUtils.isEmpty(pItem.InterfaceSystemCode)) {
              pItem.itemAry = setting._$dock(that.dockData,pItem.InterfaceSystemCode,"DictParentData");
            }
            $.each(pItem.Children, (index, item) => {
              var type = item.UIType;
              if (/3|4|5/.test(type)) {
                if (type == 5) {
                  item.itemAry = setting.getChildData(that.dictionaryData,item.DictFormName);
                  item.validateKey = mUtils.newValidateKey(); //生成唯一标识 确保单选、复选name唯一不重复
                  $.each(item.itemAry, (eleIndex, eleItem) => {
                    mUtils.isContains(item.DefaultValue, eleItem.Code) &&
                      (eleItem.selectVal = item.DefaultValue);
                  });
                  return true;
                }
                item.itemAry = setting.getChildData(that.dictionaryData,item.DictFormName);
                item.validateKey = mUtils.newValidateKey();
              }
              if (/7|8|9/.test(type)) {
                if (item.DefaultType == 1) {
                  var time = mUtils.formatDate(new Date());
                  item.DefaultValue =type == "7"? mUtils.formatJsonData(time): type == "8"? mUtils.formatHourMinute(time): time;
                }
              }
            });
          });
          $(".followContent").html("");
          $(".followContent").append(setting.getConfigHtml(list, that.displayMode,that.dictionaryData.scoreData));
          that.loadData(JSON.parse(JSON.stringify(that.params)));
        }).catch(err => {
          console.log(err);
        });
    },
    datePickerInit(_EleData){
      let self = this;
      _EleData.forEach((v,i) =>{
        if(/7|8|9/.test(v.UIType)){
        let dateType = v.UIType == 7?'date':(v.UIType == 8?'time':'datetime');
        let dateId = 'ele-'+v.ElementId+'_'+v.CheckItemId;
        let fontmat= v.UIType == 7?"yyyy-MM-dd":(v.UIType == 8?'HH:mm':'yyyy-MM-dd HH:mm')
        this.laydate.render({
          elem: "#"+dateId,
          type: dateType,
          format:fontmat,
          trigger: "click"
        });
        // let calendar = new datePicker();
        //   calendar.init({
        //     'trigger': "#"+dateId, /*按钮选择器，用于触发弹出插件*/
        //     'type': dateType,/*模式：date日期；datetime日期时间；time时间；ym年月；*/
        //   });
        }
      })
    },
    //加载数据
    loadData(objData) {
      let _EleData = objData.ItemList[0].Children,that = this;
      setting.initCheckBox(that.displayMode);
      setting.isHiddenButton(that.status,that.displayMode);
      setting.loadFollowData(_EleData, that.displayMode, that.segmentId); //加载数据
      setting.loadLogical(_EleData, that.displayMode,false); //加载逻辑控件配置
      if(/4|5/.test(objData.ItemList[0].InterfaceSystemCode)){
     // if(objData.ItemList[0].InterfaceSystemCode != 1 && !mUtils.isEmpty(objData.ItemList[0].InterfaceSystemCode)){
        const ViewerDom = document.getElementById('fileImgBox');
        const viewer = new Viewer(ViewerDom, {url:'data-original'});
      }
      that.datePickerInit(_EleData);
      this.$nextTick().then(() => {
        $("div.getVal").find("input[type='radio']").unbind();
        $("div.getVal").find("input[type='radio']").on("click", function() {
            var domName = $(this).attr("name"),$radio = $(this);
            if ($radio.data("waschecked") == true) {
              $radio.prop("checked", false);
              $("input:radio[name='" + domName + "']").data("waschecked",false);
            } else {
              $radio.prop("checked", true);
              $("input:radio[name='" + domName + "']").data("waschecked",false);
              $radio.data("waschecked", true);
            }
          });
        //多选框、单选框逻辑校验
        $("div.getVal").find("input").on("click", function(e) {
            let $parent = $(this).parent().parent().parent(),logControl = [],logControlDetails = [];
            var status = $(this).data("waschecked"); 
            if(!mUtils.isEmpty($parent.attr("logcontroldetails"))){
              logControl= JSON.parse(Base64.decode($parent.attr("logControl")));
              logControlDetails = JSON.parse(Base64.decode($parent.attr("logcontroldetails")));
              setting.logicalConfig(logControl,logControlDetails,that.displayMode);
            }
          });
        //下拉框逻辑校验
        $("select.getVal").change(function() {
          var $parent = $(this).parent(),logControl = [],logControlDetails = [];
          if (that.displayMode == 2) $parent = $(this).parent().parent();
          if(mUtils.isEmpty($parent.attr("logcontroldetails"))) return false;
          logControl= JSON.parse(Base64.decode($parent.attr("logControl")));
          logControlDetails = JSON.parse(Base64.decode($parent.attr("logcontroldetails")));
          setting.logicalConfig(logControl,logControlDetails,that.displayMode);
        });
        $("input.getVal").blur(function(){
          var $parent = $(this).parent(),logControl = [],logControlDetails = [];
          if (that.displayMode == 2) $parent = $(this).parent().parent();
          if($parent.attr("uiType") == '6'){
            logControl= JSON.parse(Base64.decode($parent.attr("logControl")));
            logControlDetails = JSON.parse(Base64.decode($parent.attr("logcontroldetails")));
            setting.logicalConfig(logControl,logControlDetails,that.displayMode);
          }
        });
        //点击同步
        $(".dockHandle").on("click", function() {
          let $code = $(this).attr("data-code");
          let Param = {
            followId: that.followdata.Id,
            checkitemID: that.segmentId,
            programId: mUtils.getStore("programid"),
            language: Api.default.language
          };
          if(/2|4/.test($code)){
            Param.dateBegin =  $("input[data-name='dateBegin']").val()
            Param.dateEnd = $("input[data-name='dateEnd']").val();
            if(mUtils.compare(Param.dateBegin,Param.dateEnd)){
              that.showMessage("error","开始日期大于结束日期");
              return;
            };
          }
          if($code == 5){
            that.postAxios(Api.default.getAiReport, Param).then(res => {
              if(res.ServerCode == '200' ){
                if(res.Data.length == 0){
                  that.showMessage("error","未获取到AI报告数据，请稍后同步！");
                  return;
                }
                that.sendVal = true;
                that.collectData = JSON.stringify(res.Data);
                that.dockHtml = that.gt_html(res.Data);
              }
            }).catch(err=>{
              console.log(err)
            });
          }else if($code == 4){
            that.postAxios(Api.default.getCollecData,Param).then(res => {
                if(res.ServerCode == '200' ){
                  if(res.Data.length == 0){
                    that.showMessage("error","未获取到采集端数据，请稍后同步！");
                    return;
                  }
                  if(res.Data.length > 1){
                    that.barVal = true;
                    that.barCode = $code;
                    that.barData = JSON.stringify(res.Data);
                    that.barHtml = that.get_Colloect(res.Data,$code);
                  }else{
                    that.dataLoad(res.Data);
                  }
                }
            }).catch(err =>{console.log(err)})
          }else if($code == 2 ){
            Param.patientCardCode = that.list.PatientCardCode;
            Param.hospitalLizationCode = that.list.HospitalLizationCode;
            Param.inspectionItems = $(".getDock").val();
            that.postAxios(Api.default.getLisData,Param).then(res => {
                if(res.ServerCode == '200' ){
                  if(res.Data.length == 0){
                    that.showMessage("error","未获取到Lis数据，请稍后同步！");
                    return;
                  }
                  if(res.Data.length > 1){
                    that.barVal = true;
                    that.barCode = $code;
                    that.barData = JSON.stringify(res.Data);
                    that.barHtml = that.get_Colloect(res.Data,$code);
                  }else{
                    that.loadLisData(res.Data);
                  }
                }
            }).catch(err =>{console.log(err)})
          }
        });
        //点击计算
         $(".CalculateBtn").on("click", function() {
            let segID = $(this).attr("data-Id"),eleID = $(this).attr("data-eleID"),followDetList = setting._$getEleData(that.displayMode,that.segmentId,objData.ItemList).arrData;
            let Param = {
              followDetList:followDetList,
              checkItemId:segID,
              elementId:eleID,
              programId: mUtils.getStore("programid"),
              language: Api.default.language
            };
            that.postAxios(Api.default.count,Param).then(res => {
              if(res.ServerCode == '200' ){
                  $(this).parents("td").find("input").val(res.Data)
              }
            }).catch(err=>{
              console.log(err)
            });
         })
      });
    },
    //获取字典数据、元素表单中字典数据(自定义字典中所有操作的数据都需要重新获取最新数据)
    elementDictData() {
      let that = this;
      let params1 = {
        parentCode: "ControlType",
        language: Api.default.language
      };
      // 控件类型
      let promiseControltType = this.getAxios(Api.default.getDict, params1).then(res => {
        if (res.Data.ServerCode == 403) return false;
        that.dictionaryData.controlType = res.Data;
      }).catch(err => {
          console.log(err);
      });
      let params = {
        programId: mUtils.getStore("programid"),
        language: Api.default.language
      };
      // 分值
      let promiseScore = this.postAxios(Api.default.getScore, params).then(res => {
        if (res.Data.ServerCode == 403) return false;
        that.dictionaryData.scoreData = res.Data;
      }).catch(err => {
        console.log(err);
      });
      let promiseAllDict = this.getAxios(Api.default.getAllDict, params)
        .then(res => {
          if (res.ServerCode != 200) return false;
          var jsonData = res.Data;
          let regData = [],
            obj = { 1: "", 2: "", 3: "" }; //取出phone email..所对应的正则
          //单独取出正则数据，所对应子数据
          let parent = jsonData.Parent,
            child = jsonData.Child;
          parent.forEach((item, index) => {
            if (item.Code == "CommonRegex") {
              parent.splice(index, 1);
              child.forEach((item, index) => {
                if (item.ParentCode == "CommonRegex") {
                  regData.push(item);
                  obj[item.Code] = item.ExContent;
                }
              });
            }
          });
          that.dictionaryData.parentData = parent;
          that.dictionaryData.childData = child;
          that.dictionaryData.regData = regData;
          that.dictionaryData.regChildData = obj;
        })
        .catch(err => {
          console.log(err);
        });
      return promiseAllDict;
    },
    //获取AI报告采集数据列表
    gt_html(jsonData){
        let mainHtml = "";
        mainHtml+='<div class="dockDetailData"><ul class="ul">';
        for(let item of jsonData){
          mainHtml += '<li><span><input type="radio" name="docksystem" value="'+item.sortNumber+'"/></span>';
          if(mUtils.isEmpty(item.createDate)) mainHtml += '<span>'+item.sortNumber+"、"+"数据"+item.sortNumber+'</span>'
          else mainHtml += '<span>'+item.sortNumber+"、"+item.createDate+'</span>';
          mainHtml += '<a class="ck_detail" data-code="'+item.sortNumber+'">查看明细</a></li>'
        }
        mainHtml += '</ul></div>'
        mainHtml += '<div class="detailList"><table class="table-area" cellpadding="0" cellspacing="0">'
        mainHtml +='<thead><tr class="firstOne"></tr><tr class="firstTwo"></tr></thead><tbody></tbody></table></div>'
        return mainHtml
    },
    //数据采集端列表
    dataLoad(jsonData){
      let that = this;
      $(".getVal").each(function(index,item) {
        var $item = $(item),$itemParent = $item.parent(),EyeCode = $itemParent.attr("EyeCode");
        var _code = EyeCode == 'TE002'?'OD':(EyeCode == 'TE003'?'OS':(EyeCode == 'TE004'?'OU':''));
        if(mUtils.isEmpty(_code)){
            that.imageHtml(jsonData[0].Images,$item);
            that.$nextTick().then(()=>{
              that.initImageTools();
            })
        }else{
          let newAryImage = [];
          jsonData[0].Images.forEach((val,idx) =>{
            if(_code == val.EyeCode){
              newAryImage.push(val);
            }
          })
          that.imageHtml(newAryImage,$item);
          that.$nextTick().then(()=>{
            that.initImageTools();
          })
        }
      })
    },
    imageHtml(AryImage,$item){
      var html = "";
      $.each(AryImage,function(index,item){
          html+= '<li class="diyLoadHover">'
          html+= '<div class="viewThumb">'
          html+= '<img data-original="'+item.FileName+'" src="'+item.FileName+'"></div>'
          html+= '<div class="diy diyName">'+item.EyeCode+'</div>'
          html+= '<div class="diy diyConfig"><input type="checkbox" name="name_'+(index+1)+'" data-code="'+item.FileName+'" data-name=""></div>'
          html+= '</li>'
      })
      $item.find("ul.fileBoxYanUl").html("").append(html);
    },
    //加载Lis数据
    loadLisData(jsonData){
      $(".getVal").each(function(index,item) {
        var $item = $(item),$detailCode = $item.parent().attr("checkDetailDictCode");
        let itemType = item.type == undefined ? $item.attr('type') : item.type;
        $.each(jsonData[0].datas,function(pIndex,pItem){
          if(pItem.InspectionSubCode == $detailCode){
            mUtils.setFormVal($item, pItem.value)[itemType]();
          }
        })
      })
    },
    get_Colloect(jsonData,$code){
      let mainHtml = "";
      let examDate = $code == 2?'ReportDate':'ExamDate';
      mainHtml+='<div class="dockDetailData"><ul class="ul">';
      for(let i =0;i<jsonData.length;i++ ){
        mainHtml += '<li><span><input type="radio" id="system_'+(i+1)+'" name="dockEyesystem" value="'+(i)+'"/></span>';
        if(mUtils.isEmpty(jsonData[i][examDate])) mainHtml += '<label for="system_'+(i+1)+'"><span>'+(i+1)+"、"+"数据"+(i+1)+'</span></label>'
        else mainHtml += '<label for="system_'+(i+1)+'"><span>'+(i+1)+"、"+jsonData[i][examDate]+'</span></label>';
      }
      return mainHtml;
    }
  },
  //自定义过滤器
  filters: {
    formatDate: function(value) {
      return mUtils.formatJsonData(value);
    },
    markSegmentName: function(list) {
      let name = list.checkItemStatus == 2 ? list.Name + "✔️" : list.Name;
      return name;
    }
  }
};
</script>
<style lang="css" scoped>
@import "../../assets/css/follow/follow";
</style>


