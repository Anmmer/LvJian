// inbound.js
const app = getApp()
import Toast from '@vant/weapp/toast/toast';
Page({
  data: {
    result: '',
    warehouse_id: "",
    warehouse_name: "",
    materialcodes: [],
    products: [],
    ready: true
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
    var materialcode = resultstr.match(/code=(\d+)&id=(\d+)/)[1]
    // for循环从strs中找到构件号或者货位号
    for (var i = 0; i < strs.length; i++) {
      var idx = strs[i].indexOf(":")
      var fieldname = strs[i].substring(0, idx)
      if (!materialcode) {
        if (this.data.warehouse_id == '') {
          wx.showToast({
            title: '请先扫描库房二维码!',
            icon: 'none',
            duration: 1500
          })
          return
        }
        // 这是一个构件标签
        if (this.data.materialcodes.find(val => val == materialcode) !== undefined) {
          wx.showToast({
            title: '扫描结果已存在!',
            icon: 'none',
            duration: 1500
          })
          return
        }
        this.data.materialcodes.push(materialcode)
        console.log("扫描到构件'" + materialcode + "'")
        // 获取构件目前生产状态
        var that = this
        wx.request({
          url: 'http://101.132.73.7:8989/DuiMa/GetPreProduct',
          data: {
            materialcode: materialcode,
            pourState: '1',
            inspectState: '1',
            isPrint: 'true'
          },
          method: 'POST',
          header: {
            "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
          },
          success(res) {
            if (res.data.data.length != 0) {
              // 生产状态
              let pop_pageDate = res.data.data
              if (pop_pageDate[0]['pourmade'] === 0 && pop_pageDate[0]['inspect'] === 0) {
                pop_pageDate[0].state = '待浇捣'
              }
              if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
                pop_pageDate[0].state = '待质检'
              }
              if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 1) {
                pop_pageDate[0].state = '质检合格'
              }
              if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 2) {
                pop_pageDate[0].state = '质检不合格'
              }
              if (pop_pageDate[0].state != '质检合格') {
                wx.showToast({
                  title: '不符合入库条件，无法入库!',
                  icon: 'none',
                  duration: 1500
                })
                return
              }
              let arr = that.data.products
              arr.push(pop_pageDate[0])
              that.setData({
                products: arr
              })
            } else {
              // 该构件已入库，提醒
              wx.showToast({
                title: '不符合入库条件，无法入库!',
                icon: 'none',
                duration: 1000
              })
            }
          },
          error(msg) {
            console.log(msg)
          }
        })
      }

      if (fieldname.trim().indexOf("货位号") >= 0) {
        // 这是货位标签
        var warehouseId = strs[i].substring(idx + 1)
        console.log("扫描到货位'" + warehouseId + "'")
        if (this.data.warehouse_id == "") {
          this.setData({
            warehouse_id: warehouseId
          })
        } else {
          wx.showToast({
            title: '您已扫描过库房号',
            icon: 'none',
            duration: 1000
          })
          return
        }
      } else if (fieldname.trim().indexOf("货位名") >= 0) {
        // 显示货位名
        var warehouseName = strs[i].substring(idx + 1)
        console.log("扫描到货位'" + warehouseName + "'")
        if (this.data.warehouse_name == "") {
          this.setData({
            warehouse_name: warehouseName,
            ready: true
          })
        }
      }
    }
  },
  deleteItem(event) {
    var list = this.data.products
    // 删除制定的构件
    list.splice(event.currentTarget.dataset.id, 1)
    this.setData({
      products: list
    })
  },
  deleteAll(event) {
    this.setData({
      products: []
    })
  },
  submitAll(event) {
    var that = this
    // 提交并清空
    if (this.data.warehouse_id != null && this.data.products.length != 0) {
      let arr = []
      for (let val of this.data.products) {
        arr.push(val.materialcode)
      }
      // 可以上传
      wx.request({
        url: 'http://101.132.73.7:8989/DuiMa/InOutWarehouse',
        data: {
          warehouseId: this.data.warehouse_id,
          productIds: JSON.stringify(arr),
          type: "1",
          userId: wx.getStorageSync('userId'),
          userName: wx.getStorageSync('userName')
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success(res) {
          // 清空所有
          if (res.data.msg !== '') {
            Dialog.confirm({
              title: '入库提示',
              message: res.data.msg
            }).then(() => {
              // on confirm
            }).catch(() => {
              // on cancel
            });
          }
          Toast('入库成功！');
          that.setData({
            products: [],
            warehouse_id: "",
            warehouse_name: ""
          })
        }
      })
    } else {
      wx.showToast({
        title: '你还未扫描库房或者未扫描构件',
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