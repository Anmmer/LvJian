// pages/produce/produce.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pourMadeNumber: 0,
    checkNumber: 0,
    pour_list: [],
    success_show: false,
    fail_show: false,
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
        line: e.detail.value.line,
        pageCur: 1,
        materialname: e.detail.value.materialname,
        materialcode: e.detail.value.materialcode
      })
    }
    let data = {
      pourState: "0",
      inspectState: "0",
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
      url: 'https://mes.ljzggroup.com/DuiMaNew/GetPreProduct',
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
  submitInfo(e) {
    var that = this
    if (e.target.dataset.id != '') {
      let arr = [];
      arr.push(e.target.dataset.id)
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMaNew/Pour',
        data: {
          pids: JSON.stringify(arr),
          pourmade_user: wx.getStorageSync('userName')
        },
        method: 'POST',
        header: {
          "content-type": 'application/x-www-form-urlencoded'
        },
        success(res) {
          // 成功后
          if (res.data.flag) {
            that.pourData()
            that.setData({
              success_show: true,
              color_style: '#fff',
              state: '',
              pid: "",
              plannumber: "",
              materialcode: '',
            })
          } else {
            that.setData({
              fail_show: true
            })
          }

        }
      })
    }
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
  jiaodao() {
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