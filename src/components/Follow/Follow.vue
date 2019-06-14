<template>
  <div class="fillcontain">
    <HeadTop :msgFather="topTitle"></HeadTop>
    <div class="detail_box">
      <div class="table_container">
        <div class="title">{{FollowNumName}} - {{FormName}}</div>
        <div class="basicInfo">
          <div class="table">
            <div class="table-column-group">
              <div class="table-column"></div>
              <div class="table-column"></div>
              <div class="table-column"></div>
              <div class="table-column"></div>
              <div class="table-column"></div>
              <div class="table-column"></div>
            </div>
            <div class="table-row-group">
              <ul class="table-row">
                <li class="table-cell className">真实姓名：</li>
                <li class="table-cell">{{list.Name}}</li>
                <li class="table-cell className">姓名缩写：</li>
                <li class="table-cell">{{list.Spell}}</li>
                <li class="table-cell className">入组编码：</li>
                <li class="table-cell getLi">{{list.Code}}</li>
              </ul>
              <ul class="table-row">
                <li class="table-cell className">所属医院：</li>
                <li class="table-cell getLi">{{list.HospitalOrgName}}</li>
                <li class="table-cell className">身份证号：</li>
                <li class="table-cell getLi">{{list.IdCard}}</li>
                <li class="table-cell className">入组时间：</li>
                <li class="table-cell getLi" >{{list.GroupDate | formatDate}}</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="tips">
            <div class="spanlist">
                <span
                v-for="(list,index) in semgentList"
                class="seach-all"
                :class="{seachchange:changeblue==index}"
                @click="changeColor(index,list)"
                :key="index"
                >{{list | markSegmentName}}</span>
            </div>
        </div>
        <div class="followContent">
          <div class="followList"></div>
        </div>
      </div>
      <div class="btn_list">
        <el-button type="primary" @click="saveHandle()">保存</el-button>
        <el-button type="success" @click="referhandle()">提交</el-button>
      </div>
    </div>
  </div>
