<template>
<div class="fillcontain">
  <HeadTop></HeadTop>
  <div class="detail_box">
    <div class="table_container">
        <div class="search">
            <span>随访时间：</span>
            <el-date-picker
            class="dateSearch"
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              start-placeholder="开始日期"
              end-placeholder="结束日期">
            </el-date-picker>
            <span>段落状态：</span>
            <el-select v-model="optionsValue" placeholder="请选择">
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
            <el-input
                placeholder="请输入姓名/常用手机/入组编码/身份证"
                prefix-icon="el-icon-search"
                v-model="inputSearch">
            </el-input>
            <el-button type="primary" icon="el-icon-search" @click="searchClick()">查询</el-button>
        </div>
        <div class="patientlist">
             <el-table :data="tableData" border @row-click="rowHandleClick" 
                stripe
                style="width: 100%">
                <el-table-column
                  prop="HospitalOrgName"
                  label="所属医院"
                  width="170">
                </el-table-column>
                <el-table-column
                  prop="Code"
                  label="入组编码">
                </el-table-column>
                <el-table-column
                  prop="Name"
                  width="80"
                  label="真实姓名">
                </el-table-column>
                <el-table-column
                  prop="IdCard"
                  width="170"
                  label="身份证号">
                </el-table-column>
                <el-table-column
                  prop="Phone1"
                  label="常用手机">
                </el-table-column>
                <el-table-column
                  prop="GroupName"
                  label="可见分组">
                </el-table-column>
                <el-table-column
                  prop="HiddenGroupName"
                  label="隐藏分组">
                </el-table-column>
                <el-table-column 
                  prop="GroupDate"
                  label="入组时间"
                  :formatter="formatter">
                </el-table-column>
                </el-table >
                <div class="pagination">
                  <el-pagination
                    background
                    v-if='tableData.length > 0'
                    @current-change="handleCurrentChange"
                    :current-page="currentPage"
                    :page-sizes="[4]" 
                    :page-size="pagesize"        
                    layout="total, prev, pager, next"
                    :total="total1">  
                  </el-pagination>
                </div>
        </div>
        <div class="followlist">
            <div class="title">随访记录{{TrueName}}</div>
              <el-table  :data="tableData2" border 
                stripe
                style="width: 100%">
                <el-table-column
                  prop="FollowNumName"
                  label="随访次数"
                  width="120">
                </el-table-column>
                <el-table-column
                  prop="FormName"
                  label="表单名称">
                </el-table-column>
                 <el-table-column
                  prop="CheckItemStatusName"
                  label="段落状态">
                </el-table-column>
                <el-table-column
                  prop="RealDate"
                  label="随访时间"
                  :formatter="RealFormatter">
                </el-table-column>
                <el-table-column
                  prop="ProGroupName"
                  label="可见分组">
                </el-table-column>
                <el-table-column
                  prop="CreatorName"
                  label="创建人">
                </el-table-column>
                  <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button type="text" size="medium" @click="handleEdit(scope.$index, scope.row)">填写</el-button>
                  </template>
                </el-table-column>
                </el-table >
                 <div class="pagination">
                  <el-pagination
                    background
                    v-if='tableData2.length > 0'
                    @current-change="handleCurrentChange2"
                    :current-page="currentPage2"
                    :page-sizes="[2]" 
                    :page-size="pagesize2"        
                    layout="total, prev, pager, next"
                    :total="total2">  
                  </el-pagination>
                </div>
        </div>
    </div>
  </div>
