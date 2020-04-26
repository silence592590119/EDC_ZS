<template>
    <header class="head-nav" id='header_container'>
        <el-row style="margin:0 10px;">
            <el-col :span="6" class='logo-container head-back' >
                <span class='title' @click="clickHandlerBack()">
                    <i class="el-icon-back"></i>
                    返回
                </span>
            </el-col>
            <el-col :span="12" class='logo-container head-title'>
                <span class='title'>{{titleName}}</span>
            </el-col>
            <el-col :span="6" class='logo-container head-user'>
                <img src="../../assets/img/avatar.png" class='avatar' alt="">
                <div class='welcome'>
                    <p class='name avatarname'>{{username}}</p>
                </div>
                <i class="fa fa-sign-out logout" @click='logout'>
                    <img src="../../assets/img/logout.png" />
                </i>
            </el-col>
        </el-row>
    </header>
</template>

<script>
    import * as mUtils from '../../utils/mUtils'
    import  Eventbus from '../../config/eventBus'
    import * as Api from '../../request/api';
    export default {
          name: 'head-nav',
          data(){
            return{
                userinfo:'',
                username:'',
                titleName:'受试者列表'
            }
          },
          created(){
            this.userinfo =  mUtils.getStore('userinfo');
            
          },
          mounted(){
            // this.getEventData();
            this.username = this.userinfo.Name == null?this.userinfo.LoginName:this.userinfo.Name;
          },
          methods:{   
              logout(){
                   let _this = this;
                    _this.$confirm('确定要退出登录么?', '温馨提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        let params = {laguage:Api.default.language}
                        _this.postAxios(Api.default.SignOut,params).then(res=>{
                            mUtils.removeStore("userinfo");
                            mUtils.removeStore("programinfo");
                            mUtils.removeStore("programid");
                            mUtils.removeStore("token");
                            _this.$router.push('/');
                        }).catch(err=>{
                            console.log(err);
                        })
                    }).catch(() => {
                        console.log('取消');
                    });
              },
              getEventData(){
                  const that = this;
                Eventbus.$on("title",(val)=>{
                    that.titleName = val;
                })
              },
              clickHandlerBack(){
                   this.$router.push('/program');
              }
          }
    }
</script>

<style scoped lang='less'>
    .logout{
        img{
            height: 20px;
            margin-top: -3px;
        }
    }
</style>
