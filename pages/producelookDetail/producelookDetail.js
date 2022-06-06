Page({
  data: {
    planList: [],
    preproductList: [],
    activeNames: [],
    plannumber: '',
    pages: 0,
    pagesMax: 15,
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '数据加载中',
    })
    this.setNavigation();
    this.setData({
      planname: options.planname,
      materialcode: options.materialcode,
      productstate: options.productstate,
      line: options.line,
      preproductid: options.preproductid
    })
    this.lookPlan();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.lookPlan();
  },


  getData(id) {
    wx.showLoading({
      title: '加载数据中',
    })
    var that = this
    wx.request({
      url: 'http://101.132.73.7:8989/DuiMa/GetPreProduct',
      data: {
        plannumber: id,
        // pageCur: that.data.pages,
        // pageMax: that.data.pagesMax
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        wx.hideLoading({
          success: (res) => {},
        })
        let pop_pageDate = res.data.data;
        for (let i = 0; i < pop_pageDate.length; i++) {
          if (pop_pageDate[i]['pourmade'] === 0 && pop_pageDate[i]['inspect'] === 0) {
            pop_pageDate[i].state = '待浇捣'
            pop_pageDate[i].style = "background-color: grey;"
          }
          if (pop_pageDate[i]['pourmade'] === 1 && pop_pageDate[i]['inspect'] === 0) {
            pop_pageDate[i].state = '待质检'
            pop_pageDate[i].style = "background-color: yellow;"
          }
          if (pop_pageDate[i]['pourmade'] === 1 && pop_pageDate[i]['inspect'] === 1) {
            pop_pageDate[i].state = '质检合格'
            pop_pageDate[i].style = "background-color: green;"
          }
          if (pop_pageDate[i]['pourmade'] === 1 && pop_pageDate[i]['inspect'] === 2) {
            pop_pageDate[i].state = '质检不合格'
            pop_pageDate[i].style = "background-color: red;"
          }
          if (wx.getStorageSync('on_or_off') == '1') {
            if (pop_pageDate[i]['covert_test'] === 1 && pop_pageDate[i]['inspect'] === 0 && pop_pageDate[i]['pourmade'] === 0) {
              pop_pageDate[i].state = '待浇捣'
              pop_pageDate[i].style = "background-color: #d9d91a;"
            }
            if (pop_pageDate[i]['covert_test'] === 0) {
              pop_pageDate[i].state = '待检验'
              pop_pageDate[i].style = "background-color: grey;"
            }
            if (pop_pageDate[i]['covert_test'] === 2) {
              pop_pageDate[i].state = '检验不合格'
              pop_pageDate[i].style = "background-color: #a94442;"
            }
          }
        }
        that.setData({
          preproductList: pop_pageDate,
          activeNames: [id]
        })
      }
    })
  },
  lookPlan() {
    var that = this
    that.data.pages += 1
    wx.request({
      url: 'http://101.132.73.7:8989/DuiMa/GetPlan',
      data: {
        // productState: 0,
        pageCur: that.data.pages,
        pageMax: that.data.pagesMax,
        materialcode: that.data.materialcode,
        planname: that.data.planname,
        line: that.data.line,
        preproductid: that.data.preproductid,
        productState: that.data.productstate
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        wx.hideLoading({
          success: (res) => {},
        })
        let jsonObj = res.data.data
        if (jsonObj.length !== 0) {
          for (let i = 0; i < jsonObj.length; i++) {
            if (jsonObj[i]['pourmadestate'] === 1 && jsonObj[i]['checkstate'] === 1) {
              jsonObj[i].state = '已完成'
              jsonObj[i].style = 'background-color: green;'
            } else {
              jsonObj[i].state = '未完成'
              jsonObj[i].style = 'background-color: red;'
            }
          }
          that.setData({
            planList: that.data.planList.concat(res.data.data)
          })
        }

      }
    })
  },

  onChange(event) {
    if (event.detail.length !== 0) {
      this.getData(event.detail[0])
    } else {
      this.setData({
        activeNames: event.detail
      })
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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    this.lookPlan();
  },

})