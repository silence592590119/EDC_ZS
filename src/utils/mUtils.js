/**
 * 存储localStorage
 */
export const setStore = (name, content) => {
	if (!name) return;
	if (typeof content !== 'string') {
		content = JSON.stringify(content);
	}
	window.localStorage.setItem(name, content);
}

/**
 * 获取localStorage
 */
export const getStore = name => {
	if (!name) return;
	var value = window.localStorage.getItem(name);
    if (value !== null) {
        try {
            value = JSON.parse(value);
        } catch (e) {
            value = value;
        }
    }
    return value;
}
export const compare = (startTime,endTime) =>{
    let dateStart = new Date(startTime).getTime();
    let dateEnd = new Date(endTime).getTime();
    if(dateStart > dateEnd){
        return true;
    }else return false;
}
/**
 * 删除localStorage
 */
export const removeStore = name => {
	if (!name) return;
	window.localStorage.removeItem(name);
}

/**
 * 让整数自动保留2位小数
 */
// export const returnFloat = value => { 
//     var value=Math.round(parseFloat(value)*100)/100; 
//     var xsd=value.toString().split("."); 
//     if(xsd.length==1){ 
//         value=value.toString()+".00"; 
//         return value;   
//     } 
//     if(xsd.length>1){ 
//         if(xsd[1].length<2){ 
//             value=value.toString()+"0"; 
//         } 
//         return value; 
//     } 
// } 
/**
 * @param {date} 标准时间格式:Fri Nov 17 2017 09:26:23 GMT+0800 (中国标准时间)
 * @param {type} 类型
 *   type == 1 ---> "yyyy-mm-dd hh:MM:ss.fff"
 *   type == 2 ---> "yyyymmddhhMMss"
 *   type == '' ---> "yyyy-mm-dd hh:MM:ss"
 */
export const formatDate = (date, type) =>{
    var year = date.getFullYear();//年
    var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;//月
    var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();//日
    var hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();//时
    var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();//分
    var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();//秒
    var milliseconds = date.getMilliseconds() < 10 ? "0" + date.getMilliseconds() : date.getMilliseconds() //毫秒
    if (type == 1) {
        return year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds + "." + milliseconds;
    } else if(type == 2){
        return year+""+month+""+day+""+hour+""+minutes+""+seconds;
    }else if(type == 3){
        return year + "-" + month + "-" + day;
    }else if(type == 4){
        return year + "-" + month + "-" + day + " " + hour + ":" + minutes;
    }else {
        return year + "-" + month + "-" + day + " " + hour + ":" + minutes + ":" + seconds;
    }
}
/**
 * 时间转换：20150101010101 --> '2015-01-01 01:01:01'
 */
export const parseToDate = (timeValue) => {
    var result = "";
    var year = timeValue.substr(0, 4);
    var month = timeValue.substr(4, 2);
    var date = timeValue.substr(6, 2);
    var hour = timeValue.substr(8, 2);
    var minute = timeValue.substr(10, 2);
    var second = timeValue.substr(12, 2);
    result = year + "-" + month + "-" + date + " " + hour + ":" + minute + ":" + second;
    return result;
}
/**
 * 将json的 yyyy-MM-dd hh:mm:ss 日期格式 转换为"yyyy-MM-dd"格式
 */
export const formatJsonData = (date) => {
    if (isEmpty(date)) return "";
    return date.match(/\d{4}.\d{1,2}.\d{1,2}/mg).toString();
}
/**
 * 将json的 yyyy-MM-dd hh:mm:ss 日期格式 转换为"yyyy-MM-dd hh:mm"格式
 */
export const formatHourMinute = (date) => {
    let regAry = date.match(/([0-9]|[0-9]|1[0-9]|2[0-3]):[0-5][0-9]/);
    return regAry == null ? "" :regAry[0];
}
/*获取某天之后或之前的如期 */
export const afterDate = (num) =>{
    let day1,day2;
    day1 = new Date();
    day2 = new Date(day1);
    day2.setDate(day1.getDate() + num);
    return day2.getFullYear() + '-' +(day2.getMonth() + 1) + '-' + day2.getDate();
}
/*获取当前时间*/
export const getCurrentDate = () =>{
    let  date, Month, day;
    date = new Date();
    date.setTime(date.getTime());
    Month = date.getMonth() + 1;
    day = date.getDate();
    if (Month <= 9) Month = '0' + Month;
    if (day <= 9) day = '0' + day;
    return date.getFullYear() + '-' + Month + '-' + day;
}
export const contains = (arr,items)=>{
    let i = arr.length;
    while(i--){
        if(arr[i] == items){
            return true;
        }
    }
    return false;
}
/**
 * 判断空值
 */
