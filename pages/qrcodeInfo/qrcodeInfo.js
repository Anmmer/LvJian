// qrcodeInfo.js
const app = getApp()
Page({
  data: {
    result: '',
    dataArray: null,
    storageInfo: null,
    materialcode: '',
    qrstyle: {},
    state: 0,
    fieldmap: {}
  },
  // 扫码函数
  scanCode(e) {
    if (this.data.state == 1) {
      return
    }
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取物料编码
    var resultstr = e.detail.result.toString()
    var materialcode = resultstr.match(/code=(\d+)&id=(\d+)/)[1]
    var id = resultstr.match(/code=(\d+)&id=(\d+)/)[2]
    // for循环从strs中找到物料编码
    console.log(id)
    // var materialcode = null
    // for (var i = 0; i < strs.length; i++) {
    //   var idx = strs[i].indexOf(":")
    //   var fieldname = strs[i].substring(0, idx)
    //   if (fieldname.indexOf("物料编码") >= 0) {
    //     materialcode = strs[i].substring(idx + 1)
    //   }
    // }
    if (materialcode != undefined && id != undefined) {
      this.getStyle(id)
      this.setData({
        materialcode: materialcode
      })
      // 请求获取数据
    } else {
      wx.showToast({
        title: '请扫描拥有构件号信息的二维码!',
        icon: 'none',
        duration: 1000
      })
    }
  },
  // 获取样式
  getStyle(qrcodeid) {
    let fieldNames = {
      qrcode_content: "STRING"
    }
    let that = this
    this.setData({
      state: 1
    })
    let pro = new Promise((resolve, reject) => {
      wx.request({
        url: "http://101.132.73.7:8989/DuiMa/QuerySQL",
        method: 'post',
        header: {
          "content-type": 'application/x-www-form-urlencoded'
        },
        data: {
          sqlStr: "select qrcode_content from qrcode where qrcode_id=" + qrcodeid + ";",
          fieldNames: JSON.stringify(fieldNames),
          pageCur: 1,
          pageMax: 1000
        },
        success(res) {
          let datatmp = res.data.data0[0]

          if (datatmp.qrcode_content == undefined) {
            return
          }

          that.setData({
            qrstyle: JSON.parse(datatmp.qrcode_content)
          })
          resolve()
        },
        error(message) {
          that.setData({
            state: 0
          })
        }
      })
    })
    pro.then(() => {
      this.getFieldMap();
    })

  },
  // 获取字段映射
  getFieldMap() {
    let fieldNames = {
      pi_key: "STRING",
      pi_value: "STRING"
    }
    let that = this
    let pro = new Promise((resolve, reject) => {
      wx.request({
        url: "http://101.132.73.7:8989/DuiMa/QuerySQL",
        method: 'post',
        header: {
          "content-type": 'application/x-www-form-urlencoded'
        },
        data: {
          sqlStr: "select pi_key,pi_value from project_item;",
          fieldNames: JSON.stringify(fieldNames),
          pageCur: 1,
          pageMax: 1000
        },
        success(res) {
          let jsonobj = res.data.data0
          let fieldmap = {}
          for (let i = 0; i < jsonobj.length; i++) {
            fieldmap[jsonobj[i].pi_key] = jsonobj[i].pi_value
          }
          that.setData({
            fieldmap: fieldmap
          })
          resolve()
        },
        error(message) {
          that.setData({
            state: 0
          })
        }
      })
    })
    pro.then(() => {
      this.getData();
    })
  },
  getData() {
    let that = this
    wx.request({
      url: 'http://101.132.73.7:8989/DuiMa/GetPreProduct',
      data: {
        materialcode: this.data.materialcode
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded'
      },
      success(res) {
        //设置构件生产情况
        if (res.data.data.length != 0) {
          // 生产状态
          let pop_pageDate = res.data.data
          if (wx.getStorageSync('on_or_off') == '1') {
            pop_pageDate[0].style1 = 'display:none'
            pop_pageDate[0].style2 = 'display:none'
            if (pop_pageDate[0]['covert_test'] == 0) {
              pop_pageDate[0].state = '已打印'
            }
            if (pop_pageDate[0]['covert_test'] == 1) {
              pop_pageDate[0].state = '隐蔽性检验通过'
            }
            if (pop_pageDate[0]['covert_test'] == 2) {
              pop_pageDate[0].style1 = 'display:block'
              pop_pageDate[0].state = '隐蔽性未通过'
            }
            if (pop_pageDate[0]['pourmade'] == 1) {
              pop_pageDate[0].state = '已浇捣'
            }
            if (pop_pageDate[0]['inspect'] == 1) {
              pop_pageDate[0].state = '质检合格'
            }
            if (pop_pageDate[0]['inspect'] == 2) {
              pop_pageDate[0].style2 = 'display:block'
              pop_pageDate[0].state = '质检不合格'
            }
          } else {
            if (pop_pageDate[0]['pourmade'] === 0 && pop_pageDate[0]['inspect'] === 0) {
              pop_pageDate[0].state = '待浇捣'
            }
            if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
              pop_pageDate[0].state = '浇捣完成'
              that.data.disabled = 'disabled'
            }
            if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
              pop_pageDate[0].state = '待质检'
            }
            if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 1) {
              pop_pageDate[0].state = '质检完成'
            }
          }

          that.setData({
            dataArray: pop_pageDate
          })

          if (typeof (res.data.warehouse_name) != "undefined") {
            that.setData({
              storageInfo: "构件存储于仓储组织'" + res.data.factory_name + "'下的货位'" + res.data.warehouse_name + "'!"
            })
          } else {
            that.setData({
              storageInfo: "构件目前不在仓库中!"
            })
          }
          //that.setData({dataArray:res.data})
        }

        //设置构件信息
        let obj = res.data.data[0];
        let tmp = that.data.qrstyle.qRCode.qRCodeContent
        let str_body = ''
        let fieldmap = that.data.fieldmap
        for (let j = 0; j < tmp.length; j++) {
          str_body += fieldmap[tmp[j]] + ':' + obj[tmp[j]] + "\n"
        }
        that.setData({
          result: str_body,
          state: 0
        })
      },
      error(message) {
        that.setData({
          state: 0
        })
      }
    })
  },
  onLoad() {
    this.setNavigation();
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
})