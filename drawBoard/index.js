
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    lineColor: {
        type: String,
        value: 'black'
    },
    background: {
        type: String,
        value: 'white'
    },
    lineWidth: {
        type: Number,
        value: 4
    },
    // todo 生成图片 提供的回调事件
    callback: {
        type: null
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    ctx: {},
    pointArr: [],
    canvasw: 0,
    canvash: 0,
  },

  ready: function() {
    this.initCanvas();
    this.log(this.data)
  },

  /**
   * 组件的方法列表
   */
  methods: {
    log() {
      return console.log.apply(console, arguments);
    },

    initCanvas() {
        const ctx = wx.createCanvasContext('boardCanvas', this);
        const res = wx.getSystemInfoSync();
        const canvasw = res.windowWidth;            // 设备宽度
        const canvash = res.windowHeight;
        this.setData({ canvasw, canvash, ctx });
        ctx.setFillStyle(this.data.background);
        ctx.fillRect(0, 0, canvasw, canvash);       // 画布背景 todo
        // ctx.draw();
        ctx.beginPath();
    },

    setPaintStyleAndDraw() {
        const { ctx, lineColor, lineWidth } = this.data;
        ctx.setStrokeStyle(lineColor);
        ctx.setLineWidth(lineWidth);
        ctx.setLineCap("round");
        ctx.setLineJoin("round");
        ctx.stroke();
        ctx.draw(false);
    },

    touchStart(e) {
      const point = e.touches[0] || {};
      const x = point.pageX;
      const y = point.pageY;
      this.data.pointArr.push({
        x,
        y,
        isStart: true
      })
    },

    drawing(e) {
      const point = e.touches[0] || {};
      const x = point.pageX;
      const y = point.pageY;
      this.data.pointArr.push({
        x,
        y,
        isStart: false
      })
      const { ctx } = this.data;
      const arr = this.data.pointArr

      // 关键点如果改点是起始点则移动，否则直接连线
      for (var i = 0; i < arr.length; i++) {
          if (arr[i].isStart) {
              ctx.moveTo(arr[i].x, arr[i].y);
          } else {
              ctx.lineTo(arr[i].x, arr[i].y);
          }
      }

      this.setPaintStyleAndDraw();
    },

    touchEnd(e) {
      this.log('end', e);
    },

    // 清除画布
    clear() {
        this.setData({pointArr: []});
        const { ctx, canvasw, canvash } = this.data;
        ctx.clearRect(0, 0, canvasw, canvash);
        ctx.draw(true);
    },

    // 保存到本地
    downLoad() {
        const _t = this;
        this.getPic(function(path) {
            wx.saveImageToPhotosAlbum({
                filePath: path,
                success(res) {
                    _t.log(res)
                }
            });
        })
    },

    // 生成图片
    getPic(call) {
        const _t = this;
        wx.canvasToTempFilePath(
            {
                canvasId: "boardCanvas",
                success(res) {
                    _t.log("success", res, call);
                    if(!call.type) {
                        call(res.tempFilePath);
                    }
                },
                fail() {
                    _t.log("canvas不可以生成图片");
                },
                complete(res) {
                    _t.log("complete", res);
                }
            },
            this
        );
    }
  }
});
