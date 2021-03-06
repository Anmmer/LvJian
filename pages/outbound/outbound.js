// outbound.js
const app = getApp()

Page({
  data: {
    warehouse_id: "",
    warehouse_name: "",
    products: [],
    product: {},
  },
  // 扫码函数
  scanCode(e) {
    var that = this
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取构件号
    var resultstr = e.detail.result.toString()
    var materialcode = resultstr.match(/code='(\d+)'&id=(\d+)/)
    if (!materialcode) {
      materialcode = resultstr.match(/code=(\d+)&id=(\d+)/)
    }
    if (materialcode) {
      materialcode = materialcode[1]
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
      url: 'https://mes.ljzggroup.com/DuiMa/GetPreProductWarehouse',
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
    // 提交并清空
    if (this.data.warehouse_id != null && this.data.products.length != 0) {
      let arr = []
      for (let val of this.data.products) {
        arr.push(val.materialcode)
      }
      // 可以上传
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMa/InOutWarehouse',
        data: {
          productIds: JSON.stringify(arr),
          type: "0", // 0出库
          userId: wx.getStorageSync('userId'),
          userName: wx.getStorageSync('userName')
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNavigation();
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