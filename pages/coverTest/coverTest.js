// pages/produce/produce.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    testMadeNumber: 0,
    checkNumber: 0,
    test_list: [],
    items: [],
    mainActiveIndex: 0,
    activeId: [],
    show: false,
    patch_library: '',
    success_show: false,
    fail_show: false,
    color_style: "#fff", //07c160
    pageAll: 0,
    pageCur: 1,
    pageMax: 10
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getFailContent()
    this.setNavigation();
    // this.testData();
  },
  testDataPages() {
    if (this.data.pageCur < this.data.pageAll) {
      this.setData({
        pageCur: this.data.pageCur + 1
      })
      this.testData()
    }
  },
  testData(e) {
    var that = this
    if (e) {
      this.setData({
        line: e.detail.value.line,
        materialname: e.detail.value.materialname,
        materialcode: e.detail.value.materialcode,
        drawing_no: e.detail.value.drawing_no,
        pageCur: 1
      })
    }
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/GetPreProduct',
      data: {
        isPrint: "true",
        testState: "0",
        line: this.data.line,
        materialname: this.data.materialname,
        materialcode: this.data.materialcode,
        drawing_no: this.data.drawing_no,
        pageCur: this.data.pageCur,
        pageMax: this.data.pageMax
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {

        if (!e) {
          that.setData({
            test_list: that.data.test_list.concat(res.data.data),
            testMadeNumber: res.data.cnt,
            pageAll: res.data.pageAll,
          })
        } else {
          that.setData({
            test_list: res.data.data,
            testMadeNumber: res.data.cnt,
            pageAll: res.data.pageAll,
          })
        }
      }
    })
  },
  fanhui: function () {
    wx.navigateBack()
  },
  onSave() {
    let that = this
    if (this.data.activeId.length == 0) {
      wx.showToast({
        title: '请选择不合格原因!',
        icon: 'none',
        duration: 500
      })
      return
    }
    let arr = [];
    let str = '';
    arr.push(this.data.id)
    for (let id of this.data.activeId) {
      for (let o of this.data.items) {
        for (let o_child of o.children) {
          if (o_child.id == id) {
            str += o_child.text + "，"
            break
          }
        }
      }
    }
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/ConcealedProcess',
      data: {
        index: '0',
        covert_test_failure_reason: str,
        covert_test_remark: this.data.covert_test_remark,
        covert_test_user: wx.getStorageSync('userName'),
        pids: JSON.stringify(arr)
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        // 成功后
        if (res.data.flag) {
          that.testData()
          that.setData({
            success_show: true,
            color_style: '#fff',
            show: false,
            covert_test_remark: '',
            activeId: []
          })
        } else {
          that.setData({
            fail_show: true,
            show: false
          })
        }
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

    if (!e.target.dataset.id)
      return
    Dialog.confirm({
      title: '检验确认！',
      confirmButtonText: '合格',
      cancelButtonText: '不合格'
    }).then(() => {
      // on confirm
      let arr = [];
      arr.push(e.target.dataset.id)
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMaNew/ConcealedProcess',
        data: {
          index: '1',
          covert_test: '1',
          covert_test_user: wx.getStorageSync('userName'),
          pids: JSON.stringify(arr),
        },
        method: 'POST',
        header: {
          "content-type": 'application/x-www-form-urlencoded'
        },
        success(res) {
          // 成功后
          if (res.data.flag) {
            that.testData()
            that.setData({
              success_show: true,
              color_style: '#fff',
              state: '',
              pid: "",
              plannumber: "",
              materialcode: '',
              materialname: ''
            })
          } else {
            that.setData({
              fail_show: true
            })

          }
        }
      })
    }).catch(() => {
      // on cancel
      this.setData({
        show: true,
        id: e.target.dataset.id
      })
    });

  },
  getFailContent() {
    let that = this;
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/GetFailContent',
      data: null,
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded'
      },
      success(res) {
        that.setData({
          items: res.data.data
        })
      }
    })
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
  test() {
    wx.navigateTo({
      url: "../test/test",
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
    this.testData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})