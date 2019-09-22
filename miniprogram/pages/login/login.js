// pages/login/login.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    avatarUrl:'',
    userInfo:'',
    name:null,
    phone:  null,
    password:null,
    flage:false
  },
  btnclick(){
    wx.navigateTo({
      url:'../regisit/regisit'
    })
  },
  formSubmit: function(e) {
    var that = this
    try
    {
     //  将年龄转换为整数类型值
      let phone = parseInt(e.detail.value.phone)
      let password = e.detail.value.password
     //  如果输入的年龄不是数字，会显示错误对话框，并退出该函数   
      if(phone && password){
        if(isNaN(phone))
        {
          //  显示错误对话框
          wx.showModal({
            title: '错误',
            content: '请输入正确的电话',
            showCancel: false
          })
          return
        }
        this.user.where({
          _openid: app.globalData.openid,
          phone:phone,
          password:password
        }).get({
          success: res => {
            if(res.data.length>0){
              wx.showToast({
                icon: 'success',
                title: '登录成功',
                showCancel: false
              })
              wx.navigateTo({
                url: '../index/index',
              })
            }else{
              wx.showModal({
                icon: 'error',
                content: '账号或密码错误',
                showCancel: false

              })
            }
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '请查看账号密码'
            })
          }
        })  
      } else{
        wx.showModal({
          title: '错误',
          content: '不能为空',
          showCancel: false
        })
        return
      }
    }
    catch(e)
    {
      wx.showModal({
        title: '错误',
        content: e.message,
        showCancel: false
      })

    }
  },
  formReset: function() {
    console.log('form发生了reset事件')
  },
  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })
        const filePath = res.tempFilePaths[0]
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)
            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '个人中心'  //修改title
    })
    var that = this
    //  调用login云函数获取openid
    wx.cloud.callFunction({
      name:'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.cloud.init({ env: 'keenstar-5871c6' })
        that.db = wx.cloud.database()
        that.user = that.db.collection('user')
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              console.log(res)
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
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