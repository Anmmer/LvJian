// pages/produce/produce.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pourMadeNumber: 0,
    checkNumber: 0,
    materialname: '',
    drawing_no: '',
    planname: '',
    inspect_list: [],
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
    this.inspectData();
  },
  inspectDataPages() {
    if (this.data.pageCur <= this.data.pageAll) {
      this.inspectData()
    }
  },
  inspectData(e) {
    if (e) {
      this.setData({
        // line: e.detail.value.line,
        pageCur: 1,
        materialname: e.detail.value.materialname,
        // materialcode: e.detail.value.materialcode,
        drawing_no: e.detail.value.drawing_no,
        planname: e.detail.value.planname,
      })
    }
    var that = this
    let data = {
      inspectState: "2",
      materialname: this.data.materialname,
      drawing_no: this.data.drawing_no,
      planname: this.data.planname,
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
            checkNumber: res.data.cnt,
            pageAll: res.data.pageAll,
            inspect_list: that.data.inspect_list.concat(res.data.data),
            pageCur: that.data.pageCur + 1
          })
        } else {
          that.setData({
            inspect_list: res.data.data,
            checkNumber: res.data.cnt,
            pageAll: res.data.pageAll,
          })
        }
      }
    })
  },
  inspect(e) {
    let that = this
    let arr = [];
    arr.push(e.target.dataset.id)
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/Inspect',
      data: {
        pids: JSON.stringify(arr),
        inspect_user: wx.getStorageSync('userName'),
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        // 成功后
        if (res.data.flag) {
          that.setData({
            success_show: true,
            color_style: '#fff',
            inspect_list: [],
            pageCur: 1
          })
          that.inspectData()
        } else {
          that.setData({
            fail_show: true,
          })
        }

      }
    })
  },
  submitInfo(e) {
    let that = this
    let arr = [];
    arr.push(e.target.dataset.id)
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/WarehouseScrapInOut',
      data: {
        pids: JSON.stringify(arr),
        type: "1",
        scrap_user: wx.getStorageSync('userName'),
        scrap_library: "报废库",
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        // 成功后
        if (res.data.flag) {
          that.setData({
            success_show: true,
            color_style: '#fff',
            inspect_list: [],
            pageCur: 1
          })
          that.inspectData()
        } else {
          that.setData({
            fail_show: true,
          })
        }
      }
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
  jiaodao1() {
    wx.navigateTo({
      url: "../patchCheck/patchCheck",
    })
  },
  jiaodao2() {
    wx.navigateTo({
      url: "../patchInWarehouse/patchInWarehouse",
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