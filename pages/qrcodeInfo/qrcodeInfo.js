// qrcodeInfo.js
const app = getApp()
Page({
  data: {
    result: '',
    dataArray: null,
    warehouseInfo: {},
    id: null,
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
    var materialcode = resultstr.match(/code='(\d+)'&id=(\d+)/)
    var id = null;
    if (!materialcode) {
      materialcode = resultstr.match(/code=(\d+)&id=(\d+)/)
    }
    if (materialcode) {
      id = materialcode[2]
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
    console.log(materialcode)
    console.log(id)

    // for循环从strs中找到物料编码
    // var materialcode = null
    // for (var i = 0; i < strs.length; i++) {
    //   var idx = strs[i].indexOf(":")
    //   var fieldname = strs[i].substring(0, idx)
    //   if (fieldname.indexOf("物料编码") >= 0) {
    //     materialcode = strs[i].substring(idx + 1)
    //   }
    // }
    if (materialcode && id) {
      if (this.data.id !== id) {
        this.getStyle(id)
      }
      this.setData({
        materialcode: materialcode,
        id: id
      })
      // 请求获取数据
    }
    if (materialcode) {
      this.setData({
        materialcode: materialcode
      })
      this.getData_1()
      this.getWarehouseInfo()
    } else {
      wx.showToast({
        title: '识别二维码失败!',
        icon: 'none',
        duration: 1000
      })
    }
  },
  // 获取样式
  getStyle(qrcodeid) {
    let fieldNames = {
      qrcode_content: "STRING",
      qrcode_name: "STRING"
    }
    let that = this
    this.setData({
      state: 1
    })
    let pro = new Promise((resolve, reject) => {
      wx.request({
        url: "https://mes.ljzggroup.com/DuiMaNew/QuerySQL",
        method: 'post',
        header: {
          "content-type": 'application/x-www-form-urlencoded'
        },
        data: {
          sqlStr: "select qrcode_content,qrcode_name from qrcode where qrcode_id=" + qrcodeid + ";",
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
            qrstyle: JSON.parse(datatmp.qrcode_content),
            qrcode_name: datatmp.qrcode_name
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
  getWarehouseInfo() {
    let that = this
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/GetWarehouseInfo',
      data: {
        materialcode: this.data.materialcode
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded'
      },
      success(res) {
        if (res.data.warehouseInfo) {
          let warehouseInfo = res.data.warehouseInfo
          that.setData({
            warehouseInfo: warehouseInfo
          })
        } else {
          that.setData({
            warehouseInfo: {}
          })
        }
      }
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
        url: "https://mes.ljzggroup.com/DuiMaNew/QuerySQL",
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
    if (this.data.pop_pageDate[0].materialcode === this.data.materialcode)
      return
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/GetPreProduct',
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
          // if (wx.getStorageSync('on_or_off') == '1') {
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
            pop_pageDate[0].pourmade = '已浇捣'
          }
          if (pop_pageDate[0]['pourmade'] == 0) {
            pop_pageDate[0].pourmade = '未浇捣'
          }
          if (pop_pageDate[0]['inspect'] == 0) {
            pop_pageDate[0].inspect = '待质检'
          }
          if (pop_pageDate[0]['inspect'] == 1) {
            pop_pageDate[0].inspect = '质检合格'
          }
          if (pop_pageDate[0]['inspect'] == 2) {
            // pop_pageDate[0].style2 = 'display:block'
            pop_pageDate[0].inspect = '质检不合格'
          }
          // } else {
          //   if (pop_pageDate[0]['pourmade'] === 0 && pop_pageDate[0]['inspect'] === 0) {
          //     pop_pageDate[0].state = '待浇捣'
          //   }
          //   if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
          //     pop_pageDate[0].state = '浇捣完成'
          //     that.data.disabled = 'disabled'
          //   }
          //   if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 0) {
          //     pop_pageDate[0].state = '待质检'
          //   }
          //   if (pop_pageDate[0]['pourmade'] === 1 && pop_pageDate[0]['inspect'] === 1) {
          //     pop_pageDate[0].state = '质检完成'
          //   }
          // }

          that.setData({
            obj: pop_pageDate
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
        let fieldmap = that.data.fieldmap
        if (that.data.qrcode_name == '打印模板（上海）') {
          that.getOtherData(obj)
        } else {
          let str_body = ''
          for (let j = 0; j < tmp.length; j++) {
            str_body += fieldmap[tmp[j]] + ':' + obj[tmp[j]] + "\n"
          }
          that.setData({
            result: str_body,
            state: 0
          })
        }

      },
      error(message) {
        that.setData({
          state: 0
        })
      }
    })
  },
  getData_1() {
    let that = this
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/GetPreProduct',
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
      }
    })
  },
  getOtherData(obj) {
    let fieldNames = {
      print_obj: "STRING",
    }
    let that = this
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/QuerySQL',
      data: {
        sqlStr: "select print_obj from print_obj where `index` = (select qc_id from default_qc where id = 3);",
        fieldNames: JSON.stringify(fieldNames),
        pageCur: 1,
        pageMax: 1000
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded'
      },
      success(res) {
        let jsonobj = res.data.data0
        jsonobj = JSON.parse(jsonobj[0].print_obj)
        console.log(jsonobj)
        console.log(obj)
        Object.assign(obj, jsonobj)
        that.getComputeData(obj)
      }
    })
  },
  getComputeData(obj) {
    let that = this
    let fieldNames = {
      build_type: "STRING",
      standard: "STRING",
      fangliang: "STRING",
      fangliang: "STRING",
      building_no: "STRING",
      floor_no: "STRING",
      time: "STRING",
      plantime: "STRING",
      concretegrade: "STRING",
      unit_consumption: "STRING",
    }
    wx.request({
      url: 'https://mes.ljzggroup.com/DuiMaNew/QuerySQL',
      data: {
        sqlStr: "select b.build_type,b.standard,b.fangliang,b.building_no,b.floor_no,c.plantime time ,DATE_ADD(c.plantime,INTERVAL 5 DAY) plantime,b.concretegrade,d.unit_consumption from preproduct b,plan c,planname d where  b.plannumber = c.plannumber and c.planname = d.planname  and b.materialcode = " + that.data.materialcode + ";",
        fieldNames: JSON.stringify(fieldNames),
        pageCur: 1,
        pageMax: 1000
      },
      method: 'POST',
      header: {
        "content-type": 'application/x-www-form-urlencoded'
      },
      success(res) {
        let jsonobj = res.data.data0[0]
        let tmp = that.data.qrstyle.qRCode.qRCodeContent
        let str_body = ''
        console.log(jsonobj)
        console.log(that.data.fieldmap)
        console.log(tmp)
        for (let j = 0; j < tmp.length; j++) {
          str_body += that.data.fieldmap[tmp[j]] + ":" + obj[tmp[j]] + "\n"
        }
        str_body += "构件种类" + ":" + jsonobj.build_type + "\n"
        // str_body += "<tr><td>" + "构件尺寸(mm)" + "</td><td>" + jsonobj.standard + "</td></tr>"
        // str_body += "<tr><td>" + "构件重量(T)" + "</td><td>" + (jsonobj.fangliang * 2.4).toFixed(2) + "</td></tr>"
        str_body += "使用部位" + ":" + jsonobj.building_no + jsonobj.floor_no + "\n"
        str_body += "构件制作日期" + ":" + jsonobj.time + "\n"
        str_body += "构件出厂检验日期" + ":" + jsonobj.plantime + "\n"
        str_body += "构件出出厂日期" + ":" + jsonobj.plantime + "\n"
        str_body += "钢筋用量(kg)" + ":" + (jsonobj.fangliang * jsonobj.unit_consumption).toFixed(2) + "\n"
        str_body += "混凝土强度等级" + ":" + jsonobj.concretegrade + "\n"
        str_body += "混凝土用砂量(T)" + ":" + (jsonobj.fangliang * 0.85).toFixed(2) + "\n"
        str_body += "混凝土用石量(T)" + ":" + (jsonobj.fangliang * 1.0).toFixed(2) + "\n"
        that.setData({
          result: str_body
        });
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
        console.log(res)

        that.setData({
          startBarHeight: res.statusBarHeight,
          navgationHeight: navgationHeight
        })
      }
    })
  },
  fanhui: function () {
    wx.navigateBack()
  },
})