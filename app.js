// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    let appid = 'wx1cc9a0655d15921e'
    let secret = 'dcdfd855d3846a8e4aa2ab7f48ba2eba'
    let that = this
    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId
        wx.request({
          url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + appid + '&secret=' + secret + '&js_code=' + res.code + '&grant_type=authorization_code',
          method: "GET",
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success(res) {
            if (res.errMsg == 'request:ok') {
              wx.setStorageSync('openid', res.data.openid)
              console.log(res.data.openid)
            }
          }
        })
      }
    })
  },
  globalData: {
    userInfo: null,
    userId: null,
    openid: null,
    userName: null,
    pcauthority: null,
    fauthority: null,
    minDate: '2022-1-1'
  }
})