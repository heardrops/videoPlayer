$(document).ready(function() {
  var video = $('#video');
  var videoDom = video[0];
  var bigBtn = $('#bigBtn');
  var np = {};
  var smallBtn = $('#smallBtn');
  var durationTime = $('#durationTime');
  var currentTime = $('#currentTime');//当前时间
  var progressBar = $('#progressBar');
  var playedProgressBar = $('#playedProgressBar');
  var progressBarBlock = $('#progressBarBlock');

  var progressBarBlockPositionLeft = progressBarBlock.position().left;
  var relProgressBarWidth = progressBar.width() - progressBarBlock.width();
  var progressBarBlockWidth = progressBarBlock.width();
  var dur;
  var timeInterval;

  var voiceLine = $('#voiceLine');
  var voiceLineBlock = $('#voiceLineBlock');
  var fullScreen = $('#fullScreen').find('img').first();

  //视频在播放以后的行为
  np.autoPlay = function() {
    if (videoDom.ended == true) {
      window.clearInterval(timeInterval);
      bigBtn.show('fast');
      playedProgressBar.width(0);
      currentTime.text('00:00:00');
      progressBarBlock.css('left', progressBarBlockPositionLeft);
      return;
    }
    var perSecWidth;
    perSecWidth = relProgressBarWidth/dur;//播放条每秒钟走的路程
    currentTime.text(np.convertTime(videoDom.currentTime));
    //超过进度条
    if(playedProgressBar.width()+progressBarBlockWidth+perSecWidth>progressBar.width()) {
      progressBarBlock.css('left',progressBar.width()-progressBarBlockWidth+progressBar.position().left()+1);
      playedProgressBar.width(progressBar.width()-progressBarBlockWidth);
    } else {//没有超过进度条
      progressBarBlock.css('left', progressBarBlock.position().left+perSecWidth);
      playedProgressBar.width(playedProgressBar.width()+perSecWidth);
    }
  };

  np.play = function() {//播放
    clearInterval(timeInterval);
    bigBtn.hide('fast');
    videoDom.play();
    smallBtn.find('img').first().attr('src', 'images/start.jpg');
    timeInterval = window.setInterval(np.autoPlay, 1000);
  };

  np.pause = function() {//暂停
    bigBtn.show('fast');
    videoDom.pause();
    smallBtn.find('img').first().attr('src', 'images/stop.jpg');
    window.clearInterval(timeInterval);
     //设定要一个定时器，只要没有清除它，该定时器就会永远工作下去，如果前面一个定时器没有清除，
    //后面又开启一个定时器，那么就要特别小心了，特别是针对同一个功能，所以，
    //当你在设定一个新的定时器的时候不知道原来的定时器是否清除，以防万一，
    //最好在设定新的定时器之前，做一个clearInterval,就是这个定时器困了我大半天，奶奶的
  };

  np.playOrPaused = function() {
    videoDom.paused ? np.play() : np.pause();
  };

  np.convertTime = function(time) {//时间转换
    var hh, mm, ss;
    var strTime = '00:00:00';
    if(time==null || time<0) {
      return strTime;
    }
    hh = parseInt(time/3600);
    mm = parseInt((time-hh*3600)/60);
    ss = parseInt(time-hh*3600-mm*60);
    if(hh < 10) {
      hh = "0" + hh;
    }
    if(mm < 10) {
      mm = "0" + mm;
    }
    if(ss < 10) {
      ss = "0" + ss;
    }
    strTime = hh + ':' + mm + ':' + ss;
    return strTime;
  };

  //当指定的音频/视频已加载时，会发生onloadedmedata事件
  videoDom.onloadedmetadata = function() {
    dur = videoDom.duration;
    var t = np.convertTime(dur);
    durationTime.text(t);
  };

  bigBtn.bind('click', np.play);
  video.bind('click', np.playOrPaused);

  progressBar.click(function(event) {
    var x = event.pageX;//鼠标指针的位置，相对于文档的左边缘
    //console.log(x);
    var left = progressBar.position().left+progressBarBlockWidth;//进度条做边的位置
    //console.log(left);
    var durationTime = dur;
    var width = relProgressBarWidth;
    var currenttime = (durationTime/width)*(x-left);
    videoDom.currentTime = currenttime;
    progressBarBlock.css('left', progressBarBlockPositionLeft+(x-left));
    playedProgressBar.width(x-left);
    var t = np.convertTime(currenttime);
    currentTime.text(t);
  });

  //当鼠标指针移动到元素上方，并按下鼠标按键时，会发生mousedown事件
  progressBarBlock.mousedown(function(event) {
    window.clearInterval(timeInterval);
    var pageX = event.pageX;
    var originLeft = progressBarBlock.position().left;

    //当鼠标指针在指定的元素中移动时，就会发生mousemove事件
    $(document).mousemove(function(event) {
      var w = event.pageX - pageX;//滑动的距离

      //最左边
      if(progressBarBlock.position().left<=progressBarBlockPositionLeft) {
        if(w<0) {
          return false;
        }
      }

      //最右边
      if(playedProgressBar.width()+progressBarBlock.width()+1>=progressBar.width()) {
        if(w>0) {
          return false;
        }
      }
      progressBarBlock.css('left', originLeft+w);
      playedProgressBar.width(progressBarBlock.position().left-progressBar.position().left-1);
    });

    //当在元素放松鼠标按钮时，会发生mouseup事件
    $(document).mouseup(function() {
      $(document).unbind('mousemove');//可以解除这个事件
      var curT = (dur/relProgressBarWidth)*(progressBarBlock.position().left-progressBar.position().left);
      if(curT>=dur) {
        bigBtn.show('fast');
        playedProgressBar.width('0');
        progressBarBlock.css('left', progressBarBlockPositionLeft);
        currentTime.text('00:00:00');
        return false;
      }
      videoDom.currentTime = curT;
      currentTime.text(np.convertTime(curT));
      np.play();
      return false;
    });
    return false;
  });

  smallBtn.click(function() {
    np.playOrPaused();
  });

  np.changeVolumn = function() {
    var volumn = ((voiceLineBlock.position().left-voiceLine.position().left)/(voiceLine.width()-voiceLineBlock.width()))*1;
    volumn > 1 ? 1 : volumn;
    volumn < 0 ? 0 : volumn;
    videoDom.volumn = volumn;//音量
  };
  voiceLineBlock.click(function() {
    return false;
  });
  voiceLine.click(function(event) {//点击在音量调的什么地方音量就到什么地方
    var pageX = event.pageX;
    if(pageX>voiceLine.position().left+voiceLineBlock.width()) {//点击在音量条上
      voiceLineBlock.css('left', pageX-2*voiceLineBlock.width());
      np.changeVolumn();
      //console.log('111111');
    }
  });

  //音量调的拖动
  voiceLineBlock.mousedown(function() {
    $(document).mousemove(function(event) {
      var pageX = event.pageX;
      if(pageX<voiceLine.position().left || pageX>voiceLine.width()+voiceLine.position().left) {
        return false;
      }
      voiceLineBlock.css('left', pageX);
    });
    $(document).mouseup(function() {
      $(document).unbind('mousemove');
      np.changeVolumn();
      //console.log('2222');
    });
  });

  fullScreen.click(function() {
    var pfix = ['webkit', 'moz', 'o', 'ms', 'khtml'];
    //           Chrome  FireFox       IE
    var fix = '';
    for(var i = 0; i < pfix.length; i++) {
      if(typeof document[pfix[i]+"CancelFullScreen"]!='undefined') {
        fix = pfix[i];
        break;
      }
    }
    if(fix === '') {
      alert('您的游览器不支持全屏!');
      return false;
    }
    videoDom[fix+"RequestFullScreen"]();
  });

  np.keypress = function(event) {
    if(event.which == 32) {//空格
      np.playOrPaused();
    }
  };
  $(document).bind('keydown', np.keypress);
});