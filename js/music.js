let server = "tencent"; //netease: 网易云音乐; tencent: QQ音乐; kugou: 酷狗音乐; xiami: 虾米; kuwo: 酷我
let type = "playlist"; //song: 单曲; playlist: 歌单; album: 唱片
let id = "8612168792"; //封面 ID / 单曲 ID / 歌单 ID

// 首先检查是否已加载APlayer和MetingJS
if (typeof APlayer === 'undefined' || typeof MetingJSElement === 'undefined') {
    // 动态加载所需的库
    $('head').append('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css">');
    $.getScript('https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.js', function() {
        $.getScript('https://cdn.jsdelivr.net/npm/meting@2.0.1/dist/Meting.min.js', function() {
            loadMusicData();
        });
    });
} else {
    loadMusicData();
}

function loadMusicData() {
    // 构建请求URL
    let apiUrl = "https://metingapi.nanorocky.top/?server=" + server + "&type=" + type + "&id=" + id;
    
    // 如果是QQ音乐，添加必要的请求头
    let ajaxConfig = {
        url: apiUrl,
        type: "GET",
        dataType: "JSON",
        success: function (response) {
            handleMusicResponse(response);
        },
        error: function (xhr, status, error) {
            handleMusicError(error);
        }
    };
    
    // 为QQ音乐添加请求头
    if (server === "tencent") {
        ajaxConfig.headers = {
            'Referer': 'https://y.qq.com/',
            'Origin': 'https://y.qq.com',
            'User-Agent': navigator.userAgent
        };
    }
    
    $.ajax(ajaxConfig);
}

function handleMusicResponse(data) {
    // 检查返回的数据格式
    let audioData;
    
    if (type === "playlist" || type === "album") {
        // 歌单或专辑返回的是歌曲列表
        audioData = data.map(song => ({
            name: song.name || song.title,
            artist: song.artist || song.author,
            url: song.url,
            cover: song.cover || song.pic,
            lrc: song.lrc || ''
        }));
    } else if (type === "song") {
        // 单曲返回的是单个歌曲对象
        audioData = [{
            name: data.name || data.title,
            artist: data.artist || data.author,
            url: data.url,
            cover: data.cover || data.pic,
            lrc: data.lrc || ''
        }];
    } else {
        // URL类型或其他
        audioData = [{
            name: '未知歌曲',
            artist: '未知歌手',
            url: data.url || '',
            cover: '',
            lrc: ''
        }];
    }
    
    // 确保audioData是数组且不为空
    if (!audioData || audioData.length === 0) {
        throw new Error('未获取到音乐数据');
    }
    
    // 初始化APlayer
    const ap = new APlayer({
        container: document.getElementById('aplayer'),
        order: 'random',
        preload: 'auto',
        listMaxHeight: '336px',
        volume: 0.5,
        mutex: true,
        lrcType: 3,
        audio: audioData,
    });
    
    setupPlayerEvents(ap);
}

function handleMusicError(error) {
    console.error('音乐加载失败:', error);
    
    // 显示错误提示
    setTimeout(function () {
        if (typeof iziToast !== 'undefined') {
            iziToast.info({
                timeout: 8000,
                icon: "fa-solid fa-circle-exclamation",
                displayMode: 'replace',
                message: '音乐播放器加载失败，尝试使用网易云音乐'
            });
        }
        
        // 自动切换到网易云音乐作为备选
        server = "netease";
        id = "3035221869"; // 网易云热门歌单ID
        loadMusicData();
    }, 1000);
}

