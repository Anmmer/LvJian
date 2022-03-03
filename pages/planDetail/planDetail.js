Page({
  data: {
    planList: [],
    preproductList: [],
    pages: 0,
    pagesMax: 10,
  },
  onLoad: function (options) {
    this.setNavigation();
    this.getData({
      planList: JSON.parse(options.planList)
    })
    console.log(options)
    console.log(JSON.parse(options.planList))
    console.log(this.getData)
  },
  getData(id) {

  },

  onChange(event) {
    this.setData({
      activeNames: event.detail
    });
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