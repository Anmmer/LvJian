// processConfirm.js
const app = getApp()
import Toast from '@vant/weapp/toast/toast';

Page({
  data: {
    result: '',
    plannumber: '',
    pid: '',
    materialcode: '',
    disabled: '',
    state: '',
    errormsg: ''
  },
  // 扫码函数
  scanCode(e) {
    if (this.data.pid != '') {
      wx.showToast({
        title: '已扫描构建!',
        icon: 'none',
        duration: 1000
      })
      return
    }
    this.setData({
      result: e.detail.result
    })
    var that = this
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取构件号
    var resultstr = e.detail.result.toString()
    var strs = resultstr.split("\n")
    console.log(strs)
    // for循环从strs中找到构件号
    var materialcode = null
    for (var i = 0; i < strs.length; i++) {
      var idx = strs[i].indexOf(":")
      var fieldname = strs[i].substring(0, idx)
      if (fieldname.indexOf("物料编码") >= 0) {
        materialcode = strs[i].substring(idx + 1)
      }
    }
    that.setData({
      materialcode: materialcode
    })
    if (materialcode != null) {
      // 获取构件目前生产状态
      var that = this
      wx.request({
        url: 'http://101.132.73.7:8989/DuiMa/GetPreProduct',
        data: {
          materialcode: materialcode,
        },
        method: 'POST',
        header: {
          "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success(res) {
          if (res.data.data.length != 0) {
            Toast('扫码成功！');
            // 生产状态
            let pop_pageDate = res.data.data
            that.data.disabled = ''
            if (pop_pageDate[0]['pourmade'] === 0 && pop_pageDate[0]['inspect'] === 0) {
              pop_pageDate[0].state = '待浇捣'
            }
            if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
              pop_pageDate[0].state = '浇捣完成'
              that.data.disabled = 'disabled'
            }
            that.setData({
              state: pop_pageDate[0].state,
              plannumber: pop_pageDate[0].plannumber,
              pid: pop_pageDate[0].pid
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '请扫描具有构件号的构件二维码!',
        icon: 'none',
        duration: 1000
      })
    }
  },
  onClose() {
    this.setData({ show: false });
  },
  submitInfo(e) {
    var that = this
    if (this.data.pid != '') {
      if (this.data.disabled == 'disabled') {
        wx.showToast({
          title: '已浇捣!',
          icon: 'none',
          duration: 1000
        })
        return
      }
      let arr = [];
      arr.push(this.data.pid)
      wx.request({
        url: 'http://101.132.73.7:8989/DuiMa/Pour',
        data: {
          pids: JSON.stringify(arr)
        },
        method: 'POST',
        header: {
          "content-type": 'application/x-www-form-urlencoded'
        },
        success(res) {
          // 成功后
          Toast.success('浇捣成功！');
          that.setData({
            state: '',
            pid: "",
            plannumber: "",
            materialcode: '',
          })
        }
      })
    } else {
      // 没有productId
      wx.showToast({
        title: '请先扫描一个未完工构件的二维码!',
        icon: 'none',
        duration: 1000
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNavigation();
    // this.pourData();
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
          startBarHeight: startBarHeight,
          navgationHeight: navgationHeight
        })
      }
    })
  },
})