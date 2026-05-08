// ==UserScript==
// @name         pic_box href index → silde
// @namespace    https://tampermonkey.net/
// @version      2026-04-23 02:48:07
// @icon         https://wnacg.com/favicon.ico
// @description  Replace "index" with "silde" in hrefs inside .pic_box
// @match        https://*.wnacg.ru/*
// @match        https://*.wnacg.com/*
// @match        https://www.wn04.ru/*
// @match        https://www.wn05.ru/*
// @match        https://www.wnacg05.cc/*
// @match        https://www.wn06.ru/*
// @match        https://www.wn07.ru/*
// @match        https://www.wn01.cfd/*
// @match        https://www.wn01.shop/*
// @match        https://www.wn02.cfd/*
// @match        https://www.wn02.shop/*
// @match        https://www.wn03.cfd/*
// @match        https://www.wn03.shop/*
// @match        https://www.wn04.cfd/*
// @match        https://www.wn04.shop/*
// @downloadURL https://raw.githubusercontent.com/Chihaya7/Database/refs/heads/master/pic_box%20href%20index%20%E2%86%92%20sild.user.js
// @updateURL https://raw.githubusercontent.com/Chihaya7/Database/refs/heads/master/pic_box%20href%20index%20%E2%86%92%20sild.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    document.querySelectorAll('.pic_box a[href], .itemImg a[href], a.ImgA.autoHeight[href]').forEach(a => {
    if (a.href.includes('index')) {
        a.href = a.href.replace(/index/g, 'slide');
    }
    });

const style = document.createElement('style');

    style.innerHTML = `
    @media screen and (max-width: 768px) {

        /* 整个列表 */
        #classify_container {
            display: flex !important;
            flex-direction: column !important;

            padding: 0 !important;
            margin: 0 !important;

            gap: 12px !important;
        }

        /* 每个项目 */
        #classify_container > li {

            width: 100% !important;
            max-width: 100% !important;

            display: grid !important;
            grid-template-columns: 220px 1fr !important;
            grid-template-rows: 1fr auto !important;

            column-gap: 12px !important;

            box-sizing: border-box !important;

            padding: 10px !important;
            margin: 0 !important;

            border-bottom: 1px solid #eee !important;

            background: #fff !important;

            float: none !important;
            clear: both !important;
        }

        /* 左侧图片 */
        #classify_container > li .ImgA {

            width: 220px !important;

            grid-row: 1 / span 2 !important;
            grid-column: 1 !important;

            display: block !important;

            margin: 0 !important;
        }

        /* 图片 */
        #classify_container > li .ImgA img {

            width: 100% !important;
            height: auto !important;

            display: block !important;

            border-radius: 6px !important;

            aspect-ratio: 3 / 4 !important;
            object-fit: cover !important;
        }

        /* 标题 */
        #classify_container > li .txtA {

            grid-column: 2 !important;
            grid-row: 1 !important;

            display: block !important;

            width: 100% !important;
            min-width: 0 !important;

            font-size: 15px !important;
            line-height: 1.5 !important;

            color: #333 !important;

            white-space: normal !important;
            word-break: break-word !important;

            overflow: visible !important;
            text-overflow: unset !important;

            margin: 0 !important;
             /* 给右上角 before 标签腾位置 */
    padding-top: 34px !important;
        }

        /* 底部信息 */
        #classify_container > li .info {

            grid-column: 2 !important;
            grid-row: 2 !important;

            display: block !important;

            margin-top: 8px !important;

            font-size: 12px !important;
            color: #999 !important;
        }

        /* 防止原站双列 */
        #classify_container.col_2 > li {
            width: 100% !important;
        }

        /* 清除原站高度 */
        #classify_container > li .autoHeight {
            height: auto !important;
        }

        /* 底部信息允许换行 */
/* 信息固定到底部 */
#classify_container > li .info {

    grid-column: 2 !important;
    grid-row: 2 !important;

    align-self: end !important;

    display: block !important;

    font-size: 12px !important;
    color: #999 !important;

    line-height: 1.5 !important;

    white-space: normal !important;
    word-break: break-word !important;

    overflow: visible !important;

    margin-top: 10px !important;
}

    }
    `;

    document.head.appendChild(style);
})();
