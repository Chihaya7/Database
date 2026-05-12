// ==UserScript==
// @name         wn04 已读系统 3.1
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  漫画已读记录 + IndexedDB + 实时变灰 + 页面新增统计
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
// @downloadURL  https://raw.githubusercontent.com/Chihaya7/Database/refs/heads/master/wnRead.js
// @updateURL    https://raw.githubusercontent.com/Chihaya7/Database/refs/heads/master/wnRead.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // =========================
    // 数据库配置
    // =========================

    const DB_NAME = 'WN_READ_DB';
    const STORE_NAME = 'read';
    const DB_VERSION = 1;

    let db = null;

    // 内存已读集合（仅存id）
    let readSet = new Set();

    // 当前页面新增数量
    let currentPageAdded = 0;

    // =========================
    // 打开数据库
    // =========================

    function openDB() {
        return new Promise((resolve, reject) => {

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = function (event) {

                db = event.target.result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {

                    db.createObjectStore(STORE_NAME, {
                        keyPath: 'id'
                    });

                }
            };

            request.onsuccess = function (event) {
                db = event.target.result;
                resolve(db);
            };

            request.onerror = function (event) {
                reject(event);
            };

        });
    }

    // =========================
    // 获取全部ID
    // =========================

    function getAllIds() {

        return new Promise((resolve, reject) => {

            const tx = db.transaction(STORE_NAME, 'readonly');

            const store = tx.objectStore(STORE_NAME);

            const request = store.getAllKeys();

            request.onsuccess = function () {
                resolve(request.result.map(Number));
            };

            request.onerror = function () {
                reject(request.error);
            };

        });

    }

    // =========================
    // 获取数据库总数量
    // =========================

    function getTotalCount() {

        return new Promise((resolve, reject) => {

            const tx = db.transaction(STORE_NAME, 'readonly');

            const store = tx.objectStore(STORE_NAME);

            const request = store.count();

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error);
            };

        });

    }

    // =========================
    // 写入漫画
    // =========================

    function saveComic(id, title) {

        return new Promise((resolve, reject) => {

            const tx = db.transaction(STORE_NAME, 'readwrite');

            const store = tx.objectStore(STORE_NAME);

            const request = store.put({
                id,
                title
            });

            request.onsuccess = function () {
                resolve();
            };

            request.onerror = function () {
                reject();
            };

        });

    }

    // =========================
    // 提取漫画ID
    // =========================

    function extractId(url) {

        if (!url) return null;

        const match = url.match(/aid-(\d+)/);

        return match ? Number(match[1]) : null;

    }

    // =========================
    // 已读样式
    // =========================

    function addReadStyle() {

        const style = document.createElement('style');

        style.innerHTML = `

            .wn-read {
                opacity: 0.45 !important;
                filter: grayscale(100%) !important;
                transition: 0.2s;
            }

            .wn-read a {
                color: #888 !important;
            }

            .wn-read a:visited {
                color: #666 !important;
            }

            .wn-read-link {
                color: #777 !important;
            }

            .wn-read-link:visited {
                color: #555 !important;
            }

            #wn-read-stats{
                display:flex;
                align-items:center;
                gap:8px;

                position:absolute;
                left:115px;
                top:12px;

                font-size:13px;
                color:#999;

                z-index:9999;
                user-select:none;
            }

            #wn-read-stats span{
                display:inline-block;
                line-height:1;
            }

        `;

        document.head.appendChild(style);

    }

    // =========================
    // 标记已读
    // =========================

    function markAsRead(element) {

        if (!element) return;

        element.classList.add('wn-read');

        element.querySelectorAll('a').forEach(a => {
            a.classList.add('wn-read-link');
        });

    }

    // =========================
    // 更新顶部统计
    // =========================

    async function updateHeaderStats() {

        const total = await getTotalCount();

        const stats = document.getElementById('wn-read-stats');

        if (!stats) return;

        stats.innerHTML = `
            <span>${total}</span>
            <span>|</span>
            <span>${currentPageAdded}</span>
        `;

    }

    // =========================
    // 插入顶部统计
    // =========================

    async function createHeaderStats() {

        const header = document.querySelector('.header');

        if (!header) return;

        const stats = document.createElement('div');

        stats.id = 'wn-read-stats';

        header.appendChild(stats);

        await updateHeaderStats();

    }

    // =========================
    // 处理 albums 页面
    // =========================

    function processAlbumsPage() {

        document.querySelectorAll('#classify_container li').forEach(li => {

            const txtA = li.querySelector('.txtA');

            if (!txtA) return;

            const href = txtA.href;

            const title = txtA.textContent.trim();

            const id = extractId(href);

            if (!id) return;

            // 已读标记
            if (readSet.has(id)) {
                markAsRead(li);
            }

            // 点击记录
            li.querySelectorAll('.ImgA, .txtA').forEach(a => {

                a.addEventListener('click', async () => {

                    if (readSet.has(id)) return;

                    readSet.add(id);

                    currentPageAdded++;

                    markAsRead(li);

                    await saveComic(id, title);

                    await updateHeaderStats();

                });

            });

        });

    }

    // =========================
    // 处理 ranking 页面
    // =========================

    function processRankingPage() {

        document.querySelectorAll('#topImgCon .itemBox').forEach(box => {

            const titleA = box.querySelector('.itemTxt .title');

            if (!titleA) return;

            const href = titleA.href;

            const title = titleA.textContent.trim();

            const id = extractId(href);

            if (!id) return;

            // 已读标记
            if (readSet.has(id)) {
                markAsRead(box);
            }

            // 点击记录
            box.querySelectorAll('.itemImg a, .itemTxt .title').forEach(a => {

                a.addEventListener('click', async () => {

                    if (readSet.has(id)) return;

                    readSet.add(id);

                    currentPageAdded++;

                    markAsRead(box);

                    await saveComic(id, title);

                    await updateHeaderStats();

                });

            });

        });

    }

    // =========================
