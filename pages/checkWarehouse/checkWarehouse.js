// checkWarehouse.js
const app = getApp()
import Toast from '@vant/weapp/toast/toast';
Page({
  data: {
    result: '',
    warehouse_id: '',
    products: [],
    warehouse_name: '',
    productstmp: []
  },
  scanCode(e) {
    this.setData({
      result: e.detail.result
    })
    var that = this
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取构件号
    var resultstr = e.detail.result.toString()
    var strs = resultstr.split("\n")
    // for循环从strs中找到构件号或者货位号
    for (var i = 0; i < strs.length; i++) {
      var idx = strs[i].indexOf(":")
      var fieldname = strs[i].substring(0, idx)
      if (fieldname.indexOf("物料编码") >= 0) {
        // 这是一个构件标签
        var materialcode = strs[i].substring(idx + 1)
        console.log("扫描到构件'" + materialcode + "'")
        if (that.data.warehouse_id == "") {
          // 还未扫描货位
          wx.showToast({
            title: '请先扫描一个货位后，再进行盘库',
            icon: 'none',
            duration: 1000
          })
          return
        } else {
          // 循环找是否存在在库位中
          console.log(materialcode)
          this.data.products.map((val, i) => {
            if (val.materialcode == materialcode) {
              this.data.products.splice(i, 1);
              console.log(materialcode)
              console.log(this.data.products)
              this.setData({
                products: this.data.products
              })
              wx.showToast({
                title: 'ok!',
                icon: 'none',
                duration: 1000
              })
            }
          })

          if (this.data.products.length == 0) {
            Toast.success('盘库成功');
          }
        }
      } else if (fieldname.indexOf("货位号") > 0) {
        // 扫到一个库
        var warehouseId = strs[i].substring(idx + 1)
        console.log("扫描到货位，其货位号为" + warehouseId)
        wx.request({
          url: 'http://101.132.73.7:8989/DuiMa/GetPreProductWarehouse',
          data: {
            warehouseId: warehouseId
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
          },
          success(res) {
            console.log(res.data)
            // 重置名字，重置id
            var jsonobj = res.data.data
            for (let i = 0; i < jsonobj.length; i++) {
              if (jsonobj[i]['pourmade'] === 0 && jsonobj[i]['inspect'] === 0) {
                jsonobj[i].state = '待浇捣'
              }
              if (jsonobj[i]['pourmade'] === 1 && jsonobj[i]['inspect'] === 0) {
                jsonobj[i].state = '待质检'
              }
              if (jsonobj[i]['pourmade'] === 1 && jsonobj[i]['inspect'] === 1) {
                jsonobj[i].state = '质检合格'
              }
              if (jsonobj[i]['pourmade'] === 1 && jsonobj[i]['inspect'] === 2) {
                jsonobj[i].state = '质检不合格'
              }
            }
            that.setData({
              warehouse_name: jsonobj[0].warehouse_name,
              warehouse_id: warehouseId,
              products: jsonobj
            })
          }
        })
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNavigation();
    wx.showToast({
      title: '请先扫描库房二维码',
      icon: 'none',
      duration: 2500
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
  fanhui: function () {
    wx.navigateBack()
  },
})