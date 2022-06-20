// pages/produce/produce.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pourMadeNumber: 0,
    checkNumber: 0,
    pour_list: [],
    pageAll: 0,
    pageCur: 1,
    pageMax: 10
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNavigation();
    this.pourData();
  },
  pourDataPages() {
    if (this.data.pageCur <= this.data.pageAll) {
      this.pourData()
    }
  },
  pourData() {
    var that = this
    let data = {
      pourState: "0",
      inspectState: "0",
      pageCur: this.data.pageCur,
      pageMax: this.data.pageMax
    }
    if (wx.getStorageSync('on_or_off') == '1') {
      data.isTest = 'true'
    }
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMa/GetPreProduct',
      data: data,
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        that.setData({
          pour_list: that.data.pour_list.concat(res.data.data),
          pourMadeNumber: res.data.cnt,
          pageAll: res.data.pageAll,
          pageCur: that.data.pageCur + 1
        })
      }
    })
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  jiaodao() {
    console.log("出库")
    wx.navigateTo({
      url: "../processConfirm/processConfirm",
    })
  },
  check() {
    console.log("出库")
    wx.navigateTo({
      url: "../check/check",
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})