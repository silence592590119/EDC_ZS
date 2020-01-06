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
                   //if (mUtils.isEmpty(obj_f["Content"])) return false;
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
}
/**
 * 通过父级code获取子级数据数组
 */
export const isHiddenButton = (status) => {
    if(status == 2){
        $(".followList .getVal").attr("disabled",'disabled');
        $(".followList .getVal").find("input,select").attr("disabled",'disabled')
        $(".btn_list,.dock_system").hide();
    }else{
        $(".followList .getVal").removeAttr("disabled");
        $(".followList .getVal").find("input,select").removeAttr("disabled");
        $(".btn_list,.dock_system").show();
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
 * 根据问卷和表单模式  加载逻辑校验
 */
export const loadLogicalCheck = (_EleData,isType) => {
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
                            let data = item.FollowData.Content;
                            if(!mUtils.isEmpty(data)){
                                if(pItem.UIType == 5){
                                    let arr = data.split(',');
                                    if(mUtils.contains(arr,pItem.OperatorValue)){
                                        state = true;
                                    }
                                }else {
                                    if(pItem.OperatorValue == data) state = true;
                                }
                            }else {
                                let defValue = item.DefaultValue;
                                if(defValue){
                                    if(pItem.UIType == 5){
                                        let arr = defValue.split(',');
                                        if(mUtils.contains(arr,pItem.OperatorValue)){
                                            state = true;
                                        }
                                    }else {
                                        if(pItem.OperatorValue == defValue) state = true;
                                    }
                                }
                            }   
                        }
                    });
                });
            }
            if(state){
                $.each(result,function(pIndex,pItem){
                    $(".getTd").each(function(index,item){
                        var $item = $(item),type=$item.attr("uiType"),elementID = $item.attr("elementid"),segmentID = $item.attr("segmentid");
                        if(elementID == pItem.ElementId && segmentID == pItem.CheckItemId){
                            if(pItem.OperatorResult == 101){
                                if(isType == 1) $item.parent().hide();
                                if(isType == 2){
                                    $item.parent().hide();
                                    $item.parent().prev().hide();
                                }
                            }else if(pItem.OperatorResult == 102){
                                $item.find('input,select').attr("disabled","disabled");
                            }else if(pItem.OperatorResult == 103){
                                let required="";
                                if(/4|5/.test(type)){
                                    required = $($item.find('div')).attr("rulerequired");
                                    $($item.find('div')).attr("logcRequired",'1');
                                }else{
                                    if(isType ==1){
                                      required = $($item.children()).attr("rulerequired");
                                      $($item.children()).attr("logcRequired",'1');
                                    }
                                    if(isType == 2){
                                      required = $($item.children().children()).attr("rulerequired");
                                      $($item.children().children()).attr("logcRequired",'1');
                                    }
                                    
                                }
                                if(required != 1){
                                    let preHtml = null;
                                    if(isType == 1) preHtml = $($($item.prev())).html();
                                    if(isType == 2) preHtml = $($($item.parent().prev().children())).html();
                                    if(preHtml.indexOf("i") == -1){
                                        if(isType == 1) $($($item.prev())).html("<i>*</i>"+preHtml);
                                        if(isType == 2){
                                           if($($($item.parent().prev().children())).find("span").hasClass("noRequred")){
                                                preHtml = "<span>"+$($($item.parent().prev().children())).find("span").html()+"</span>"
                                           }
                                           $($($item.parent().prev().children())).html("<i>*</i>"+preHtml);
                                        } 
                                    }
                                }
                            }
                        }
                    });
                });
            }
        }
    });
}
//逻辑校验公共逻辑
export const logicalCommon = (objData,isType,status) => {
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
          if(elementId == pItem.ElementId && segmentID == pItem.CheckItemId){
            if(/4|5/.test(type)){
              var $node = $item.children(),val="";
              if(/4/.test(type)){
                val = $node.find("input[type=radio]").filter((i,o)=>o.checked).attr("data-code");
                if(val == pItem.OperatorValue && status) state = true;
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
              if(isType == 2) $node = $item.children().children();
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
                if(isType == 2) $item.parent().prev().show();
                $item.find('input,select').removeAttr("disabled");
                if(isType == 2){
                  var $last = $item.children().last();
                  if ($last.hasClass("dataTips")) {
                    $last.remove();
                  }
                }
                let required="";
                if(/4|5/.test(type)){
                    required = $($item.find('div')).attr('rulerequired');
                    $($item.find('div')).removeAttr("logcRequired");
                }else{
                  if(isType ==1){
                    required = $($item.children()).attr("rulerequired");
                    $($item.children()).removeAttr("logcRequired",'1');
                  }
                  if(isType == 2){
                    required = $($item.children().children()).attr("rulerequired");
                    $($item.children().children()).removeAttr("logcRequired",'1');

                  }
                }
                if(required != 1){
                    let preHtml = null;
                    if(isType == 1) preHtml = $($($item.prev())).html();
                    if(isType == 2) preHtml = $($($item.parent().prev().children())).html();
                    if(preHtml.indexOf("*") > -1){
                        if(isType == 1) $($($item.prev())).html(preHtml.replace("<i>*</i>",''));
                        if(isType == 2){
                            if(!$($($item.parent().prev().children())).find("span").hasClass("noRequred")){
                                preHtml = "<i>*</i><span class='noRequred'>"+$($($item.parent().prev().children())).find("span").html()+"</span>"
                            }
                           $($($item.parent().prev().children())).html(preHtml.replace("<i>*</i>",''));
                        } 
                    }else {
                        if(isType == 1) $($($item.prev())).html(preHtml);
                        if(isType == 2) {
                            $($($item.parent().prev().children())).html(preHtml);
                        }
                    }
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
                if(isType == 2) $item.parent().prev().hide();
                if(/4|5/.test(type)) $item.find("input").filter((i,o)=>o.checked).attr("checked",false);
                else $item.find("input,select").val("");
              }else if(pItem.OperatorResult == 102){
                $item.find('input,select').attr("disabled","disabled");
                $item.find('input,select').val("");
              }else if(pItem.OperatorResult == 103){
                let required="";
                if(/4|5/.test(type)){
                  required = $($item.find('div')).attr("rulerequired");
                  $($item.find('div')).attr("logcRequired",'1');
                }else{
                  if(isType ==1){
                    required = $($item.children()).attr("rulerequired");
                    $($item.children()).attr("logcRequired",'1');
                  }
                  if(isType == 2){
                    required = $($item.children().children()).attr("rulerequired");
                    $($item.children().children()).attr("logcRequired",'1');
                  }
                }
                if(required != 1){
                    let preHtml = null;
                    if(isType == 1) preHtml = $($($item.prev())).html();
                    if(isType == 2) preHtml = $($($item.parent().prev().children())).html();
                    if(preHtml.indexOf("*") == -1){
                        if(isType == 1) $($($item.prev())).html("<i>*</i>"+preHtml);
                        if(isType == 2){
                          if($($($item.parent().prev().children())).find("span").hasClass("noRequred")){
                                preHtml = "<span>"+$($($item.parent().prev().children())).find("span").html()+"</span>"
                           }
                           $($($item.parent().prev().children())).html("<i>*</i>"+preHtml);
                        } 
                    }
                }
              }
            }
        })
      })
    }
}
/**
 * 根据段落类型参数  返回展示问卷和表单模式 页面
 */
