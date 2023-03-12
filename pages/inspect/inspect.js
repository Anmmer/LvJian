// pages/produce/produce.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pourMadeNumber: 0,
    checkNumber: 0,
    inspect_list: [],
    pageAll: 0,
    pageCur: 1,
    pageMax: 10
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNavigation();
    // this.inspectData();
  },
  inspectDataPages() {
    if (this.data.pageCur <= this.data.pageAll) {
      this.inspectData()
    }
  },
  inspectData(e) {
    var that = this
    if (e !== undefined) {
      this.setData({
        line: e.detail.value.line,
        materialname: e.detail.value.materialname,
        materialcode: e.detail.value.materialcode
      })
    }
    let data = {
      inspectState: "0",
      pourState: "1",
      line: this.data.line,
      materialname: this.data.materialname,
      materialcode: this.data.materialcode,
      pageCur: this.data.pageCur,
      pageMax: this.data.pageMax
    }
    if (wx.getStorageSync('on_or_off') == '1') {
      data.isTest = 'true'
    }
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaTest/GetPreProduct',
      data: data,
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        if (e == undefined) {
          that.setData({
            checkNumber: res.data.cnt,
            pageAll: res.data.pageAll,
            inspect_list: that.data.inspect_list.concat(res.data.data),
            pageCur: that.data.pageCur + 1
          })
        } else {
          that.setData({
            checkNumber: res.data.cnt,
            pageAll: res.data.pageAll,
            inspect_list: res.data.data,
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
    wx.navigateTo({
      url: "../check/check",
    })
  },
  // check() {
  //   wx.navigateTo({
  //     url: "../check/check",
  //   })
  // },
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