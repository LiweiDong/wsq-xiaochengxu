const api = require('../../../utils/api.js')
const util = require('../../../utils/util.js')


// pages/message/list/favor.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    messages: [],
    loader: {
      ing: false,
      more: true,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    api.getMessageList('favor').then( resp => {
      var unpacked = unpackMsgContent(resp.data)
      this.setData({ messages: unpacked })
      console.log("get favor message list:", resp.data)
    }).catch( err => {
      console.log(err)
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    api.getMessageList('favor').then(resp => {
      var unpacked = unpackMsgContent(resp.data)
      this.setData({ messages: unpacked })
    }).catch(err => {
      console.log(err)
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loader.ing || !this.data.loader.more) {
      return
    }
    var messages = this.data.messages
    var since = 0
    var limit = 20
    if (messages && messages.length > 0) {
      since = messages[messages.length - 1].id
    }
    api.getMessageList('favor', since, limit).then(resp => {
      if (resp.data.length < limit) {
        this.data.loader.more = false
      }
      var unpacked = unpackMsgContent(resp.data)
      this.setData({ messages: messages.concat(unpacked) })
    })
  },
  clickItem: function(e) {
    var idx = e.currentTarget.dataset.idx
    var msg = this.data.messages[idx]
    var key = 'messages['+idx+'].status'
    // 跳转到帖子，并设置为已读
    this.setData({
      [key]: 1,
    })
    api.setMessageRead(msg.id).catch( err => {
      console.log(err)
    })
    // fetch post and goto thread page
    wx.navigateTo({
      url: '/pages/thread/thread?pid='+msg.post_id,
    })
  }
})

function unpackMsgContent(msgs) {
  var i = 0 
  var n = msgs.length
  for (; i < n; i++) {
    var json = util.jsonParse(msgs[i].content)
    if (json.ok) {
      msgs[i].post_id = json.object.post_id
      msgs[i].subject = json.object.subject
    } else {
      msgs[i].subject = msgs[i].content
    }
    msgs[i].time = util.formatTime(new Date(msgs[i].created_at * 1000))
  }
  return msgs
}
