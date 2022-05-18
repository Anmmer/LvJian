// check.js
const app = getApp()
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  data: {
    result: '',
    items: [],
    mainActiveIndex: 0,
    activeId: [],
    show: false,
    patch_library: '',
    plannumber: '',
    materialcode: '',
    pid: '',
    state: '',
  },
  // 扫码函数
  scanCode(e) {
    this.setData({
      result: e.detail.result
    })
    var that = this
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取构件号
    var resultstr = e.detail.result.toString()
    var strs = resultstr.split("\n")
    // for循环从strs中找到构件号
    var materialcode = null
    for (var i = 0; i < strs.length; i++) {
      var idx = strs[i].indexOf(":")
      var fieldname = strs[i].substring(0, idx)
      if (fieldname.indexOf("物料编码") >= 0) {
        materialcode = strs[i].substring(idx + 1)
      }
    }
    that.setData({
      materialcode: materialcode
    })
    if (materialcode != null) {
      // 获取构件目前生产状态
      var that = this
      wx.request({
        url: 'http://101.132.73.7:8989/DuiMa/GetPreProduct',
        data: {
          materialcode: materialcode,
        },
        method: 'POST',
        header: {
          "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
        },
        success(res) {
          if (res.data.data.length != 0) {
            // 生产状态
            let pop_pageDate = res.data.data
            if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
              pop_pageDate[0].state = '待质检'
            }
            if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 1) {
              pop_pageDate[0].state = '质检完成'
            }
            Toast('扫码成功！');
            that.setData({
              state: pop_pageDate[0].state,
              plannumber: pop_pageDate[0].plannumber,
              materialname: pop_pageDate[0].materialname,
              pid: pop_pageDate[0].pid
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '请扫描有物料编码的二维码!',
        icon: 'none',
        duration: 1000
      })
    }
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
    console.log(this.data.activeId)
  },
  inspectNo() {

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
    arr.push(this.data.pid)
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
      url: 'http://101.132.73.7:8989/DuiMa/InspectNo',
      data: {
        pids: JSON.stringify(arr),
        patch_library: this.data.patch_library,
        failure_reason: str
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
      },
      success(res) {
        // 成功后
        Toast.success('质检成功！');
        that.setData({
          state: '',
          pid: "",
          plannumber: "",
          materialcode: '',
          show: false,
          activeId: [],
          patch_library: ''
        })
      }
    })
  },
  onChange(event) {
    // event.detail 为当前输入的值
    this.setData({
      patch_library: event.detail
    })
  },
  submitInfo(e) {
    var that = this
    if (this.data.state !== '待质检') {
      wx.showToast({
        title: '未处于质检状态!',
        icon: 'none',
        duration: 1000
      })
      return
    }
    if (this.data.pid != null) {
      Dialog.confirm({
        title: '质检确认！',
        confirmButtonText: '合格',
        cancelButtonText: '不合格'
      }).then(() => {
        // on confirm
        let arr = [];
        arr.push(this.data.pid)
        wx.request({
          url: 'http://101.132.73.7:8989/DuiMa/Inspect',
          data: {
            pids: JSON.stringify(arr),
          },
          method: 'POST',
          header: {
            "content-type": 'application/x-www-form-urlencoded'
          },
          success(res) {
            // 成功后
            Toast.success('质检成功！');
            that.setData({
              state: '',
              pid: "",
              plannumber: "",
              materialcode: '',
              materialname: ''
            })
          }
        })
      }).catch(() => {
        // on cancel
        this.setData({
          show: true
        })
      });

    } else {
      // 没有materialcode
      wx.showToast({
        title: '请先扫描一个未完工构件的二维码!',
        icon: 'none',
        duration: 1000
      })
    }
  },
  getFailContent() {
    let that = this;
    wx.request({
      url: 'http://101.132.73.7:8989/DuiMa/GetFailContent',
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setNavigation();
    this.getFailContent();
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
          startBarHeight: startBarHeight,
          navgationHeight: navgationHeight
        })
      }
    })
  },
})