// check.js
const app = getApp()
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  data: {
    plannumber: '',
    materialcode: '',
    pid: '',
    state: '',
  },
  // 扫码函数
  scanCode(e) {
    this.setData({
      result: e.detail.result
    })
    var that = this
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取构件号
    var resultstr = e.detail.result.toString()
    var materialcode = resultstr.match(/code='(\d+)'&id=(\d+)/)
    if (!materialcode) {
      materialcode = resultstr.match(/code=(\d+)&id=(\d+)/)
    }
    if (materialcode) {
      materialcode = materialcode[1]
    } else {
      var strs = resultstr.split("\n")
      // for循环从strs中找到构件号
      for (var i = 0; i < strs.length; i++) {
        var idx = strs[i].indexOf(":")
        var fieldname = strs[i].substring(0, idx)
        if (fieldname.indexOf("物料编码") >= 0) {
          materialcode = strs[i].substring(idx + 1)
        }
      }
    }
    if (!materialcode || materialcode == this.data.materialcode) return
    that.setData({
      materialcode: materialcode
    })
    if (materialcode != null) {
      // 获取构件目前生产状态
      var that = this
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMa/GetPreProduct',
        data: {
          materialcode: materialcode,
        },
        method: 'POST',
        header: {
          "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success(res) {
          if (res.data.data.length != 0) {
            // 生产状态
            let pop_pageDate = res.data.data
            if (wx.getStorageSync('on_or_off') == '1') {
              if (pop_pageDate[0]['covert_test'] === 1 && pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
                pop_pageDate[0].state = '待质检'
              } else if (pop_pageDate[0]['covert_test'] === 1 && pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 1) {
                pop_pageDate[0].state = '质检完成'
              } else if (pop_pageDate[0]['covert_test'] === 1 && pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 2) {
                pop_pageDate[0].state = '质检不合格'
              } else {
                pop_pageDate[0].state = '未处于修补状态'
              }
            } else {
              if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
                pop_pageDate[0].state = '待质检'
              } else if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 1) {
                pop_pageDate[0].state = '质检完成'
              } else if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 2) {
                pop_pageDate[0].state = '质检不合格'
              } else {
                pop_pageDate[0].state = '未处于修补状态'
              }
            }
            Toast('扫码成功！');
            that.setData({
              state: pop_pageDate[0].state,
              plannumber: pop_pageDate[0].plannumber,
              materialname: pop_pageDate[0].materialname,
              pid: pop_pageDate[0].pid
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '请扫描有物料编码的二维码!',
        icon: 'none',
        duration: 1000
      })
    }
  },
  submitInfo(e) {
    var that = this
    console.log(this.data.pid)
    if (this.data.pid == null || this.data.pid == '') {
      // 没有materialcode
      wx.showToast({
        title: '请先扫描一个未完工构件的二维码!',
        icon: 'none',
        duration: 1000
      })
      return
    }
    if (this.data.state == '质检不合格') {
     
        // on confirm
        let arr = [];
        arr.push(this.data.pid)
        wx.request({
          url: 'https://mes.ljzggroup.com/DuiMa/Inspect',
          data: {
            pids: JSON.stringify(arr),
          },
          method: 'POST',
          header: {
            "content-type": 'application/x-www-form-urlencoded'
          },
          success(res) {
            // 成功后
            Toast.success('修补成功！');
            that.setData({
              state: '',
              pid: "",
              plannumber: "",
              materialcode: '',
              materialname: ''
            })
          }
        })
    } else {
      wx.showToast({
        title: '未处于修补状态!',
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