export const isEmpty = (keys) => {
    if (typeof keys === "string") {
        keys = keys.replace(/\"|&nbsp;|\\/g, '').replace(/(^\s*)|(\s*$)/g, "");
        if (keys == "" || keys == null || keys == "null" || keys === "undefined" ) {
            return true;
        } else {
            return false;
        }
    } else if (typeof keys === "undefined") {  // 未定义
        return true;
    } else if (typeof keys === "number") {
        return false;
    }else if(typeof keys === "boolean"){
        return false;
    }else if(typeof keys == "object"){
        if(JSON.stringify(keys )=="{}"){
            return true;
        }else if(keys == null){ // null
            return true;
        }else{
            return false;
        }
    }

    if(keys instanceof Array && keys.length == 0){// 数组
        return true;
    }

}

/**
 * 返回两位的小数的字符串
 */
export const toFixedNum = (num) => {
    const tonum = Number(num).toFixed(2);
    return tonum;
}

export const showMessage = () =>{
    this.$message({
        showClose: true,
        message: '对不起，您暂无此操作权限~',
        type: 'success'
    });
}

/**
 * 读取base64
 */
export const  readFile = file => {
    console.log(file)
    //var file = this.files[0];
    //判断是否是图片类型
    if (!/image\/\w+/.test(file.raw.type)) {
        alert("只能选择图片");
        return false;
    }
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function (e) { 
        var filedata = {
            filename: file.name,
            filebase64: e.target.result
        }
        alert(e.target.result)
    }
}

/**
 *生成newvalidatekey字符串  
 **/
export const newValidateKey = () => {
    let guid = '';
    for(let i=0;i<=32;i++){
        var n = Math.floor(Math.random() * 16.0).toString(16);
        guid += n;
        if((i == 8) || (i == 12) || (i == 16) || (i == 20)){
            guid += '-';
        }
    }
    return guid;
}
/**
 * 判断字符串是否存在
 */
export const isContains = (str,substr) =>{
    return new RegExp(substr).test(str);
}
export const getFormVal = ($item) => {
    try {
        return {
            "select-one": function () {
                return $item.val();
            },
            "select-text": function () {
                return $item.find("option:selected").text();
            },
            "text": function () {
                return $.trim($item.val());
            },
            "password": function () {
                return $.trim($item.val());
            },
            "radio": function () {
                var check_state = $item.prop("checked"), itemVal = check_state === true ? $item.val() : "";
                return itemVal;
            },
            "radio-text": function () {
                var check_state = $item.prop("checked");
                return check_state === true ? $item.next().html() : "";
            },
            "checkbox": function () {
                var check_state = $item.prop("checked"), dataCode = $item.attr("dataCode"), itemVal = check_state === true ? dataCode : "";
                return itemVal;
            },
            "textarea": function () {
                return $.trim($item.val());
            },
            "number": function () {
                return $.trim($item.val());
            },
            "get_radio": function () {
                return $item.find("input[type=radio]").filter((i, o) => o.checked).val() || "";
            },
            "get_checkbox": function () {
                return $item.find("input[type=checkbox]").filter((i, o) => o.checked).val() || "";
            }
        };
    } catch (ex) {
        console.error(ex);
        throw new Error(ex.message);
    }

}

export const setFormVal = ($item, val) => {
    try {
        //val==boolean不进行赋值
        // val = typeof val == "boolean" ? val : (val || "");
        return {
            "select-one": function () {
                $item.val(val);
            },
            "text": function () {
                $item.val(val);
            },
            "number": function () {
                $item.val(val);
            },
            "password": function () {
                $item.val(val);
            },
            "radio": function () {
                val != null && val !='' && $item.find(`input[value=${val}]`).prop("checked", "checked");//值为"" 不赋值选中
            },
            "textarea": function () {
                $item.val(val);
            },
            "Date": function () {
                $item.val(toolsEDC.formatJsonData(val));
            }
        };
    } catch (ex) {
        console.error(ex);
        throw new Error(ex.message);
    }
}
/**
 * 错误信息操作 state当前状态 true添加/false移除 $item当前项
 */
export const errorMsgOperate = (state,$item,ruleTitle,isType,expform,uitype)=>{
    let title;
    if(isEmpty(ruleTitle)) title = '必填项不能为空';
    else title = ruleTitle;
    let span = null;
    if(isType == 1) span = '<span class="dataTips" style="color:#333" data-toggle="tooltip" data-placement="right" title="'+title+'"><span class="glyphicon glyphicon-exclamation-sign form-control-feedback"></span></span>';
    else span = '<div class="dataTips" style="color:#ff0000;height: 50px;line-height: 50px;border: 1px solid #ff0000;margin-top: 5px;padding-left: 36px;background: #fff1ee;">'+title+'</div>'
    if(state){
        if(isType == 1 ) {
            $item.addClass("errorPrompt");
            $item.addClass("inputClass");
            if(uitype == '5' && expform == '2'){ 
                $item.parent().children().last().after(span);
            }else{
                $item.after(span);        
            }
        }
        if(isType == 2 ){
            let $parent =$item.parent();
            if(expform == 2) $parent = $item.parent().parent();   
            if(uitype == 6){
                if($parent.parent().children('div.CalculateName')){
                    $parent.parent().children('div.CalculateName').next().remove();
                    $parent.parent().children('div.CalculateName').after(span);
                }else{
                    $parent.next().remove();
                    $parent.after(span);
                }
            }else{
                $parent.next().remove();
                $parent.after(span);
            }
        } 
        $("[data-toggle = 'tooltip']").tooltip();
    }else{
        if(isType == 1 ){
            $item.removeClass("errorPrompt");
            $item.removeClass("inputClass");
            $item.siblings(".dataTips").remove();
        } 
        if(isType == 2 ){
            $item.parent().siblings(".dataTips").remove();          
        } 
    }
}
/**
 * 必填项校验
 */
export const requiredCheck = (requireArr,isType) =>{
    try {
        var state = "", ruleObj = {
            required: function (val) {
                var state = val == "" || val == null || val == undefined || val == "undefined";
                return !state;
            },
            customReg: function (reg, val) {
                return eval(reg).test(val);
            }
        }, pubObj = {
            booleanFn: function ($item, rule, range, digit,UIType) {
                var val = $item.val(), ruleState;
                if (!isEmpty(val)) {
                    ruleState = (rule == "" ? true : ruleObj["customReg"](rule, val));
                } else {
                    ruleState = true;
                }
                ruleState ? errorMsgOperate(false, $item,'',isType,'',UIType) : errorMsgOperate(true, $item, '您输入的值不满足正则表达式',isType,'',UIType);
                state += ruleState + ",";
                if (rule) {
                    if (ruleState && range) {
                        pubObj.booleanInt($item, range, digit,UIType);
                    }
                } else {
                    if (range) {
                        pubObj.booleanInt($item, range, digit,UIType);
                    }
                }
            },
            booleanInt: function ($item, range, digit,UIType) {
                var val = $item.val(), ruleState, content = "";
                if (!isEmpty(val)) {
                    ruleState = UIType == '1' ? intervalValidation(val.length, range) : intervalValidation(val, range);
                    content = UIType == '1' ? '您输入文本长度区间不满足' + range : '您输入值的区间不满足' + range;
                } else {
                    ruleState = true;
                }
                ruleState ? errorMsgOperate(false, $item,'',isType,'',UIType) :errorMsgOperate(true, $item, content,isType,'',UIType);
                state += ruleState + ",";
                if (range) {
                    if (ruleState && digit) {
                        pubObj.booleanDigit($item, digit,UIType);
                    }
                } else {
                    if (digit) {
                        pubObj.booleanDigit($item, digit,UIType);
                    }
                }
            },
            booleanDigit: function ($item, digit,UIType) {
                var val = $item.val(), ruleState, content = "";
                if (!isEmpty(val)) {
                    if (digit > 0) {
                        if (val.indexOf(".") != -1) {
                            var length = val.split(".")[1].length;
                            ruleState = length > digit ? false : true;
                        } else {
                            ruleState = true;
                        }
                    } else if (digit == 0) {
                        var reg = /^-?[0-9]\d*$/;
                        ruleState = reg.test(val) == true ? true : false;
                    }
                    content = digit == '0' ? '输入的值只能为整数' : '输入的值小数位不能超过' + digit + '位';
                }
                else ruleState = true;
                ruleState ? errorMsgOperate(false, $item,'',isType,'',UIType) : errorMsgOperate(true, $item, content,isType,'',UIType);
                state += ruleState + ",";
            },
            booleanDateCheck:function($item){
                $.each($item, function (index, item) {
                    var $item = $(item), $parent = $item.parent(), mindata = $item.attr("mindata"), maxdata = $item.attr("maxdata"),
                        val = $item.val(), uitype = $parent.attr("uitype");
                    if (/7|9/.test(uitype)) {
                        var dapt = "",_mindata ="",_maxdata = "" ;
                        _mindata = new Date(mindata).getTime(); _maxdata = new Date(maxdata).getTime(); val = new Date(val).getTime();
                        if (!isEmpty(val)) {
                            if (val < _mindata || val > _maxdata) {
                                dapt = false;
                                errorMsgOperate(true, $item, '日期的输入范围为[' + mindata + '，' + maxdata + ']',isType);
                                $item.removeClass("errorPrompt");
                            } else {
                                dapt = true;
                                errorMsgOperate(false, $item,'',isType);
                            }
                        } else {
                            dapt = true;
                            errorMsgOperate(false, $item,'',isType);
                        }
                        state += dapt + ",";
                    } else {
                        var clock = "";
                        var t1 = mindata.split(":"), t2 = maxdata.split(":"), t3 = val.split(":");
                        if (!isEmpty(val)) {
                            if (mindata && maxdata) {
                                if (t3[0] >= t1[0] && t3[0] <= t2[0] && t3[1] >= t1[1] && t3[1] <= t2[1]) {
                                    clock = true;
                                    errorMsgOperate(false, $item,'',isType);
                                } else {
                                    clock = false;
                                    errorMsgOperate(true, $item, '时间的输入范围为[' + mindata + '，' + maxdata + ']',isType);
                                    $item.removeClass("errorPrompt");
                                };
                            } else if (mindata && !maxdata) {
                                if (t3[0] >= t1[0] && t3[1] >= t1[1]) {
                                    clock = true;
                                    errorMsgOperate(false, $item,'',isType);
                                } else {
                                    clock = false;
                                    errorMsgOperate(true, $item, '时间的输入范围为[' + mindata + '，' + maxdata + ']',isType);
                                    $item.removeClass("errorPrompt");
                                };
                            } else if (!mindata && maxdata) {
                                if (t3[0] <= t2[0] && t3[1] <= t2[1]) {
                                    clock = true;
                                    errorMsgOperate(false, $item,'',isType);
                                } else {
                                    clock = false;
                                    errorMsgOperate(true, $item, '时间的输入范围为[' + mindata + '，' + maxdata + ']',isType);
                                    $item.removeClass("errorPrompt");
                                };
                            }
                        } else {
                            clock = true;
                            errorMsgOperate(false, $item,'',isType);
                        }
                        state += clock + ",";
                    }
                });
            }
        }
        $.each(requireArr, function (index, item) {
            //rulerequired是否必填自定义属性存在必填 否则不必填
            var $item = $(item), required = $item.attr("rulerequired"),logcRequired=$item.attr("logcRequired"), rule = $item.attr("ruleReg") || "", range = $item.attr("ruleRange") || "", digit = $item.attr("ruleDigit") || "", val = $item.val(), reqState = null;
            let $parent = isType == 1?$item.parent():$item.parent().parent();
            let attrType = $parent.attr("uitype");
            let expform = $item.parents("td.getTd").attr("expform");
            errorMsgOperate(false, $item,'',isType,expform,attrType);
            if (required == '1' || logcRequired == 1) {
                reqState = ruleObj.required(val);//返回true填写false未填写
                state += reqState + ",";
                if (!reqState) {
                    errorMsgOperate(true, $item,'',isType,expform,attrType);
                } else {
                    if (rule) pubObj.booleanFn($item, rule, range, digit,attrType);
                    else {
                        if (range) pubObj.booleanInt($item, range, digit,attrType);
                    }
                    if (!rule && !range && /7|8|9/.test(attrType)) {
                        pubObj.booleanDateCheck($item);
                    }
                    if (!rule && !range && digit) {
                        pubObj.booleanDigit($item, digit,attrType);
                    }
                }
            }
            else {
                if (rule) {
                    pubObj.booleanFn($item, rule, range, digit,attrType);
                } else {
                    if (range){
                        pubObj.booleanInt($item, range, digit,attrType);
                    } 
                }
                if (!rule && !range && /7|8|9/.test(attrType)) {
                    pubObj.booleanDateCheck($item);
                }
                if (!rule && !range && digit) {
                    pubObj.booleanDigit($item, digit,attrType);
                }
            }
        });
        return !/false/.test(state); //如果state中有一个是false即返回false
    } catch (ex) {
        console.error(ex);
        throw new Error(ex.message);
    }
}
/**
 * 验证区间 patternGroup区间组合 如："[1,2]|(3,4]" 满足其中一个即可
 */
export const intervalValidation = (val, patternGroup) =>{
    var ary = patternGroup.split('|'), state = "";
        $.each(ary, function (index, item) {
            state += range(val, item) + ",";
        });
        //如果满足任意一个既满足条件
        return /true/.test(state);
}
/**
 * "[min,max]"表示：输入值必须 >= min 并且 <= max。 (min,max)"表示：输入值必须 > min 并且 < max。
"(min,max]"表示：输入值必须 > min 并且 <= max。(min,)"表示：输入值必须 > min。(min,)"等价于"(min,]  [,max]"表示：输入值必须 <= max。
"[value]"表示：输入值必须 == value。出于严格规范性以及解析性能考虑，目前expression中不能包含任何空白字符 形如"[min, max]"的写法会在执行校验时抛出错误。
 */
export const range = (val, expr) => {
    val = val && parseFloat(val);
    var pattern = parseIntervalPattern(expr);
    if (pattern.equals) {
        if (val != pattern.min)
            return false;
    } else {
        if (pattern.min) {
            var leftResult = val > pattern.min || pattern.left == ">=" && pattern.min == val;
            if (!leftResult)
                return leftResult;
        }
        if (pattern.max) {
            var rightResult = val < pattern.max || pattern.right == "<=" && pattern.max == val;
            if (!rightResult)
                return rightResult;
        }
    }
    //都满足直接return true
    return true;
}
/**
 * 解析范围区间，形如："(1,2)"、"[2,5]"
 */
export const parseIntervalPattern = (pattern) => {
    var cache = {};
    if (!cache[pattern]) {
        cache.__interval || (cache.__interval = /^([\[\(])(-?\d+(\.\d+)?)?(,)?(-?\d+(\.\d+)?)?([\]\)])$/);
        if (cache.__interval.test(pattern) && (RegExp.$2 || RegExp.$4)) {
            var result = {min: RegExp.$2, max: RegExp.$5};
            if (RegExp.$4 == RegExp.$5) {
                result.equals = true;
            } else {
                result.left = RegExp.$1 == "[" ? ">=" : ">";
                result.right = RegExp.$7 == "]" ? "<=" : "<";
            }
            cache[pattern] = result;
        } else {
            throw "Unexpected interval pattern:" + pattern;
        }
    }
    return cache[pattern];
}
/**
 * 单独处理单选和复选框
 */
export const onlyRadioCheckBox = (radioArr,isType,isMode) => {
    var isSure = true;
    $.each(radioArr, function (index, item) {
        var $item = $(item), $last = $item.children().last(), checked = "",
            expform = $item.parents("td.getTd").attr("expform");
        $.each($item.children().find("input"), function (i, o) {
            checked += $(this).prop("checked");
        });
        if (/true/.test(checked)) {
            if(isMode == 2) $last = $item.parent().children().last();
            if ($last.hasClass("dataTips")) {
                $last.remove();
            }
            isSure = true;
        } else {
            isSure = false;
            if (!$last.hasClass("dataTips")) {
                errorMsgOperate(true, $last,'',isMode,expform);
                $last.removeClass("errorPrompt");
                $last.removeClass("inputClass");
            }
            if(isType){
                return false;
            }
        }
    });
    return isSure;
}
export const cm_html = (jsonData,segId,$item) => {
    var html = "";
    if(isEmpty(jsonData) || jsonData.length == 0) return false;
    $item.find("ul.fileBoxYanUl").html("");
    $.each(jsonData,function(index,item){
      if(item.checkitemID == segId){
        html+= '<li class="diyLoadHover">'
        html+= '<div class="viewThumb">'
        html+= '<img data-original="'+item.path+'" src="'+item.path+'"></div>'
        // html+= '<div class="diy diyName">'+item.eye+'</div>'
        html+= '<div class="diy diyConfig"><input type="checkbox" name="name_'+(index+1)+'" data-code="'+item.path+'" data-name=""></div>'
        html+= '</li>'
      } 
    })
    $item.find("ul.fileBoxYanUl").append(html);
  }