// ==UserScript==
// @name         pic_box href index → silde
// @namespace    https://tampermonkey.net/
// @version      2026-05-12
// @icon         https://wnacg.com/favicon.ico
// @description  Replace "index" with "slide" in hrefs + mobile layout optimize
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
// @downloadURL  https://raw.githubusercontent.com/Chihaya7/Database/refs/heads/master/pic_box%20href%20index%20%E2%86%92%20sild.user.js
// @updateURL    https://raw.githubusercontent.com/Chihaya7/Database/refs/heads/master/pic_box%20href%20index%20%E2%86%92%20sild.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // =========================
    // 提前注入 CSS
    // =========================

    const style = document.createElement('style');

    style.textContent = `
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
            grid-template-rows: auto auto !important;

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
    padding-top: 0 !important;
    margin-top: 34px !important;
    height: auto !important;
    align-self: start !important;
}
        /* 底部信息 */
        #classify_container > li .info {

            grid-column: 2 !important;
            grid-row: 3 !important;

            /* 固定到底部 */
            align-self: end !important;

            display: block !important;

            font-size: 12px !important;
            color: #999 !important;

            line-height: 1.5 !important;

            white-space: normal !important;
            word-break: break-word !important;

            overflow: visible !important;

            margin-bottom : 15px !important;

            /* 提示可点击 */
            cursor: pointer !important;
        }

        /* 防止原站双列 */
        #classify_container.col_2 > li {
            width: 100% !important;
        }

        /* 清除原站高度 */
        #classify_container > li .autoHeight {
            height: auto !important;
        }
    }

    /* =========================
       topImgCon 样式
    ========================= */

    /* 整个卡片 */
    #topImgCon .itemBox{

        all: unset;

        display: flex;
        gap: 6px;

        width: 100%;
        padding: 6px;

        box-sizing: border-box;

        position: relative;

        border-bottom: 1px solid #ddd;

        align-items: flex-start;

        overflow: hidden;

        clear: both;
    }

    /* 左侧图片区域 */
    #topImgCon .itemImg{
        width: 200px;
        flex-shrink: 0;

        height: auto;
    }

    /* 图片 */
    #topImgCon .itemImg img{
        width: 100%;
        height: auto;

        display: block;

        border-radius: 6px;
    }

    /* 右侧文字区域 */
    #topImgCon .itemTxt{
        flex: 1;

        display: flex;
        flex-direction: column;

        min-width: 0;

        margin: 0 !important;
        padding: 0 !important;
    }

    /* 标题 */
    #topImgCon .itemTxt .title{
        height: auto !important;

        overflow: visible !important;
        white-space: normal !important;

        line-height: 1.5;

        margin: 0 !important;
        padding: 0 !important;
    }

    /* 对直接子元素清楚 float */
    #topImgCon .itemTxt > *{
        position: static !important;
        float: none !important;
    }

    /* 信息行 */
    #topImgCon .itemTxt .txtItme{
        margin: 0 0 6px 0 !important;
        padding: 0 !important;

        font-size: 13px;
        line-height: 1.4;

        color: #666;
    }

    /* 排名徽章 */
    #topImgCon .number{
        position: absolute;

        top: 10px;
        left: 10px;

        z-index: 5;

        width: 28px;
        height: 28px;

        border-radius: 50%;

        background: rgba(0,0,0,.7);
        color: #fff;

        display: flex;
        align-items: center;
        justify-content: center;

        font-size: 14px;
        font-weight: bold;
    }

    /* =========================
       Toast 提示框
    ========================= */

    .copyToast{

        position: fixed;

        left: 50%;
        bottom: 80px;

        transform: translateX(-50%);

        background: rgba(0,0,0,.8);
        color: #fff;

        padding: 10px 18px;

        border-radius: 8px;

        font-size: 14px;

        z-index: 999999;

        opacity: 0;

        transition: opacity .25s;
    }

    /* 显示状态 */
    .copyToast.show{
        opacity: 1;
    }
    `;

    document.documentElement.appendChild(style);

    // =========================
    // Toast
    // =========================

    function showToast(text) {

        // 删除旧 toast
        const old = document.querySelector('.copyToast');

        if (old) old.remove();

        // 创建 toast
        const toast = document.createElement('div');

        toast.className = 'copyToast';

        toast.textContent = text;

        document.body.appendChild(toast);

        // 下一帧显示
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // 自动隐藏
        setTimeout(() => {

            toast.classList.remove('show');

            setTimeout(() => {
                toast.remove();
            }, 250);

        }, 1500);
    }

    // =========================
    // 绑定复制点击事件
    // =========================

    function bindCopyClick(clickEl, textEl) {

        // 元素不存在直接返回
        if (!clickEl || !textEl) return;

        // 鼠标小手
        clickEl.style.cursor = 'pointer';

        clickEl.addEventListener('click', async (e) => {

            // 阻止默认行为
            e.preventDefault();

            // 阻止冒泡
            e.stopPropagation();

            try {

                // 复制文字
                await navigator.clipboard.writeText(
                    textEl.textContent.trim()
                );

                showToast('复制成功');

            } catch {

                showToast('复制失败');
            }
        });
    }

    // =========================
    // DOM 完成后执行
    // =========================

    function init() {

        // =========================
        // imgBox 处理
        // =========================

        if (document.querySelector('.imgBox')) {

            document.querySelectorAll('.imgBox li').forEach(li => {

                // 删除 cate-0
                if (li.classList.contains('cate-0')) {
                    li.remove();
                    return;
                }

                const imgA = li.querySelector('a.ImgA.autoHeight[href]');
                const txtA = li.querySelector('a.txtA');
                const info = li.querySelector('.info');

                // txtA 使用 imgA 链接
                if (imgA && txtA) {

                    txtA.href = imgA.href;
                    txtA.target = '_blank';
                }

                // 点击 info 复制 txtA 标题
                bindCopyClick(info, txtA);
            });
        }

        // =========================
        // topImgCon 处理
        // =========================

        if (document.getElementById('topImgCon')) {

            document.querySelectorAll('#topImgCon .itemBox').forEach(box => {

                const title = box.querySelector('.title');
                const dateItem = box.querySelector('.txtItme .date');
                if (title) {
                    title.target = '_blank';
                }

                // 点击日期复制标题
                bindCopyClick(dateItem, title);
            });
        }

        // =========================
        // href index → slide
        // =========================

        document.querySelectorAll(
            '.pic_box a[href], .itemImg a[href], a.ImgA.autoHeight[href]'
        ).forEach(a => {

            if (a.href.includes('index')) {

                a.href = a.href.replace(/index/g, 'slide');

                a.target = '_blank';
            }
        });
    }

    // =========================
    // 等待 DOM
    // =========================

    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', init);

    } else {

        init();
    }

})();