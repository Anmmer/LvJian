// checkWarehouse.js
const app = getApp()
import Toast from '@vant/weapp/toast/toast';
Page({
  data: {
    result: '',
    warehouse_id: '',
    products: [],
    warehouse_name: '',
    success_show: false,
    fail_show: false,
    productstmp: [],
    ready: true,
  },
  scanCode(e) {
    var that = this
    if (!this.data.ready) {
      return
    }
    this.setData({
      ready: false
    })
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取构件号
    var resultstr = e.detail.result.toString()
    var materialcode = resultstr.match(/code='(\d+)'&id=(\d+)/)
    var warehouseIdMatch = resultstr.match(/warehouseId=(\w+)&id=/)
    var warehouseId = null
    if (!materialcode) {
      materialcode = resultstr.match(/code=(\d+)&id=(\d+)/)
    }
    if (materialcode) {
      materialcode = materialcode[1]
    } else if (warehouseIdMatch) {
      warehouseId = warehouseIdMatch[1]
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
    if (materialcode) {
      // 这是一个构件标签
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
        this.data.products.forEach((val, i) => {
          if (val.materialcode == materialcode) {
            that.data.products.splice(i, 1);
            that.data.productstmp.push(val)
            that.setData({
              products: that.data.products
            })
            if (this.data.products.length == 0) {
              wx.request({
                url: 'https://mes.ljzggroup.com/DuiMaTest/InOutWarehouse',
                data: {
                  ids: JSON.stringify(this.data.productstmp.map((item) => {
                    return item.materialcode
                  })),
                  type: "4", // 4盘库
                  userId: wx.getStorageSync('userId'),
                  userName: wx.getStorageSync('userName')
                },
                method: 'POST',
                header: {
                  'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
                },
                success(res) {
                  that.setData({
                    success_show: true,
                    ready: true
                  })
                }
              })
            }
            wx.showToast({
              title: '操作成功!',
              icon: 'none',
              duration: 500
            })
            return
          }
        })
        this.setData({
          ready: true
        })
      }
    } else if (warehouseId) {
      // 扫到一个库
      console.log("扫描到货位，其货位号为" + warehouseId)
      this.setData({
        warehouse_id: warehouseId,
      })
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMaTest/GetPreProductWarehouse',
        data: {
          warehouseId: warehouseId,
        },
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success(res) {
          console.log(res.data)
          // 
          var jsonobj = res.data.data
          that.setData({
            ready: true
          })
          if (!res.data.data.length) {
            wx.showToast({
              title: '该仓库暂无构件',
              icon: 'none',
              duration: 500
            })
            return
          }
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
            name: jsonobj[0].name,
            path: jsonobj[0].path,
            products: jsonobj
          })
        }
      })
    }

  },
  successOnClose() {
    this.setData({
      success_show: false
    })
  },
  failOnClose() {
    this.setData({
      fail_show: false
    })
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