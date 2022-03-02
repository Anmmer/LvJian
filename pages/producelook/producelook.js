// pages/producelook/producelook.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        planname: '',
        materialcode: '',
        productstate: '',
        planlist: [],
        pages: 0,
    },

    bindsubmit(e) {
        var that = this
        that.setData({
            materialcode: e.detail.value.input1,
            planname: e.detail.value.input2,
            productstate: e.detail.value.radio1,
            planlist: [],
            pages: 0
        })
        this.lookPlan()



    },
    lookPlan() {
        wx.showLoading({
            title: '加载数据中',
        })
        var that = this
        var newPage = that.data.pages + 1
        that.setData({
            pages: newPage
        })
        console.log(that.data.materialcode)
        console.log(that.data.planname)
        console.log(that.data.productstate)
        wx.request({
            url: 'http://101.132.73.7:8989/DuiMa/GetPlanWx2',
            data: {
                pageCur: that.data.pages,
                pageMax: 10,
                planname: that.data.planname,
                materialcode: that.data.materialcode,
                productstate: that.data.productstate
            },
            method: 'POST',
            header: {
                "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
            },
            success(res) {
                wx.hideLoading({
                    success: (res) => {},
                })
                console.log('查询生产流程计划单成功')
                console.log(res)
                console.log(res.data.data)
                that.setData({
                    planlist: that.data.planlist.concat(res.data.data)
                })
                if (res.data.data < 10) {
                    wx.showToast({
                        title: '加载完毕',
                    })
                }
            }
        })
    },
    product(options) {
        console.log("传入的计划id", options.currentTarget.dataset.id)
        wx.navigateTo({
            url: '../produceProductLook/produceProductLook?id=' + options.currentTarget.dataset.id,
        })

    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.lookPlan()
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
        this.lookPlan()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})