// pages/plan/plan.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    planlist:[],
    planname:'',
    materialcode:'',
    date1: '',
    date2: '',
    pages:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载数据中',
    })
    this.lookPlan()

  },
  lookPlan(){
    var that = this
    var newPage=that.data.pages+1
        that.setData({
            pages:newPage
        })
    wx.request({
      url: 'http://101.132.73.7:8989/DuiMa/GetPlanWx',
      data: {
       // productState: 0,
        pageCur: that.data.pages,
        pageMax: 10,
        materialcode: that.data.materialcode,
        startDate: that.data.date1,
        endDate: that.data.date2,
        planname: that.data.planname,

      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        wx.hideLoading({
          success: (res) => {                   
          },
        })
        console.log('加载计划页面访问成功')
        console.log(res)
        that.setData({
          planlist: that.data.planlist.concat(res.data.data)
        })
        
        
      }

    })
  },

  submit(e){
    var that=this
    that.setData({
        planname:e.detail.value.planname,
        materialcode:e.detail.value.materialcode,
        date1:e.detail.value.startime,
        date2:e.detail.value.endTime,
        planlist:[],
        pages:0

    })
    console.log("发送请求前数据核对：",that.data.materialcode)
    console.log("发送请求前数据核对：",that.data.planname)
    console.log("发送请求前数据核对：",that.data.date1)
    console.log("发送请求前数据核对：",that.data.date2)
    this.lookPlan()
    // wx.request({
    //   url: 'http://101.132.73.7:8989/DuiMa/GetPlanWx',
    //   data: {
    //     materialcode: that.data.materialcode,
    //     startDate: that.data.date1,
    //     endDate: that.data.date2,
    //     planname: that.data.planname,
    //    // productState: 0,
    //     pageCur: that.data.pages,
    //     pageMax: 10
    //   },
    //   method: 'POST',
    //   header: {
    //     "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
    //   },
    //   success(res) {
    //     console.log('计划单搜索成功')
    //     console.log(res.data.data)
    //     that.setData({
    //       planlist: res.data.data
    //     })
    //   }
    // })
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

  }
})