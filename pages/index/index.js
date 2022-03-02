// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    userName: null,
  },
  onLoad() {
    this.setData({
      userName: app.globalData.userName
    })
    this.setNavigation();
  },
  onShow: function (){
    this.getTabBar().init();
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
  toQrcodeInfo() {
    console.log("查询二维码")
    wx.navigateTo({
      url: "../qrcodeInfo/qrcodeInfo",
    })
  },

  toInbound() {
    console.log("入库")
    wx.navigateTo({
      url: "../inbound/inbound",
    })
  },
  toOutbound() {
    console.log("出库")
    wx.navigateTo({
      url: "../outbound/outbound",
    })
  },
  toCheckWarehouse() {
    console.log("清点库存");
    wx.navigateTo({
      url: '../checkWarehouse/checkWarehouse',
    })
  }
})