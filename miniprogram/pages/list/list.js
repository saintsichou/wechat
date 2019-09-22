// pages/list/list.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    patientList:[],
    image:'https://6b65-keenstar-5871c6-1300213761.tcb.qcloud.la/my-image.jpeg?sign=d87a20961b88ba083820e8c51a05c15d&t=1568888357',
    totalCount:0,
    searchFlag: false,//开始搜索输入
    inputFlag: false,//是否正在输入
    timeoutId:0,
    textInput:'',
    carID:''
  },
  //编辑页面
  goEdit() {
    wx.navigateTo({
      url: "../list_edit/list_edit"
    })
  },
  converTime(t){
    let dateee = new Date(t).toJSON();  
    let date = new Date(+new Date(dateee)+8*3600*1000).toISOString().replace(/T/g,' ').replace(/\.[\d]{3}Z/,'')
    return date;
 },
  //文本聚焦时
  textFocus(){
    let self = this;
    self.searchFlag = true;
    self.inputFlag = false;
},
//输入
textInput(e){
    let self = this;
    let text = e.detail.value;
    self.textValue = text;
    console.log('111---', text);
},
//开始输入
goSearch(){
    this.searchFlag = true;
    this.inputFlag = false;
    console.log(textInput)
    this.infos.where(
    {
        phone: db.RegExp({
            regexp: textInput,
            options: 'i',
        })
    }).get()
    .then(res=>{
        console.log(res)
    })
    .catch(error=>console.log(error))
},
//取消输入
cancelSearch(){
    this.searchFlag = false;
    this.productList = [];
    this.inputFlag = true;
},
debounce (func, delay) {
    let timer
    return function (...args) {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        func.apply(this, args)
      }, delay)
    }
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
                app.globalData.avatarUrl = res.userInfo.avatarUrl,
                this.setData({
                  avatarUrl: res.userInfo.avatarUrl,
                  userInfo: res.userInfo
                })
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
        that.infos.count()
        .then(res=>{
            this.setData({
                totalCount:res.total,
                carID:res.total
            })
        })
        .catch(error=>{console.log(error)})
        that.infos
        .orderBy('postID', 'desc')
        .limit(10)
        .get()
        .then(res=>{
            console.log(res)
            this.setData({
                patientList:res.data
            })
        }).catch(console.error)
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
    wx.showLoading({

        title: '玩命加载中',
  
    })
    this.infos
    .orderBy('postID', 'desc')
    .limit(10)
    .get()
    .then(res=>{
        console.log(res)
        this.setData({
            patientList:res.data
        })
        wx.stopPullDownRefresh();
        wx.hideLoading();
    }).catch(console.error)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    var temp = [];
    // 获取后面十条
    if(this.data.patientList.length < this.data.totalCount){
      try {
        this.infos
          .skip(10)
          .limit(10) // 限制返回数量为 5 条
          .orderBy('postID', 'desc')  // 排序
          .get({
            success: function (res) {
              // res.data 是包含以上定义的两条记录的数组
              if (res.data.length > 0) {
                for(var i=0; i < res.data.length; i++){
                  var tempTopic = res.data[i];
                  temp.push(tempTopic);
                }
                var totalTopic;
                totalTopic =  that.data.patientList.concat(temp);
                that.setData({
                  patientList: totalTopic,
                })
              } else {
                wx.showToast({
                  title: '没有更多数据了',
                })
              }
            },
            fail: function (event) {
              console.log("======" + event);
            }
          })
      } catch (e) {
        console.error(e);
      }
    }else{
      wx.showToast({
        title: '没有更多数据了',
      })
    }
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})