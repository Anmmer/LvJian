// qrcodeInfo.js
const app = getApp()
Page({
  data: {
    result:'',
    dataArray: null,
    storageInfo: null
  },
  // 扫码函数
  scanCode(e){
    this.setData({result:e.detail.result})
    var that = this
    // 对扫码结果进行分析
    // 1. 通过字符串正则表达式提取构件号
    var resultstr = e.detail.result.toString()
    var strs = resultstr.split("\n")
    // for循环从strs中找到构件号
    var productId = null
    for(var i = 0; i < strs.length; i++){
      var idx = strs[i].indexOf(":")
      var fieldname = strs[i].substring(0,idx)
      if(fieldname.indexOf("构件号")>=0){
        productId = strs[i].substring(idx+1)
      }
    }
    console.log(productId)
    if(productId != null){
      wx.request({
        url: 'http://101.132.73.7:8989/DuiMa/GetProductInfo',
        data:{
          productId:productId
        },
        method:'POST',
        header:{
          "content-type":'application/x-www-form-urlencoded'
        },
        success(res){
          console.log(res.data)
          that.setData({dataArray:JSON.parse(res.data.produceInfo)})
          
          if(typeof(res.data.warehouse_name) != "undefined"){
            that.setData({storageInfo:"构件存储于仓储组织'"+res.data.factory_name+"'下的货位'"+res.data.warehouse_name+"'!"})
          }
          else{
            that.setData({storageInfo:"构件目前不在仓库中!"})
          }
          //that.setData({dataArray:res.data})
        }
      })
      // 请求获取数据
    }else{
      wx.showToast({
        title:'请扫描拥有构件号信息的二维码!',
        icon:'none',
        duration:1000
      })
    }
    /*
    var index1 = resultstr.indexOf("\n")
    var str1 = resultstr.substring(0,index1)
    var index2 = str1.indexOf(":")
    var codeType = str1.substring(0,index2)    // 二维码的类型: 构件号 or 设备 or 库位
    var codeContent = str1.substring(index2+1)  // 二维码的内容
    console.log(codeType)
    console.log(codeContent)
    // 发起请求，获取数据
    wx.request({
      url: 'http://192.168.43.176:8080/ProductInfo',
      data:{
        product_id:codeContent
      },
      header:{
        "content-type":'application/json'
      },
      success(res){
        console.log(res.data)
        that.setData({dataArray:res.data})
      }
    })
    */
  }
})