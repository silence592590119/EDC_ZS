<template>
  <div class="fillcontain" :style="{ height: bodyHeight + 'px' }">
    <HeadTop :msgFather="topTitle"></HeadTop>
    <div class="detail_box">
      <div class="table_container">
        <div class="title">{{FollowNumName}} - {{FormName}}</div>
        <div class="basicInfo">
          <div class="segmentSatus">
            <span>真实姓名：{{list.Name}}</span>
            <span class="span">已提交（<span>{{CompleteNum}}</span>）</span>
            <span class="span">已保存（<span>{{PreservedNum}}</span>）</span>
            <span class="span">未完成（<span>{{UnfinishedNum}}</span>）</span>
          </div>
        </div>
        <div class="tips">
            <div class="spanlist">
                <span v-for="(list,index) in semgentList"
                class="seach-all"  :class="{seachchange:changeblue==index}"
                @click="changeColor(index,list)"  :key="index">{{list | markSegmentName}}</span>
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
import HeadTop from "../common/HeadTop3"
import Eventbus from "../../config/eventBus"
import * as mUtils from "../../utils/mUtils"
import * as setting from "../../utils/publicConfig"
import * as Api from "../../request/api"
let Base64 = require('js-base64').Base64
export default {
  name: "",
  data() {
    return {
      bodyHeight:'',
      followdata: {}, //随访信息
      FollowNumName: "", //随访次数
      FormName: "", //表单名称
      list: {}, //受试者基本信息
      params: [], //段落信息
      myHtml: "",
      semgentList:[],//段落列表信息
      segmentId:'',//第一个段落的ID
      displayMode:'',//页面模式
      dictionaryData: {},
      changeblue:0,
      status:'',
      disabled:false,
      topTitle:"",
      segNum:"",
      UnfinishedNum:0,
      PreservedNum:0,
      CompleteNum:0,
    }
  },
  components: {
    HeadTop
  },
  created() {
    //组件创建时，调用数据
    let that = this;
    that.followdata = mUtils.getStore("followData");
    that.FollowNumName = that.followdata.FollowNumName;
    that.FormName = that.followdata.FormName;
    that.topTitle = that.followdata.FollowTimes == 0?"基线表单":"随访表单";
    that.list = mUtils.getStore("patientinfo");
    that.getSegmentList();
  },
  mounted() {
    //组件挂载时，执行
    var that = this;
    that.bodyHeight=document.documentElement.clientHeight;
    that.elementDictData().then(() => {
      let childData = that.dictionaryData;
      if(that.semgentList.length > 0){
        that.getFormHtml();
      }else{
        that.showMessage('error',"当前表单无可用段落！");
      }
    });
  },
  methods: {
    //提示信息
    showMessage(type,message){
      this.$alert(message, '温馨提示', {
        confirmButtonText: '确定',
        type:type
      });
    },
    //点击段落标签页改变颜色，获取状态
    changeColor(index, item) {
        this.changeblue = index;
        this.segmentId = item.Id;
        this.status = item.checkItemStatus;
        this.displayMode = item.DisplayMode;
        this.getFormHtml() 
    },
    //获取段落列表
    getSegmentList(){
      let that = this;
      let Params ={
         programId:mUtils.getStore("programid"),
         followId:this.followdata.Id,
         language:Api.default.language
      }
      that.postAxios(Api.default.segmentlist,Params).then(res=>{
        let Unfinished=[],Preserved=[], Complete=[];
          if(res.Data.length >0){
            that.semgentList = res.Data;
            that.segmentId = res.Data[that.changeblue].Id;
            that.status = res.Data[that.changeblue].checkItemStatus;
            that.displayMode = res.Data[that.changeblue].DisplayMode;
            res.Data.forEach(function (c) {
              if(mUtils.isEmpty(c['checkItemStatus'])) Unfinished.push(c);
              if(c['checkItemStatus'] == 1) Preserved.push(c);
              if(c['checkItemStatus'] == 2) Complete.push(c);
              that.CompleteNum =Complete.length;
              that.PreservedNum =Preserved.length;
              that.UnfinishedNum =Unfinished.length;
            });
            that.segNum = that.UnfinishedNum+'-'+that.PreservedNum+'-' + that.CompleteNum;
            mUtils.setStore('segNum',that.segNum);
            setting.isHiddenButton(that.status);
          }
      }).catch(err=>{
        console.log(err);
      });
    },
    //保存
    saveHandle(){
      let isType = false;//isType为是否保存，区分保存和提交
      this.commonHandleData(isType);
    },
    //提交
    referhandle(){
      let isType = true;
      this.commonHandleData(isType);
    },
    //保存及提交数据
    commonHandleData(isType){
      let that = this; 
      let _eleData =  JSON.parse(JSON.stringify(this.params));
      let CheckElementData = _eleData.ItemList, Param = {
            followId:that.followdata.Id,
            checkItemId:that.segmentId, 
            programId:mUtils.getStore("programid"),
            language: Api.default.language 
          };
      let arrData = [], requireArr = [], radioArr = [], dateArr = [], content = "";
      $(".getVal").each(function(index,item) {
          var $item = $(item),attrReq = $item.attr("rulerequired"), itemType,attrLogic = $item.attr("logcRequired");
          var $itemParent,attrId,segmentId,attrType,attrDic;
          itemType = item.type == undefined ? $(item).attr('type') : item.type;
          if(that.displayMode == 1){
             $itemParent = $item.parent();
          }else{
            if(itemType == 'get_checkbox' || itemType == 'get_radio') $itemParent = $item.parent();
            else $itemParent = $item.parent().parent();
          }
          attrId = $itemParent.attr("elementid"); segmentId = $itemParent.attr("segmentid");
          attrType = $itemParent.attr("uitype"); attrDic = $itemParent.attr("dictformname");
          $.each(CheckElementData, function (pIndex, pItem) {
              $.each(pItem.Children, function (index, item) {
                  if (attrId == item.ElementId && that.segmentId == item.CheckItemId) {
                      var obj_f = item.FollowData;
                      obj_f.CheckItemId = item.CheckItemId;
                      obj_f.ElementId = item.ElementId;
                      obj_f.UIType = attrType;
                      if (!mUtils.isEmpty(attrDic)) obj_f.ParentDictCode = attrDic; obj_f.Value = $item.find("option:selected").text();
                      if (item.UIType == '4') {
                          let parent =  $item.parent().parent();
                          if($(parent).css('display') != 'none'){
                            obj_f.Content = $item.find("input[type=radio]").filter((i, o) => o.checked).attr("data-code") || "";
                            obj_f.Value = $item.find("input[type=radio]").filter((i, o) => o.checked).attr("data-name") || ""; 
                          }else{
                            obj_f.Content = '';
                            obj_f.Value = '';
                          }
                      } else if (item.UIType == '5') {
                          obj_f.Content = ''; obj_f.Value = '';
                          let parent =  $item.parent().parent();
                          if($(parent).css('display') != 'none'){
                            $item.find("input[type=checkbox]").each(function (i, o) {
                              if (o.checked) {
                                  obj_f.Content += $(this).data("code") + ',';
                                  obj_f.Value += $(this).data("name") + ',';
                              }
                            });
                          }
                          if (!mUtils.isEmpty(obj_f.Content)) {
                              obj_f.Content = obj_f.Content.substring(0, obj_f.Content.length - 1);
                          }
                          if (!mUtils.isEmpty(obj_f.Value)) {
                              obj_f.Value = obj_f.Value.substring(0, obj_f.Value.length - 1);
                          }
                      } else {
                          let parent = null;
                          parent = that.displayMode == 1 ? $item.parent().parent():$item.parent().parent().parent();
                          if($(parent).css('display') != 'none'){
                            obj_f.Content = mUtils.getFormVal($item)[itemType]();
                          }else{
                            obj_f.Content = '';
                            obj_f.Value = '';
                          }
                      }
                      arrData.push(obj_f);
                      if (item.UIType != '4' && item.UIType != '5') {
                         if(that.displayMode == 1) if($item.parent().parent().css('display') != 'none') requireArr.push($item);
                         if(that.displayMode == 2) if($item.parent().parent().parent().css('display') != 'none') requireArr.push($item);
                      } else {
                          if (attrReq == '1' || attrLogic == 1){
                            if($item.parent().parent().css('display') != 'none') radioArr.push($item);  
                          } 
                      }
                  }
              });
          });
      });
      Param.isSubmit = isType == true ? '2' : '1';
      Param.followDetList = arrData;
      //调用服务接口
      let msg = "";
      if(isType) msg = '提交成功';
      else msg = '保存成功';
      mUtils.requiredCheck(requireArr,that.displayMode);
      mUtils.onlyRadioCheckBox(radioArr,isType,that.displayMode);//必填项校验
      if(isType){
        if(mUtils.requiredCheck(requireArr,that.displayMode) && mUtils.onlyRadioCheckBox(radioArr,isType,that.displayMode)){
          that.saveFollowData(isType,Param,msg)
        }else{
          that.showMessage('error','有未通过检验的数据，请核对并修改数据后提交');
          return; 
        }
      }else{
        //mUtils.requiredCheck(requireArr,that.displayMode);
        //mUtils.onlyRadioCheckBox(radioArr,isType,that.displayMode);//必填项校验
        that.saveFollowData(isType,Param,msg)
      }
    },
    //保存数据
    saveFollowData(isType,Param,msg){
      let that = this;
      that.postAxios(Api.default.savefollow,Param).then(res=>{
          if(res.ServerCode == 200){
            that.showMessage('success', msg);
          }
          that.getSegmentList();
      }).catch(err=>{
          console.log(err);
      });
    },
    //获取表单网页
    getFormHtml() {
      let that = this;
      let Params = {
        followId: that.followdata.Id,
        formId:that.followdata.FormId,
        checkItemId: that.segmentId,
        language: "CN",
        programId: mUtils.getStore("programid")
      };
      that.postAxios(Api.default.followData, Params)
        .then(res => {
          that.params = res.Data;
          let list = JSON.parse(
            JSON.stringify(res.Data.ItemList)
          );
          $.each(list, (pIndex, pItem) => {
            $.each(pItem.Children, (index, item) => {
              var type = item.UIType;
              if (/3|4|5/.test(type)) {
                if(type == 5){
                    item.itemAry = setting.getChildData(that.dictionaryData,item.DictFormName);
                    item.validateKey = mUtils.newValidateKey();//生成唯一标识 确保单选、复选name唯一不重复
                    $.each(item.itemAry,(eleIndex,eleItem)=>{
                        mUtils.isContains(item.DefaultValue,eleItem.Code) && (eleItem.selectVal = item.DefaultValue)
                    });
                    return true;
                }
                item.itemAry = setting.getChildData(that.dictionaryData,item.DictFormName);
                item.validateKey = mUtils.newValidateKey();
              }
              if (/7|8|9/.test(type)) {
                if(item.DefaultType == 1){
                    var time = mUtils.formatDate(new Date());
                    item.DefaultValue = type == '7'? mUtils.formatJsonData(time) : (type == '8'?mUtils.formatHourMinute(time):time);
                }
              }
            });
          });
          $(".followContent").html("");
          $(".followContent").append(setting.getConfigHtml(list,that.displayMode));
          that.loadData(JSON.parse(JSON.stringify(that.params)));
        }).catch(err => {
          console.log(err);
        });
    },
    //加载数据
    loadData(objData){
      let _EleData = objData.ItemList[0].Children,that = this;
      setting.loadFollowData(_EleData,that.displayMode,that.segmentId);//加载数据
      setting.isHiddenButton(that.status);
      setting.loadLogicalCheck(_EleData,that.displayMode);//加载逻辑控件配置
      this.$nextTick().then(() => {
        $("div.getVal").find("input[type='radio']").unbind();
        $("div.getVal").find("input[type='radio']").on("click",function(){
          var domName = $(this).attr('name'),$radio = $(this);
          if($radio.data("waschecked") == true){
            $radio.prop("checked",false);
            $("input:radio[name='"+domName+"']").data("waschecked",false);
          }else{
            $radio.prop("checked",true);
            $("input:radio[name='"+domName+"']").data("waschecked",false);
            $radio.data("waschecked",true);
          }
        })
        //多选框、单选框逻辑校验
        $('div.getVal').find("input").on('click',function(e){
          let $parent= $(this).parent().parent().parent(),logControl = [],logControlDetails=[];
          logControlDetails = JSON.parse(Base64.decode($parent.attr("logcontroldetails")));
          var status = $(this).data("waschecked");
          setting.logicalCommon(logControlDetails,that.displayMode,status);
        });
        //下拉框逻辑校验
        $("select.getVal").change(function(){
          var $parent= $(this).parent(),logControl = [],logControlDetails=[];
          if(that.displayMode == 2) $parent= $(this).parent().parent();
          logControlDetails = JSON.parse(Base64.decode($parent.attr("logcontroldetails")));
          setting.logicalCommon(logControlDetails,that.displayMode,'');
        })
      })
    },
    //获取字典数据、元素表单中字典数据(自定义字典中所有操作的数据都需要重新获取最新数据)
    elementDictData() {
      let that = this;
      let params1 = {
        parentCode: "ControlType",
        language: Api.default.language
      };
      // 控件类型
      let promiseControltType = this.getAxios(Api.default.getDict, params1)
        .then(res => {
          if(res.Data.ServerCode == 403) return false;
          that.dictionaryData.controlType = res.Data;
        }).catch(err => {
          console.log(err);
        });
      let params = {
        programId: mUtils.getStore("programid"),
        language: Api.default.language
      };
      let promiseAllDict = this.getAxios(Api.default.getAllDict, params).then(res => {
          if(res.ServerCode != 200) return false;
          var jsonData = res.Data;
          let regData = [],obj = { 1: "", 2: "", 3: "" }; //取出phone email..所对应的正则
          //单独取出正则数据，所对应子数据
          let parent = jsonData.Parent,child = jsonData.Child;
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
        }).catch(err => {
          console.log(err);
        });
      return promiseAllDict;
    }
  },
  //自定义过滤器
  filters: {
    formatDate: function(value) {
      return mUtils.formatJsonData(value);
    },
    markSegmentName:function(list){
      let name = list.checkItemStatus == 2?list.Name+'✔️':list.Name
      return name;
    }
  }
};
</script>
<style lang="css" scoped>
  @import '../../assets/css/follow/follow'
</style>


