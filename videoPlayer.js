// const moment = require('moment');;

const videoPlayer = document.querySelector('.video-player');
const videoWindow = document.querySelector('.video-window');
const videoTools = document.querySelector('.video-tools');
const videoProgress = document.querySelector('.video-progress');
const videoFeatures = document.querySelector('.video-features');
const volume_control = document.querySelector('.volume-control');
const speed_setting = document.querySelector('.speed-setting');
const videoImage_view = document.querySelector('.videoImage-view')

// 功能鍵部分
const replay_10 = document.querySelector('.replay-10');
// const pause = document.querySelector('.pause');
const play_arrow = document.querySelector('.play-arrow');
const forward_10 = document.querySelector('.forward-10');
const volume_muted = document.querySelector('.volume-muted');
// const volume_off = document.querySelector('.volume-off');
const zoom_map = document.querySelector('.zoom-map');
const video_progress_inp = document.querySelector('.video-progress-inp');
const volume_control_inp = document.querySelector('.volume-control-inp')
const big_play_btn = document.querySelector('.big-play-btn');
// const big_play_bg = document.querySelector('.big-play-bg');
const speed_text = document.querySelector('.speed-text');


const totalTime = document.querySelector('.totalTime');
const currentTime = document.querySelector('.currentTime');


// video player 屬性
let isPlay = false;
let volume = 50;
let isMuted = false;
let totalSecondTime = 0;
// let totalTime = '';
// let currentTime = '0:00'
let showSetting = false;
let videoSpeed = 1;
let sliderTime = 0;
let timer;
let isError = false;
let isFullScreen = false;
let isLoading = false;

let canvas;
let videoMarkers = [];
let file;
let imageIndex = 0;
let image = ''


// 事件
videoPlayer.onloadeddata  = function(){
    console.log('onloadeddata')
    // 給進度調時間使用
    video_progress_inp.max = videoPlayer.duration;
    video_progress_inp.value = 0;
    // 顯示總時間、當前時間
    currentTime.innerHTML = '0:00';
    totalTime.innerHTML = moment.duration(videoPlayer.duration, 'seconds').format({trim: false})
};

videoPlayer.addEventListener('playing', () => {
    console.log('playing')
    // timer = setInterval(() => {
    //     console.log('timeupdate')
    //     video_progress_inp.value = videoPlayer.currentTime;
    //     currentTime.innerHTML = moment.duration(videoPlayer.currentTime < 1 ? 1 : videoPlayer.currentTime, 'seconds').format({trim: false})
    // }, (1000 / videoSpeed))
})

videoPlayer.addEventListener('timeupdate', () => {
    console.log('timeupdate')
    timer = setInterval(() => {
        video_progress_inp.value = videoPlayer.currentTime;
        currentTime.innerHTML = moment.duration(videoPlayer.currentTime < 1 ? 1 : videoPlayer.currentTime, 'seconds').format({trim: false})
    }, (1000 / videoSpeed))
    // clearInterval(timer)
    canvas = document.createElement('canvas');
    // 預載寫入畫布
    canvas.width = '1600';
    canvas.height = '900';
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoPlayer, 0, 0, 1600, 900);
    image = canvas.toDataURL('image/png');
})

// 緩衝
videoPlayer.addEventListener('waiting', () => {
    console.log('waiting');
})

