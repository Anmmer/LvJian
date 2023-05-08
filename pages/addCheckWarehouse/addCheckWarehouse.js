// pages/produce/produce.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pourMadeNumber: 0,
    checkNumber: 0,
    materialname: '',
    materialcode: '',
    factory_id: '',
    planname: '',
    items: [],
    result: [],
    show2: false,
    building_no: '',
    floor_no: '',
    drawing_no: '',
    columns: [],
    pour_list: [],
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
    this.getWarehouse()
    this.setNavigation();
    // this.pourData();
  },
  getOutWarehouseMethod() {
    let that = this
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/GetInOutWarehouseMethod',
      data: {
        type: '2'
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

  pourDataPages() {
    if (this.data.pageCur < this.data.pageAll) {
      this.setData({
        pageCur: this.data.pageCur + 1
      })
      this.pourData()
    }
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
  onChange(event) {
    console.log(event)
    this.setData({
      result: event.detail
    });
  },
  toggle(event) {
    const {
      index
    } = event.currentTarget.dataset;
    const checkbox = this.selectComponent(`.checkboxes-${index}`);
    checkbox.toggle();
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
      show2: false
    })
  },
  onConfirm1(event) {
    const {
      value
    } = event.detail;
    console.log(event)
    this.setData({
      path: value[2].path,
      factory_id: value[2].id,
      show2: false,
    })
  },
  show2() {
    this.setData({
      show2: true
    })
  },
  pourData(e) {
    var that = this
    if (e) {
      this.setData({
        // line: e.detail.value.line,
        pageCur: 1,
        materialname: e.detail.value.materialname,
        // materialcode: e.detail.value.materialcode,
        drawing_no: e.detail.value.drawing_no,
        planname: e.detail.value.planname,
        building_no: e.detail.value.building_no,
        floor_no: e.detail.value.floor_no
      })
    }
    let data = {
      // line: this.data.line,
      materialname: this.data.materialname,
      preproductid: this.data.drawing_no,
      planname: this.data.planname,
      // isOrder: true,
      // materialcode: this.data.materialcode,
      factoryName: this.data.factory_id,
      building_no: this.data.building_no,
      floor_no: this.data.floor_no,
      pageCur: this.data.pageCur,
      pageMax: this.data.pageMax
    }

    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/GetWarehouseInfo',
      data: data,
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        if (!e) {
          that.setData({
            pour_list: that.data.pour_list.concat(res.data.warehouseInfo),
            pourMadeNumber: res.data.cnt,
            pageAll: res.data.pageAll,
          })
        } else {
          that.setData({
            pour_list: res.data.warehouseInfo,
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
  show() {
    this.setData({
      show1: true
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
    //获取页面栈
    let pages = getCurrentPages();
    //检查页面栈
    //判断页面栈中页面的数量是否有跳转(可以省去判断)
    if (pages.length > 1) {
      //获取上一个页面实例对象
      let prePage = pages[pages.length - 2];
      //调用上一个页面实例对象的方法
      if (!this.data.result.length) {
        wx.showToast({
          title: '请选择构件',
          icon: 'none',
          duration: 1000
        })
        return
      }

      let materialcode = ''
      if (prePage.data.products.find(v => {
          materialcode = this.data.result.find(e => {
            return v.materialcode === e
          })
          return materialcode
        })) {

        wx.showToast({
          title: "物料编码为" + materialcode + '的构件已存在',
          icon: 'none',
          duration: 1000
        })
        return
      }
      let that = this
      console.log(that.data.pour_list)
      this.data.result.forEach(e => {

        let index = that.data.pour_list.find(v => {
          return v.materialcode === e
        })
        if (index) {
          prePage.data.products.unshift(index)
        }
      });
      console.log(prePage.data.products)
      prePage.setData({
        products: prePage.data.products
      })
      //返回上一个页面
      wx.navigateBack();
    }
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
      url: "../moveWarehouse/moveWarehouse",
    })
  },
  check() {
    console.log("出库")
    wx.navigateTo({
      url: "../check/check",
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