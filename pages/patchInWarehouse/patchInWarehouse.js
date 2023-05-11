// inbound.js
const app = getApp()
import Toast from '@vant/weapp/toast/toast';
Page({
  data: {
    result: '',

    warehouse_name: "",
    materialcodes: [],
    products: [],
    success_show: false,
    fail_show: false,
    patch_library: '',
    inspect_remark: '',
    ready: true
  },
  // 扫码函数
  scanCode(e) {
    this.setData({
      result: e.detail.result
    })
    var that = this
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取物料编码
    var resultstr = e.detail.result.toString()
    var materialcode = resultstr.match(/code='(\d+)'&id=(\d+)/)
    var warehouseIdMatch = resultstr.match(/warehouseId=(\d+)/)
    var warehouseId = null
    if (!materialcode) {
      materialcode = resultstr.match(/code=(\d+)&id=(\d+)/)
    }
    if (materialcode) {
      materialcode = materialcode[1]
    } else if (warehouseIdMatch) {
      warehouseId = warehouseIdMatch[1]
    }
    if (materialcode) {
      // 这是一个构件标签
     
      if (this.data.materialcodes.find(val => val == materialcode)) {
        wx.showToast({
          title: '扫描结果已存在!',
          icon: 'none',
          duration: 500
        })
        return
      }
     
      console.log("扫描到构件'" + materialcode + "'")
      // 获取构件目前生产状态
      var that = this
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMaNew/GetPreProduct',
        data: {
          materialcode: materialcode,
          pourState: '1',
          inspectState: '1',
          isPrint: 'true'
        },
        method: 'POST',
        header: {
          "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success(res) {
          if (res.data.data.length != 0) {
            // 生产状态
            let pop_pageDate = res.data.data
            if (pop_pageDate[0]['pourmade'] === 0 && pop_pageDate[0]['inspect'] === 0) {
              pop_pageDate[0].state = '待浇捣'
            }
            if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
              pop_pageDate[0].state = '待质检'
            }
            if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 1) {
              pop_pageDate[0].state = '质检合格'
            }
            if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 2) {
              pop_pageDate[0].state = '质检不合格'
            }
            if (pop_pageDate[0].state != '质检合格') {
              wx.showToast({
                title: '不符合入库条件，无法入库!',
                icon: 'none',
                duration: 500
              })
              return
            }
            that.data.materialcodes.unshift(materialcode)
            let arr = that.data.products
            arr.unshift(pop_pageDate[0])
            that.setData({
              products: arr
            })
          } else {
            // 该构件已入库，提醒
            wx.showToast({
              title: '不符合入库条件，无法入库!',
              icon: 'none',
              duration: 1000
            })
          }
        },
        error(msg) {
          console.log(msg)
        }
      })
    }

  },
  deleteItem(event) {
    var list = this.data.products
    let materialcodes = this.data.materialcodes
    // 删除制定的构件
    list.splice(event.currentTarget.dataset.id, 1)
    materialcodes.splice(event.currentTarget.dataset.id, 1)
    this.setData({
      products: list,
      materialcodes: materialcodes
    })
  },
  deleteAll(event) {
    this.setData({
      products: []
    })
  },
  successOnClose() {
    this.setData({
      success_show: false
    })
  },
  failOnClose() {
    this.setData({
      fail_show: false
    })
  },
  submitAll(event) {
    var that = this
    if(!this.data.patch_library){
      wx.showToast({
        title: '地址不能为空',
        icon: 'none',
        duration: 1000
      })
      return
    }
    // 提交并清空
    if (this.data.products.length != 0) {
      let arr = []
      for (let val of this.data.products) {
        arr.push(val.materialcode)
      }
      // 可以上传
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMaNew/InspectNo',
        data: {
          pids: JSON.stringify(arr),
          patch_library: this.data.patch_library,
          inspect_remark: this.data.inspect_remark,
          inspect_user: wx.getStorageSync('userName'),
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success(res) {
          // 清空所有
          if (res.data.flag) {
            that.setData({
              success_show: true,
              products: [],
              warehouse_id: "",
              warehouse_name: ""
            })
          } else {
            that.setData({
              fail_show: true
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '未扫描构件',
        icon: 'none',
        duration: 1000
      })
    }
  },

  getOutWarehouseMethod() {
    let that = this
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/GetInOutWarehouseMethod',
      data: {
        type: "1",
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        that.setData({
          columns: res.data.data.map((item) => {
            return item.name
          })
        })
      }
    })
  },
  show() {
    this.setData({
      show: true
    })
  },
  onCancel() {
    this.setData({
      show: false
    })
  },

  onConfirm(event) {
    this.setData({
      in_warehouse_method: event.detail.value,
      show: false
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNavigation();
    this.getOutWarehouseMethod()
  },

  setNavigation() {
    let startBarHeight = 20
    let navgationHeight = 44
    let that = this
    wx.getSystemInfo({
      success: function (res) {
        console.log(res.model)
        if (res.model == 'iPhone X') {
          startBarHeight = 44
        }
        that.setData({
          startBarHeight: res.statusBarHeight,
          navgationHeight: navgationHeight
        })
      }
    })
  },
  fanhui: function () {
    wx.navigateBack()
  },
})