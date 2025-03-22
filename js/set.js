/*
作者: guren
主页：https://gurbk.github.io/
GitHub：https://github.com/gurbk
版权所有，请勿删除
*/

/* 自定义配置 */
/* 尚未完善 */


// 背景图片 Cookies 
function setBgImg(bg_img) {
    if (bg_img) {
        Cookies.set('bg_img', bg_img, {
            expires: 36500
        });
        return true;
    }
    return false;
};

// 获取背景图片 Cookies
function getBgImg() {
    let bg_img_local = Cookies.get('bg_img');
    if (bg_img_local && bg_img_local !== "{}") {
        return JSON.parse(bg_img_local);
    } else {
        setBgImg(bg_img_preinstall);
        return bg_img_preinstall;
    }
}

let bg_img_preinstall = {
    "type": "5", // 1:默认背景 2:每日一图 3:随机风景 4:随机动漫 5:mc酱动漫
    "2": "https://cdn.seovx.com/?mom=302", // 随机美图
    "3": "https://api.r10086.com/%E6%A8%B1%E9%81%93%E9%9A%8F%E6%9C%BA%E5%9B%BE%E7%89%87api%E6%8E%A5%E5%8F%A3.php?%E5%9B%BE%E7%89%87%E7%B3%BB%E5%88%97=%E9%A3%8E%E6%99%AF%E7%B3%BB%E5%88%971", // 随机风景
    "4": "https://www.dmoe.cc/random.php",// 随机动漫
    "5": "https://t.alcy.cc/ycy" // mc酱动漫
};

// 更改背景图片
function setBgImgInit() {
    let bg_img = getBgImg();
    $("input[name='wallpaper-type'][value=" + bg_img["type"] + "]").click();

    switch (bg_img["type"]) {
        case "1":
            $('#bg').attr('src', `./img/background${1 + ~~(Math.random() * 10)}.webp`) //随机默认壁纸
            break;
        case "2":
            $('#bg').attr('src', bg_img_preinstall[2]); //必应每日
            break;
        case "3":
            $('#bg').attr('src', bg_img_preinstall[3]); //随机风景
            break;
        case "4":
            $('#bg').attr('src', bg_img_preinstall[4]); //随机动漫
            break;
        case "5":
            $('#bg').attr('src', bg_img_preinstall[5]); //mc酱动漫
            break;
    }
};

$(document).ready(function () {
    // 壁纸数据加载
    setBgImgInit();
    // 设置背景图片
    $("#wallpaper").on("click", ".set-wallpaper", function () {
        let type = $(this).val();
        let bg_img = getBgImg();
        bg_img["type"] = type;
        iziToast.show({
            icon: "fa-solid fa-image",
            timeout: 2500,
            message: '壁纸设置成功，刷新后生效',
        });
        setBgImg(bg_img);
    });
});
