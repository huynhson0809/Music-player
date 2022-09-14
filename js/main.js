function slider(){
    let counter = 1
    setInterval(function(){
        document.getElementById('radio'+ counter).checked = true
        counter++
        if(counter>5) {
            counter = 1
        }
    },4000)
}
slider()

const urlListSong = 'https://mp3.zing.vn/xhr/chart-realtime?songId=0&videoId=0&albumId=0&chart=song&time=-1'

// const songs = [{}]



const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY =  'HUYNHSON_KEY'

const playlist = $('.song-list')
const player = $('.playing')
const heading = $('.singer__song-playing')
const singerOfHeading = $('.singer__song')
const singerImage = $('.singer-img')
const singerImage2 = $('.singer-img-2')
const cdThumb = $('.singer-img')
const cdThumb2 = $('.singer-img-2')
const audio = $('#audio')
// const cd = $('.cd')
const playBtn =$('.fa-play')
const pauseBtn =$('.fa-pause')
const nextBtn =$('.fa-forward-step')
const preBtn =$('.fa-backward-step')
const progress = $('.music-playing')
const randomBtn = $('.fa-shuffle')
const repeatBtn = $('.fa-repeat')
const heartBtn = $('.fa-heart.playing__icon')
const timeEnd = $('.playing__time-end')
const volumeDown = $('.fa-volume-off')
const volumeOff = $('.fa-volume-xmark')
const volumeUp = $('.fa-colume-high')
const volume = $('#volume')
const searchInput = $('.search-input')

const cd = $('.singer-mobile')
// const cors = require('cors')


// let keySearch
let min,sec