// 播放/暫停
function playVideo() {
    if (!isPlay) {
        videoPlayer.play();
        play_arrow.innerHTML = 'pause'
        big_play_btn.style.display = 'none'
    } else {
        videoPlayer.pause();
        play_arrow.innerHTML = 'play_arrow'
        big_play_btn.style.display = 'flex'
        isLoading = false;
        clearInterval(timer)
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
    videoPlayer.muted = !videoPlayer.muted;
    volume_muted.innerHTML = videoPlayer.muted ? 'volume_off' : 'volume_up';
    videoPlayer.volume = (videoPlayer.muted ? 0 : 50) / 100;
    volume_control_inp.value = videoPlayer.muted ? 0 : 50;
}

// 聲音大小聲
function volumeControl(event) {
    videoPlayer.volume = event.target.value / 100
    videoPlayer.muted = event.target.value === 0 ? true : false;
}

// 移動時間點
function timeControl(event) {
    console.log('timechange', event.target.value)
    clearInterval(timer);
    videoPlayer.currentTime = event.target.value;
    currentTime.innerHTML = moment.duration(videoPlayer.currentTime, 'seconds').format()
}

// 放大/縮小
function fullScreen() {

    if (isFullScreen) {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            isFullScreen = !isFullScreen;
            zoom_map.innerHTML = 'zoom_out_map'
        }
    } else {
        if (videoWindow.webkitRequestFullscreen) {
            console.log('use webkitRequestFullscreen')
            videoWindow.webkitRequestFullscreen()
            isFullScreen = !isFullScreen;
            zoom_map.innerHTML = 'zoom_in_map'
        } else if (videoWindow.requestFullscreen) {
            console.log('use requestFullscreen')
            videoWindow.requestFullscreen()
            isFullScreen = !isFullScreen;
            zoom_map.innerHTML = 'zoom_in_map'
        } else if (videoWindow.msRequestFullscreen) {
            console.log('use msRequestFullscreen')
            videoWindow.msRequestFullscreen()
            isFullScreen = !isFullScreen;
            zoom_map.innerHTML = 'zoom_in_map'
        }
    }
    console.log(isFullScreen)
}

// 打開設定
function speedSetting(e) {
    e.stopPropagation()
    showSetting = !this.showSetting;
    speed_setting.style.display = speed_setting.style.display === 'block' ? 'none' : 'block';
}

// 調整播放速度
function setPlaySpeed(value) {
    console.log(value)
    if(value !== 1){
        speed_text.innerHTML = `Speed: ${value}`;
    } else {
        speed_text.innerHTML = null;
    }
    videoPlayer.playbackRate = value;
    videoSpeed = value;
    speed_setting.style.display = speed_setting.style.display === 'block' ? 'none' : 'block';
}

// 擷取畫面及上傳到圖片暫存區
function getVideoMarker() {
    console.log(image)
    file = base64toFile(image);
    // file upload api
    let remake = ''
    let secondtime = videoPlayer.currentTime;
    console.log(videoPlayer.currentTime)
    videoMarkers.push({ imgName: file.name, currentTime: moment.duration(videoPlayer.currentTime, 'seconds').format('hh:mm:ss:SS', { trim: false }), secondTime: secondtime, remake: '', imgUrl: '' })
    console.log(videoMarkers)

    let html = `
        <div style="margin-right:10px;width:200px;">
            <div style="width:200px;height:120px;">
                <img style="width:100%;height:100%;object-fit: cover;" src="${image}" alt=""
                    onclick="jumpSpecifiedFragment(${secondtime})">
            </div>
            <p>time: ${moment.duration(videoPlayer.currentTime, 'seconds').format('hh:mm:ss:SS', { trim: false })}</p>
            <textarea rows="4" style="width:100%;max-width:200px;max-height:80px;" placeholder="備註">${remake}</textarea>
            <div style="text-align: right;">
                <button style="width:40px !important;height:40px;padding: 0" onclick="deleteFragment()">
                    <span class="material-icons">
                        delete
                    </span>
                </button>
            </div>
        </div>
    `
    videoImage_view.innerHTML += html;

}

function base64toFile(dataURI) {
    console.log(dataURI)
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
    let index = imageIndex + 1;
    index = String(index).padStart(4, '0')

    console.log(index)
    // 生成文件对象
    return new File([ia], `${moment().format('YYYYMMDD')}${index}.png`, { type: mime })
}

// 跳至marker時間點
function jumpSpecifiedFragment(time) {
    videoPlayer.currentTime = time;
    video_progress_inp.value = videoPlayer.currentTime;
    currentTime.innerHTML = moment.duration(videoPlayer.currentTime, 'seconds').format({trim: false})
    clearInterval(timer);
}

// 刪除marker
function deleteFragment(index) {
    videoMarkers.splice(index, 1)
}