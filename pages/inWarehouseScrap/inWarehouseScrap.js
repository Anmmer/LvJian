// inbound.js
const app = getApp()
import Toast from '@vant/weapp/toast/toast';
Page({
  data: {
    result: '',
    warehouse_id: "",
    warehouse_name: "",
    materialcodes: [],
    products: [],
    success_show: false,
    fail_show: false,
    patch_library: '',
    remark: '',
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
    } else {
      var strs = resultstr.split("\n")
      // for循环从strs中找到构件号
      for (var i = 0; i < strs.length; i++) {
        var idx = strs[i].indexOf(":")
        var fieldname = strs[i].substring(0, idx)
        if (fieldname.indexOf("物料编码") >= 0) {
          materialcode = strs[i].substring(idx + 1)
        }
      }
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
      this.data.materialcodes.push(materialcode)
      console.log("扫描到构件'" + materialcode + "'")
      // 获取构件目前生产状态
      var that = this
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMaTest/GetPreProduct',
        data: {
          materialcode: materialcode,
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
            if (pop_pageDate[0].state != '质检不合格') {
              wx.showToast({
                title: '不符合入库条件，无法入库!',
                icon: 'none',
                duration: 500
              })
              return
            }
            let arr = that.data.products
            arr.push(pop_pageDate[0])
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

    // if (warehouseId) {
    //   // 这是货位标签
    //   console.log("扫描到货位'" + warehouseId + "'")
    //   if (this.data.warehouse_id == "") {
    //     this.setData({
    //       warehouse_id: warehouseId
    //     })
    //     wx.request({
    //       url: 'https://mes.ljzggroup.com/DuiMaTest/GetFactory',
    //       data: {
    //         id: warehouseId,
    //         type: '3',
    //       },
    //       method: 'POST',
    //       header: {
    //         "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
    //       },
    //       success(res) {
    //         this.setData({
    //           warehouse_name: res.data.data[0].name
    //         })
    //       }
    //     })
    //   } else {
    //     wx.showToast({
    //       title: '您已扫描过库房号',
    //       icon: 'none',
    //       duration: 1000
    //     })
    //     return
    //   }

    // }
  },
  deleteItem(event) {
    var list = this.data.products
    // 删除制定的构件
    list.splice(event.currentTarget.dataset.id, 1)
    this.setData({
      products: list
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
    // 提交并清空
    if (this.data.products.length != 0) {
      let arr = []
      for (let val of this.data.products) {
        arr.push(val.materialcode)
      }
      // 可以上传
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMaTest/WarehouseScrapInOut',
        data: {
          pids: JSON.stringify(arr),
          type: "1",
          scrap_library: "报废库",
          scrap_remark: this.data.remark,
          scrap_user: wx.getStorageSync('userName'),
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success(res) {
          // 清空所有
          if (res.data.message) {
            Toast.success(res.data.message);
          }
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
        title: '你还未扫描库房或者未扫描构件',
        icon: 'none',
        duration: 1000
      })
    }
  },

  getOutWarehouseMethod() {
    let that = this
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaTest/GetInOutWarehouseMethod',
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
    wx.showToast({
      title: '请先扫描库房二维码',
      icon: 'none',
      duration: 2500
    })
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
          startBarHeight: startBarHeight,
          navgationHeight: navgationHeight
        })
      }
    })
  },
  fanhui: function () {
    wx.navigateBack()
  },
})