// login.js
// 登陆界面
const app = getApp()
Page({
  // 页面创建时执行
  onLoad: function () {
    this.setNavigation();
    let that = this
    // 检测是否有工号在Storage中，并检查时间戳
    wx.getStorage({
      key: 'user_data',
      success(res) {
        var lastLoginTime = new Date(res.data.LastLoginTime)
        var currentTime = new Date()
        //if(currentTime.getTime()-lastLoginTime.getTime() > 1) {
        if (currentTime.getTime() - lastLoginTime.getTime() > 7 * 24 * 60 * 60 * 1000) {
          // 登陆过期
          wx.showToast({
            title: '您的登陆信息已过期，请重新登陆！',
            icon: 'none',
            duration: 1000
          })
        } else {
          // 免密登陆，进行跳转
          // 加载权限
          wx.getStorage({
            key: 'user_data',
            success(res) {
              app.globalData.fauthority = JSON.parse(res.data.fauthority)
            },
            fail(res) {
              console.log(res)
            }
          })
          app.globalData.userId = res.data.userId
          app.globalData.userName = res.data.userName
          // 页面跳转
          wx.switchTab({
            url: '../index/index',
          })
        }
      },
      fail() {
        // 没有user_data的存储
        console.log("There is no user_data")
        that.autoLogin()
      }
    })
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
  autoLogin() {
    let userId = wx.getStorageSync('userId')
    let userName = wx.getStorageSync('userName')
    if (userId !== null && userId !== '') {
      console.log(userId)
      wx.request({
        url: 'http://101.132.73.7:8989/DuiMa/GetAuthority',
        data: {
          userId: userId
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success(res) {
          // 写入Storage
          var currentTime = new Date()
          wx.setStorage({
            key: "user_data",
            data: {
              LastLoginTime: currentTime.getTime(),
              userId: userId,
              userName: userName,
              fauthority: res.data.processContent,
            }
          })
          app.globalData.fauthority = JSON.parse(res.data.processContent)
          app.globalData.userId = userId
          app.globalData.userName = userName
          // 进行跳转界面'
          wx.switchTab({
            url: '../index/index',
          })
        },
        fail(res) {
          console.log(res)
        }
      })
    }
  },
  // 系统登陆函数
  systemLogin: function (data) {
    wx.request({
      url: 'http://101.132.73.7:8989/DuiMa/LoginCheck',
      data: {
        user_phone: data.detail.value.user_phone,
        userPwd: data.detail.value.password,
        openid: app.globalData.openid
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        // 成功登陆将修改app的全局数据
        if (res.data.flag) {
          var userName = res.data.userName
          var userId = res.data.userId
          // 登陆成功，获取权限
          wx.request({
            url: 'http://101.132.73.7:8989/DuiMa/GetAuthority',
            data: {
              userId: userId
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success(res) {
              // 写入Storage
              var currentTime = new Date()
              wx.setStorage({
                key: "user_data",
                data: {
                  LastLoginTime: currentTime.getTime(),
                  userId: userId,
                  userName: userName,
                  fauthority: res.data.processContent,
                }
              })
              app.globalData.fauthority = JSON.parse(res.data.processContent)
              app.globalData.userId = data.detail.value.userid
              app.globalData.userName = userName
              // 进行跳转界面
              wx.switchTab({
                url: '../index/index',
              })
            },
            fail(res) {
              console.log(res)
            }
          })
        } else {
          console.log("Login Error!")
          // 显示操作失败
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail(res) {
        console.log(res)
      }
    })
  }
})