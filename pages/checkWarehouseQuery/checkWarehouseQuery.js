// pages/produce/produce.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    batch_id: '',
    user_name: '',
    startDate: '',
    endDate: '',
    pour_list: [],
    pourMadeNumber: 0,
    pageAll: 0,
    pageCur: 1,
    pageMax: 10
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNavigation();
    // this.pourData();
  },
  pourDataPages() {
    if (this.data.pageCur < this.data.pageAll) {
      this.setData({
        pageCur: this.data.pageCur + 1
      })
      this.pourData()
    }
  },
  pourData(e) {
    var that = this
    if (e) {
      this.setData({
        pageCur: 1,
        batch_id: e.detail.value.batch_id,
        user_name: e.detail.value.user_name,
        startDate: e.detail.value.startDate,
        endDate: e.detail.value.endDate,
      })
    }
    let data = {
      batch_id: this.data.batch_id,
      user_name: this.data.user_name,
      startDate: this.data.startDate,
      endDate: this.data.endDate,
      type: '0',
      status: '1',
      pageCur: this.data.pageCur,
      pageMax: this.data.pageMax
    }

    wx.request({
      url: 'http://localhost:8989/DuiMa/InventoryCheck',
      data: data,
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        if (!e) {
          that.setData({
            pour_list: that.data.pour_list.concat(res.data.data),
            pourMadeNumber: res.data.cnt,
            pageAll: res.data.pageAll,
          })
        } else {
          that.setData({
            pour_list: res.data.data,
            pourMadeNumber: res.data.cnt,
            pageAll: res.data.pageAll,
          })
        }

      }
    })
  },
  fanhui: function () {
    wx.navigateBack()
  },

  submitInfo() {

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
  jiaodao(e) {
    console.log(e)
    wx.navigateTo({
      url: "../checkWarehouse/checkWarehouse?check_id=" + e.target.dataset.id.check_id + "&create_time=" + e.target.dataset.id.create_time + "&should_check_num=" + e.target.dataset.id.should_check_num + "&real_check_num=" + e.target.dataset.id.real_check_num + "&batch_id=" + e.target.dataset.id.batch_id + "&user_name=" + e.target.dataset.id.user_name,
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