// pages/plan/plan.js
const app = getApp();
import utils from "../../utils/util"
Page({
  /**
   * 页面的初始数据
   */
  data: {
    planname: '',
    materialcode: '',
    pages: 0,
    show1: false,
    show2: false,
    currentDate1: new Date().getTime(), // 初始日期 // 时间戳补 3 位
    currentDate2: new Date().getTime(), // 初始日期 // 时间戳补 3 位
    minDate: app.globalData.minDate, // 最小时间
    // 时间 - 显示赋值
    formatter(type, value) {
      if (type === 'year') {
        return `${value} 年 `;
      } else if (type === 'month') {
        return `${value} 月 `;
      } else if (type === 'day') {
        return `${value} 日 `;
      }
      return value;
    }
  },
  // 时间 - 当值变化时触发的事件 start
  onInput1(event) {
    var newTime = new Date(event.detail);
    if (this.data.show == 0) {
      newTime = null;
    } else {
      newTime = utils.formatTime(newTime);
    }
    this.setData({
      currentDate: event.detail,
    });
  },
  // 时间 - 当值变化时触发的事件 end
  onInput2(event) {
    var etime = event.detail + (86400 - 1) * 1000;
    var newTime = new Date(etime);
    if (this.data.show2 == false) {
      newTime = null;
    } else {
      newTime = utils.formatTime(newTime);
    }
    this.setData({
      currentDate2: event.detail,
    });
  },
  // 时间 - 弹出框
  showPopup1() {
    this.setData({
      key1: 1
    });
    this.setData({
      show1: true
    });
  },
  // 时间 - 弹出框
  showPopup2() {
    this.setData({
      key2: 1
    });
    this.setData({
      show2: true
    });
  },
  // 时间 - 弹出框关闭
  onClose() {
    this.setData({
      show1: false
    });
    this.setData({
      show2: false
    });
  },
  // 时间 - 确定按钮
  confirmFn1(e) {
    var newTime = new Date(e.detail);
    newTime = utils.formatTime(newTime);
    this.setData({
      start_date: newTime
    });
    this.setData({
      show1: false
    });
  },
  // 时间 - 确定按钮
  confirmFn2(e) {
    var newTime = new Date(e.detail);
    newTime = utils.formatTime(newTime);
    this.setData({
      end_date: newTime
    });
    this.setData({
      show2: false
    });
  },
  // 时间 - 取消按钮
  cancelFn() {
    this.setData({
      show1: false
    });
    this.setData({
      show2: false
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // wx.showLoading({
    //   title: '加载数据中',
    // })
    this.setNavigation();
    // this.lookPlan()
  },
  lookPlan() {
    var that = this
    var newPage = that.data.pages + 1
    that.setData({
      pages: newPage
    })
    wx.request({
      url: 'http://localhost:8989/DuiMa/GetPlan',
      data: {
        // productState: 0,
        pageCur: that.data.pages,
        pageMax: 10,
        materialcode: that.data.materialcode,
        startDate: that.data.start_date,
        endDate: that.data.end_date,
        planname: that.data.planname,

      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        wx.hideLoading({
          success: (res) => {},
        })
        console.log('加载计划页面访问成功')
        console.log(res.data.data)
        wx.navigateTo({
          url: '../planDetail/planDetail?planList=' + JSON.stringify(res.data.data),
        })
      }
    })
  },

  submit(e) {
    var that = this
    that.setData({
      planname: e.detail.value.planname,
      materialcode: e.detail.value.materialcode,
      start_date: e.detail.value.start_date,
      end_date: e.detail.value.end_date,
      planlist: [],
      pages: 0
    })
    wx.showLoading({
      title: '数据加载中',
    })
    this.lookPlan()
  },

  product(options) {
    console.log("传入的计划id", options.currentTarget.dataset.id)
    wx.navigateTo({
      url: '../planproduct/planproduct?id=' + options.currentTarget.dataset.id,
    })

  },
  bindDateChange1: function (e) {
    console.log('picker发送选择改变，开始日期携带值为', e.detail.value)
    this.setData({
      date1: e.detail.value
    })
  },
  bindDateChange2: function (e) {
    console.log('picker发送选择改变，结束日期携带值为', e.detail.value)
    this.setData({
      date2: e.detail.value
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
    console.log('触底了')
    this.lookPlan()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

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