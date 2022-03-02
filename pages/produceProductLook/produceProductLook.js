// pages/produceProductLook/produceProductLook.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        planid:'',
        pages:0,
        pagesMax:10,
        productlist:[]


    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log("接受的计划id参数", options)
        var that = this
        that.setData({
            planid: options.id
        })
        this.getData()
    },
    getData(){
        wx.showLoading({
            title: '加载数据中',
          })
        var that=this
        var newPage=that.data.pages+1
        that.setData({
            pages:newPage
        })
        wx.request({
            url: 'http://101.132.73.7:8989/DuiMa/GetPreProductWx',
            data: {
                plannumber: that.data.planid,
                pageCur: that.data.pages,
                pageMax: that.data.pagesMax
            },
            method: 'POST',
            header: {
                "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
            },
            success(res){
                wx.hideLoading({
                    success: (res) => {                   
                    },
                  })
                console.log('查询构件列表成功')
                console.log('分离的数据',res.data.data)
                that.setData({
                    productlist:that.data.productlist.concat(res.data.data)
                })
                if(res.data.data.length<10){                 
                      wx.showToast({
                        title: '加载完毕',
                      })
                }

                
            }, 
                     
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
        this.getData()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})