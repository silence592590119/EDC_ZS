import * as mUtils from '../utils/mUtils'
 /**
 * 加载数据
 */
export const loadFollowData = (_EleData,displayMode,id) => {
    $.each(_EleData, function (index, item) {
        $(".getVal").each(function (pIndex, pItem) {
            var $item = $(pItem), itemType;
            itemType = pItem.type == undefined ? $(pItem).attr('type') : pItem.type;
            var $itemParent,attrId,segmentId
            if(displayMode == 1){
                $itemParent = $item.parent();
            }else{
               if(itemType == 'get_checkbox' || itemType == 'get_radio') $itemParent = $item.parent();
               else $itemParent = $item.parent().parent();
            }
            attrId = $itemParent.attr("elementid");segmentId = $itemParent.attr("segmentid")
            if (attrId == item.ElementId && id == item.CheckItemId) {
                var obj_f = item.FollowData;
                if (item.UIType == '4') {
                  if(item.ExpressiveForm == "1"){
                    $item.find("input[type='radio']").removeAttr("checked");
                    $item.find("input[data-code='" + obj_f.Content + "']").prop("checked", "checked");
                    $item.find("input[data-code='" + obj_f.Content + "']").data("waschecked", true);
                  }else{
                    mUtils.setFormVal($item, obj_f["Content"])[itemType]();  
                  }
                }
                else if (item.UIType == '5') {
                  if(item.ExpressiveForm == "1"){
                    $item.find("input[type='checkbox']").removeAttr("checked");
                    if (mUtils.isEmpty(obj_f["Content"])) return false;
                    var arr = obj_f["Content"].split(',');
                    $.each(arr, function (i, o) {
                      $item.find("input[data-code='" + o + "']").prop("checked", "checked");
                    });
                  }else{
                    var ElementCheckItemId = item.CheckItemId + '_'+item.ElementId;
                    $("." + ElementCheckItemId).find("option").removeAttr("selected");
                    if(mUtils.isEmpty(obj_f["Content"])) return true;
                    var arr = obj_f["Content"].split(',');
                    //多选下拉框
                    if (arr.length == 0) {
                        return true;
                    }else{
                      $("." + ElementCheckItemId).val(arr);
                      $("." + ElementCheckItemId).trigger("chosen:updated");
                    }
                  }
                }else if(item.UIType == '11'){
                  if(!mUtils.isEmpty(obj_f.Content)){
                    var list = obj_f.Content.split(','),_list=[];
                    for(let i=0;i<list.length;i++){
                      let param ={};
                      param.path=list[i];
                      if(item.ImageEye !="" && item.ImageEye!= 'TE001' ){
                        param.eye = item.ImageEyeName;
                      }else  param.eye ='';
                      param.checkitemID = item.CheckItemId;
                      _list.push(param);
                    }
                    mUtils.cm_html(_list,segmentId,$item);
                    $.each(list, function (i, o) {
                      $item.find("input[data-code='" + o + "']").prop("checked", "checked").attr("disabled","disabled");
                    });
                  }
                }
                else{
                  mUtils.setFormVal($item, obj_f["Content"])[itemType]();
                } 
            }
        });
    });
    if($("input[data-name='dateBegin']")) $("input[data-name='dateBegin']").val(mUtils.afterDate(-6))
    if($("input[data-name='dateEnd']")) $("input[data-name='dateEnd']").val(mUtils.getCurrentDate())
}
/**
 * 通过父级code获取子级数据数组
 */
export const isHiddenButton = (status,displayMode) => {
    if(status == 2){
        $(".followList .getVal").attr("disabled",'disabled');
        $(".followList .getVal").find("input,select").attr("disabled",'disabled')
        $(".btn_list,.dock_system,.CalculateBtn").hide();
    }else{
        $(".followList .getVal").removeAttr("disabled");
        $(".btn_list,.dock_system,.CalculateBtn").show();
        if(displayMode == 1){
          $(".table_detail .getVal").each(function(index,item){
            if($(item).siblings().length > 0){
              $(item).attr("disabled",'disabled').css({"background-color":'#ebebe4'});
            }
          });
        }
        $(".followList select.chosen-select").removeAttr("disabled");
        $(".followList").find("input[type=text],select,textarea").removeAttr("disabled").css({"background-color":'#ffffff'});
        $(".followList input.Wdate").removeAttr("disabled").css({"background-color":'#ffffff'});
    }
}
/**
 * 通过父级code获取子级数据数组
 */
export const getChildData = (dictionaryData,parentCode) => {
    var arr = [];
    $.each(dictionaryData.childData,(index, item) => {
        if (item.ParentCode == parentCode) {
            arr.push(item);
        }
    });
    return arr;
}
/**
 * 根据段落类型参数  返回展示问卷和表单模式 页面
 */
