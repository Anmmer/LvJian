// pages/produce/produce.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    testMadeNumber: 0,
    checkNumber: 0,
    test_list: [],
    pageAll: 0,
    pageCur: 1,
    pageMax: 10
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNavigation();
    // this.testData();
  },
  testDataPages() {
    if (this.data.pageCur <= this.data.pageAll) {
      this.testData()
    }
  },
  testData(e) {
    var that = this
    if (e !== undefined) {
      this.setData({
        line: e.detail.value.line,
        materialname: e.detail.value.materialname,
        materialcode: e.detail.value.materialcode
      })
    }
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMa/GetPreProduct',
      data: {
        isPrint: "true",
        testState: "0",
        line: this.data.line,
        materialname: this.data.materialname,
        materialcode: this.data.materialcode,
        pageCur: this.data.pageCur,
        pageMax: this.data.pageMax
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        if (e == undefined) {
          that.setData({
            test_list: that.data.test_list.concat(res.data.data),
            testMadeNumber: res.data.cnt,
            pageAll: res.data.pageAll,
            pageCur: that.data.pageCur + 1
          })
        } else {
          that.setData({
            test_list: res.data.data,
            testMadeNumber: res.data.cnt,
            pageAll: res.data.pageAll,
            pageCur: 1
          })
        }
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
  test() {
    wx.navigateTo({
      url: "../test/test",
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
    this.testData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})