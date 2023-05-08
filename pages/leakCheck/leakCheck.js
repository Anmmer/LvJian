// pages/produce/produce.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pourMadeNumber: 0,
    checkNumber: 0,
    materialname: '',
    materialcode: '',
    factory_id: '',
    planname: '',
    items: [],
    show2: false,
    building_no: '',
    floor_no: '',
    drawing_no: '',
    columns: [],
    pour_list: [],
    success_show: false,
    fail_show: false,
    pageAll: 0,
    pageCur: 1,
    pageMax: 10,
    check_id: '',
    create_time: '',
    path: '',
    planname: '',
    build_type: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    this.setData({
      check_id: options.check_id,
      create_time: options.create_time,
      path: options.path,
      planname: options.planname,
      build_type: options.build_type
    })
    this.setNavigation();
    this.pourData();
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
        // line: e.detail.value.line,
        pageCur: 1,
        materialname: e.detail.value.materialname,
        // materialcode: e.detail.value.materialcode,
        drawing_no: e.detail.value.drawing_no,
        planname: e.detail.value.planname,
        building_no: e.detail.value.building_no,
        floor_no: e.detail.value.floor_no
      })
    }
    let data = {
      check_id: this.data.check_id,
      check_type: "leak_check",
      type: '4',
      pageCur: this.data.pageCur,
      pageMax: this.data.pageMax
    }

    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/InventoryCheck',
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
            pour_list: res.data.warehouseInfo,
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
      url: "../moveWarehouse/moveWarehouse",
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