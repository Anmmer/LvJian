// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    userName: null,
    gezi: [],
    authority: [{
        icon: "/pages/image/sm.png",
        wenzi: "扫码",
        linktype: "navigateTo",
        url: "/pages/qrcodeInfo/qrcodeInfo",
        img: "/pages/image/kecheng1.png"
      },
      {
        icon: "/pages/image/cx.png",
        wenzi: "计划查询",
        linktype: "navigateTo",
        url: "/pages/plan/plan",
        img: "/pages/image/kecheng2.png"
      },
      {
        icon: "/pages/image/sc.png",
        wenzi: "生产查询",
        linktype: "navigateTo",
        url: "/pages/producelook/producelook",
        img: "/pages/image/kecheng3.png"
      },
      {
        icon: "/pages/image/jd.png",
        wenzi: "浇捣",
        linktype: "navigateTo",
        url: "/pages/pour/pour",
        img: "/pages/image/kecheng3.png"
      },
      {
        icon: "/pages/image/zj.png",
        wenzi: "成品检验",
        linktype: "navigateTo",
        url: "/pages/inspect/inspect",
        img: "/pages/image/zj.png"
      },
      {
        icon: "/pages/image/xb.png",
        wenzi: "修补库",
        linktype: "navigateTo",
        url: "/pages/patchlibrary/patchlibrary",
        img: "/pages/image/kecheng4.png"
      },
      {
        icon: "/pages/image/bf.png",
        wenzi: "报废库",
        linktype: "navigateTo",
        url: "/pages/warehouseScrap/warehouseScrap",
        img: "/pages/image/kecheng4.png"
      },
      {
        icon: "/pages/image/rk.png",
        wenzi: "扫码入库",
        linktype: "navigateTo",
        url: "/pages/inboundQuery/inboundQuery",
        img: "/pages/image/kecheng5.png"
      },
      {
        icon: "/pages/image/ck.png",
        wenzi: "扫码出库",
        linktype: "navigateTo",
        url: "/pages/outboundQuery/outboundQuery",
        img: "/pages/image/kecheng5.png"
      },
      {
        icon: "/pages/image/pk.png",
        wenzi: "盘点库存",
        linktype: "navigateTo",
        url: "/pages/checkWarehouseQuery/checkWarehouseQuery",
        img: "/pages/image/kecheng5.png"
      },
      {
        icon: "/pages/image/yk.png",
        wenzi: "扫码移库",
        linktype: "navigateTo",
        url: "/pages/moveWarehouseQuery/moveWarehouseQuery",
        img: "/pages/image/kecheng5.png"
      },
      {
        icon: "/pages/image/dr.png",
        wenzi: "期初导入",
        linktype: "navigateTo",
        url: "/pages/initWarehouse/initWarehouse",
        img: "/pages/image/kecheng5.png"
      },
      {
        icon: "/pages/image/dr.png",
        wenzi: "库存查询",
        linktype: "navigateTo",
        url: "/pages/warehouseQuery/warehouseQuery",
        img: "/pages/image/kecheng5.png"
      },

    ],
    active: 0,

    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: false,
    // canIUseOpenData: wx.canIUse('open-data.type.userAvatarUrl') && wx.canIUse('open-data.type.userNickName') // 如需尝试获取用户信息可改为false
    canIUseOpenData: false,
  },
  onLoad() {
    let on_or_off
    let pro = new Promise((resolve, reject) => {
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMaNew/GetDefaultSet',
        data: null,
        method: 'POST',
        header: {
          "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success(res) {
          if (res.data.data !== undefined) {
            res.data.data.forEach((item) => {
              if (item.name == 'concealed_process') {
                on_or_off = item.on_or_off;
              }
            })
            wx.setStorageSync('on_or_off', on_or_off)
            resolve()
          }
        }
      })
    })
    pro.then(() => {
      let arr = []
      let fauthority = wx.getStorageSync('fauthority')
      console.log(fauthority)
      for (let val of fauthority) {
        arr.push(this.data.authority[val.pc_id - 1])
      }
      if (on_or_off == '1') {
        arr.splice(3, 0, {
          icon: "/pages/image/jy.png",
          wenzi: "隐蔽性检验",
          linktype: "navigateTo",
          url: "/pages/coverTest/coverTest",
          img: "/pages/image/kecheng3.png"
        })
      }
      this.setData({
        gezi: arr,
        userName: wx.getStorageSync('userName')
      })
      this.setNavigation();
      if (wx.getUserProfile) {
        this.setData({
          canIUseGetUserProfile: true
        })
      }
      this.checkLogin()
    })
  },
  onShow: function () {
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
          startBarHeight: res.statusBarHeight,
          navgationHeight: navgationHeight
        })
      }
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  checkLogin() {
    var that = this
    wx.checkSession({
      success() {
        //session_key 未过期，并且在本生命周期一直有效
        that.setData({
          hasName: true
        })
      },
      fail() {
        // session_key 已经失效，需要重新执行登录流程
        wx.login() //重新登录
      }
    })
  },
})