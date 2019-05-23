// pages/numberMobile/numberMobile.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    code: '',
    phone: ''
  },
  formSubmit (e) {
    const that = this
    console.log(e)
    // 用于服务通知的formId
    const formId = e.detail.formId
    console.log("-------------formId-----")
    console.log(formId)
  },

  //解密数据
  decodeData: function (code, encryptedData, iv ) {
    const that = this
    wx.request({
      url: 'http://127.0.0.1:3500/dedata',
      data: {
        encryptedData,
        iv,
        code
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        //解密后的数据
        // console.log(res)
        if (res) {
          console.log('----------解密数据------')
          console.log(res.data.data)
        }
      }
    })
  },

  //获取用户信息
  getUserInfo: function (e) {
    const that = this
    if (e.detail.errMsg === 'getUserInfo:ok') { //允许授权
      wx.getUserInfo({
        success: function (res) {
          const {iv, encryptedData } = res
          const code = that.data.code
          that.decodeData(code, encryptedData, iv)
        }
      })
    } else {
      console.log('用户拒绝授权')
    }
  },


  //获取手机号(目前该接口针对非个人开发者，且完成了认证的小程序开放)
  getPhoneNumber: function (e) {
    const that = this;
    console.log(e)
    wx.checkSession({
      success: function () {
        const ency = e.detail.encryptedData;
        const iv = e.detail.iv;
        if (e.detail.errMsg != "getPhoneNumber:ok") { // 拒绝授权
          console.log("拒绝授权" + e.detail.errMsg);
        } else { // 允许授权
          console.log("============允许授权" + e.detail.errMsg);
          that.decodeData(that.data.code, ency, iv)
        }
      },
      fail: function () {
        console.log("session_key 已经失效，需要重新执行登录流程");
        that.getCode()
      }
    });
  },

  //获取登陆态
  getCode: function () {
    const that = this
    wx.login({
      success: function (res) {
        that.setData({
          code: res.code
        })
      },
      fail: function (res) {
        //获取登陆态失败
        console.log('获取登陆态失败')
      }
    })
  },

  onLoad: function () {
    this.getCode()
  }

})