<template>
  <div class="app-container">

    <div class="filter-container">

      <!--      项目名称-->
      <el-input v-model="listQuery.project" :placeholder="$t('table.project')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <!--      项目类型-->
      <el-select v-model="listQuery.env" :placeholder="$t('table.env')" clearable class="filter-item" style="width: 130px;margin-left: 10px;" value="">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
      </el-select>
      <!--      搜索-->
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" style="margin-left: 10px;" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>

      <!--      添加-->
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>

    </div>

    <el-table
      :key="tableKey"
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >

      <el-table-column :label="$t('table.id')" prop="id" align="center" width="80">
        <template slot-scope="scope">
          <span>{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.project')" min-width="50px" align="center">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleUpdate(row)">{{ row.project }}</span>
          &emsp;
          <el-tag>{{ row.env | envFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.swagger_url')" min-width="110px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.swagger_url }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.version')" min-width="40px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.version">{{ row.version }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.updated_at')" width="150px" align="center">
        <template slot-scope="{row}">
          <span v-if="row.updated_at">{{ row.updated_at | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
          <span v-else>-</span>
        </template>
      </el-table-column>

      <!--      <el-table-column :label="$t('table.readings')" align="center" width="95">-->
      <!--        <template slot-scope="{row}">-->
      <!--          <span v-if="row.pageviews" class="link-type" @click="handleFetchPv(row.pageviews)">{{ row.pageviews }}</span>-->
      <!--          <span v-else>0</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->

      <el-table-column :label="$t('table.status')" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.status | statusFilter">
            {{ row.status | statusFilter }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">

          <!--          <el-button type="primary" size="mini" @click="handleUpdate(row)">-->
          <!--            {{ $t('table.edit') }}-->
          <!--          </el-button>-->

          <!--          <el-button v-if="row.status!='1'" size="mini" type="success" @click="handleModifyStatus(row,'1')">-->
          <!--            {{ $t('table.get_api_docs') }}-->
          <!--          </el-button>-->

          <el-button v-if="row.status!='1'" size="mini" type="success">
            {{ $t('table.pulling') }}
          </el-button>

          <el-button v-if="row.status!='0'" size="mini" class="el-button el-button--primary" @click="handleGetApiDocs(row,'0')">
            {{ $t('table.get_api_docs') }}
          </el-button>

          <!--          <el-button v-loading="buttonLoading" size="mini" type="success" @click="handleGetApiDocs(row)">-->
          <!--            {{ $t('table.get_api_docs') }}-->
          <!--          </el-button>-->

          <el-button size="mini" type="danger" @click="handleDelete(row)">
            {{ $t('table.delete') }}
          </el-button>

        </template>
      </el-table-column>

    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" style="margin-right: 180px;margin-left: 180px">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="110px" style="margin-left:10px;">

        <el-form-item :label="$t('table.project')" prop="project" style="width: 300px">
          <el-input v-model="temp.project" />
        </el-form-item>

        <el-form-item :label="$t('table.env')" prop="env">
          <el-select v-model="temp.env" class="filter-item" placeholder="Please select" value="">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('table.swagger_url')" prop="swagger_url" style="max-width: 700px;margin-right: 10px">
          <el-input v-model="temp.swagger_url" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { fetchPv } from '@/api/article'
import { projectList, createProject, updateProject, deleteProject, getProjectApiDocs } from '@/api/project'
import waves from '@/directive/waves' // waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // secondary package based on el-pagination

const calendarTypeOptions = [
  { key: '0', display_name: '开发环境' },
  { key: '1', display_name: '测试环境' },
  { key: '2', display_name: '预生产环境' },
  { key: '3', display_name: '生产环境' }
]

const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

const statusOptions = [
  { key: '0', display_name: '未更新' },
  { key: '1', display_name: '已更新' },
  { key: '2', display_name: '需更新' }
]

const statusKeyValue = statusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'ComplexTable',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      return statusKeyValue[status]
    },
    envFilter(env) {
      return calendarTypeKeyValue[env]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        id: '',
        page: 1,
        limit: 10,
        project: undefined,
        env: undefined
      },
      calendarTypeOptions,
      statusOptions: [0, 1],
      showReviewer: false,
      temp: {
        // id: '',
        project: '',
        swagger_url: '',
        env: '',
        status: 0
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        project: [{ required: true, message: 'project is required', trigger: 'blur' }],
        env: [{ required: true, message: 'env is required', trigger: 'change' }],
        swagger_url: [{ required: true, message: 'swagger_url is required', trigger: 'blur' }]
      }
      // downloadLoading: false
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      projectList(this.listQuery).then(response => {
        this.list = response.data.items
        this.total = response.data.total
        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 100)
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },

    handleModifyStatus(row, status) {
      this.$message({
        message: '操作成功',
        type: 'success'
      })
      row.status = status
    },
    handleGetApiDocs(row, status) {
      this.$confirm('开始获取Api文档?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })
        .then(async() => {
          const data = {
            'id': row.id
          }
          row.status = status
          await getProjectApiDocs(data)
          this.getList()
          // const index = this.list.findIndex(v => v.id === this.temp.id)
          // this.list.splice(index, 1, this.temp)
          setTimeout(() => {
          }, 1.5 * 100)
          this.$message({
            type: 'success',
            message: '获取成功'
          })
        })
        .catch(err => { console.error(err) })
    },
    // sortChange(data) {
    //   const { prop, order } = data
    //   if (prop === 'id') {
    //     this.sortByID(order)
    //   }
    // },
    // sortByID(order) {
    //   if (order === 'ascending') {
    //     this.listQuery.sort = '+id'
    //   } else {
    //     this.listQuery.sort = '-id'
    //   }
    //   this.handleFilter()
    // },
    resetTemp() {
      this.temp = {
        id: '',
        project: '',
        env: '',
        swagger_url: '',
        status: 0
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // this.temp.id = parseInt(Math.random() * 100) + 1024 // mock a id
          // this.temp.author = 'vue-element-admin'
          createProject(this.temp).then(() => {
            this.getList()
            this.list.unshift(this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '创建成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      // this.temp.timestamp = new Date(this.temp.timestamp)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          // tempData.timestamp = +new Date(tempData.timestamp) // change Thu Nov 30 2017 16:41:05 GMT+0800 (CST) to 1512031311464
          updateProject(tempData).then(() => {
            const index = this.list.findIndex(v => v.id === this.temp.id)
            this.list.splice(index, 1, this.temp)
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('请确认删除?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(async() => {
          const data = {
            'id': row.id
          }
          await deleteProject(data)
          this.getList()
          // const index = this.list.findIndex(v => v.id === this.temp.id)
          // this.list.splice(index, 1, this.temp)
          this.$message({
            type: 'success',
            message: '删除成功'
          })
        })
        .catch(err => { console.error(err) })
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    formatJson(filterVal) {
      return this.list.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
