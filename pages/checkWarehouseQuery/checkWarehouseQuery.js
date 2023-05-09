// pages/produce/produce.js
import utils from "../../utils/util"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    batch_id: '',
    user_name: '',
    startDate: '',
    endDate: '',
    pour_list: [],
    currentDate1: new Date().getTime(), // 初始日期 // 时间戳补 3 位
    currentDate2: new Date().getTime(), // 初始日期 // 时间戳补 3 位
    pourMadeNumber: 0,
    show1: false,
    show2: false,
    pageAll: 0,
    pageCur: 1,
    pageMax: 10,
    start_date: '',
    end_date: '',
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNavigation();
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
        pageCur: 1,
        batch_id: e.detail.value.batch_id,
        user_name: e.detail.value.user_name,
        startDate: e.detail.value.startDate,
        endDate: e.detail.value.endDate,
      })
    }
    let data = {
      batch_id: this.data.batch_id,
      user_name: this.data.user_name,
      startDate: this.data.startDate,
      endDate: this.data.endDate,
      type: '0',
      status: '1',
      pageCur: this.data.pageCur,
      pageMax: this.data.pageMax
    }

    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/InventoryCheck',
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

  submitInfo(e) {
    console.log(e.target.dataset.id)
    wx.navigateTo({
      url: "../leakCheck/leakCheck?check_id=" + e.target.dataset.id.check_id + '&create_time=' + e.target.dataset.id.create_time + '&path=' + e.target.dataset.id.path + '&planname=' + e.target.dataset.id.planname + '&build_type=' + e.target.dataset.id.build_type
    })
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
  jiaodao(e) {
    console.log(e)
    wx.navigateTo({
      url: "../checkWarehouse/checkWarehouse?check_id=" + e.target.dataset.id.check_id + "&create_time=" + e.target.dataset.id.create_time + "&should_check_num=" + e.target.dataset.id.should_check_num + "&real_check_num=" + e.target.dataset.id.real_check_num + "&batch_id=" + e.target.dataset.id.batch_id + "&user_name=" + e.target.dataset.id.user_name,
    })
  },
  detail() {
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