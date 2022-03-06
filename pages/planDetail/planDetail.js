Page({
  data: {
    planList: [],
    preproductList: [],
    activeNames: [],
    plannumber: '',
    pages: 0,
    pagesMax: 10,
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '数据加载中',
    })
    this.setNavigation();
    console.log(options)
    this.setData({
      planname: options.planname,
      materialcode: options.materialcode,
      start_date: options.start_date,
      end_date: options.start_date
    })
    this.lookPlan();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.lookPlan();
  },


  getData(id) {
    wx.showLoading({
      title: '加载数据中',
    })
    var that = this
    wx.request({
      url: 'http://localhost:8989/DuiMa/GetPreProduct',
      data: {
        plannumber: id,
        // pageCur: that.data.pages,
        // pageMax: that.data.pagesMax
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        wx.hideLoading({
          success: (res) => {},
        })
        that.setData({
          preproductList: res.data.data,
          activeNames: [id]
        })
      }
    })
  },
  lookPlan() {
    var that = this
    that.data.pages += 1
    wx.request({
      url: 'http://localhost:8989/DuiMa/GetPlan',
      data: {
        // productState: 0,
        pageCur: that.data.pages,
        pageMax: that.data.pagesMax,
        materialcode: that.data.materialcode,
        startDate: that.data.start_date,
        endDate: that.data.end_date,
        planname: that.data.planname,
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        wx.hideLoading({
          success: (res) => {},
        })
        if (res.data.data.length !== 0) {
          that.setData({
            planList: that.data.planList.concat(res.data.data)
          })
        }

      }
    })
  },

  onChange(event) {
    if (event.detail.length !== 0) {
      this.getData(event.detail[0])
    } else {
      this.setData({
        activeNames: event.detail
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
          startBarHeight: startBarHeight,
          navgationHeight: navgationHeight
        })
      }
    })
  },


  fanhui: function () {
    wx.navigateBack()
  },
})