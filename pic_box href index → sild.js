// ==UserScript==
// @name         pic_box href index → silde
// @namespace    https://tampermonkey.net/
// @version      2025年12月14日 14:15:12
// @icon         https://wnacg.com/favicon.ico
// @description  Replace "index" with "silde" in hrefs inside .pic_box
// @match        https://www.wnacg.*
// @match        https://www.wn04.ru/*
// @match        https://www.wn05.ru/*
// @match        https://www.wnacg05.cc/*
// @updateURL https://raw.githubusercontent.com/Chihaya7/Database/refs/heads/master/pic_box%20href%20index%20%E2%86%92%20sild.js
// @updateURL https://raw.githubusercontent.com/Chihaya7/Database/refs/heads/master/pic_box%20href%20index%20%E2%86%92%20sild.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    document.querySelectorAll('.pic_box a[href]').forEach(a => {
        if (a.href.includes('index')) {
            a.href = a.href.replace(/index/g, 'slide');
        }
    });
})();