// 4.1 Gist 自动恢复
// =========================

async function fetchGistData() {

    const url = `https://api.github.com/gists/${GIST_ID}`;

    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github+json'
        }
    });

    if (!res.ok) {
        throw new Error('获取 Gist 失败');
    }

    const data = await res.json();

    const file = data.files[GIST_FILENAME];

    if (!file || !file.content) return [];

    try {
        return JSON.parse(file.content);
    } catch (e) {
        console.error('Gist JSON解析失败', e);
        return [];
    }
}


// =========================
// 写入 IndexedDB（批量）
// =========================

function bulkInsertComics(list) {

    return new Promise((resolve, reject) => {

        const tx = db.transaction(STORE_NAME, 'readwrite');

        const store = tx.objectStore(STORE_NAME);

        for (const item of list) {

            // id去重写入（天然覆盖）
            store.put(item);

        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);

    });

}
// =========================
// 4.0 GitHub Gist 自动备份
// =========================

// GitHub Token
const GITHUB_TOKEN = '改';

// Gist ID
const GIST_ID = '3fe6a98a0c34bbe53678cd47d8d919ac';

// Gist 文件名
const GIST_FILENAME = 'wn_read.json';

// 每日同步记录
const LAST_SYNC_KEY = 'wn_read_last_sync_date';


// =========================
// 获取今天日期
// =========================

function getTodayString() {

    const d = new Date();

    const y = d.getFullYear();

    const m = String(d.getMonth() + 1).padStart(2, '0');

    const day = String(d.getDate()).padStart(2, '0');

    return `${y}-${m}-${day}`;

}


// =========================
// 今日是否已同步
// =========================

function shouldSyncToday() {

    const last = localStorage.getItem(LAST_SYNC_KEY);

    return last !== getTodayString();

}


// =========================
// 标记今日已同步
// =========================

function markTodaySynced() {

    localStorage.setItem(
        LAST_SYNC_KEY,
        getTodayString()
    );

}


// =========================
// 获取全部漫画数据
// =========================

function getAllComics() {

    return new Promise((resolve, reject) => {

        const tx = db.transaction(STORE_NAME, 'readonly');

        const store = tx.objectStore(STORE_NAME);

        const request = store.getAll();

        request.onsuccess = function () {
            resolve(request.result);
        };

        request.onerror = function () {
            reject(request.error);
        };

    });

}


// =========================
// 上传 Gist
// =========================

async function backupToGist() {

    try {

        console.log('开始同步 Gist');

        // 获取全部数据
        const comics = await getAllComics();

        // 转 JSON
        const content = JSON.stringify(comics);

        // Gist API
        const url =
            `https://api.github.com/gists/${GIST_ID}`;

        // PATCH 内容
        const body = {

            files: {

                [GIST_FILENAME]: {

                    content: content

                }

            }

        };

        // 上传
        const res = await fetch(url, {

            method: 'PATCH',

            headers: {

                'Authorization': `Bearer ${GITHUB_TOKEN}`,

                'Accept': 'application/vnd.github+json',

                'Content-Type': 'application/json'

            },

            body: JSON.stringify(body)

        });

        if (!res.ok) {

            throw new Error('Gist 上传失败');

        }

        console.log('Gist 备份成功');

        markTodaySynced();

    } catch (e) {

        console.error('Gist 备份失败', e);

    }

}



// =========================
// 自动恢复入口
// =========================

async function restoreFromGistIfNeeded() {

    try {

        console.log('开始检查 Gist 恢复数据');

        const cloudData = await fetchGistData();

        if (!cloudData || cloudData.length === 0) return;

        // 当前本地数据
        const localIds = await getAllIds();
        const localSet = new Set(localIds);

        // 过滤：只补本地没有的
        const needInsert = cloudData.filter(item => !localSet.has(item.id));

        if (needInsert.length === 0) {
            console.log('无需恢复');
            return;
        }

        console.log('恢复数据条数:', needInsert.length);

        await bulkInsertComics(needInsert);

        // 更新内存
        needInsert.forEach(i => readSet.add(i.id));

        console.log('Gist恢复完成');

    } catch (e) {

        console.error('恢复失败', e);

    }

}
    // =========================
    // 初始化
    // =========================

    async function init() {

        addReadStyle();

        await openDB();

        const ids = await getAllIds();

        readSet = new Set(ids);
        // ⭐新增：先恢复云端数据
        await restoreFromGistIfNeeded();

        await createHeaderStats();

        // albums 页面
        if (document.querySelector('#classify_container')) {
            processAlbumsPage();
        }

        // ranking 页面
        if (
            location.href.includes('ranking') ||
            document.querySelector('#topImgCon .itemBox')
        ) {
            processRankingPage();
        }
        // =========================
        // 初始化时触发
        // =========================

        if (shouldSyncToday()) {

            backupToGist();

        }

    }

    init();

})();
