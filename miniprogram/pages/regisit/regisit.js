// pages/regisit/regisit.js
const app = getApp()
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    name:null,
    phone:  null,
    password:null,
    flag:false
  },
  btnclick(){
    wx.navigateTo({
      url:'../login/login'
    })
  },
  formSubmit: function(e) {
    var that = this
    try
    {
     //  将年龄转换为整数类型值
      let phone = parseInt(e.detail.value.phone)
      let name = e.detail.value.name
      let password = e.detail.value.password
     //  如果输入的年龄不是数字，会显示错误对话框，并退出该函数   
      if(name && phone && password){
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
          phone:phone
        }).get({
          success: res => {
            if(res.data.length>0){
              wx.showModal({
                title: '失败',
                content: '已有该电话号码',
                showCancel:false
              })
              return
            }else{
              //  向user数据集添加记录
              this.user.add({
                // data 字段表示需新增的 JSON 数据
                data: {
                  name: e.detail.value.name,
                  phone:  phone,
                  password: e.detail.value.password
                },
                //  数据插入成功，调用该函数
                success: function (res) {
                  wx.showModal({
                    title: '成功',
                    content: '注册成功',
                    showCancel:false
                  })
                  setTimeout(()=>{wx.navigateBack({
                    delta: 1
                  })},3000)
                 
                }
              })
            }
          },
          fail: err => {
            wx.showToast({
              icon: 'none',
              title: '查询记录失败'
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
