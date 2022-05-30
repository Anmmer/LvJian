// login.js
// 登陆界面
const app = getApp()
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  data: {
    show: false
  },
  // 页面创建时执行
  onLoad: function () {
    this.setNavigation();
    wx.showLoading({
      title: '加载中',
    })
    let promise = new Promise((resolve, reject) => {
      // 登录
      wx.login({
        success: res => {
          // 发送 res.code 到后台换取 openId
          wx.request({
            url: 'https://api.weixin.qq.com/sns/jscode2session?appid=' + app.globalData.appid + '&secret=' + app.globalData.secret + '&js_code=' + res.code + '&grant_type=authorization_code',
            method: "GET",
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            success(res) {
              if (res.errMsg == 'request:ok') {
                wx.setStorageSync('openid', res.data.openid)
                console.log(res.data.openid)
              }
              resolve();
            }
          })
        }
      })
    })
    promise.then(() => {
      this.getData()
    })
  },
  getData() {
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
          wx.hideLoading({
            success: (res) => {},
          })
          Dialog.confirm({
            title: '使用微信号登录',
            // message: '弹窗内容'
          }).then(() => {
            // on confirm
            that.autoLogin();
          }).catch(() => {
            // on cancel
          });
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
        wx.hideLoading({
          success: (res) => {},
        })
        console.log(wx.getStorageSync('openid'))
        if (wx.getStorageSync('openid') !== '') {
          Dialog.confirm({
            title: '使用微信号登录',
            // message: '弹窗内容'
          }).then(() => {
            // on confirm
            that.autoLogin();
          }).catch(() => {
            // on cancel
          });
        }
      }
    })
  },
  onClose() {
    this.setData({
      show: false
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
  autoLogin() {
    let openid = wx.getStorageSync('openid')
    console.log(openid)
    if (openid !== '') {
      let pro = new Promise((resolve, reject) => {
        wx.request({
          url: 'http://101.132.73.7:8989/DuiMa/AutoLogin',
          data: {
            openid: openid
          },
          method: 'POST',
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success(res) {
            if (res.data.flag && res.data.data.length !== 0) {
              wx.setStorageSync('userId', res.data.data[0].user_id)
              wx.setStorageSync('userName', res.data.data[0].user_name)
              resolve()
            }
          }
        })
      })
      pro.then(() => {
        wx.request({
          url: 'http://101.132.73.7:8989/DuiMa/GetAuthority',
          data: {
            userId: wx.getStorageSync('userId')
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
                userId: wx.getStorageSync('userId'),
                userName: wx.getStorageSync('userName'),
                fauthority: res.data.processContent,
              }
            })
            wx.setStorageSync('gp_name', JSON.parse(res.data.function)[0].gp_name)
            wx.setStorageSync('fauthority', JSON.parse(res.data.processContent));
            // 进行跳转界面'
            wx.switchTab({
              url: '../index/index',
            })
          },
          fail(res) {
            console.log(res)
          }
        })
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
        openid: wx.getStorageSync('openid')
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
              wx.setStorageSync('fauthority', JSON.parse(res.data.processContent));
              wx.setStorageSync('userId', userId)
              wx.setStorageSync('userName', userName)
              wx.setStorageSync('gp_name', JSON.parse(res.data.function)[0].gp_name)
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
  },
  login() {

  }
})