function setupPlayerEvents(ap) {
    /* 底栏歌词 */
    const lrcInterval = setInterval(function () {
        const currentLrc = $(".aplayer-lrc-current").text();
        if (currentLrc && $("#lrc").length) {
            $("#lrc").html("<span class='lrc-show'><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='18' height='18'><path fill='none' d='M0 0h24v24H0z'/><path d='M12 13.535V3h8v3h-6v11a4 4 0 1 1-2-3.465z' fill='rgba(255,255,255,1)'/></svg>&nbsp;" + currentLrc + "&nbsp;<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' width='18' height='18'><path fill='none' d='M0 0h24v24H0z'/><path d='M12 13.535V3h8v3h-6v11a4 4 0 1 1-2-3.465z' fill='rgba(255,255,255,1)'/></svg></span>");
        }
    }, 500);

    /* 音乐通知及控制 */
    ap.on('play', function () {
        const musicName = $(".aplayer-title").text();
        const artistName = $(".aplayer-author").text();
        const music = musicName + artistName;
        
        if (typeof iziToast !== 'undefined') {
            iziToast.info({
                timeout: 4000,
                icon: "fa-solid fa-circle-play",
                displayMode: 'replace',
                message: music
            });
        }
        
        if ($("#play").length) {
            $("#play").html("<i class='fa-solid fa-pause'>");
        }
        
        if ($("#music-name").length) {
            $("#music-name").html(music);
        }
        
        if ($(document).width() >= 990) {
            $('.power').css("display", "none");
            $('#lrc').css("display", "block");
        }
    });

    ap.on('pause', function () {
        if ($("#play").length) {
            $("#play").html("<i class='fa-solid fa-play'>");
        }
        
        if ($(document).width() >= 990) {
            $('#lrc').css("display", "none");
            $('.power').css("display", "block");
        }
    });

    // 鼠标悬停控制
    if ($("#music").length) {
        $("#music").hover(function () {
            $('.music-text').css("display", "none");
            $('.music-volume').css("display", "flex");
        }, function () {
            $('.music-text').css("display", "block");
            $('.music-volume').css("display", "none");
        });
    }

    /* 一言与音乐切换 */
    if ($('#open-music').length) {
        $('#open-music').on('click', function () {
            $('#hitokoto').css("display", "none");
            $('#music').css("display", "flex");
        });
    }

    if ($("#hitokoto").length) {
        $("#hitokoto").hover(function () {
            $('#open-music').css("display", "flex");
        }, function () {
            $('#open-music').css("display", "none");
        });
    }

    if ($('#music-close').length) {
        $('#music-close').on('click', function () {
            $('#music').css("display", "none");
            $('#hitokoto').css("display", "flex");
        });
    }

    /* 上下曲控制 */
    if ($('#play').length) {
        $('#play').on('click', function () {
            ap.toggle();
            updateMusicName();
        });
    }

    if ($('#last').length) {
        $('#last').on('click', function () {
            ap.skipBack();
            ap.play();
            updateMusicName();
        });
    }

    if ($('#next').length) {
        $('#next').on('click', function () {
            ap.skipForward();
            ap.play();
            updateMusicName();
        });
    }

    // 空格键控制播放暂停
    window.onkeydown = function (e) {
        if (e.keyCode == 32) {
            e.preventDefault(); // 防止页面滚动
            ap.toggle();
        }
    }

    /* 打开音乐列表 */
    if ($('#music-open').length) {
        $('#music-open').on('click', function () {
            if ($(document).width() >= 990) {
                $('#box').css("display", "block");
                $('#row').css("display", "none");
                $('#more').css("display", "none");
            }
        });
    }

    // 音量调节
    if ($("#volume").length) {
        $("#volume").on('input propertychange touchend', function () {
            let x = $("#volume").val();
            ap.volume(x, true);
            updateVolumeIcon(x);
        });
    }

    // 辅助函数：更新音乐名称显示
    function updateMusicName() {
        if ($("#music-name").length) {
            $("#music-name").html($(".aplayer-title").text() + $(".aplayer-author").text());
        }
    }

    // 辅助函数：更新音量图标
    function updateVolumeIcon(volume) {
        if (!$("#volume-ico").length) return;
        
        if (volume == 0) {
            $("#volume-ico").html("<i class='fa-solid fa-volume-xmark'></i>");
        } else if (volume > 0 && volume <= 0.3) {
            $("#volume-ico").html("<i class='fa-solid fa-volume-off'></i>");
        } else if (volume > 0.3 && volume <= 0.6) {
            $("#volume-ico").html("<i class='fa-solid fa-volume-low'></i>");
        } else {
            $("#volume-ico").html("<i class='fa-solid fa-volume-high'></i>");
        }
    }
}
