// check.js
const app = getApp()
import Toast from '@vant/weapp/toast/toast';
import Dialog from '@vant/weapp/dialog/dialog';

Page({
  data: {
    result: '',
    items: [],
    mainActiveIndex: 0,
    inspect_remark: '',
    activeId: [],
    show: false,
    success_show: false,
    fail_show: false,
    color_style: "#fff", //07c160
    patch_library: '',
    plannumber: '',
    materialcode: '',
    pid: '',
    state: '',
  },
  // 扫码函数
  scanCode(e) {
    var that = this
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取构件号
    var resultstr = e.detail.result.toString()
    var materialcode = resultstr.match(/code='(\d+)'&id=(\d+)/)
    if (!materialcode) {
      materialcode = resultstr.match(/code=(\d+)&id=(\d+)/)
    }
    if (materialcode) {
      materialcode = materialcode[1]
    } else {
      var strs = resultstr.split("\n")
      // for循环从strs中找到构件号
      for (var i = 0; i < strs.length; i++) {
        var idx = strs[i].indexOf(":")
        var fieldname = strs[i].substring(0, idx)
        if (fieldname.indexOf("物料编码") >= 0) {
          materialcode = strs[i].substring(idx + 1)
        }
      }
    }
    that.setData({
      materialcode: materialcode
    })
    if (materialcode != null) {
      // 获取构件目前生产状态
      var that = this
      wx.request({
        url: 'https://mes.ljzggroup.com/DuiMaNew/GetPreProduct',
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
            if (wx.getStorageSync('on_or_off') == '1') {
              if (pop_pageDate[0]['covert_test'] === 1 && pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
                pop_pageDate[0].state = '待质检'
              } else if (pop_pageDate[0]['covert_test'] === 1 && pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 1) {
                pop_pageDate[0].state = '质检合格'
              } else if (pop_pageDate[0]['covert_test'] === 1 && pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 2) {
                pop_pageDate[0].state = '质检不合格'
              } else {
                pop_pageDate[0].state = '未处于质检状态'
              }
            } else {
              if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
                pop_pageDate[0].state = '待质检'
              } else if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 1) {
                pop_pageDate[0].state = '质检合格'
              } else if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 2) {
                pop_pageDate[0].state = '质检不合格'
              } else {
                pop_pageDate[0].state = '未处于质检状态'
              }
            }
            that.setData({
              color_style: '#07c160'
            })
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
    if (this.data.state !== '待质检') {
      wx.showToast({
        title: '未处于待质检状态!',
        icon: 'none',
        duration: 1000
      })
      return
    }
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
    arr.push(this.data.materialcode)
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
      url: 'https://mes.ljzggroup.com/DuiMaNew/InspectNo',
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
          that.setData({
            success_show: true,
            color_style: '#fff',
            state: '',
            pid: "",
            plannumber: "",
            materialcode: '',
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
    if (this.data.state !== '待质检') {
      wx.showToast({
        title: '未处于待质检状态!',
        icon: 'none',
        duration: 1000
      })
      return
    }
    if (!this.data.materialcode) {
      // 没有materialcode
      wx.showToast({
        title: '请先扫描一个未完工构件的二维码!',
        icon: 'none',
        duration: 1000
      })
      return
    }
    if (this.data.state == '待质检') {
      Dialog.confirm({
        title: '质检确认！',
        confirmButtonText: '合格',
        cancelButtonText: '不合格'
      }).then(() => {
        // on confirm
        let arr = [];
        arr.push(this.data.materialcode)
        wx.request({
          url: 'https://mes.ljzggroup.com/DuiMaNew/Inspect',
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
                fail_show: true,
              })
            }

          }
        })
      }).catch(() => {
        // on cancel
        this.setData({
          show: true
        })
      });
    } else {
      wx.showToast({
        title: '未处于质检状态!',
        icon: 'none',
        duration: 1000
      })
    }
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
          startBarHeight: res.statusBarHeight,
          navgationHeight: navgationHeight
        })
      }
    })
  },
})