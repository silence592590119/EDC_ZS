<template>
  <div class="dialog" v-show="showMask">
    <div class="dialog-container">
      <div class="dialog-title">{{title}}</div>
      <div v-if="showMask" class="content" v-html="content" @click="eventTemp"></div>
      <div class="btns">
        <div class="default-btn" @click="closeBtn">{{cancelText}}</div>
        <div class="confirm-btn" @click="confirmBtn">{{confirmText}}</div>
      </div>
      <div class="close-btn" @click="closeMask">
        <i class="el-message-box__close el-icon-close"></i>
      </div>
    </div>
  </div>
</template>
<script>
import * as mUtils from "../../utils/mUtils";
import Bus from '../../config/eventBus';
export default {
  props: {
    value: {},
    collectData:{
        Type:String,
        default:""
    },
    content: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      default: ""
    },
    cancelText: {
      type: String,
      default: "取消"
    },
    confirmText: {
      type: String,
      default: "确认"
    }
  },
  data() {
    return {
      showMask: false,
      param:[],
      aa:'1'
    };
  },
  methods: {
    eventTemp(e){
        let that =this;
        if (e.target.tagName === 'A') {
            $(e.target).parent().find("input").prop("checked",true);
            let json = that.dataOne(JSON.parse(that.collectData),$(e.target).data("code"))[0]
            var html1= "",html2="";
            for(let k in json){
                if(mUtils.isEmpty(json["createDate"])){
                    delete json["createDate"]
                }
                delete json["imageUrl"]
                if(k != 'checkitemID')
                   html1+= '<th>'+k+'</th>'
            }
            $(".firstOne").html("").append(html1);
            $(".firstOne th").each(function(index,item){
                html2 += '<th>'+json[$(item).html()]+'</th>'
            })
            $(".firstTwo").html("").append(html2);
        }
    },
    dataOne(jsonData,$code){
        let that = this,param=[];
        $.each(jsonData,function(index,item){
            if(item.sortNumber == $code) 
                param.push(item);
        });
        return param;
    },
    closeMask() {
      this.showMask = false;
    },
    closeBtn() {
      this.$emit("cancel");
      this.closeMask();
    },
    confirmBtn() {
      let that =this;
      that.$nextTick(()=>{ 
        let val = $("input[name='docksystem']:checked").val(),param=[];
        param = that.dataOne(JSON.parse(that.collectData),val); 
        that.$emit("confirm",param);
        that.closeMask();
      })
    }
  },
  mounted() {
    this.showMask = this.value;
  },
  watch: {
    value(newVal, oldVal) {
      this.showMask = newVal;
    },
    showMask(val) {
      this.$emit("input", val);
    }
  }
};
</script>
<style lang="css" scoped>
.content >>> .dockDetailData {
    width: 100%;
    max-height: 120px;
    overflow-y: auto;
    overflow-x: hidden;
    /* height: 36px; */
}
.content >>> .dockDetailData ul li{
    width: 46%;
    color: #1f2d3d;
    background-color: #ffffff;
    margin-bottom: 2px;
    border: none;
    text-align: left;
    display: inline-block;
    position: relative;
}
.content >>> .dockDetailData ul li:nth-of-type(odd){
    margin-right: 60px;
}
.content >>> .dockDetailData .ul li span input[type=radio] {
    height: 16px;
    width: 16px;
    position: relative;
    top: 3px;
    margin-right: 6px;
}
.content >>> .dockDetailData .ul li a{
    display: inline-block;
    position: absolute;
    right: 7px;
    text-align: center;
}
.content >>> a {
    text-decoration: none;
}
.content >>> .table-area th {
    position: relative;
    text-align: left;
    
    color: #1f2d3d;
    background-color: #c8eaea;
    border: 1px solid #a4bfbf;
}
.content >>> .detailList{
    width: 100%;
    overflow-x: auto;
}
.content >>> .detailList .table-area {
    margin-bottom: 2px;
}
.content >>> .detailList  .table-area .firstTwo th{
    line-height: 22px;
}
.content >>> .detailList .table-area .firstOne th{
    padding: 10px 5px;
    line-height: 26px;
}
</style>
<style lang="less" scoped>
.dialog {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  .dialog-container {
    width: 90%;
    height: 380px;
    background: #ffffff;
    position: absolute;
    top: 10%;
    left: 50%;
    transform: translate(-50%, -5%);
    border-radius: 8px;
    position: relative;
    .dialog-title {
      width: 100%;
      height: 60px;
      font-size: 18px;
      color: #696969;
      font-weight: 600;
      padding: 16px 50px 0 20px;
      box-sizing: border-box;
    }
    .content {
      color: #797979;
      line-height: 26px;
      padding: 0 20px;
      box-sizing: border-box;
      height: 100%;
    }
    .inp {
      margin: 10px 0 0 20px;
      width: 200px;
      height: 40px;
      padding-left: 4px;
      border-radius: 4px;
      border: none;
      background: #efefef;
      outline: none;
      &:focus {
        border: 1px solid #509ee3;
      }
    }
    .btns {
      width: 100%;
      height: 60px;
      position: absolute;
      bottom: -10px;
      left: 0;
      text-align: center;
      padding: 0 16px;
      box-sizing: border-box;
      & > div {
        display: inline-block;
        height: 40px;
        line-height: 40px;
        padding: 0 24px;
        color: #ffffff;
        background: #f1f1f1;
        border-radius: 8px;
        margin-right: 12px;
        cursor: pointer;
      }
      .default-btn {
        color: #787878;
        &:hover {
          color: #509ee3;
        }
      }
      .danger-btn {
        background: #ef8c8c;
        &:hover {
          background: rgb(224, 135, 135);
        }
        &:active {
          background: #ef8c8c;
        }
      }
      .confirm-btn {
        color: #ffffff;
        background: #509ee3;
        &:hover {
          background: #6fb0eb;
        }
      }
    }
    .close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 30px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      font-size: 18px;
      cursor: pointer;
      &:hover {
        font-weight: 600;
      }
    }
  }
}
</style>
