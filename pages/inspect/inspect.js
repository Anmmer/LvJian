// pages/produce/produce.js
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pourMadeNumber: 0,
    checkNumber: 0,
    inspect_list: [],
    mainActiveIndex: 0,
    inspect_remark: '',
    activeId: [],
    show: false,
    success_show: false,
    fail_show: false,
    color_style: "#fff", //07c160
    patch_library: '',
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
    // this.inspectData();
  },
  inspectDataPages() {
    if (this.data.pageCur < this.data.pageAll) {
      this.setData({
        pageCur: this.data.pageCur + 1
      })
      this.inspectData()
    }
  },
  inspectData(e) {
    var that = this
    if (e !== undefined) {
      this.setData({
        line: e.detail.value.line,
        pageCur: 1,
        materialname: e.detail.value.materialname,
        materialcode: e.detail.value.materialcode
      })
    }
    let data = {
      inspectState: "0",
      pourState: "1",
      isPrint: true,
      isPour: true,
      line: this.data.line,
      materialname: this.data.materialname,
      materialcode: this.data.materialcode,
      pageCur: this.data.pageCur,
      pageMax: this.data.pageMax
    }
    if (wx.getStorageSync('on_or_off') == '1') {
      data.isTest = 'true'
    }
    wx.request({
      url: 'http://localhost:8989/DuiMa/GetPreProduct',
      data: data,
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        if (e) {
          that.setData({
            checkNumber: res.data.cnt,
            pageAll: res.data.pageAll,
            inspect_list: that.data.inspect_list.concat(res.data.data),
          })
        } else {
          that.setData({
            checkNumber: res.data.cnt,
            pageAll: res.data.pageAll,
            inspect_list: res.data.data,
          })
        }

      }
    })
  },
  fanhui: function () {
    wx.navigateBack()
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
  onClickNav({
    detail = {}
  }) {
    this.setData({
      mainActiveIndex: detail.index || 0
    });
    console.log(this.data.mainActiveIndex)
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
  onSave() {
    let that = this
    if (this.data.patch_library == '') {
      wx.showToast({
        title: '请输入修补库地址!',
        icon: 'none',
        duration: 1000
      })
      return
    }
    if (this.data.activeId.length == 0) {
      wx.showToast({
        title: '请选择不合格原因!',
        icon: 'none',
        duration: 1000
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
      url: 'http://localhost:8989/DuiMa/InspectNo',
      data: {
        pids: JSON.stringify(arr),
        patch_library: this.data.patch_library,
        inspect_remark: this.data.inspect_remark,
        inspect_user: wx.getStorageSync('userName'),
        failure_reason: str
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        // 成功后
        if (res.data.flag) {
          that.inspectData()
          that.setData({
            success_show: true,
            color_style: '#fff',
            show: false,
            activeId: [],
            patch_library: ''
          })
        } else {
          that.setData({
            fail_show: true,
            show: false,
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
  onChange(event) {
    // event.detail 为当前输入的值
    this.setData({
      patch_library: event.detail
    })
  },
  onChange1(event) {
    // event.detail 为当前输入的值
    this.setData({
      inspect_remark: event.detail
    })
  },
  submitInfo(e) {
    var that = this
    if (!e.target.dataset.id)
      return
    Dialog.confirm({
      title: '质检确认！',
      confirmButtonText: '合格',
      cancelButtonText: '不合格'
    }).then(() => {
      // on confirm
      let arr = [];
      arr.push(e.target.dataset.id)
      wx.request({
        url: 'http://localhost:8989/DuiMa/Inspect',
        data: {
          pids: JSON.stringify(arr),
          inspect_user: wx.getStorageSync('userName'),
        },
        method: 'POST',
        header: {
          "content-type": 'application/x-www-form-urlencoded'
        },
        success(res) {
          // 成功后
          if (res.data.flag) {
            that.inspectData()
            that.setData({
              success_show: true,
              color_style: '#fff',
              show: false
            })
          } else {
            that.setData({
              fail_show: true,
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
      url: 'http://localhost:8989/DuiMa/GetFailContent',
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
  jiaodao() {
    wx.navigateTo({
      url: "../check/check",
    })
  },
  // check() {
  //   wx.navigateTo({
  //     url: "../check/check",
  //   })
  // },
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