loadSongs(urlListSong)
async function loadSongs(url){
    const res = await fetch(url)
    const resData = await res.json()
    const song2s = resData.data.song
    const songs = song2s
    
    const app = {
        currentIndex: 0,
        isPlaying: false,
        isRandom: false,
        isRepeat: false,
        isHeart: false,
        isMute: false,
        keySearch: '',
        config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
        setConfig: function(key,value){
            this.config[key] = value            
            localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
        },
        songs, 
        render: function(){
            const htmls = this.songs.map((song,index) => {
                min = Math.floor(Number(song.duration)/60)
                sec = Number(song.duration) - min*60
                // console.log(Number(song.duration))
                return `
                <li class="song__item" data-index = "${index}">
                    <span class="song__item-order">${song.position}</span>
                    <i class="fa-solid fa-music item__icon"></i>
                    <img src="${song.thumbnail}" alt="Song Image" class="song__img">
                    <span class="song__item-title">${song.title}</span>
                    <span class="song__item-playing">${song.total}</span>
                    <span class="song__item-time">${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}</span>
                    <span class="song__item-album">${song.artists[0].name}</span>
                </li>`
            })
    
            playlist.innerHTML = htmls.join('')
        },
        defineProperties: function(){
            Object.defineProperty(this,'currentSong',{
                get: function(){
                    return this.songs[this.currentIndex]
                }
            })
        },
        // Phương thức này cho phép chúng ta khai báo thuộc tính mới, hoặc thay đổi một thuộc tính đã có của một object bằng cách sử dụng property descriptors
        handleEvents: function(){
            const _this = this
            //xử lý phóng to thu nhỏ Cd
            const cdWidth = cd.offsetHeight
            // console.log(cdWidth)
    
            // xử lý Cd quay/dừng
            const cdThumbAnimate = cdThumb.animate([
                {
                    transform: 'rotate(360deg)'
                }],
                {
                    duration: 10000, //10 seconds
                    iterations: Infinity
                }
            )
            // cdThumbAnimate.play()
                cdThumbAnimate.pause()

            //Xử lý cd quay dừng với mobile
            const cdThumbAnimate2 = cdThumb2.animate([
                {
                    transform: 'rotate(360deg)'
                }],
                {
                    duration: 10000, //10 seconds
                    iterations: Infinity
                }
            )
            // cdThumbAnimate.play()
                cdThumbAnimate2.pause()

            //Xử lý khi kéo lên kéo xuống list songs
            document.onscroll = function() {
                if(screen.width <= 1023){
                    const scrollTop = window.scrollY || document.documentElement.scrollTop
                    // console.log(cdWidth )
                    const newCdWidth = (cdWidth + 99 - scrollTop )
                    // console.log(newCdWidth)
                    player.style.top =  newCdWidth > 94 ? newCdWidth + 'px' : '94px'
                    // console.log(newCdWidth)
                    cd.style.opacity = newCdWidth / cdWidth
                }
            }
    
            //Xử lý khi nhấn vào heart
            heartBtn.onclick = function() {
                if(_this.isHeart === false){
                    heartBtn.classList.add('active')
                    _this.isHeart = true
                    _this.setConfig('isHeart',true)
                }
                else {
                    heartBtn.classList.remove('active')
                    _this.isHeart = false
                    _this.setConfig('isHeart',false)
                }
            }
            
            //xử lí khi click play
            playBtn.onclick = function() {
                if(_this.isPlaying == false){
                    audio.pause()
                    setTimeout(function(){
                        audio.play()
                    },100)
                }
            }
            
            //Khi song được play
            audio.onplay = function() {
                player.classList.add('active')
                _this.isPlaying = true
                cdThumbAnimate.play()
                cdThumbAnimate2.play()
                audio.volume = volume.value/100
            }
    
            pauseBtn.onclick = function() {
                if(_this.isPlaying){
                    audio.pause()
                }
            }
            // Khi song bị pause
            audio.onpause = function() {
                player.classList.remove('active')
                _this.isPlaying = false
                cdThumbAnimate.pause()
                cdThumbAnimate2.pause()
            }
    
            // //khi chạy audio
            audio.ontimeupdate = function(){
                const progressPercent = Math.floor(audio.currentTime/audio.duration *100)
                if(audio.currentTime == 0){
                    progress.value = 0
                }
                else {
                    progress.value = progressPercent
                }
            }
    
    
            // //Xử lí khi tua song
            progress.onchange = function(e) {
                const seekTime = (audio.duration * e.target.value/100)
                audio.currentTime = seekTime
            }
    
            //khi next song
            nextBtn.onclick = function(){
                if(_this.isRandom){
                    _this.randomSong()
                }
                else {
                    _this.nextSong()
                }
                audio.pause()
                setTimeout(function(){
                    audio.play()
                },100)
            }
    
            //khi pre song
            preBtn.onclick = function(){
                if(_this.isRandom){
                    _this.randomSong()
                }
                else {
                    _this.preSong()
                }
                audio.pause()
                setTimeout(function(){
                    audio.play()
                },100)
            }
    
            // //khi random song
            randomBtn.onclick = function(){
                _this.isRandom = !_this.isRandom
                _this.setConfig('isRandom', _this.isRandom)
                randomBtn.classList.toggle('active',_this.isRandom)
                //Đối số thứ 2 nếu true thì add, false thì ngược lại
            }
    
            // //khi ended song
            audio.onended = function() {
                if(_this.isRepeat == true){
                    audio.pause()
                    setTimeout(function(){
                        audio.play()
                    },100)
                }
                else{
                    nextBtn.click()
                }
            }
            // //khi repeat song 
            repeatBtn.onclick = function(){
                _this.isRepeat = !_this.isRepeat
                _this.setConfig('isRepeat',_this.isRepeat)
                repeatBtn.classList.toggle('active',_this.isRepeat)
            }
    
            //lắng nghe hành động click vào bài hát
            playlist.onclick = function(e){
                const songNode = e.target.closest('.song__item:not(.active')
                console.log(songNode)
                // const songOption = e.target.closest('.option')
                if(songNode){
                    //xử lý khi click vào song
                    //dùng phương thức dataset trong JS
                    _this.currentIndex = songNode.dataset.index
                    //hoặc _this.currentIndex = songNode.getAttribute('data-index')
                    _this.loadCurrentSong()
                    audio.pause()
                    setTimeout(function(){
                        audio.play()
                    },100)
                }
            }

            // Lắng nghe hành động tắt âm thanh
            volumeDown.onclick = function(){
                if(_this.isMute === false ){
                    volumeDown.classList.remove('active')
                    volumeOff.classList.add('active')
                    _this.isMute = true
                    // _this.setConfig('isMute',true)
                    audio.volume = 0
                }
            }

            // lắng nghe hành động bật âm thanh
            volumeOff.onclick = function() {
                if(_this.isMute ){
                    volumeDown.classList.add('active')
                    volumeOff.classList.remove('active')
                    _this.isMute = false
                    // _this.setConfig('isMute',false)
                    audio.volume = volume.value/100
                }
            }
            
            // lắng nghe và xử lý hành động tua âm thanh
            volume.onchange = function(e) {
                // console.log(e.target.value)
                const seekVolume = (e.target.value/100)
                audio.volume = seekVolume
                if(audio.volume === 0){
                    volumeDown.click()
                }
                else {
                    volumeOff.click()
                }
            }

            //lắng nghe hành động nhập tìm kiếm bài hát
            searchInput.onchange = function(e){
                // _this.keySearch = e.target.value
                console.log(e.target.value)
                // _this.findSong(e.target.value)
            }
            
        },

        // 
        scrollTopToActiveSong: function(){
            setTimeout(() => {
                $('.song__item.active').scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                })
            }, 500)
        },

        loadCurrentSong: async function() {
            const code = this.currentSong.code
            // console.log(code)
            // let resData
            const urlSong =`https://mp3.zing.vn/xhr/media/get-source?type=audio&key=${code}`
            const res = await fetch(urlSong)
            const resData = await res.json()
            const song = resData.data.source["128"]
            audio.src  = song
            heading.textContent = this.currentSong.title
            singerOfHeading.textContent = this.currentSong.artists[0].name
            singerImage.src = this.currentSong.thumbnail || this.currentSong.artist.thumbnail  
            singerImage2.src = this.currentSong.thumbnail || this.currentSong.artist.thumbnail  

            min = Math.floor(Number(this.currentSong.duration)/60)
            sec = Number(this.currentSong.duration) - min*60
            timeEnd.textContent = `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`
            // console.log(heading, cdThumb, audio)
            this.activeSong()
            
            
        },
    
        nextSong: function() {
            this.currentIndex++
            if(this.currentIndex >= this.songs.length) {
                this.currentIndex = 0
            }
            this.loadCurrentSong()
        },
        preSong: function() {
            this.currentIndex--
            if(this.currentIndex < 0) {
                this.currentIndex = this.songs.length - 1
            }
            this.loadCurrentSong()
        },
        randomSong: function() {
            let newIndex
            do {
                newIndex = Math.floor(Math.random() * this.songs.length)
            }
            while(this.currentIndex === newIndex)
            this.currentIndex = newIndex
            this.loadCurrentSong()
        },
        activeSong: function(){
            const currentHeading = $('.singer__song-playing')
            const currentSongs = $$('.song__item')
            const songTitle = $$('.song__item-title')
            songTitle.forEach((song,index) => {
                const lenghHeading = currentHeading.innerText.length
                const songTitle = song.innerText.slice(0,lenghHeading)
                if(songTitle === currentHeading.innerText) {
                    currentSongs[index].classList.add('active')
                }
                else {
                    currentSongs[index].classList.remove('active')
                }
            })
            if(screen.width < 1023) {
                this.scrollTopToActiveSong()
            }
        },
        // findSong: async function(value){
        //     const urlFindSong = `http://mp3.zing.vn/xhr/recommend?type=audio&id=ZW67OIA0`
        //     const res = await fetch(urlFindSong)
        //     const resData = await res.json()
        //     console.log(resData)
        // },  
        loadConfig: function(){
            this.isRandom = this.config.isRandom
            this.isRepeat = this.config.isRepeat
            this.isHeart = this.config.isHeart
            // this.isMute = this.config.isMute
        },
        start : function() {
            // //load config
            this.loadConfig()
            // //định nghĩa các thuộc tính cho object
            this.defineProperties()
            // //lắng nghe/ xử lí các sự kiện (DOM events)
            this.handleEvents()
    
            // //taỉ thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
            this.loadCurrentSong()
            // //render playlist
            this.render()
            
            //find song
            // console.log(this.keySearch)
            // this.findSong()

            //load recent song
            // this.loadRecentSong()

            // //hiển thị random hay repeat lúc ban đầu
            repeatBtn.classList.toggle('active',this.isRepeat)
            randomBtn.classList.toggle('active',this.isRandom)
            // volume.classList.toggle('active',this.isMute)
            heartBtn.classList.toggle('active',this.isHeart)
        }
        
    }
    
    app.start()
    
    // app.use(cors())
    // console.log(songs)
}


