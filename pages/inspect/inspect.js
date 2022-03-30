// pages/produce/produce.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pourMadeNumber: 0,
    checkNumber: 0
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNavigation();
    this.inspectData();
  },
  inspectData() {
    var that = this
    wx.request({
      url: 'http://101.132.73.7:8989/DuiMa/GetPreProduct',
      data: {
        inspectState: "0",
        pourState: "1",
        pageCur: 1,
        pageMax: 1000
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        that.setData({
          checkNumber: res.data.cnt,
          inspect_list: res.data.data
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
      url: "../check/check",
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