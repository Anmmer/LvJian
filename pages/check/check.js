// check.js
const app = getApp()

Page({
  data: {
    result: '',
    plannumber: '',
    materialcode: '',
    disabled: '',
    state: '',
    errormsg: ''
  },
  // 扫码函数
  scanCode(e) {
    this.setData({
      result: e.detail.result
    })
    var that = this
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取构件号
    var resultstr = e.detail.result.toString()
    var strs = resultstr.split("\n")
    console.log(strs)
    // for循环从strs中找到构件号
    var materialcode = null
    for (var i = 0; i < strs.length; i++) {
      var idx = strs[i].indexOf(":")
      console.log("idx:" + idx)
      var fieldname = strs[i].substring(0, idx)
      console.log(fieldname.charCodeAt(3).toString(16))
      console.log(fieldname.charCodeAt(2).toString(16))
      console.log(fieldname.charCodeAt(1).toString(16))
      console.log(fieldname.charCodeAt(0).toString(16))
      console.log(fieldname.indexOf("物料编码"))
      console.log("物料编码".length)
      if (fieldname.indexOf("物料编码") >= 0) {
        materialcode = strs[i].substring(idx + 1)
      }
    }
    that.setData({
      materialcode: materialcode
    })
    console.log(materialcode)
    if (materialcode != null) {
      // 获取构件目前生产状态
      var that = this
      wx.request({
        url: 'http://101.132.73.7:8989/DuiMa/GetPreProduct',
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
            that.data.disabled = ''
            if (pop_pageDate[0]['pourmade'] === 0 && pop_pageDate[0]['inspect'] === 1) {
                pop_pageDate[0].state = '待质检'
              }
              if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 1) {
                pop_pageDate[0].state = '质检完成'
                that.data.disabled = 'disabled'
              }
            that.setData({
              state: pop_pageDate[0].state
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '请扫描具有构件号的构件二维码!',
        icon: 'none',
        duration: 1000
      })
    }
  },
  submitInfo(e) {
    var that = this
    console.log(app.globalData.userId)
    console.log(this.data.product_id)
    // 传送userId和product_id，在服务器端写入时间
    if (this.data.product_id != null && this.data.pc_name != "") {
      wx.request({
        url: 'http://101.132.73.7:8989/DuiMa/Confirm',
        data: {
          productId: that.data.product_id,
          userId: app.globalData.userId,
          userName: app.globalData.userName
        },
        method: 'POST',
        header: {
          "content-type": 'application/x-www-form-urlencoded'
        },
        success(res) {
          console.log(res)
          // 成功后
          wx.showToast({
            title: '完成工序确认!',
            icon: 'success',
            duration: 1000
          })
          // 同时清除构件号product_id和所在工序内容pc_name和errormsg
          that.setData({
            product_id: "",
            pc_name: "",
            errormsg: ""
          })
        }
      })
    } else {
      // 没有productId
      wx.showToast({
        title: '请先扫描一个未完工构件的二维码!',
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
    // this.pourData();
  },
  fanhui: function () {
    wx.navigateBack()
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
})