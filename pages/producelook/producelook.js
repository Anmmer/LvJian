// pages/producelook/producelook.js
Page({
    /**
     * 页面的初始数据
     */
    data: {
        planname: '',
        materialcode: '',
        productstate: '',
        checked: '',
        planlist: [],
        pages: 0,
    },

    bindsubmit(e) {
        wx.navigateTo({
            url: '../producelookDetail/producelookDetail?planname=' + e.detail.value.input2 +
                '&materialcode=' + e.detail.value.input1 +
                '&productstate=' + this.data.checked
        })
    },

    onChange(event) {
        this.setData({
            checked: event.detail
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
                    startBarHeight: startBarHeight,
                    navgationHeight: navgationHeight
                })
            }
        })
    },

    fanhui: function () {
        wx.navigateBack()
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setNavigation();
        // this.lookPlan()
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