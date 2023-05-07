// pages/produce/produce.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pourMadeNumber: 0,
    checkNumber: 0,
    pour_list: [],
    in_warehouse_method: '',
    path: '',
    columns: [],
    items: [],
    mainActiveIndex: 0,
    activeId: [],
    show: false,
    show2: false,
    success_show: false,
    fail_show: false,
    pageAll: 0,
    pageCur: 1,
    pageMax: 10
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNavigation();
    this.getWarehouse()
    this.getInWarehouseMethod()
    // this.pourData();
  },
  pourDataPages() {
    if (this.data.pageCur < this.data.pageAll) {
      this.setData({
        pageCur: this.data.pageCur + 1
      })
      this.pourData()
    }
  },
  pourData(e) {
    var that = this
    if (e) {
      this.setData({
        line: e.detail.value.line,
        pageCur: 1,
        materialname: e.detail.value.materialname,
        // materialcode: e.detail.value.materialcode,
        drawing_no: e.detail.value.drawing_no,
        planname: e.detail.value.planname,
      })
    }
    let data = {
      stockStatus: "0",
      inspectState: "1",
      line: this.data.line,
      materialname: this.data.materialname,
      drawing_no: this.data.drawing_no,
      planname: this.data.planname,
      // materialcode: this.data.materialcode,
      pageCur: this.data.pageCur,
      pageMax: this.data.pageMax
    }
    if (wx.getStorageSync('on_or_off') == '1') {
      data.isTest = 'true'
    }
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/GetPreProduct',
      data: data,
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        if (!e) {
          that.setData({
            pour_list: that.data.pour_list.concat(res.data.data),
            pourMadeNumber: res.data.cnt,
            pageAll: res.data.pageAll,
          })
        } else {
          that.setData({
            pour_list: res.data.data,
            pourMadeNumber: res.data.cnt,
            pageAll: res.data.pageAll,
          })
        }

      }
    })
  },
  fanhui: function () {
    wx.navigateBack()
  },
  show2() {
    this.setData({
      show2: true
    })
  },
  show() {
    this.setData({
      show1: true
    })
  },
  onConfirm(event) {
    const {
      value
    } = event.detail;
    this.setData({
      in_warehouse_method: value,
      show1: false,
    })
  },
  onConfirm1(event) {
    const {
      value
    } = event.detail;

    this.setData({
      path: value[2].path,
      factory_id: value[2].id,
      show2: false,
    })
  },
  getWarehouse() {
    let that = this;
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/GetFactory',
      data: null,
      method: 'POST',
      header: {
        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        that.setData({
          items: [{
              key: '1',
              values: res.data.data,
            },
            {
              key: '2',
              values: res.data.data[0].children,
            },
            {
              key: '3',
              values: res.data.data[0].children.length ? res.data.data[0].children[0].children : [],
            }
          ]
        })
      }
    })
  },
  change(e) {

    let factory = e.detail.picker
    let i = e.detail.index
    if (i < 2) {
      factory.setColumnValues(i + 1, e.detail.value[i] ? e.detail.value[i].children : [])
      if (i === 0 && e.detail.value[i] && e.detail.value[i].children.length) {
        factory.setColumnValues(i + 2, e.detail.value[i].children[0] ? e.detail.value[i].children[0].children : [])
      }
    }
  },
  onCancel() {
    this.setData({
      show1: false,
      show2: false
    })
  },
  getInWarehouseMethod() {
    let that = this
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/GetInOutWarehouseMethod',
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
  submitInfo(e) {
    var that = this
    if (!this.data.factory_id) {
      wx.showToast({
        title: '请选择货位信息',
        icon: 'none',
        duration: 1000
      })
      return
    }
    if (!this.data.in_warehouse_method) {
      wx.showToast({
        title: '请选择入库方式',
        icon: 'none',
        duration: 1000
      })
      return
    }

    if (e.target.dataset.id) {
      let arr = [];
      arr.push(e.target.dataset.id)
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMaNew/InOutWarehouse',
        data: {
          ids: JSON.stringify(arr),
          type: "1",
          in_warehouse_id: that.data.factory_id,
          userName: wx.getStorageSync('userName'),
          method: that.data.in_warehouse_method
        },
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success(res) {
          // 成功后
          if (res.data.flag) {

            that.setData({
              success_show: true,
              color_style: '#fff',
              state: '',
              pid: "",
              plannumber: "",
              materialcode: '',
              pour_list: [],
              pageCur: 1
            })
            that.pourData()
          } else {
            that.setData({
              fail_show: true
            })
          }

        }
      })
    }
  },
  onClickNav({
    detail = {}
  }) {
    this.setData({
      mainActiveIndex: detail.index || 0
    });
  },

  onClickItem({
    detail = {}
  }) {
    const {
      activeId
    } = this.data;

    const index = activeId.indexOf(detail.id);
    if (index > -1) {
      activeId.splice(index, 1);
    } else {
      activeId.push(detail.id);
    }

    this.setData({
      activeId
    });
  },
  onClose() {
    this.setData({
      show: false,
      activeId: [],
      patch_library: ''
    })
  },
  onChange1(event) {
    // event.detail 为当前输入的值
    this.setData({
      covert_test_remark: event.detail
    })
  },
  setNavigation() {
    let startBarHeight = 20
    let navgationHeight = 44
    let that = this
    wx.getSystemInfo({
      success: function (res) {

        if (res.model == 'iPhone X') {
          startBarHeight = 44
        }
        that.setData({
          startBarHeight: res.statusBarHeight,
          navgationHeight: navgationHeight
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  jiaodao() {
    wx.navigateTo({
      url: "../inbound/inbound",
    })
  },
  check() {
    console.log("出库")
    wx.navigateTo({
      url: "../inbound/inbound",
    })
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})