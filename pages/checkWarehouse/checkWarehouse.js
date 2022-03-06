// checkWarehouse.js
const app = getApp()
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
    var productId = null
    for (var i = 0; i < strs.length; i++) {
      var idx = strs[i].indexOf(":")
      var fieldname = strs[i].substring(0, idx)
      var flag = (fieldname == "货位号")
      console.log()
      console.log(flag)
      console.log(fieldname)
      if (fieldname.indexOf("构件号") >= 0) {
        // 这是一个构件标签
        var productId = strs[i].substring(idx + 1)
        console.log("扫描到构件'" + productId + "'")
        if (that.data.warehouse_id == "") {
          // 还未扫描货位
          wx.showToast({
            title: '请先扫描一个货位后，再进行盘库',
            icon: 'none',
            duration: 1000
          })
          continue
        } else {
          // for循环找是否存在在库位中
          var list = that.data.products
          var listtmp = that.data.productstmp
          var flag = false
          for (var j = 0; j < listtmp.length; j++) {
            if (listtmp[j] == productId) flag = true;
          }
          if (!flag) {
            wx.showToast({
              title: '该构件不是该库的构件!',
              icon: 'none',
              duration: 3000
            })
            continue
          }
          var idx = 0;
          flag = false
          for (var j = 0; j < list.length; j++) {
            if (list[j] == productId) {
              idx = j;
              flag = true
            }
          }
          if (flag) {
            list.splice(idx, 1)
            that.setData({
              products: list
            })
          }
        }
      } else if (fieldname.trim() == "货位号") {
        // 扫到一个库
        var warehouseId = strs[i].substring(idx + 1)
        console.log("扫描到货位，其货位号为" + warehouseId)
        var fields = {
          warehouse_name: "STRING"
        }
        wx.request({
          url: 'http://101.132.73.7:8989/DuiMa/QuerySQL',
          data: {
            sqlStr: "select warehouse_name from warehouse where warehouse_id =" + warehouseId + ";",
            fieldNames: JSON.stringify(fields),
            pageCur: 1,
            pageMax: 10
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
          },
          success(res) {
            console.log(res.data)
            // 重置名字，重置id
            var jsonobj = JSON.parse(res.data.data)
            that.setData({
              warehouse_name: jsonobj.warehouse_name,
              warehouse_id: warehouseId
            })
          }
        })
        // 查询所有该货位上的构件
        fields = {
          product_id: "STRING"
        }
        wx.request({
          url: 'http://101.132.73.7:8989/DuiMa/QuerySQL',
          data: {
            sqlStr: "select product_id from product where warehouse_id=" + warehouseId + ";",
            fieldNames: JSON.stringify(fields),
            pageCur: 1,
            pageMax: 1000
          },
          method: "POST",
          header: {
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
          },
          success(res) {
            console.log(res.data)
            var jsonobj = JSON.parse(res.data.data)
            console.log(jsonobj)
            var list = []
            var listtmp = [] // 深复制
            for (var j = 0; j < jsonobj.length; j++) {
              list.push(jsonobj[j].product_id)
              listtmp.push(jsonobj[j].product_id)
            }
            that.setData({
              products: list,
              productstmp: listtmp
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