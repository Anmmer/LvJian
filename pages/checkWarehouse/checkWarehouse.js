// checkWarehouse.js
const app = getApp()
import Toast from '@vant/weapp/toast/toast';
Page({
  data: {
    result: '',
    warehouse_id: '',
    products: [],
    warehouse_name: '',
    success_show: false,
    fail_show: false,
    productstmp: [],
    ready: true,
  },
  scanCode(e) {
    var that = this
    if (!this.data.ready) {
      return
    }
    this.setData({
      ready: false
    })
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取构件号
    var resultstr = e.detail.result.toString()
    var materialcode = resultstr.match(/code='(\d+)'&id=(\d+)/)
    var warehouseIdMatch = resultstr.match(/warehouseId=(\w+)&id=/)
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

    // 这是一个构件标签
    console.log("扫描到构件'" + materialcode + "'")
    if (this.data.products.find((v) => {
        return v.materialcode === materialcode
      })) {
      wx.showToast({
        title: '扫描结果已存在!',
        icon: 'none',
        duration: 500
      })
      this.setData({
        ready: false
      })
      return
    }
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/GetPreProduct',
      data: {
        materialcode: materialcode,
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        that.setData({
          ready: true
        })
        if (res.data.data.length > 0) {
          that.setData({
            products: that.data.products.unshift(res.data.data[0]),

          })
        }

      },
      error(msg) {
        console.log(msg)
        that.setData({
          ready: true
        })
      }
    })




    this.setData({
      ready: true
    })
  },
  submitAll(event) {
    var that = this
    if (this.data.products.length === 0) {
      wx.showToast({
        title: '请扫描构件或添加构件',
        icon: 'none',
        duration: 1000
      })
      return
    }
    let arr = []
    for (let val of this.data.products) {
      arr.push(val.materialcode)
    }
    // 可以上传
    wx.request({
      url: 'http://localhost:8989/DuiMa/InventoryCheck',
      data: {
        materialcodes: JSON.stringify(arr),
        type: "8",
        check_id: that.data.check_id,
        user_name: wx.getStorageSync('userName'),
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        // 清空所有
        console.log(res)
        if (res.data.flag) {
          that.setData({
            success_show: true,
            products: [],

          })
        } else {
          Toast(res.data.msg);
        }

      }
    })

  },
  goto() {
    wx.navigateTo({
      url: "../addCheckWarehouse/addCheckWarehouse",
    })
  },
  deleteItem(event) {
    let list = this.data.products
    // 删除制定的构件
    list.splice(event.currentTarget.dataset.id, 1)

    this.setData({
      products: list,

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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNavigation();
    this.setData({
      check_id: options.check_id,
      create_time: options.create_time,
      should_check_num: options.should_check_num,
      real_check_num: options.real_check_num,
      batch_id: options.batch_id,
      user_name: options.user_name
    })
    // wx.showToast({
    //   title: '请先扫描库房二维码',
    //   icon: 'none',
    //   duration: 2500
    // })

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