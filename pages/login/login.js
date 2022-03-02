// login.js
// 登陆界面
const app = getApp()
Page({
  // 页面创建时执行
  onLoad: function(){
    // 检测是否有工号在Storage中，并检查时间戳
    wx.getStorage({
      key:'user_data',
      success(res) {
        var lastLoginTime = new Date(res.data.LastLoginTime)
        var currentTime = new Date()
        //if(currentTime.getTime()-lastLoginTime.getTime() > 1) {
        if(currentTime.getTime()-lastLoginTime.getTime() > 7*24*60*60*1000) {
          // 登陆过期
          wx.showToast({
            title:'您的登陆信息已过期，请重新登陆！',
            icon:'none',
            duration:1000
          })
        }
        else {
          // 免密登陆，进行跳转
          // 加载权限
          wx.getStorage({
            key: 'user_data',
            success (res) {
              app.globalData.fauthority = res.data.fauthority
              app.globalData.pcauthrority = res.data.pcauthrority
            },
            fail (res){
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
      fail(){
        // 没有user_data的存储
        console.log("There is no user_data")
      }
    })
  },
  // 系统登陆函数
  systemLogin:function(data) {
    wx.request({
      url: 'http://101.132.73.7:8989/DuiMa/LoginCheck',
      data: {
        userId: data.detail.value.userid,
        userPwd: data.detail.value.password
      },
      method:"POST",
      header:{
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res) {
        // 成功登陆将修改app的全局数据
        console.log(res)
        var userName = res.data.userName
        if(res.data.ret=="true") {
          // 登陆成功，获取权限
          wx.request({
            url: 'http://101.132.73.7:8989/DuiMa/GetAuthority',
            data:{
              userId:data.detail.value.userid
            },
            method:'POST',
            header:{
              'content-type':'application/x-www-form-urlencoded'
            },
            success(res){
              // 写入Storage
              console.log(res)
              var currentTime = new Date()
              wx.setStorage({
                key:"user_data",
                data:{
                  LastLoginTime: currentTime.getTime(),
                  userId:data.detail.value.userid,
                  userName:userName,
                  fauthority:res.data.function,
                  pcauthority:res.data.processContent
                }
              })
              app.globalData.fauthority = JSON.parse(res.data.function)
              app.globalData.pcauthrority = JSON.parse(res.data.processContent)
              app.globalData.userId = data.detail.value.userid
              app.globalData.userName = userName
              // 显示操作成功界面
              wx.showToast({
                title: '登陆成功',
                icon: 'success',
                duration: 1000
              })
              // 进行跳转界面
              wx.switchTab({
                url: '../index/index',
              })
            },
            fail(res){
              console.log(res)
            }
          })
        }
        else {
          console.log("Login Error!")
          // 显示操作失败
          wx.showToast({
            title: '登陆失败',
            icon: 'none',
            duration:1000
          })
        }
      },
      fail(res){
        console.log(res)
      }
    })
  }
})