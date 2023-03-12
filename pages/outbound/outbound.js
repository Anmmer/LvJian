// outbound.js
const app = getApp()

Page({
  data: {
    warehouse_id: "",
    warehouse_name: "",
    products: [],
    product: {},
    show: false
  },
  // 扫码函数
  scanCode(e) {
    var that = this
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取构件号
    var resultstr = e.detail.result.toString()
    var materialcode = resultstr.match(/code='(\d+)'&id=(\d+)/)
    var warehouseIdMatch = resultstr.match(/warehouseId='(\d+)'/)
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
    if (!materialcode || materialcode == this.data.materialcode) return
    // for循环从strs中找到构件号或者货位号
    // for (var i = 0; i < strs.length; i++) {
    // var idx = strs[i].indexOf(":")
    // var fieldname = strs[i].substring(0, idx)
    // if (fieldname.indexOf("物料编码") >= 0) {
    //   // 这是一个构件标签
    //   var materialcode = strs[i].substring(idx + 1)
    //   console.log("扫描到构件'" + materialcode + "'")
    if (this.data.products.find(val => val.materialcode == materialcode) !== undefined) {
      wx.showToast({
        title: '扫描结果已存在!',
        icon: 'none',
        duration: 1500
      })
      return
    }
    console.log("扫描到构件'" + materialcode + "'")
    // 获取构件目前生产状态
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaTest/GetPreProductWarehouse',
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
          console.log(pop_pageDate)
          if (pop_pageDate[0].state != '质检合格') {
            wx.showToast({
              title: '不符合入库条件，无法入库!',
              icon: 'none',
              duration: 1500
            })
            return
          }
          that.data.products.push(pop_pageDate[0])
          that.setData({
            product: pop_pageDate[0],
            products: that.data.products
          })
        } else {
          // 该构件已入库，提醒
          wx.showToast({
            title: '不在库中!',
            icon: 'none',
            duration: 1000
          })
        }
      },
      error(msg) {
        console.log(msg)
      }
    })
    // }
    // }
  },
  onConfirm(event) {
    const {
      value
    } = event.detail;
    this.setData({
      method: value.name,
      show: false
    })
  },
  onCancel() {
    this.setData({
      show: false
    })
  },
  showPopup() {
    this.setData({
      show: true
    })
  },
  getInWarehouseMethod() {
    let that = this
    wx.request({
      url: 'http://localhost:8989/DuiMa/GetInOutWarehouseMethod',
      data: {
        type: '2'
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        that.setData({
          columns: res.data.data,
        })
      }
    })
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
  submitAll(event) {
    var that = this
    if (!this.data.out_warehouse_method) {
      wx.showToast({
        title: '请选择出库方式',
        icon: 'none',
        duration: 1000
      })
      return
    }
    // 提交并清空
    if (this.data.method == void 0) {
      wx.showToast({
        title: '请选择出库方式',
        icon: 'none',
        duration: 1000
      })
      return
    }
    if (this.data.warehouse_id != null && this.data.products.length != 0) {
      let arr = []
      for (let val of this.data.products) {
        arr.push(val.materialcode)
      }
      // 可以上传
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMaTest/InOutWarehouse',
        data: {
          ids: JSON.stringify(arr),
          type: "2", // 2出库
          method: this.data.out_warehouse_method,
          userId: wx.getStorageSync('userId'),
          userName: wx.getStorageSync('userName'),
          method: this.data.method
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success(res) {
          if (res.data.msg !== '') {
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              duration: 1000
            })
            return
          } else {
            wx.showToast({
              title: '出库成功',
              icon: 'none',
              duration: 1000
            })
          }
          // 清空所有
          console.log(res.data)
          var list = []
          that.setData({
            products: [],
            warehouse_id: "",
            warehouse_name: ""
          })
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
        type: "2",
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
      out_warehouse_method: event.detail.value,
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