</template>
<script>
import HeadTop from "../common/HeadTop3"
import Eventbus from "../../config/eventBus"
import * as mUtils from "../../utils/mUtils"
import * as Api from "../../request/api"
let Base64 = require('js-base64').Base64
export default {
  name: "",
  data() {
    return {
      followdata: {}, //随访信息
      FollowNumName: "", //随访次数
      FormName: "", //表单名称
      list: {}, //受试者基本信息
      params: [], //段落信息
      myHtml: "",
      semgentList:[],//段落列表信息
      segmentId:'',//第一个段落的ID
      dictionaryData: {},
      changeblue:0,
      status:'',
      disabled:false,
      topTitle:""
    }
  },
  components: {
    HeadTop
  },
  created() {
    //组件创建时，调用数据
    let that = this;
    that.followdata = mUtils.getStore("followData");
    console.log(that.followdata);
    that.FollowNumName = that.followdata.FollowNumName;
    that.FormName = that.followdata.FormName;
    that.topTitle = that.followdata.FollowTimes == 0?"基线表单":"随访表单";
    that.list = mUtils.getStore("patientinfo");
    that.getSegmentList();
  },
  mounted() {
    //组件挂载时，执行
    var that = this;
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
          if(res.Data.length >0){
            that.semgentList = res.Data;
            that.segmentId = res.Data[that.changeblue].Id;
            that.status = res.Data[that.changeblue].checkItemStatus;
            if(that.status == 2){
              $(".followList .getVal").attr("disabled",'disabled');
              $(".followList .getVal").find("input,select").attr("disabled",'disabled')
              $(".btn_list").hide();
            }else{
              $(".followList .getVal").removeAttr("disabled");
              $(".followList .getVal").find("input,select").removeAttr("disabled");
              $(".btn_list").show();
            }
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
          var $item = $(item), $itemParent = $item.parent(), attrId = $itemParent.attr("elementid"), segmentId = $itemParent.attr("segmentid"),
              attrType = $itemParent.attr("uitype"), attrDic = $itemParent.attr("dictformname"), attrReq = $item.attr("rulerequired"), itemType;
          itemType = item.type == undefined ? $(item).attr('type') : item.type;
          $.each(CheckElementData, function (pIndex, pItem) {
              $.each(pItem.Children, function (index, item) {
                  if (attrId == item.ElementId && that.segmentId == item.CheckItemId) {
                      var obj_f = item.FollowData;
                      obj_f.CheckItemId = item.CheckItemId;
                      obj_f.ElementId = item.ElementId;
                      obj_f.UIType = attrType;
                      if (!mUtils.isEmpty(attrDic)) obj_f.ParentDictCode = attrDic; obj_f.Value = $item.find("option:selected").text();
                      if (item.UIType == '4') {
                          obj_f.Content = $item.find("input[type=radio]").filter((i, o) => o.checked).attr("data-code");
                          obj_f.Value = $item.find("input[type=radio]").filter((i, o) => o.checked).attr("data-name");
                      } else if (item.UIType == '5') {
                          obj_f.Content = ''; obj_f.Value = '';
                          $item.find("input[type=checkbox]").each(function (i, o) {
                              if (o.checked) {
                                  obj_f.Content += $(this).data("code") + ',';
                                  obj_f.Value += $(this).data("name") + ',';
                              }
                          });
                          if (!mUtils.isEmpty(obj_f.Content)) {
                              obj_f.Content = obj_f.Content.substring(0, obj_f.Content.length - 1);
                          }
                          if (!mUtils.isEmpty(obj_f.Value)) {
                              obj_f.Value = obj_f.Value.substring(0, obj_f.Value.length - 1);
                          }
                      } else {
                          obj_f.Content = mUtils.getFormVal($item)[itemType]();
                      }
                      arrData.push(obj_f);
                      if (item.UIType != '4' && item.UIType != '5') {
                          requireArr.push($item);
                          if (/7|8|9/.test(item.UIType)) {
                              dateArr.push($item);
                          }
                      } else {
                          if (attrReq == '1') radioArr.push($item);
                      }
                  }
              });
          });
      });
      mUtils.requiredCheck(requireArr);
      mUtils.onlyRadioCheckBox(radioArr);//必填项校验
      Param.isSubmit = isType == true ? '2' : '1';
      Param.followDetList = arrData;
      //调用服务接口
      let msg = "";
      if(isType) msg = '提交成功';
      else msg = '保存成功';
      if(isType){
        if(mUtils.requiredCheck(requireArr) && mUtils.onlyRadioCheckBox(radioArr)){
          that.saveFollowData(isType,Param,msg)
        }else{
          that.showMessage('error','有未通过检验的数据，请核对并修改数据后提交');
          return; 
        }
      }else{
          that.saveFollowData(isType,Param,msg)
      }
    },
    //保存数据
    saveFollowData(isType,Param,msg){
      let that = this;
       that.postAxios(Api.default.savefollow,Param).then(res=>{
         console.log(res);
         if(res.ServerCode == 200){
           that.showMessage('success', msg);
         }
         if(isType){
          that.getSegmentList();
         }
        }).catch(err=>{
          console.log(err);
        })
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
            //console.log(pItem.Children);
            $.each(pItem.Children, (index, item) => {
              var type = item.UIType;
              if (/3|4|5/.test(type)) {
                if(type == 5){
                    item.itemAry = that.getChildData(item.DictFormName);
                    item.validateKey = mUtils.newValidateKey();//生成唯一标识 确保单选、复选name唯一不重复
                    $.each(item.itemAry,(eleIndex,eleItem)=>{
                        mUtils.isContains(item.DefaultValue,eleItem.Code) && (eleItem.selectVal = item.DefaultValue)
                    });
                    return true;
                }
                item.itemAry = that.getChildData(item.DictFormName);
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
          $(".followList").html("");
          $(".followList").append(that.gethtml(list));
          that.loadData(JSON.parse(JSON.stringify(that.params)));
        })
        .catch(err => {
          console.log(err);
        });
    },
    //加载数据
    loadData(objData){
      let _EleData = objData.ItemList[0].Children,that = this;
      $.each(_EleData, function (index, item) {
        $(".getVal").each(function (pIndex, pItem) {
          var $item = $(pItem), $itemParent = $item.parent(), attrId = $itemParent.attr("elementid"),
              segmentId = $itemParent.attr("segmentid"), itemType;
              itemType = pItem.type == undefined ? $(pItem).attr('type') : pItem.type;
              if (attrId == item.ElementId && that.segmentId == item.CheckItemId) {
                  var obj_f = item.FollowData;
                  if (item.UIType == '4') {
                      $item.find("input[type='radio']").removeAttr("checked");
                      $item.find("input[data-code='" + obj_f.Content + "']").prop("checked", "checked");
                      $item.find("input[data-code='" + obj_f.Content + "']").data("waschecked", true);
                  }
                  else if (item.UIType == '5') {
                      $item.find("input[type='checkbox']").removeAttr("checked");
                      if (mUtils.isEmpty(obj_f["Content"])) return false;
                      var arr = obj_f["Content"].split(',');
                      $.each(arr, function (i, o) {
                          $item.find("input[data-code='" + o + "']").prop("checked", "checked");
                      });
                  }
                  else mUtils.setFormVal($item, obj_f["Content"])[itemType]();
              }
          });
      });
      $(".getTd").each(function(index,item){
        var $item =$(item),logControl =$item.attr("logControl"),details =$item.attr('logControlDetails'), state=false;
        let condition=[],result=[];
        details = JSON.parse(Base64.decode(details));
        if(details.length > 0){
          $.each(details,function(index,item){
            if(item.Type == 1) condition.push(item);
            if(item.Type == 2) result.push(item);
          });
          if(condition.length == 0 && result.length > 0){
            state = true;
          }
          if(condition.length > 0){
            $.each(condition,function(pIndex,pItem){
              $.each(_EleData,function(index,item){
                if(item.ElementId == pItem.ElementId && item.CheckItemId == pItem.CheckItemId){
                  if(!mUtils.isEmpty(item.FollowData.Content)){
                    if(pItem.OperatorValue == item.FollowData.Content) state = true;
                  }else {
                    if(item.DefaultValue){
                      if(pItem.OperatorValue == item.DefaultValue) state = true;
                    }
                  }
                }
              })
            });
          }
          if(state){
            $.each(result,function(pIndex,pItem){
              $(".getTd").each(function(index,item){
                 var $item = $(item),type=$item.attr("uiType"),elementID = $item.attr("elementid"),segmentID = $item.attr("segmentid");
                 if(elementID == pItem.ElementId && segmentID == pItem.CheckItemId){
                   if(pItem.OperatorResult == 101){
                     $item.parent().hide();
                   }else if(pItem.OperatorResult == 102){
                      $item.find('input,select').attr("disabled","disabled");
                   }else if(pItem.OperatorResult == 103){
                     let required="";
                     if(/4|5/.test(type)){
                        required = $($item.children().children()).attr("rulerequired");
                        $($item.children().children()).attr("logcRequired",'1');
                     }else{
                        required = $($item.children()).attr("rulerequired");
                        $($item.children()).attr("logcRequired",'1');
                     }
                     if(required != 1){
                       let preHtml = $($($item.prev())).html();
                       if(preHtml.indexOf("i") == -1){
                         $($($item.prev())).html("<i>*</i>"+preHtml);
                       }
                     }
                   }
                 }
              })
            })
          }
        }
      });
      if(that.status == 2){
        $(".followList .getVal").attr("disabled",'disabled');
        $(".followList .getVal").find("input,select").attr("disabled",'disabled')
        $(".btn_list").hide();
      }else{
        $(".followList .getVal").removeAttr("disabled");
        $(".followList .getVal").find("input,select").removeAttr("disabled");
        $(".btn_list").show();
      }
      this.$nextTick().then(() => {
        $('div.getVal').find("input").on('click',function(e){
          let $parent= $(this).parent().parent().parent(),logControl = [],logControlDetails=[];
          logControlDetails = JSON.parse(Base64.decode($parent.attr("logcontroldetails")));
          that.logicalCommon(logControlDetails)
        })
      })
    },
    //逻辑校验公共逻辑
    logicalCommon(objData){
      let condition=[],result=[],state=false;
      $.each(objData,function(index,item){
        if(item.Type == 1) condition.push(item);
        if(item.Type == 2) result.push(item);
      });
      if(condition.length == 0 && result.length > 0){//无条件时直接执行动作
        state = true;
      }
      //如果有条件时，判断条件是否成立，成立之后执行动作
      if(condition.length > 0){
        $.each(condition,function(pIndex,pItem){
          $(".getTd").each(function(index,item){
            var $item = $(item),elementId=$item.attr("elementid"),segmentID = $item.attr("segmentid"),type=$item.attr("uiType");
            if(elementId == pItem.ElementId && segmentID == pItem.checkItemId){
              if(/4|5/.test(type)){
                var $node = $item.children(),val="";
                if(/4/.test(type)){
                  val = $node.find("input[type=radio]").filter((i,o)=>o.checked).attr("data-code");
                  if(val == pItem.OperatorValue) state = true;
                }
                if(/5/.test(type)){
                  $node.find("input[type=checkbox]").each(function(i,o){
                    if(o.checked) val+=$(this).data("code")+',';
                  });
                  if(!mUtils.isEmpty(val)) val = val.substring(0,val.length-1).split(',');
                  if(mUtils.contains(val,pItem.OperatorValue)){
                    state = true;
                  }
                }
              }else {
                var $node = $item.children();
                if($($node).val() == pItem.OperatorValue){
                  state = true;
                }
              }
            }
          })
        });
      }
      if(objData.length > 0){
          $.each(result,function(pIndex,pItem){
          $(".getTd").each(function(index,item){
              var $item = $(item),type=$item.attr("uiType"),elementID = $item.attr("elementid"),segmentID = $item.attr("segmentid");
              if(elementID == pItem.ElementId && segmentID == pItem.CheckItemId){
                  $item.parent().show();
                  $item.find('input,select').attr("disabled","disabled");
                  let required="";
                  if(/4|5/.test(type)){
                    required = $($item.children().children()).attr("rulerequired");
                    $($item.children().children()).removeAttr("logcRequired",'1');
                  }else{
                    required = $($item.children()).attr("rulerequired");
                    $($item.children()).removeAttr("logcRequired",'1');
                  }
                  if(required != 1){
                    let preHtml = $($($($item.prev()))).html();
                    if(preHtml.indexOf("i") > -1){
                      $($($($item.prev()))).html(preHtml.replace("<i>*</i>",''));
                    }else $($($($item.prev()))).html(preHtml)
                  }
              }
          })
        })
      }
      if(state){
        $.each(result,function(pIndex,pItem){
          $(".getTd").each(function(index,item){
              var $item = $(item),type=$item.attr("uiType"),elementID = $item.attr("elementid"),segmentID = $item.attr("segmentid");
              if(elementID == pItem.ElementId && segmentID == pItem.CheckItemId){
                if(pItem.OperatorResult == 101){
                  $item.parent().hide();
                  if(/4|5/.test(type)) $item.find("input"),attr("checked",false)
                  else $item.find("input").val("");
                }else if(pItem.OperatorResult == 102){
                  $item.find('input,select').attr("disabled","disabled");
                  $item.find('input,select').val("");
                }else if(pItem.OperatorResult == 103){
                  let required="";
                  if(/4|5/.test(type)){
                    required = $($item.children().children()).attr("rulerequired");
                    $($item.children().children()).attr("logcRequired",'1');
                  }else{
                    required = $($item.children()).attr("rulerequired");
                    $($item.children()).attr("logcRequired",'1');
                  }
                  if(required != 1){
                    let preHtml = $($($item.prev())).html();
                    if(preHtml.indexOf("i") == -1){
                      $($($item.prev())).html("<i>*</i>"+preHtml);
                    }
                  }
                }
              }
          })
        })
      }
    },
    //通过父级code获取子级数据数组
    getChildData(parentCode) {
        var arr = [];
        $.each(this.dictionaryData.childData,(index, item) => {
            if (item.ParentCode == parentCode) {
                arr.push(item);
            }
        });
        return arr;
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
    },
    //获取表单模版
    gethtml(jsonData) {
      let html = "",that = this;
      $.each(jsonData, function(index, item) {
        html += '<div class="title_detail">';
        html += '<table class="table_detail">';
        $.each(item.Children, function(pIndex, pItem) {
          var type = pItem.UIType,
            required = pItem.IsRequired,
            value = pItem.DefaultValue,
            dictFormName = pItem.DictFormName,
            minData = pItem.BeginDate,
            maxData = pItem.EndDate;
          html += "<tr>";
          html += "<td>";
          if (required == "1") {
            html += "<i>*</i>";
          }
          html += "<span>" + pItem.ElementName + "</span></br>";
          if (pItem.Remark) {
            html += '<span class="ElemRemark">【' + pItem.Remark + "】</span>";
          }
          html += "</td>";
          html +=
            '<td class="getTd" elementID="' +
            pItem.ElementId +
            '" segmentID="' +
            pItem.CheckItemId +
            '" uiType="' +
            type +
            '" dictFormName="' +
            dictFormName +
            '" logControl="'+Base64.encode(JSON.stringify(pItem.logControl))+
            '" logControlDetails="'+Base64.encode(JSON.stringify(pItem.logControlDetails))+
            '" defaultValue="' +
            value +
            '" >';
          // 文本框
          if (type == "1") {
            if (pItem.MinValue != null || pItem.MaxValue != null) {
              html +=
                '<input type="text" class="getVal" value="' +
                value +
                '" ruleRequired="' +
                required +
                '" ruleReg="' +
                pItem.ValidateReg +
                '" ruleRange="[' +
                pItem.MinValue +
                "," +
                pItem.MaxValue +
                ']" />';
            } else {
              html +=
                '<input type="text" class="getVal" value="' +
                value +
                '" ruleRequired="' +
                required +
                '" ruleReg="' +
                pItem.ValidateReg +
                '" />';
            }
          }
          // 文本域
          if (type == "2") {
            html +=
              ' <textarea class="getVal" ruleRequired="' +
              required +
              '">' +
              value +
              "</textarea>";
          }
          //下拉框
          if (type == "3") {
            html += '<select class="getVal" ruleRequired="' + required + '">';
            html += '<option value="">请选择</option>';
            $.each(pItem.itemAry,function(eIndex,itemEle){
                var eleCode = itemEle.Code,eleName = itemEle.Name;
                if(pItem.DefaultValue == eleCode){
                    html += '<option value="'+eleCode+'" selected="" data-name="'+eleName+'">'+eleName+'</option>'
                }else{
                    html += '<option value="'+eleCode+'" data-name="'+eleName+'">'+eleName+'</option>'
                }
            });
            html += "</select>";
          }
          //单选框
          if (type == "4") {
            html +=
              ' <div class="getVal" type="get_radio" @click="handle" ruleRequired="' +
              required +
              '">';
            $.each(pItem.itemAry,function(rIndex,itemRle){
                var eleCode = itemRle.Code,eleName = itemRle.Name;
                if(value == eleCode){
                    html += '<label>'
                    html += '<input type="radio" name="'+pItem.validateKey+'" data-code="'+eleCode+'" data-name="'+eleName+'" checked="" />'+eleName
                    html += '</label>'
                }else{
                    html += '<label>'
                    html += '<input type="radio" name="'+pItem.validateKey+'" data-code="'+eleCode+'" data-name="'+eleName+'" />'+eleName
                    html += '</label>'
                }
            });
            html += " </div>";
          }
          // 复选框
          if (type == "5") {
            html +=
              ' <div class="getVal" type="get_checkbox" ruleRequired="' +
              required +
              '">';
            $.each(pItem.itemAry,function(bIndex,itemBle){
                var eleCode = itemBle.Code,eleName = itemBle.Name;
                if(value == itemBle.selectVal){
                    html += '<label>'
                    html += '<input type="checkbox" name="'+pItem.validateKey+'" data-code="'+eleCode+'" data-name="'+eleName+'" checked="" />'+eleName
                    html += '</label>'
                }else{
                    html += '<label>'
                    html += '<input type="checkbox" name="'+pItem.validateKey+'" data-code="'+eleCode+'" data-name="'+eleName+'" />'+eleName
                    html += '</label>'
                }
            });
            html += " </div>";
          }
          //数字框
          if (type == "6") {
            if (pItem.MinValue != null || pItem.MaxValue != null) {
              html +=
                '<input type="text" class="getVal" value="' +
                value +
                '" ruleRequired="' +
                required +
                '" ruleReg="' +
                pItem.ValidateReg +
                '" ruleRange="[' +
                pItem.MinValue +
                "," +
                pItem.MaxValue +
                ']" ruleDigit="' +
                pItem.DigitCount +
                '" />';
            } else {
              html +=
                '<input type="text" class="getVal" value="' +
                value +
                '" ruleRequired="' +
                required +
                '" ruleReg="' +
                pItem.ValidateReg +
                '" ruleRange="" ruleDigit="' +
                pItem.DigitCount +
                '" />';
            }
          }
          //日期框
          if (type == "7") {
            var dateType = "'yyyy-MM-dd'";
            html +=
              ' <input type="text" class="getVal j-datePicker Wdate" value="' +
              value +
              '" minData="' +
              minData +
              '" maxData="' +
              maxData +
              '" ruleRequired="' +
              required +
              '" onclick="WdatePicker({dateFmt:' +
              dateType +
              '})" onfocus="this.blur()"/>';
          }
          //时间框
          if (type == "8") {
              var dateType = "'HH:mm'"
               html +=
              ' <input type="text" class="getVal j-datePicker Wdate" value="' +
              value + '" minData="' +minData +'" maxData="' +maxData +'" ruleRequired="' +required +'" onclick="WdatePicker({dateFmt:' +dateType +'})" onfocus="this.blur()" />';
          }
          //日期时间框
          if (type == "9") {
            var dateType = "'yyyy-MM-dd HH:mm'";
            html +=
              ' <input type="text" class="getVal j-datePickerTime Wdate" value="' +
              value +
              '" minData="' +
              minData +
              '" maxData="' +
              maxData +
              '" ruleRequired="' +
              required +
              '" onclick="WdatePicker({dateFmt:' +
              dateType +
              '})" onfocus="this.blur()"/>';
          }
          html += "</td>";
          html += "</tr>";
        });
        html += "</table>";
        html += "</div>";
      });
      return html;
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
  .title {
    margin: 0 20px;
    font-size: 20px;
    padding: 10px 0px;
    color: #333333;
    font-weight: bold;
    padding-top: 0px;
  }
  .table_container {
    height: calc(100% - 60px);
    overflow: hidden;
  }
  .basicInfo {
    margin: 0 20px;
  }
  .tips {
    margin: 10px 20px;
    overflow: hidden;
  }
  .spanlist{
    width: 100%;
    overflow-y: hidden;
    white-space: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling:touch
  }
  .seach-all {
    border-right: 1px solid #ffffff;
    display: inline-block;
    text-align: center;
    padding: 10px 12px;
    border-radius: 3px;
    font-size: 14px;
    color: #ffffff;
    background-color: #0fa9ab;
  }
  .seach-all:last-child {
    border-right: none;
  }
  .seachchange {
    background-color: #6fa6e8;
  }
  .followContent {
    height: calc(100% - 155px);
    display: inline-block;
    overflow-x: hidden;
    overflow-y: auto;
    padding-bottom: 20px;
  }
  .followList {
    margin: 0 20px;
    display: inline-block;
  }
  .btn_list{
    width: 100%;
    text-align: center;
    height: 40px;
    line-height: 40px;
  }
  .followList >>> .title_head {
    width: 100%;
    height: 36px;
    line-height: 36px;
    font-size: 14px;
    font-weight: bold;
    background-color: rgb(233, 251, 255);
    padding-left: 10px;
  }
  .followList >>> .ElemRemark{
    font-size: 12px;
    color: #a4bfbf;
  }
  .followList >>> input[type="checkbox"], .followList >>> input[type="radio"] {
    vertical-align: middle;
    height: 16px;
    width: 16px;
    display: inline-block;
    margin-top: -2px;
  }
  .followList >>> label {
    padding-left: 0px;
    padding-right: 12px;
    font-weight: normal;
  }
  .followList >>>  i {
    top: 4px;
    position: relative;
    font-size: 18px;
    padding-left: 0;
    padding-right: 2px;
    font-weight: bold;
    color: red;
    font-style: normal;
  }
  .followList >>> input {
    width: 172px;
    height: 26px;
    line-height: 26px;
    border: 1px solid #aaa;
    display: inline-block;;
  }
  .followList >>> select{
    border: 1px solid #aaa;
    width: 170px;
    height: 26px;
    line-height: 26px;
    border-radius: 2px;
    background-color: #fff;
  }
  .followList >>> textarea{
    border: 1px solid #aaa;
    width: 500px;
    height: 100px;
    border-radius: 2px;
  }
  .followList >>> .table_detail{
    font-size: 16px;
    table-layout: fixed;
  }
  .followList >>> .table_detail tr td{
    width: 10%;
    border: 1px solid #cce8e8;
    background-color: #fafbfd;
    height: 26px;
    line-height: 26px;
    padding-right: 16px;
  }
  .followList >>> .table_detail tr td:first-child{
    width: 4.8%;
    text-align: right;
  }
  .followList >>> .table_detail tr .getTd{
    text-align: left;
    padding: 5px;
    background-color: #fff;
  }
  .table {
    display: table;
    border-collapse: collapse;
    width: 100%;
    font-size: 14px;
    margin-bottom: 10px;
  }
  .table-column-group {
    display: table-column-group;
  }
  .table-column {
    display: table-column;
    width: 100px;
  }
  .table-row-group {
    display: table-row-group;
  }
  .table-row {
    display: table-row;
  }
  .table-row-group .table-row:hover,
  .table-footer-group .table-row:hover {
    background: #f6f6f6;
  }
  .table-cell {
    display: table-cell;
    padding: 0 5px;
    border: 1px solid #cce8e8;
    line-height: 30px;
    text-align: center;
  }
  .getLi {
    width: 20%;
    max-width: 20%;
  }
  .className {
    text-align: right;
    color: #333333;
    background-color: #fafbfd;
  }
</style>


