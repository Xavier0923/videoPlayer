const moment = require('moment');
import 'moment-duration-format';

const videoPlayer = document.querySelector('.videoPlayer');
const videoWindow = document.querySelector('.video-window');
const videoTools = document.querySelector('.video-tools');
const videoProgress = document.querySelector('.video-progress');
const videoFeatures = document.querySelector('.video-features');
const volume_control = document.querySelector('.volume-control');
const settings = document.querySelector('.settings');

// 功能鍵部分
const replay_10 = document.querySelector('.replay-10');
// const pause = document.querySelector('.pause');
const play_arrow = document.querySelector('.play-arrow');
const forward_10 = document.querySelector('.forward-10');
const volume_muted = document.querySelector('.volume-muted');
// const volume_off = document.querySelector('.volume-off');
const zoom_out_map = document.querySelector('.zoom-out-map');
const zoom_in_map = document.querySelector('.zoom-in-map');
const video_progress_inp = document.querySelector('.video-progress-inp');

// moment.duration(videoPlayer.duration, 'seconds').format()

videoPlayer.oncanplay = function(){
    video_progress_inp.max = videoPlayer.duration;
};


// videoPlayer.oncanplay = function() {
//     alert("Can start playing video");
// }

// video player 屬性
let isPlay = false;
let volume = 50;
let isMuted = false;
let totalSecondTime = 0;
let totalTime = '';
let currentTime = '0:00'
let showSetting = false;
let videoSpeed = 1;
let sliderTime = 0;
let timer;
let isError = false;
let isFullScreen = false;
let isLoading = false;

let canvas;
let videoMarkers = [];
let image = '';
let file;
let imageIndex = 0;

// 播放/暫停
function playVideo() {
    if (!isPlay) {
        videoPlayer.play();
    } else {
        videoPlayer.pause();
        clearInterval(timer);
        isLoading = false;
    }
    isPlay = !isPlay;
}
// 快轉/倒退
function videoSkip(value) {
    if (value > 0) {
        videoPlayer.currentTime = videoPlayer.currentTime + 10
    } else {
        videoPlayer.currentTime = videoPlayer.currentTime - 10
    }
};

// 聲音是否靜音
function volumeMuted() {
    volume_muted.innerHTML = volume_muted.innerHTML === 'volume_up' ? 'volume_off' : 'volume_up';
    videoPlayer.muted = !videoPlayer.muted;
    videoPlayer.volume = videoPlayer.muted ? 0 : 50;
}

// 聲音大小聲
function volumeControl(event) {
    console.log(event.target.value);
    videoPlayer.volume = event.target.value / 100
    videoPlayer.muted = event.target.value === 0 ? true : false;
}

// 移動時間點
function timeControl(event) {
    // 進度條
    currentTime = this.videoPlayer.nativeElement.currentTime > 0 ? moment.duration(event.target.value, 'seconds').format() : '0:00';
    this.renderer.setProperty(this.videoPlayer.nativeElement, 'currentTime', event.target.value)
}

// 放大/縮小
function fullScreen() {

    if (isFullScreen) {
        console.log(document.exitFullscreen())
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    } else {
        if (this.videoWindow.nativeElement.webkitRequestFullscreen) {
            console.log('use webkitRequestFullscreen')
            this.videoWindow.nativeElement.webkitRequestFullscreen()
        } else if (this.videoWindow.nativeElement.requestFullscreen) {
            console.log('use requestFullscreen')
            this.videoWindow.nativeElement.requestFullscreen()
        } else if (this.videoWindow.nativeElement.msRequestFullscreen) {
            console.log('use msRequestFullscreen')
            this.videoWindow.nativeElement.msRequestFullscreen()
        }
    }
    console.log(this.isFullScreen)
}

// 打開設定
function speedSetting(e) {
    e.stopPropagation()
    showSetting = !this.showSetting;
}

// 調整播放速度
function setPlaySpeed(value) {
    videoSpeed = value;
    this.videoPlayer.nativeElement.playbackRate = value;
    showSetting = !showSetting;
}

// 擷取畫面及上傳到圖片暫存區
function getVideoMarker() {
    file = this.base64toFile(image);
    // file upload api

    console.log(this.videoPlayer.nativeElement.currentTime)
    videoMarkers.push({ imgName: image, currentTime: moment.duration(this.videoPlayer.nativeElement.currentTime, 'seconds').format('hh:mm:ss:SS', { trim: false }), secondTime: this.videoPlayer.nativeElement.currentTime, remake: '', imgUrl: '' })
    console.log(this.videoMarkers)
}

function base64toFile(dataURI) {
    // 分割数据
    const [meta, data] = dataURI.split(',')
    // 对数据编码
    let byte
    if (meta.includes('base64')) {
        byte = atob(data)
    } else {
        byte = encodeURI(data)
    }
    // 获取图片格式
    const mime = meta.split(':')[1].split(';')[0]
    // 创建 8 位无符号整型数组
    const ia = new Uint8Array(byte.length)
    // 获取字符 UTF-16 编码值
    for (let i = 0; i < byte.length; i++) {
        ia[i] = Number(byte.codePointAt(i))
    }
    // 生成文件对象
    return new File([ia], `${moment().format('yyyy/MM/DD hh:mm')}截圖-${imageIndex}.png`, { type: mime })
}

// 跳至marker時間點
function jumpSpecifiedFragment(time) {
    this.videoPlayer.nativeElement.currentTime = time;
}

// 刪除marker
function deleteFragment(index) {
    videoMarkers.splice(index, 1)
}