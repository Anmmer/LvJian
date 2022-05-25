// qrcodeInfo.js
const app = getApp()
Page({
  data: {
    result: '',
    dataArray: null,
    storageInfo: null
  },
  // 扫码函数
  scanCode(e) {
    this.setData({
      result: e.detail.result
    })
    var that = this
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取物料编码
    var resultstr = e.detail.result.toString()
    var strs = resultstr.split("\n")
    // for循环从strs中找到物料编码
    var materialcode = null
    for (var i = 0; i < strs.length; i++) {
      var idx = strs[i].indexOf(":")
      var fieldname = strs[i].substring(0, idx)
      if (fieldname.indexOf("物料编码") >= 0) {
        materialcode = strs[i].substring(idx + 1)
      }
    }
    if (materialcode != null) {
      wx.request({
        url: 'http://101.132.73.7:8989/DuiMa/GetPreProduct',
        data: {
          materialcode: materialcode
        },
        method: 'POST',
        header: {
          "content-type": 'application/x-www-form-urlencoded'
        },
        success(res) {
          if (res.data.data.length != 0) {
            // 生产状态
            let pop_pageDate = res.data.data
            if (wx.getStorageSync('on_or_off') == '1') {
              if (pop_pageDate[0]['covert_test'] == 0) {
                pop_pageDate[0].state = '已打印'
              }
              if (pop_pageDate[0]['covert_test'] == 1) {
                pop_pageDate[0].state = '隐蔽性检验通过'
              }
              if (pop_pageDate[0]['covert_test'] == 2) {
                pop_pageDate[0].state = '隐蔽性未通过'
              }
              if (pop_pageDate[0]['pourmade'] == 1) {
                pop_pageDate[0].state = '已浇捣'
              }
              if (pop_pageDate[0]['inspect'] == 1) {
                pop_pageDate[0].state = '质检合格'
              }
              if (pop_pageDate[0]['inspect'] == 2) {
                pop_pageDate[0].state = '质检不合格'
              }
            } else {
              if (pop_pageDate[0]['pourmade'] === 0 && pop_pageDate[0]['inspect'] === 0) {
                pop_pageDate[0].state = '待浇捣'
              }
              if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
                pop_pageDate[0].state = '浇捣完成'
                that.data.disabled = 'disabled'
              }
              if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
                pop_pageDate[0].state = '待质检'
              }
              if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 1) {
                pop_pageDate[0].state = '质检完成'
              }
            }
            that.setData({
              dataArray: pop_pageDate
            })

            if (typeof (res.data.warehouse_name) != "undefined") {
              that.setData({
                storageInfo: "构件存储于仓储组织'" + res.data.factory_name + "'下的货位'" + res.data.warehouse_name + "'!"
              })
            } else {
              that.setData({
                storageInfo: "构件目前不在仓库中!"
              })
            }
            //that.setData({dataArray:res.data})
          }
        }
      })
      // 请求获取数据
    } else {
      wx.showToast({
        title: '请扫描拥有构件号信息的二维码!',
        icon: 'none',
        duration: 1000
      })
    }
  },
  onLoad() {
    this.setNavigation();
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