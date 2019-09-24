// pages/list_edit/list_edit.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    editFlag: true,
    imagePath: '',
    array:[1,2,3,4,5,6,7,8,9],
    name:'',
    phone:'',
    worknumber:'',
    branch:'',
    post:'',
    indexs:0,
    userInfo: {},
    avatarUrl:'',
    insID:0
  },
  formSubmit: function (e) {
    const {name,
    phone,
    worknumber,
    branch,
    indexs,
    post} = e.detail.value
    if(name=='' || phone=='' || indexs==''){
      wx.showModal({
        title: '错误',
        content: '必填项不能为空',
        showCancel: false
      })
      return
    }else{
      if(phone.length==11){
        let resf = true
       //  向user数据集添加记录
       for (let i = 1; i <= indexs; i++) {
        this.infos.add({
          // data 字段表示需新增的 JSON 数据
          data: {
            name:name,
            phone:phone,
            worknumber:worknumber || 'null',
            branch:branch || 'null',
            post:post || 'null',
            postID:new Date().getTime(),
            avatarUrl:this.data.avatarUrl || app.globalData.avatarUrl,
            postID:new Date().getTime(),
            // postID:`广州-海北-XYW-${new Date().getFullYear()}${(sum*1+i)<100?(sum*1+i)>10?`0${(sum*1+i)}`:`00${(sum*1+i)}`:sum*1+i}`,
            date:this.time()
          },
          //  数据插入成功，调用该函数
          success: function (res) {
            if(resf){
              wx.showModal({
                title: '成功',
                content: '提交成功',
                showCancel:false,
                success (res) {
                  if (res.confirm) {
                    wx.navigateTo({
                      url:'../list/list'
                    })
                  } 
                }
              }),
              resf=false
              // setTimeout(()=>{
              // // resf = true          
              // },1500) 
            }
          },
          fail: function(error){
            console.log(error)
            wx.showModal({
              title: '失败',
              content: '提交失败',
              showCancel:false
            })
          }
        }) 
        }
      }else{
        wx.showModal({
          title: '错误',
          content: '电话号码错误',
          showCancel: false
        })
        return
      }  
    }
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
  formReset: function () {
    console.log('form发生了reset事件')
  },
  nameInput(e){
    let text = e.detail.value;
    console.log(text);
  },
  bindPickerChange(e){
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      indexs: e.detail.value
    })
  },
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
            wx.showToast({
              icon: 'none',
              title: '上传成功',
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
  time() {
    let y = new Date().getFullYear();
    let m = (new Date().getMonth()+1)<10?"0"+(new Date().getMonth()+1):new Date().getMonth()+1;
    let d = new Date().getDate()<10?"0"+new Date().getDate():new Date().getDate();
    let h = new Date().getHours()<10?"0"+new Date().getHours():new Date().getHours();
    let min = new Date().getMinutes()<10?"0"+new Date().getMinutes():new Date().getMinutes();
    let ms = new Date().getSeconds()<10?"0"+new Date().getSeconds():new Date().getSeconds();
    let nowTime = `${y}-${m}-${d} ${h}:${min}:${ms}`
    return nowTime;
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
        }else{
          wx.showModal({
            title: '失败',
            content: '未授权,请重新授权',
            showCancel:false,
            success (res) {
              if (res.confirm) {
                wx.navigateTo({
                  url:"../getUserInfo/getUserInfos"
                })
              } 
            }
          })
        }
      }
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
        that.infos = that.db.collection('infos')
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
		// self.$apply();
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