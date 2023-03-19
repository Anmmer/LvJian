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
    columns: [],
    success_show: false,
    fail_show: false,
    show: false,
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
    console.log(resultstr)
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
      console.log(warehouseId)
    }
    if (materialcode) {
      // 这是一个构件标签
      if (this.data.warehouse_id == '') {
        wx.showToast({
          title: '请先扫描库房二维码!',
          icon: 'none',
          duration: 500
        })
        return
      }
      if (this.data.materialcodes.find(val => val == materialcode)) {
        wx.showToast({
          title: '扫描结果已存在!',
          icon: 'none',
          duration: 500
        })
        return
      }
      console.log("扫描到构件'" + materialcode + "'")
      // 获取构件目前生产状态
      var that = this
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMaTest/GetPreProduct',
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
                duration: 1000
              })
              return
            }
            let arr = that.data.products
            that.data.materialcodes.push(materialcode)
            arr.unshift(pop_pageDate[0])
            that.setData({
              products: arr
            })
          } else {
            // 该构件已入库，提醒
            wx.showToast({
              title: '暂无数据!',
              icon: 'none',
              duration: 1000
            })
          }
        },
        error(msg) {
          console.log(msg)
        }
      })
    } else if (warehouseId) {
      // 这是货位标签
      console.log("扫描到货位'" + warehouseId + "'")
      if (this.data.warehouse_id == "") {
        this.setData({
          warehouse_id: warehouseId
        })

        wx.request({
          url: 'https://mes.ljzggroup.com/DuiMaTest/GetFactory',
          data: {
            id: warehouseId,
            pageCur: '1',
            pageMax: '10',
            type: '3',
          },
          method: 'POST',
          header: {
            "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
          },
          success(res) {
            that.setData({
              warehouse_name: res.data.data[0].name,
              path: res.data.data[0].path
            })
          }
        })
      } else {
        wx.showToast({
          title: '您已扫描过库房号',
          icon: 'none',
          duration: 1000
        })
        return
      }
      if (fieldname.indexOf("货位号") >= 0) {
        // 这是货位标签
        var warehouseId = strs[i].substring(idx + 1)
        console.log("扫描到货位'" + warehouseId + "'")
        if (this.data.warehouse_id == "") {
          wx.request({
            url: 'https://mes.ljzggroup.com/DuiMa/GetFactory',
            data: {
              id: warehouseId,
              pageCur: '1',
              pageMax: '10',
              type: '3',
            },
            method: 'POST',
            header: {
              'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            },
            success(res) {
              that.setData({
                warehouse_name: res.data[0].name,
                warehouse_id: res.data[0].id,
              })
            }
          })
        } else {
          wx.showToast({
            title: '您已扫描过库房号',
            icon: 'none',
            duration: 1000
          })
          return
        }
      }
    }
  },
  onConfirm(event) {
    const {
      value
    } = event.detail;
    this.setData({
      in_warehouse_method: value.name,
      show: false
    })
  },
  onCancel() {
    this.setData({
      show: false
    })
  },
  showPopup() {
    this.setData({
      show: true
    })
  },
  deleteItem(event) {
    let list = this.data.products
    let materialcodes = this.data.materialcodes
    // 删除制定的构件
    list.splice(event.currentTarget.dataset.id, 1)
    materialcodes.splice(event.currentTarget.dataset.id, 1)
    this.setData({
      products: list,
      materialcodes: materialcodes
    })
  },
  deleteAll(event) {
    this.setData({
      products: []
    })
  },
  getInWarehouseMethod() {
    let that = this
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaTest/GetInOutWarehouseMethod',
      data: {
        type: '1'
      },
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        that.setData({
          columns: res.data.data.map((item) => {
            return item.name
          }),
        })
      }
    })


  },
  submitAll(event) {
    var that = this
    if (!this.data.in_warehouse_method) {
      wx.showToast({
        title: '请选择入库方式',
        icon: 'none',
        duration: 1000
      })
      return
    }

    if (this.data.warehouse_id != null && this.data.products.length != 0) {
      let arr = []
      for (let val of this.data.products) {
        arr.push(val.materialcode)
      }
      // 可以上传
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMaTest/InOutWarehouse',
        data: {
          ids: JSON.stringify(arr),
          type: "1",
          in_warehouse_id: that.data.warehouse_id,
          userName: wx.getStorageSync('userName'),
          method: that.data.in_warehouse_method
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success(res) {
          // 清空所有
          console.log(res)
          if (res.data.flag) {
            that.setData({
              success_show: true,
              products: [],
              warehouse_id: "",
              warehouse_name: ""
            })
          } else {
            Toast(res.data.msg);
          }

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
  show() {
    this.setData({
      show: true
    })
  },
  onCancel() {
    this.setData({
      show: false
    })
  },

  onConfirm(event) {
    this.setData({
      in_warehouse_method: event.detail.value,
      show: false
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
    this.getInWarehouseMethod()
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