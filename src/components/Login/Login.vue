<template>
    <div class="login_page fillcontain" :style="{ height: bodyHeight + 'px'}">
        <transition name="form-fade" mode="in-out">
          <div class="form_contianer"> 
            <div class="logo-image">
              <!-- <img src="../../assets/img/logo.png" /> -->
              <!-- <img src="../../assets/img/logo_xian.png" /> -->
              <img src="../../assets/img/logo_gong.png" />
            </div>
            <section class="form_contianer">
              <div class="manage_tip">
                <p class="title">欢迎登录</p>
              </div>
              <el-form :model="loginForm" :rules="ruleInline" ref="loginForm" class="loginForm">
              <el-form-item prop="username">
                <span class="fa-tips">
                  <!-- <i class="fa fa-user"></i> -->
                  <img src="../../assets/img/user.png" />
                </span>
                <el-input class="area" type="text" placeholder="用户名" v-model="loginForm.username" ></el-input>
              </el-form-item>
              <el-form-item prop="password">
                  <span class="fa-tips">
                    <!-- <i class="fa fa-lock"></i> -->
                    <img src="../../assets/img/password.png" />
                  </span>
              <el-input class="area" type="password" placeholder="密码" v-model="loginForm.password"></el-input>
              </el-form-item>
              <el-form-item>
                  <el-button type="primary"  @click="submitForm('loginForm')" class="submit_btn">登录</el-button>
              </el-form-item>
            </el-form>
          </section>
        </div>
      </transition>
    </div>
</template>

<script>
import * as mUtils from '../../utils/mUtils'
import * as Api from '../../request/api'
export default {
  name:'login',
  data(){
      return{
        bodyHeight:'',
        loginForm: {
            username: '',
            password: ''
        },
        ruleInline: {
          username: [
              { required: true, message: '请填写用户名', trigger: 'blur' }
          ],
          password: [
              { required: true, message: '请填写密码', trigger: 'blur' }
          ]
        }
      }
  },
  methods:{
    showMessage(type,message){
      this.$alert(message, '温馨提示', {
        confirmButtonText: '确定',
        type:type
      });
    },
    //保存用户信息到缓存
    saveUserInfo(userinfo){
      mUtils.setStore('userinfo',userinfo)
    },
    submitForm(loginForm){
      let that = this;
      let Params= {
            UserName:that.loginForm.username,
            Password:that.loginForm.password,
            language:Api.default.language
          }
      that.$refs[loginForm].validate((valid) => {
        if (valid) {
          //用户登录的接口
          that.postAxios(Api.default.login,Params).then(res=>{
              let userData = res.Data.userInfo;
              mUtils.setStore('token',res.Data.ticket);
              that.saveUserInfo(userData); // 存入缓存，用于显示用户名
              if(!mUtils.isEmpty(res.Data.programId)){
                mUtils.setStore('programid',res.Data.programId);
                that.postAxios(Api.default.enterProgram,{programId:res.Data.programId,language:'CN'}).then(res=>{
                  that.$router.push('/patient'); 
                }).catch(err=>{
                  console.log(err);
                });
              }else{
                that.$router.push('/program');
              }
              that.showMessage('success', '登录成功');
            }).catch(err=>{
              console.log(err);
            })
        } else {
          that.$notify.error({
            title: '错误',
            message: '请输入正确的用户名密码',
            duration:1500,
            offset: 120
          });
          return false;
        }
      });
    }
  },
  mounted(){
    this.bodyHeight=document.documentElement.clientHeight;
    mUtils.removeStore("token");
  }
}
</script>
<style lang="less" scoped>
  @import '../../assets/css/common/mixin';
  //中山样式
  // .logo-image{
  //   position: relative;
  //   top: -132px;
  //   left: -40px;
  //   img{
  //     width: 120%;
  //   }
  // }
  //西安四院样式
  .logo-image{
    position: relative;
    top: -130px;
    left: 0;
    img{
      width: 90%;
    }
  }
  // 宫瘤宁样式
  // .logo-image{
  //   position: relative;
  //   top: -130px;
  //   left: 0;
  //   img{
  //     width: 100%;
  //   }
  // }
  .login_page{
    //background-image: url(../../assets/img/background12.png);
     background-image:url(../../assets/img/background_xian.png);
    background-repeat: no-repeat;
    background-size: 100% 100%;
  }
 .manage_tip{
    margin-bottom: 20px;
    text-align: center;
    padding-left: 12px;
    p{
      font-size: 20px;
    }
  }
  .form_contianer{
    .wh(340px, 270px);
    .ctp(340px, 270px);
    padding: 25px;
    border-radius: 5px;
    text-align: center;
    background-color: #fff;
    .submit_btn{
      width: 100%;
      font-size: 16px;
    }
  }
  .tip{
    font-size: 12px;
    color: red;
  }
  .el-input--mini .el-input__inner {
    height: 36px;
    line-height: 36px;
    font-size: 14px;
  }
  .fa-tips{
    position: absolute;
    right: 0px;
    top: 0px;
    z-index: 1;
    font-size: large;
    padding: 0px 6px;
  }
  .form-fade-enter-active, .form-fade-leave-active {
    transition: all 1s;
  }
  .form-fade-enter, .form-fade-leave-active {
    transform: translate3d(0, -50px, 0);
    opacity: 0;
  }
</style>