export const getConfigHtml = (jsonData,isType) => {
  let  html = "",dockFlag="",dockName="",EyeCode="";
  var ateType = "'yyyy-MM-dd'";
  $.each(jsonData, function(index, item) {
   // html += "<div class='divider'></div>"
    if(isType == 1) html += ' <div class="followList titleList"><div class="title_detail">';
    else  html += ' <div class="followList questionList"><div class="question_detail">';
    //同步按钮显示
    if(item.InterfaceSystemCode != '' && item.InterfaceSystemCode !=1){
      html+='<div class="dock_system" data-Id="'+item.Id+'" data-Code="'+item.InterfaceSystemCode+'">'
      if(item.InterfaceSystemCode !=5){
        html+='<input type="text" class="getVal j-datePicker Wdate" onclick="WdatePicker({dateFmt:' +
        ateType +'})" onfocus="this.blur()"/>'
        html+='<span>至</span>'
        html+='<input type="text" class="getVal j-datePicker Wdate" onclick="WdatePicker({dateFmt:' +
        ateType +'})" onfocus="this.blur()"/>'
      }
      if(item.InterfaceSystemCode == 2) dockFlag = true;
      else dockFlag = false;
      html += '<select disabled="'+dockFlag+'" class="getDock" data-name="dock">';
      html += '<option value="">请选择</option>';
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
      html+="<button data-Id='"+item.Id+"' class='dockHandle'>"+dockName+"同步</button></div>"
    }
    //同步按钮显示end

    html += '<table class="table_detail">';
    $.each(item.Children, function(pIndex, pItem) {
      let type = pItem.UIType,required = pItem.IsRequired, value = pItem.DefaultValue,
          dictFormName = pItem.DictFormName,minData = pItem.BeginDate,maxData = pItem.EndDate,
          checkDetailDictCode = pItem.CheckDetailDictCode
      html += "<tr>";
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
        html += "<tr>";
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
        '" >';
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
            '<input type="text" class="getVal" value="' +
            value +
            '" ruleRequired="' +
            required +
            '" ruleReg="' +
            pItem.ValidateReg +
            '" />';
        }
        if(isType == 2) html += "</div>"
      }
      // 文本域
      if (type == "2") {
        if(isType == 2) html += "<div class='text_texteara'>"
        html +=
          ' <textarea class="getVal" ruleRequired="' +
          required +
          '">' +
          value +
          "</textarea>";
        if(isType == 2) html += "</div>"
      }
      //下拉框
      if (type == "3") {
        if(isType == 2) html += "<div class='text_input'>"
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
        if(isType == 2) html += "</div>"
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
        if(isType == 2) html += "</div>"
      }
      //日期框
      if (type == "7") {
        var dateType = "'yyyy-MM-dd'";
        if(isType == 2) html += "<div class='text_input'>"
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
        if(isType == 2) html += "</div>"
      }
      //时间框
      if (type == "8") {
        var dateType = "'HH:mm'"
        if(isType == 2) html += "<div class='text_input'>"
        html +=
          ' <input type="text" class="getVal j-datePicker Wdate" value="' +
          value + '" minData="' +minData +'" maxData="' +maxData +'" ruleRequired="' +required +'" onclick="WdatePicker({dateFmt:' +dateType +'})" onfocus="this.blur()" />';
        if(isType == 2) html += "</div>"
      }
      //日期时间框
      if (type == "9") {
        var dateType = "'yyyy-MM-dd HH:mm'";
        if(isType == 2) html += "<div class='text_input'>"
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
export const _$dock=(data,_$val,_$code) =>{
  var result = {};
  $.each(data,function(index,item){
    if(_$val == item.Code){
      result = item[_$code]
    }
  });
  return result;
}