</div>
</template>
<script>
import HeadTop from '../common/HeadTop2'
import  Eventbus from '../../config/eventBus'
import * as mUtils from '../../utils/mUtils'
import * as Api from '../../request/api'
export default {
    name:'',
    data(){
        return{
          currentPage:1, //初始页
          pagesize:3,//受检者每页的数据
          pagesize2:2,//随访记录每页的数据
          currentPage2:1,//初始页
          inputSearch: '',//查询框的值
          dateRange:[],//随访时间段
          total1:"",//受检者总数
          total2:"",//随访记录总数
          patientId:'',
          TrueName:'',
          Params:{
            Name:'',
            beginPlanTime:'',
            endPlanTime:'',
            checkItemStatus:'',
            ShowNum:'3',
            PageIndex:'1',
            ProgramId:mUtils.getStore("programid"),
            language:Api.default.language
          },
          ParamsList:{
            patientId:'',
            beginPlanTime:'',
            endPlanTime:'',
            checkItemStatus:'',
            rows:'2',
            page:'1',
            programId:mUtils.getStore("programid"),
            language:Api.default.language
          },
          tableData:[],
          tableData2:[],
          options: [{
            value: '0',
            label: '全部'
          }, {
            value: '1',
            label: '未全部提交'
          }, {
            value: '2',
            label: '已全部提交'
          }],
          optionsValue:'1'
        }    
    },
    components:{
        HeadTop
    },
    mounted(){
      this.dateRange=[mUtils.formatDate(new Date(),'3'),mUtils.formatDate(new Date(),'3')];
      this.Params.beginPlanTime=mUtils.formatDate(new Date(),'3');
      this.Params.endPlanTime=mUtils.formatDate(new Date(),'3');
      this.Params.checkItemStatus=this.optionsValue;
      this.getPatiList();
    },
    methods:{
        //点击受检者列表行
        rowHandleClick(row, event, column){
          this.ParamsList.page = 1;
          this.currentPage2 = 1;
          mUtils.setStore("patientinfo",row);
          this.patientId = row.Id;
          this.ParamsList.patientId = row.Id;
          this.TrueName = '---'+row.Name;
          this.ParamsList.beginPlanTime='';
          this.ParamsList.endPlanTime='';
          if(!mUtils.isEmpty(this.dateRange)){
            this.ParamsList.beginPlanTime = this.dateRange[0];
            this.ParamsList.endPlanTime = this.dateRange[1];
          }    
          this.ParamsList.checkItemStatus = this.optionsValue;
          this.getFollowList();  
        },
        //点击填写进入编辑表单
        handleEdit(index,row){
          mUtils.setStore("followData",row);
          this.$router.push('/follow');
        },
        //受检者列表点击上、下一页
        handleCurrentChange: function(currentPage){
          this.currentPage = currentPage;
          this.Params.PageIndex = this.currentPage;
          this.getPatiList();
        },
        //随访记录列表点击上、下一页
        handleCurrentChange2:function(currentPage2){
          this.currentPage2 = currentPage2;
          this.ParamsList.page = currentPage2;
          this.ParamsList.patientId = this.patientId;
          this.getFollowList();
        },
        //点击查询按钮
        searchClick(){
          this.tableData2=[];
          this.TrueName="";
          this.Params.beginPlanTime='';
          this.Params.endPlanTime='';
          if(!mUtils.isEmpty(this.dateRange)){
            this.Params.beginPlanTime = this.dateRange[0];
            this.Params.endPlanTime = this.dateRange[1];
          }    
          this.Params.Name = this.inputSearch;
          this.Params.checkItemStatus = this.optionsValue;
          this.Params.PageIndex = '1';
          this.currentPage = 1;
          this.getPatiList();
        },
        //获取受检者列表
        getPatiList(){
          let that = this;
          that.postAxios(Api.default.patiList,that.Params).then(res=>{
            that.tableData = res.Data.List;
            that.total1=res.Data.Count;
          }).catch(err=>{
              console.log(err);
          });
        },
        //获取随访记录列表
        getFollowList(){
          let that = this;
          that.postAxios(Api.default.followlist,that.ParamsList).then(res=>{
            that.tableData2 = res.Data.List;
            that.total2=res.Data.Count;
          }).catch(err=>{
              console.log(err);
          });
        },
        //格式化受检者列表时间
        formatter(row, column){
          return mUtils.formatJsonData(row.GroupDate);
        },
        //格式化随访记录列表时间
        RealFormatter(row, column){
          return mUtils.formatJsonData(row.RealDate);
        }
    }
}
</script>
<style lang="less">
 .search{
  .el-range-separator{
    padding: 0px;
    width: 50px;
  }  
}
</style>
<style lang="less" scoped>
    .search{
      margin: 0 20px;
    }
    .search .el-input{
      width: 30%;
    }
    .search .dateSearch{
      width: 28%;
    }
    .search .el-select{
      width: 12%;
    }
    .patientlist{
      margin: 20px 20px;
    }
    .followlist{
      margin: 0px 20px;
    }
    .title{
      font-size: 22px;
      letter-spacing: 3px;
      padding: 10px 0px;
    }
    .pagination{
      display: block;
      text-align:right;
      margin:10px 0px;
      .el-pagination__total{
        font-size: 16px;
      }
    }
</style>