export const getConfigHtml = (jsonData,isType,scoreData) => {
  let  html = "",dockFlag="",dockName="",EyeCode="",cluFlag="";
  var ateType = "'yyyy-MM-dd'";
  $.each(jsonData, function(index, item) {
   // html += "<div class='divider'></div>"
    if(isType == 1) html += ' <div class="followList titleList"><div class="title_detail">';
    else  html += ' <div class="followList questionList"><div class="question_detail">';
    //同步按钮显示
    if(item.InterfaceSystemCode != '' && item.InterfaceSystemCode !=1){
      html+='<div class="dock_system" data-Id="'+item.Id+'" data-Code="'+item.InterfaceSystemCode+'">'
      if(item.InterfaceSystemCode !=5){
        html+='<input type="text" class="getVal j-datePicker Wdate" data-name="dateBegin" onclick="WdatePicker({dateFmt:' +
        ateType +'})" onfocus="this.blur()"/>'
        html+='<span>至</span>'
        html+='<input type="text" class="getVal j-datePicker Wdate" data-name="dateEnd" onclick="WdatePicker({dateFmt:' +
        ateType +'})" onfocus="this.blur()"/>'
      }
      html += '<select class="getDock" data-name="dock">';
      if(item.InterfaceSystemCode == 2){
        //html += '<option value="">请选择</option>';
        item.itemAry = item.itemAry.filter(res=>{return res.Code === item.DictCode});
      }
      $.each(item.itemAry,function(dIndex,itemDck){
        var eleCode = itemDck.Code,eleName = itemDck.Name;
        if(item.DictCode == eleCode){
          html+="<option value='"+eleCode+"' selected='' data-name='"+eleName+"'>"+eleName+"</option>"
        }else{
          html+="<option value='"+eleCode+"' data-name='"+eleName+"'>"+eleName+"</option>"
        }
      });
      html+="</select>"
      if(item.InterfaceSystemCode == 5) dockName = item.JianYanName;
      else dockName = item.InterfaceSystemName;
      html+="<button data-Id='"+item.Id+"' data-Code='"+item.InterfaceSystemCode+"' class='dockHandle'>"+dockName+"同步</button></div>"
    }
    //同步按钮显示end
    html += '<table class="table_detail">';
    $.each(item.Children, function(pIndex, pItem) {
      let type = pItem.UIType,required = pItem.IsRequired, value = pItem.DefaultValue,
          dictFormName = pItem.DictFormName,minData = pItem.BeginDate,maxData = pItem.EndDate,
          checkDetailDictCode = pItem.CheckDetailDictCode,IsShow="";
      if(pItem.IsShow == '1'){
        IsShow = 'ElementShow'
      }else{
        IsShow = 'ElementHide'
      }
      html += '<tr class="'+IsShow+'">';
      if(isType == 1){
        html += "<td>";
        if (required == "1") {
            html += "<i>*</i>";
        }
        if(pItem.ImageEye !="" ){
          if(pItem.ImageEye !='TE001'){
            html += "<span>" + pItem.ElementName+'——'+pItem.ImageEyeName + "</span></br>";
          }else{
            html += "<span>" + pItem.ElementName + "</span></br>";
          }
        }else html += "<span>" + pItem.ElementName + "</span></br>";
        if (pItem.Remark) {
            html += '<span class="ElemRemark">【' + pItem.Remark + "】</span>";
        }
        html += "</td>";
      }else{
        html += "<td class='questionName'>";
        if (required == "1") {
          html += "<i>*</i>";
          html += "<span class='yesRequired'>" + pItem.ElementName + "</span>";
        }else{
           html += "<span class='noRequred'>" + pItem.ElementName + "</span>";
        }
        if (pItem.Remark) {
          html += '<span class="ElemRemark">【' + pItem.Remark + "】</span>";
        }
        html += "</td>";
        html += "</tr>";
        html += '<tr class="'+IsShow+'">';
      }
      if(type == 11) EyeCode = pItem.ImageEye
      else EyeCode = pItem.Eye
      html +=
        '<td class="getTd" EyeCode="'+EyeCode+'" checkDetailDictCode="'+checkDetailDictCode+'" elementID="' +
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
        '" ExpForm="'+pItem.ExpressiveForm+'" >';
      // 文本框
      if (type == "1") {
        if(isType == 2) html += "<div class='text_input'>"
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
            '<input type="text" class="getVal" value="' +value +'" ruleRequired="' +required +'" ruleReg="' +pItem.ValidateReg +'" />';
        }
        if(isType == 2) html += "</div>"
      }
      // 文本域
      if (type == "2") {
        if(isType == 2) html += "<div class='text_texteara'>"
        html +=' <textarea class="getVal" ruleRequired="' +required +'">' +value + "</textarea>";
        if(isType == 2) html += "</div>"
      }
      //单选框
      if (type == "4") {
        pItem.itemAry = setDicNumber(pItem.itemAry,scoreData,pItem.Id,pItem.IsDisplay)
        if(pItem.ExpressiveForm == '1'){
          html +='<div class="getVal" type="get_radio" @click="handle" ruleName="'+pItem.validateKey+'" ruleRequired="' +required +'">';
          $.each(pItem.itemAry,function(rIndex,itemRle){
              var eleCode = itemRle.Code,eleName = itemRle.Name;
              if(!mUtils.isEmpty(itemRle.Score)){
                eleName = itemRle.Name + itemRle.Score;
              }
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
        }else{
          if(isType == 2) html += "<div class='text_input'>"
          html += '<select class="getVal" ruleRequired="' + required + '">';
          html += '<option value="">请选择</option>';
          $.each(pItem.itemAry,function(eIndex,itemEle){
              var eleCode = itemEle.Code,eleName = itemEle.Name;
              if(!mUtils.isEmpty(itemEle.Score)){
                eleName = itemEle.Name + itemEle.Score;
              }
              if(pItem.DefaultValue == eleCode){
                  html += '<option value="'+eleCode+'" selected="" data-name="'+eleName+'">'+eleName+'</option>'
              }else{
                  html += '<option value="'+eleCode+'" data-name="'+eleName+'">'+eleName+'</option>'
              }
          });
          html += "</select>";
          if(isType == 2) html += "</div>"
        }
      }
      // 复选框
      if (type == "5") {
        if(pItem.ExpressiveForm == '1'){
          html +=' <div class="getVal" type="get_checkbox" ruleRequired="' +required +'">';
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
        }else{
          var ElementCheckItemId = pItem.CheckItemId + '_'+ pItem.ElementId;
          if(isType == 2) html += "<div class='text_input'>"
          html +='<select class="getVal chosen-select '+ElementCheckItemId+'" data-CheckBox="true" data-Checked="'+ElementCheckItemId+'" data-placeholder="请选择" multiple="" ruleRequired="' +required +'">'
          $.each(pItem.itemAry,function(eIndex,itemEle){
            var eleCode = itemEle.Code,eleName = itemEle.Name;
            if(pItem.DefaultValue == eleCode){
                html += '<option value="'+eleCode+'" selected="" data-name="'+eleName+'">'+eleName+'</option>'
            }else{
                html += '<option value="'+eleCode+'" data-name="'+eleName+'">'+eleName+'</option>'
            }
          });
          html+='</select>'
          if(isType == 2) html += "</div>"
        }
      }
      //数字框
      if (type == "6") {
        if(isType == 2) html += "<div class='text_input'>"
        if (pItem.MinValue != null || pItem.MaxValue != null) {
          //判断有无计算按钮，输入框是否禁用
          if(pItem.IsCalculateBtn == 1){
            html += '<input type="text" class="getVal"  value="' + value + '"  ruleRequired="' + required + '" ruleReg="' + pItem.ValidateReg +'" ruleRange="[' +pItem.MinValue +"," +pItem.MaxValue +']" ruleDigit="' +pItem.DigitCount +'" />';
            html += "<div data-type='"+type+"' data-Id='"+item.Id+"' data-eleID='"+pItem.ElementId+"' class='CalculateBtn'>计算</div>"
            if(isType == 2) html += "</div>"
            html += '<div class="CalculateName">计算公式:'+pItem.CalculationFormulaName+'</div>'
          }else{
            html += '<input type="text" class="getVal" value="' + value + '"  ruleRequired="' + required + '" ruleReg="' + pItem.ValidateReg +'" ruleRange="[' +pItem.MinValue +"," +pItem.MaxValue +']" ruleDigit="' +pItem.DigitCount +'" />';
          }
        } else {
          if(pItem.IsCalculateBtn == 1){
            html += '<input type="text" class="getVal" value="' + value + '" ruleRequired="' +required +'" ruleReg="' +pItem.ValidateReg +'" ruleRange="" ruleDigit="' +pItem.DigitCount + '" />';
            html += "<div data-type='"+type+"' data-Id='"+item.Id+"' data-eleID='"+pItem.ElementId+"' class='CalculateBtn'>计算</div>"
            if(isType == 2) html += "</div>"
            html += '<div class="CalculateName">计算公式:'+pItem.CalculationFormulaName+'</div>'
          }else{
            html += '<input type="text" class="getVal" value="' + value + '" ruleRequired="' + required + '" ruleReg="' + pItem.ValidateReg + '" ruleRange="" ruleDigit="' + pItem.DigitCount + '" />';
          }  
        }
        
      }
      //日期框
      if (type == "7" || type == '8' || type == '9') {
        if(isType == 2) html += "<div class='text_input'>"
        let dateId = 'ele-'+pItem.ElementId+'_'+pItem.CheckItemId; 
        html +=
          ' <input type="text" id="'+dateId+'" class="getVal j-datePicker Wdate" value="' +
          value +
          '" minData="' +
          minData +
          '" maxData="' +
          maxData +
          '" ruleRequired="' +
          required +
          '" onfocus="this.blur()" />';
        if(isType == 2) html += "</div>"
      }
      //图片控件
      if(type == '11'){
        html +='<div class="FileImgBox getVal" type="get_img" ruleRequired="' +required +'" >'
        html += '<ul class="fileBoxYanUl" id="fileImgBox" name="ul"></ul>'
      }
      html += "</td>";
      html += "</tr>";
    });
    html += "</table>";
    html += "</div></div>";
  });
  return html;
}
/*字典分值处理*/
export const setDicNumber = (data,scoreData,itemId,IsDisplay) => {
  if(!mUtils.isEmpty(data)){
    if(!IsDisplay){
      $.each(data,function(index,item){
        item.Score = '';
      })
    }else{
      $.each(data,function(index,item){  
        if(!mUtils.isEmpty(scoreData)){
          $.each(scoreData,function(pIndex,pItem){
            if(pItem.CheckitemElementID == itemId && item.Id == pItem.DictDetailID){
              item.Score = '('+pItem.Score+'分)';
            }
          })
        }
      })
    }
  }
  
  return data;
}
export const _$dock=(data,_$val,_$code) =>{
  var result = {};
  $.each(data,function(index,item){
    if(_$val == item.Code){
      result = item[_$code]
    }
  });
  return result;
}

//获取数据
export const _$getEleData=(displayMode,segID,CheckElementData)=>{
 let Children = CheckElementData[0].Children;
  let obj={},arrData = [],requireArr = [],radioArr = [];
  $(".getVal").each(function(index, item) {
    let $item = $(item),attrReq = $item.attr("rulerequired"),itemType,attrLogic = $item.attr("logcRequired");
    var  $itemParent, attrId, attrType, attrDic;
    itemType = item.type == undefined ? $(item).attr("type") : item.type;
    if (displayMode == 1) {
      $itemParent = $item.parent();
    }else {
      if (itemType == "get_checkbox" || itemType == "get_radio")
        $itemParent = $item.parent();
      else $itemParent = $item.parent().parent();
    }
    attrId = $itemParent.attr("elementid");
    attrType = $itemParent.attr("uitype");attrDic = $itemParent.attr("dictformname");
    $.each(Children, function(index, item) {
      if (attrId == item.ElementId && segID == item.CheckItemId) {
        var obj_f = item.FollowData;
        obj_f.CheckItemId = item.CheckItemId;
        obj_f.ElementId = item.ElementId;
        obj_f.UIType = attrType;
        if (!mUtils.isEmpty(attrDic)) obj_f.ParentDictCode = attrDic;
        obj_f.Value = $item.find("option:selected").text();
        if (item.UIType == "4") {
          let parent = $item.parent().parent();
          if ($(parent).css("display") != "none") {
            if(item.ExpressiveForm == '1'){
              obj_f.Content = $item.find("input[type=radio]").filter((i, o) => o.checked).attr("data-code") || "";
              obj_f.Value = $item.find("input[type=radio]").filter((i, o) => o.checked).attr("data-name") || "";
            }else{
              obj_f.Content = mUtils.getFormVal($item)[itemType]();
            }
          } else {
            obj_f.Content = "";
            obj_f.Value = "";
          }
        } else if (item.UIType == "5" || item.UIType == "11") {
          obj_f.Content = "";obj_f.Value = "";
          let parent = $item.parent().parent();
          if ($(parent).css("display") != "none") {
            if((item.ExpressiveForm == '1' && item.UIType == "5") || item.UIType == "11"){
              $item.find("input[type=checkbox]").each(function(i, o) {
                if (o.checked) {
                  obj_f.Content += $(this).data("code") + ",";
                  obj_f.Value += $(this).data("name") + ",";
                }
              });
              if (!mUtils.isEmpty(obj_f.Content)) {
                obj_f.Content = obj_f.Content.substring(0,obj_f.Content.length - 1);
              }
              if (!mUtils.isEmpty(obj_f.Value)) {
                obj_f.Value = obj_f.Value.substring(0,obj_f.Value.length - 1);
              }
              if(item.UIType == "11") obj_f.Value ="";
            }else{
              if (!mUtils.isEmpty($item.val())) {
                obj_f.Content = $item.val().toString();
              }
              if ($item.parent().find(".search-choice").length > 0) {
                  var $searchChoice = $item.parent().find(".search-choice"),arrChoice="";
                  $searchChoice.each(function (index, item) {
                    var $item = $(item);
                    arrChoice += $item.find("span").html() + ',';
                  });
                  if (!mUtils.isEmpty(arrChoice)) {
                    obj_f.Value = arrChoice.substring(0, arrChoice.length - 1);;
                  }
              }
            }
          }
        } else {
          let parent = null;
          parent = displayMode == 1? $item.parent().parent(): $item.parent().parent().parent();
          if ($(parent).css("display") != "none") {
            obj_f.Content = mUtils.getFormVal($item)[itemType]();
          } else {
            obj_f.Content = "";
            obj_f.Value = "";
          }
        }
        arrData.push(obj_f);
        if (item.UIType != "4" && item.UIType != "5" && item.UIType != "11") {
          if (displayMode == 1){
              if ($item.parent().parent().css("display") != "none")
              requireArr.push($item);
          }
          if (displayMode == 2){
            if ($item.parent().parent().parent().css("display") != "none")
              requireArr.push($item);
          } 
        } else {
          if (attrReq == "1" || attrLogic == 1) {
            if ($item.parent().parent().css("display") != "none")
              if(item.ExpressiveForm == '2'){
                requireArr.push($item);
              }else radioArr.push($item);
          }
        }
      }
    })
  });
  obj.arrData = arrData;obj.requireArr = requireArr;obj.radioArr = radioArr;
  return obj;
}

export const initCheckBox=(isType)=>{
  $(".chosen-select").each(function(index,item){
    var $dataCheckBox = $(item).attr("data-Checked");
    $("."+$dataCheckBox).chosen("chosen:updated");
    $(".chosen-select").chosen({no_results_text:"没有找到任何数据!",width:"",display_selected_options:false});
    if(isType == '1') {
      $(".chosen-container").css({"width":"auto","min-width":"90%"});
      $(".chosen-container-multi .chosen-choices").css({"margin-top":"0px","height":"46px","line-height": "46px"});
      $(".chosen-container .chosen-drop").css({"top":"113%","border":'1px solid #ccc'});
    }
    else $(".chosen-container").css({"width":"100%"});
    $(".chosen-container li.search-field").find("input").css("width","54px");
  })
}
/*start 新逻辑校验 */
//数据加载时 执行逻辑校验
export const loadLogical = (list,isType,isAdd) => {
  $(".getTd").each(function (index, item) {
    var $item = $(item),logControl = $item.attr("logControl"), details = $item.attr("logControlDetails"),
    defaultValue = $item.attr("defaultValue");
    let result = [], condition = [], state = "", _$state = "";
    logControl= JSON.parse(Base64.decode(logControl));
    details = JSON.parse(Base64.decode(details));
    if (details.length > 0) {
      $.each(details, function (index, item) {
          if (item.Type == 1) condition.push(item);
          if (item.Type == 2) result.push(item);
      });
      if (condition.length == 0) {
          if (result.length > 0) _$setResult(result);
      } else {
        $.each(logControl, function (index, item) {
          var arr = [], arr1 = [];
          $.each(details, function (pIndex, pItem) {
            if (mUtils.isEmpty(item.ParentID)) {
                if (item.ID == pItem.LogicalID) {
                    if (pItem.Type == 1) arr.push(pItem);
                    if (pItem.Type == 2) arr1.push(pItem)
                }
            } else {
                if (item.ParentID == pItem.LogicalID) {
                    if (pItem.Type == 1) arr.push(pItem);
                    if (pItem.Type == 2) arr1.push(pItem)
                }
            }
          });
          state = _$getLoadCondition(arr, list, defaultValue);
          _$state = item.ConditionRelation == 1 ? !/false/.test(state) : /true/.test(state);
          if (_$state) {
            _$setResult(arr1,isType, isAdd);
          }
        });
      }
    }          
  });
}
//页面加载时 判断逻辑校验时的条件是否成立
export const _$getLoadCondition = (condition, checkList, defaultValue) => {
  var state = "";
  $.each(condition, function (pIndex, pItem) {
      $.each(checkList, function (index, item) {
          if (item.ElementId == pItem.ElementId && item.CheckItemId == pItem.CheckItemId) {
              var data = item.FollowData.Content;
              if (!mUtils.isEmpty(data)) {
                  state += _$getLoadLogic(pItem.UIType, data, pItem.Operator, pItem.OperatorValue);
              } else {
                  if (defaultValue) {
                      state += _$getLoadLogic(pItem.UIType, data, pItem.Operator, defaultValue);
                  } else {
                      state += false;
                  }
              }
          }
      })
  });
  return state;
};
//页面加载时 逻辑校验时的条件
export const _$getLoadLogic = (UIType, data, Operator, Value) => {
    var state = "";
    if (UIType == 5) {
        var val = data.split(",");
        if (mUtils.contains(val,Value)) {
            state += Operator == 11 ? true : false;
        } else {
            state += Operator == 11 ? false : true;
        };
    } else if (UIType == 4) {
        if (Value == data) {
            state += Operator == 11 ? true : false;
        } else {
            state += Operator == 11 ? false : true;
        }
    } else {
        state += _$getOperator(Operator, data, Value);
    }
    return state;
};
//逻辑校验
export const logicalConfig = (logicData, objData,isType) => {
  var result = [], condition = [], state = "", _$state = "";
  $.each(objData, function (index, item) {
    if (item.Type == 1) condition.push(item);//条件
    if (item.Type == 2) result.push(item);//动作
  });
  if (condition.length == 0) {
    if (result.length > 0) _$setResult(result, isType,true);
  } else {
    $.each(logicData, function (index, item) {
      var arr = [], arr1 = [];
      $.each(objData, function (pIndex, pItem) {
        if (mUtils.isEmpty(item.ParentID)) {
          if (item.ID == pItem.LogicalID) {
            if (pItem.Type == 1) arr.push(pItem);
            if (pItem.Type == 2) arr1.push(pItem);
          }
        } else {
          if (item.ParentID == pItem.LogicalID) {
            if (pItem.Type == 1) arr.push(pItem);
            if (pItem.Type == 2) arr1.push(pItem);
          }
        }
      });
      state = _$getCondition(arr);
      _$state = item.ConditionRelation == 1 ? !/false/.test(state) : /true/.test(state);
      if (_$state) {
        _$setResult(arr1, isType,true);
      }
    });
  }
}
//获取逻辑校验时的条件
export const _$getCondition = (condition) => {
  var state = "";
  $.each(condition, function (pIndex, pItem) {
      $(".getTd").each(function (index, item) {
          var $item = $(item), elementID = $item.attr("elementid"), segmentID = $item.attr("segmentid"), type = $item.attr("uiType"), ExpForm = $item.attr("ExpForm");
          if (elementID == pItem.ElementId && segmentID == pItem.CheckItemId) {
            if (/4|5/.test(type)) {
              var $node = $item.children(), val = "";
              if (/4/.test(type)) {
                if (ExpForm == 1) {
                  val = $node.find("input[type=radio]").filter((i, o) => o.checked).attr("data-code");
                  //选中 不选中
                  if ($("input[type=radio][name='" + $($node).attr("ruleName") + "']").is(":checked")) {
                    if (val == pItem.OperatorValue) {
                        state += pItem.Operator == 11 ? true : false;
                    } else {
                        state += pItem.Operator == 11 ? false : true;
                    }
                  } else {
                    state += pItem.Operator == 11 ? false : true;
                  }
                } else {
                  val = $node.val();
                  if (val == pItem.OperatorValue) {
                      state += pItem.Operator == 11 ? true : false;
                  } else {
                      state += pItem.Operator == 11 ? false : true;
                  }
                }
              }
              if (/5/.test(type)) {
                if (ExpForm == 1) {
                  $node.find("input[type=checkbox]").each(function (i, o) {
                    if (o.checked) {
                        val += $(this).data("code") + ',';
                    }
                  });
                } else {
                  if (!mUtils.isEmpty($node.val())) {
                    val = $node.val().toString().split(",");
                  }
                }
                if (!mUtils.isEmpty(val)) {
                  if (ExpForm == 1) val = val.substring(0, val.length - 1).split(",");
                  if (mUtils.contains(val,pItem.OperatorValue)) {
                      state += pItem.Operator == 11 ? true : false;
                  } else {
                      state += pItem.Operator == 11 ? false : true;
                  }
                } else {
                  state += pItem.Operator == 11 ? false : true;
                }
              }
            } else {
              var $node = $item.children();
              if (!mUtils.isEmpty($($node).val())) {
                state += _$getOperator(pItem.Operator, $($node).val(), pItem.OperatorValue);
              } else {
                state += false;
              }
            }
          }
      });
  });
  return state;
}
//根据条件，实施逻辑结果
export const _$setResult = (result,isType, isAdd) => {
  $.each(result, function (pIndex, pItem) {
    $(".getTd").each(function (index, item) {
      var $item = $(item), elementID = $item.attr("elementid"), segmentID = $item.attr("segmentid"), 
      type = $item.attr("uiType"), ExpForm = $item.attr("ExpForm");
      if (elementID == pItem.ElementId && segmentID == pItem.CheckItemId) {
        let ElementCheckItemId = pItem.CheckItemId + '_' + pItem.ElementId;
        if (pItem.OperatorResult == 101 || pItem.OperatorResult == 107) {// 101隐藏与107显示
          let $type = pItem.OperatorResult== 101?true:false;
          _$setShowHidden($type, $item, type, ExpForm, pItem.ElementCheckItemId,isType);
        } else if (pItem.OperatorResult == 103 || pItem.OperatorResult == 108) {//103必填与108不必填
          if ($item.parent().css("display") != 'none') {
            let $type = pItem.OperatorResult== 103?true:false;
            _$setEleRequired($type,type,$item,ExpForm,isType);
          }
      } else if (pItem.OperatorResult == 109 && isAdd) {//覆盖赋值
        if ($item.parent().css("display") != 'none') {
          var OperatorValue = pItem.OperatorValue;
          if (type == '4') {
            if (ExpForm == "1") {
              $item.find("input[type='radio']").removeAttr("checked");
              $item.find("input[data-code='" + OperatorValue + "']").prop("checked", "checked");
              $item.find("input[data-code='" + OperatorValue + "']").data("waschecked", true);
            } else {
              $item.find("select").val(OperatorValue);
            }
          } else if (type == '5') {
            _$setReduce(true, $item, ExpForm, OperatorValue, ElementCheckItemId);
          } else {
            $item.find("input,textarea,select").val(OperatorValue);
          }
        }
      } else if (pItem.OperatorResult == 110 && isAdd) {//追加赋值
        if ($item.parent().css("display") != 'none') {
          _$setAdd(type,$item, ExpForm, pItem.OperatorValue, ElementCheckItemId)
        }
      } else if (pItem.OperatorResult == 111 && isAdd) {//追减赋值
            var OperatorValue = pItem.OperatorValue;
            if ($item.parent().css("display") != 'none') {
              if (/1|2/.test(type)) {
                _$setTextCheckBoxtMinus(true,$item,OperatorValue,ExpForm,ElementCheckItemId)
              } else if (/5/.test(type)) {
                _$setTextCheckBoxtMinus(false,$item,OperatorValue,ExpForm,ElementCheckItemId)
              }
            }
        }
      }
    });
  });
}
//实施逻辑结果时，下拉多选或复选 覆盖赋值、追加赋值公共方法
export const _$setReduce = ($type, $item, ExpForm, OperatorValue, ElementCheckItemId) => {
    if (ExpForm == "1") {
        if ($type) $item.find("input[type='checkbox']").removeAttr("checked");
        if (mUtils.isEmpty(OperatorValue)) return false;
        var arr = OperatorValue.split(',');
        $.each(arr, function (i, o) {
            $item.find("input[data-code='" + o + "']").prop("checked", "checked");
        });
    } else {
        var arr = OperatorValue.split(',');
        //多选下拉框
        if (arr.length == 0) { return true; }
        if ($type) {
            $("." + ElementCheckItemId).find("option").removeAttr("selected");
        } else {
            if (!mUtils.isEmpty($item.find("select").val())) {
                var v_arr = $item.find("select").val().toString().split(',');
                arr.push(...v_arr);
                arr =[...new Set(arr)];
            }
        }
        $("." + ElementCheckItemId).val(arr);
        $("." + ElementCheckItemId).trigger("chosen:updated");
    }
}
//根据操作符编号获取操作符
export const _$getOperator = (Operator, val1, val2) => {
    var state = "";
    switch (Operator) {
        case 1:
            state = parseFloat(val1) == parseFloat(val2) ? true : false;
            break;
        case 2:
            state = parseFloat(val1) != parseFloat(val2) ? true: false;
            break;
        case 3:
            state = parseFloat(val1) < parseFloat(val2) ? true: false;
            break;
        case 4:
            state = parseFloat(val1) > parseFloat(val2) ? true: false;
            break;
        case 5:
            state = parseFloat(val1) <= parseFloat(val2) ? true : false;
            break;
        case 6:
            state = parseFloat(val1) >= parseFloat(val2) ? true: false;
            break;
    }
    return state
}
//根据操作结果 判断元素显示隐藏
export const _$setShowHidden = ($type, $item, type, ExpForm, ElementCheckItemId,isType) => {
  if ($type){
    if (/4|5/.test(type)) {
      if (ExpForm == 1) {
          $item.find("input").attr("checked", false);
      } else {
          if (/4/.test(type)) $item.find("select").val("");
          if (/5/.test(type)) {
              $("." + ElementCheckItemId).find("option").removeAttr("selected");
              $("." + ElementCheckItemId).trigger("chosen:updated");
          }
      }
    } else $item.find("input,select,textarea").val("");
    if(isType == 1) $item.parent().hide();
    else if(isType == 2) {
      $item.parent().hide();
      $item.parent().prev().hide();
    }
  } else{
    if(isType == 1)  $item.parent().show();
    else if(isType == 2) {
      $item.parent().show();
      $item.parent().prev().show();
    }
  } 
};
//根据结果 判断元素必填 不必填
export const _$setEleRequired = ($type,type,$item,ExpForm,isType) =>{
  let required = "",_$item_$ele = "",$preEle = null;
  if(/4|5/.test(type)){
    _$item_$ele = ExpForm == 1 ? $($item.find('div')):$($item.find('select.getVal'));
  }else{
    _$item_$ele = isType == 1 ? $($item.children()):$($item.children().children());
  }
  $preEle= isType == 1?$($item.prev()):$($item.parent().prev().children());
  let preHtml = $preEle.html();
  if($type){
    required = _$item_$ele.attr("rulerequired");
    _$item_$ele.attr("logcRequired", "1");
    if (required != 1) {
      if(preHtml.indexOf("*") == -1){
        if(isType == 1) $preEle.html("<i>*</i>"+preHtml);
        if(isType == 2){
          if($preEle.find("span").hasClass("noRequred")){
            preHtml = "<span>"+$preEle.find("span").html()+"</span>"
          }
          $preEle.html("<i>*</i>"+preHtml);
        } 
      }
    }
  }else{//不必填
    _$item_$ele.removeAttr("rulerequired").removeAttr("logcRequired");
    if(isType == 1){
      if (preHtml.indexOf("*") > -1) {
        $preEle.html(preHtml.replace("<i>*</i>", ""));
      } else $preEle.html(preHtml)
    }else{
      if(!$preEle.find("span").hasClass("noRequred")){
        preHtml = "<span class='noRequred' >"+$preEle.find("span").html()+"</span>"
      }
      $preEle.html(preHtml);
    }
  }
}
//追加赋值
export const _$setAdd = (type,$item,ExpForm,OperatorValue,ElementCheckItemId) =>{
  if (/1|2/.test(type)) {
    let dot = mUtils.isEmpty($item.find("input,textarea").val()) == true ? "" : "；";
    $item.find("input,textarea").val($item.find("input,textarea").val() + dot + OperatorValue);
  } else if (/5/.test(type)) {
    _$setReduce(false, $item, ExpForm, OperatorValue, ElementCheckItemId);
  }
}
//追减赋值 -- 文本框文本域true 复选false
export const _$setTextCheckBoxtMinus = ($type,$item,OperatorValue,ExpForm,ElementCheckItemId) =>{
  if($type){
    var str = $item.find("input,textarea").val(), str1 = "", str2 = "", str3 = "";
    if (str.lastIndexOf(OperatorValue) != -1) {
        str1 = str.substring(0, str.lastIndexOf(OperatorValue));
        str2 = str.substring(str.lastIndexOf(OperatorValue), str.length);
        str3 = str2.replace(OperatorValue, "");
        $item.find("input,textarea").val(str1 + str3);
    }
  }else{
    var v_code = "", v_arr = [], b_arr = [];
    if (ExpForm == "1") {
      $item.find("input[type=checkbox]").each(function (i, o) {
          if (o.checked) {
              v_code += $(this).data("code") + ',';
          }
      });
      if (!mUtils.isEmpty(v_code)) {
          v_arr = v_code.substring(0, v_code.length - 1).split(',');
      }
      $item.find("input[type='checkbox']").removeAttr("checked");
      if (mUtils.isEmpty(OperatorValue)) return false;
      b_arr = OperatorValue.split(',');
      let arr = v_arr.filter(items=> {
          if (!b_arr.includes(items)) return items;
      });
      $.each(arr, function (i, o) {
          $item.find("input[data-code='" + o + "']").prop("checked", "checked");
      });
    } else {
      if (!mUtils.isEmpty($item.find("select").val())) {
          v_arr = $item.find("select").val().toString().split(',');
      }
      $("." + ElementCheckItemId).find("option").removeAttr("selected");
      b_arr = OperatorValue.split(',');
      //多选下拉框
      if (b_arr.length == 0) { return true; }
      let arr = v_arr.filter(items=> {
          if (!b_arr.includes(items)) return items;
      });
      $("." + ElementCheckItemId).val(arr);
      $("." + ElementCheckItemId).trigger("chosen:updated");
    }
  }
}
/*end*/
