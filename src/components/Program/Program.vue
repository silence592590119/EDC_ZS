<template>
  	<div class="login_page fillcontain">
        <HeadTop></HeadTop>
        <div class="detail_box">
            <div class="table_container">
                <div class="programList">
                    <el-table :data="tableData" border size="medium">
                        <el-table-column
                            label="项目编码"
                            prop="Code"
                            width="180">
                        </el-table-column>
                        <el-table-column
                            label="项目名称"
                            prop="Name">
                        </el-table-column>
                        <el-table-column
                            label="总PI"
                            prop="PIName"
                            width="120">
                        </el-table-column>
                        <el-table-column label="操作" width="100">
                            <template slot-scope="scope" >
                                <el-button v-if="scope.row.IsEnterShow == true" type="text" size="medium" @click="handleClick(scope.row)">进入</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div> 
        </div>
  	</div>
</template>

<script>
import HeadTop from '../common/HeadTop'
import * as mUtils from '../../utils/mUtils'
import * as Api from '../../request/api'
export default {
    name:'program',
    data(){
        return {
            contentHeight:'',
            tableData:[],
            Params:{
                language:Api.default.language
            }
        }
    },
    components:{
        HeadTop
    },
    created(){
        let that = this;
        that.postAxios(Api.default.getProgramList,that.Params).then(res=>{
            that.tableData = res.Data;
        }).catch(err=>{
            console.log(err);
        });
    },
    methods: {
        saveProgramInfo(programinfo){
            mUtils.setStore('programinfo',programinfo);
        },
        handleClick(obj){
            let that = this;
            that.Params.programId = obj.Id;
            that.saveProgramInfo(obj); //存入缓存，用于获取项目信息
            mUtils.setStore('programid',obj.Id);
            that.postAxios(Api.default.enterProgram,that.Params).then(res=>{
                that.$router.push('/patient'); 
            }).catch(err=>{
                console.log(err);
            });
        }
    }
}
</script>

<style lang="less" scoped>
    .programList{
        margin: 10px 20px;
    }
</style>
