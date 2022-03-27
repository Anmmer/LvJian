// pages/plan/plan.js
const app = getApp();
import utils from "../../utils/util"
Page({
  /**
   * 页面的初始数据
   */
  data: {
    show1: false,
    show2: false,
    start_date: '',
    end_date: '',
    currentDate1: new Date().getTime(), // 初始日期 // 时间戳补 3 位
    currentDate2: new Date().getTime(), // 初始日期 // 时间戳补 3 位
    maxDate: new Date().getTime(), // 最小时间
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
  onChange(event) {
    this.setData({
        checked: event.detail
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
    this.setNavigation();
  },


  submit(e) {
    if (e.detail.value.start_date > e.detail.value.end_date) {
      wx.showToast({
        title: '开始日期不能大于结束日期!',
        icon: 'none',
        duration: 1000
      })
      return
    }
    wx.navigateTo({
      url: '../planDetail/planDetail?planname=' + e.detail.value.planname +
        '&materialcode=' + e.detail.value.materialcode +
        '&start_date=' + e.detail.value.start_date +
        '&end_date=' + e.detail.value.end_date
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