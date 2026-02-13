// ==UserScript==
// @name         Manga Canvas Hunter V20.0 Final
// @version      20.0
// @description  UI折叠设置 + 详细教程 + 全代码注释 + 核心防弹逻辑 (修复暂停按钮UI不刷新)
// @author       Gemini & You
// @match        https://takecomic.jp/episodes/*
// @match        *://*.comic-days.com/episode/*
// @match        *://*.shonenjumpplus.com/episode/*
// @match        *://*.tonarinoyj.jp/episode/*
// @match        *://*.magapoke.com/episode/*
// @match        *://*.mangacross.jp/comics/*
// @match        *://*.comic-walker.com/contents/viewer/*
// @grant        none
// @require      https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js
// @require      https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // 1. 配置与状态初始化 (Config & State)
    // ==========================================
    const DEFAULT_CONFIG = {
        isHQ: false,             // 高画质(PNG)开关
        isPaused: false,         // 暂停自动采集
        isManualMode: false,     // 手动模式开关
        skipHashOnManual: true,  // 手动模式下是否忽略查重
        isCollapsed: false,      // 面板默认折叠状态
        panelOpacity: 0.8,       // 面板默认透明度
        highlightColor: '#00ff00', // 反馈颜色
        highlightWidth: '4',     // 边框粗细
        feedbackStyle: 'box',    // 反馈样式 (box/check/emoji)
        feedbackSize: 0.5,       // 图标大小比例
        feedbackOpacity: 0.8,    // 反馈动画透明度
        showFeedback: true,      // 是否显示反馈
        maxCachePages: 500       // 最大缓存页数
    };

    // 读取本地存储配置，如果没有则使用默认值
    let cfg = JSON.parse(localStorage.getItem('tc_v20_cfg')) || DEFAULT_CONFIG;
    const saveCfg = () => localStorage.setItem('tc_v20_cfg', JSON.stringify(cfg));

    // 运行时状态容器
    const STATE = { 
        images: [],              // 存储已捕获的 Blob 对象
        hashes: new Set(),       // 哈希池，用于去重
        observed: new WeakSet(), // 记录已观察的 Canvas 元素
        queue: [],               // 处理队列
        processing: 0,           // 当前正在处理的任务数
        totalSizeBytes: 0,       // 总内存占用
        mousePos: { x: 0, y: 0 } // 实时鼠标坐标（用于穿透查找）
    };

    // ==========================================
    // 2. 样式注入 (CSS Injection)
    // ==========================================
    const styleSheet = document.createElement("style");
    styleSheet.innerText = `
        /* 动画定义 */
        @keyframes tc-pop { 0% { opacity: 0; transform: scale(0.5); } 50% { opacity: var(--fb-op); transform: scale(1.1); } 100% { opacity: 0; transform: scale(1.2); } }
        @keyframes tc-border-glow { 0% { opacity: 0; } 50% { opacity: var(--fb-op); } 100% { opacity: 0; } }
        
        /* 反馈节点样式 */
        .tc-fb-node { pointer-events: none; position: fixed; z-index: 2147483647; display: flex; align-items: center; justify-content: center; box-sizing: border-box !important; }
        .tc-anim-pop { animation: tc-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .tc-anim-box { animation: tc-border-glow 0.6s ease-out forwards; }
        
        /* 面板内部样式 */
        .tc-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; font-size: 11px; color: #444; }
        .tc-row input[type="range"] { width: 60px; height: 4px; cursor: pointer; }
        
        /* 折叠菜单样式 */
        .tc-accordion-header { font-size: 11px; color: #2196F3; font-weight: bold; padding: 6px 0; border-bottom: 1px solid #e3f2fd; cursor: pointer; user-select: none; display: flex; justify-content: space-between; }
        .tc-accordion-header:hover { background-color: #f5f9ff; }
        .tc-accordion-content { display: none; padding-top: 8px; padding-bottom: 4px; }
        .tc-accordion-content.active { display: block; animation: fadeIn 0.3s; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* 面板整体交互 */
        #tc-panel { transition: opacity 0.2s, width 0.3s; }
        #tc-panel:hover { opacity: 1 !important; }
    `;
    document.head.appendChild(styleSheet);

    // ==========================================
    // 3. 核心功能逻辑 (Core Logic)
    // ==========================================

    /**
     * 计算 Canvas 指纹 (Hash)
     * 策略：取画面中 5 个关键点（中心+四角附近）的像素值混合计算
     * 容错：如果遇到跨域 Canvas (Tainted)，则使用位置+尺寸作为指纹
     */
    function getCanvasFingerprint(canvas) {
        const w = canvas.width, h = canvas.height, ctx = canvas.getContext('2d');
        if (!ctx) return `no_ctx_${w}x${h}_${Math.random()}`;
        try {
            const pts = [[w*0.5,h*0.5],[w*0.1,h*0.1],[w*0.9,h*0.1],[w*0.1,h*0.9],[w*0.9,h*0.9]];
            let hash = 0;
            pts.forEach(([x, y]) => {
                const d = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
                for(let i=0; i<4; i++) hash = (Math.imul(hash, 31) + d[i]) | 0;
            });
            return `${w}x${h}_${(hash >>> 0).toString(36)}`;
        } catch(e) {
            // 跨域污染保底方案
            const rect = canvas.getBoundingClientRect();
            return `tainted_${w}x${h}_${Math.floor(rect.top)}`;
        }
    }

    /**
     * 播放视觉反馈
     * 逻辑：根据设置样式生成 div 覆盖在 canvas 上，播放 CSS 动画后自毁
     */
    function playFeedback(canvas) {
        if (!cfg.showFeedback || !canvas) return;
        const rect = canvas.getBoundingClientRect();
        // 视口外不播放,节省性能
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;

        const node = document.createElement('div');
        node.className = 'tc-fb-node';
        node.style.cssText = `top:${rect.top}px; left:${rect.left}px; width:${rect.width}px; height:${rect.height}px; --fb-op:${cfg.feedbackOpacity};`;

        if (cfg.feedbackStyle === 'box') {
            node.className += ' tc-anim-box';
            node.style.border = `${cfg.highlightWidth}px solid ${cfg.highlightColor}`;
            node.style.boxShadow = `inset 0 0 15px ${cfg.highlightColor}`;
        } else {
            node.className += ' tc-anim-pop';
            const content = cfg.feedbackStyle === 'check' ? `<span style="color:${cfg.highlightColor}; filter:drop-shadow(0 0 5px rgba(0,0,0,0.2));">✔</span>` : '😋';
            node.innerHTML = `<span style="font-size:${rect.width * cfg.feedbackSize}px;">${content}</span>`;
        }
        document.body.appendChild(node);
        setTimeout(() => node.remove(), 600);
    }

    /**
     * 将 Canvas 加入处理队列
     * @param {HTMLCanvasElement} canvas 目标元素
     * @param {boolean} isForced 是否为手动强制触发
     */
    function enqueueCapture(canvas, isForced = false) {
        // 基础过滤：太小的图或者是自动模式下已暂停
        if (!canvas || canvas.width < 200 || (cfg.isPaused && !isForced)) return;

        // 【关键】手动触发立即反馈，不经过任何异步等待，确保手感
        if (isForced) playFeedback(canvas);

        const fp = getCanvasFingerprint(canvas);
        
        // 查重逻辑：如果已存在且不忽略查重，则退出
        if (STATE.hashes.has(fp) && !(isForced && cfg.skipHashOnManual)) return;

        // 【关键】自动模式防抖：入队前先占位，防止快速滚动时重复入队
        if (!isForced) {
            if (cfg.isManualMode) return; // 自动模式下，如果开了手动开关，则不抓取
            STATE.hashes.add(fp);
        }

        if (STATE.images.length >= cfg.maxCachePages) return;
        STATE.queue.push({canvas, isForced, fp});
        processQueue();
    }

    // 队列处理器：控制并发数，防止浏览器卡死
    function processQueue() {
        if (STATE.processing < 2 && STATE.queue.length > 0) {
            STATE.processing++;
            const t = STATE.queue.shift();
            canvasToBlob(t.canvas, t.isForced, t.fp);
        }
        updateUI();
    }

    // 转换核心：Canvas -> Blob
    function canvasToBlob(canvas, isForced, fp) {
        canvas.toBlob((blob) => {
            STATE.processing--; processQueue();
            if (!blob) return;
            
            // 二次查重：防止异步间隙的重复（主要针对手动强制模式的复杂情况）
            if (isForced && !cfg.skipHashOnManual && STATE.hashes.has(fp)) return;

            if (isForced) STATE.hashes.add(fp);
            STATE.totalSizeBytes += blob.size;
            STATE.images.push({ blob, ext: cfg.isHQ ? 'png' : 'jpg', hash: fp });
            updateUI();
            
            // 自动模式在保存成功后播放反馈
            if (!isForced) playFeedback(canvas); 
        }, cfg.isHQ ? 'image/png' : 'image/jpeg', 0.9);
    }

    // ==========================================
    // 4. UI 构建与交互 (UI Construction)
    // ==========================================
    function createUI() {
        if(document.getElementById('tc-panel')) return;
        const panel = document.createElement('div');
        panel.id = 'tc-panel';
        panel.style.cssText = `position:fixed; top:20px; right:20px; z-index:2147483640; background:white; width:${cfg.isCollapsed?'120px':'240px'}; border-radius:14px; box-shadow:0 10px 30px rgba(0,0,0,0.15); font-family:system-ui, sans-serif; opacity:${cfg.panelOpacity}; border:1px solid #eee; overflow:hidden;`;
        
        panel.innerHTML = `
            <div id="tc-header" style="background:#2196F3; color:white; padding:12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center; font-weight:bold; font-size:12px;">
                <span>HUNTER V20.0</span><span id="tc-arrow">${cfg.isCollapsed?'▼':'▲'}</span>
            </div>

            <div id="tc-body" style="padding:15px; display:${cfg.isCollapsed?'none':'block'}; position:relative;">
                
                <span id="btn-settings" style="position:absolute; top:12px; right:15px; cursor:pointer; font-size:16px; z-index:10;" title="设置">⚙️</span>

                <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:12px;">
                    <div><span id="tc-count" style="font-size:32px; font-weight:bold; color:#2196F3;">0</span><small style="color:#999; margin-left:4px;">pages</small></div>
                    <div id="tc-memory" style="font-size:10px; color:#888; margin-bottom:5px; margin-right:25px;">0.0 MB</div>
                </div>

                <button id="btn-manual-act" style="width:100%; padding:10px; background:#e3f2fd; color:#2196F3; border:2px dashed #2196F3; border-radius:8px; cursor:pointer; font-weight:bold; margin-bottom:10px; display:${cfg.isManualMode?'block':'none'};">🎯 暴力抓取当前页</button>
                
                <button id="btn-pause" style="width:100%; padding:10px; border:none; border-radius:8px; cursor:pointer; font-weight:bold; margin-bottom:10px; background:${cfg.isPaused?'#ff9800':'#4CAF50'}; color:white; display:${cfg.isManualMode?'none':'block'};">
                    ${cfg.isPaused ? '▶ 恢复自动抓取' : '⏸ 暂停自动抓取'}
                </button>
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:10px;">
                    <button id="btn-undo" style="padding:8px; background:#f5f5f5; border:1px solid #ddd; border-radius:6px; cursor:pointer; font-size:11px;">↩ 撤销</button>
                    <button id="btn-clear" style="padding:8px; background:#fff1f0; border:1px solid #ffa39e; border-radius:6px; cursor:pointer; font-size:11px; color:#f5222d;">🗑 清空</button>
                </div>
                
                <button id="btn-dl" style="width:100%; padding:12px; background:#2196F3; color:white; border:none; border-radius:8px; cursor:pointer; font-weight:bold; margin-bottom:12px;">💾 下载 ZIP 压缩包</button>
                
                <div id="btn-hq-toggle" style="font-size:11px; color:#2196F3; cursor:pointer; text-align:center; padding:7px; background:#f0f7ff; border-radius:8px; border:1px dashed #2196F3;">画质方案: <b>${cfg.isHQ ? 'PNG' : 'JPG'}</b></div>
                
                <div id="tc-settings" style="display:none; margin-top:15px; border-top:1px solid #eee;">
                    
                    <div class="tc-accordion-header"><span>🛡️ 采集模式方案</span><span>▼</span></div>
                    <div class="tc-accordion-content">
                        <div class="tc-row"><span>启用手动模式</span><input type="checkbox" id="cfg-manual" ${cfg.isManualMode?'checked':''}></div>
                        <div class="tc-row"><span>手动强制忽略查重</span><input type="checkbox" id="cfg-skip-hash" ${cfg.skipHashOnManual?'checked':''}></div>
                        <div style="font-size:9px; color:#999;">开启手动模式将隐藏自动暂停按钮。</div>
                    </div>

                    <div class="tc-accordion-header"><span>🎨 视觉反馈设置</span><span>▼</span></div>
                    <div class="tc-accordion-content">
                        <div class="tc-row"><span>显示反馈动画</span><input type="checkbox" id="cfg-show-fb" ${cfg.showFeedback?'checked':''}></div>
                        <div class="tc-row"><span>样式</span><select id="cfg-style"><option value="box" ${cfg.feedbackStyle==='box'?'selected':''}>丝滑边框</option><option value="check" ${cfg.feedbackStyle==='check'?'selected':''}>对号✔</option><option value="emoji" ${cfg.feedbackStyle==='emoji'?'selected':''}>表情😋</option></select></div>
                        <div class="tc-row"><span>透明度</span><input type="range" id="cfg-fb-op" min="1" max="10" value="${cfg.feedbackOpacity*10}"></div>
                        <div class="tc-row"><span>粗细/大小</span><input type="range" id="cfg-fb-size" min="1" max="15" value="${cfg.feedbackStyle==='box'?cfg.highlightWidth:cfg.feedbackSize*10}"></div>
                        <div class="tc-row" id="color-row"><span>颜色</span><input type="color" id="cfg-color" value="${cfg.highlightColor}"></div>
                    </div>

                    <div class="tc-accordion-header"><span>⚙️ 系统参数限制</span><span>▼</span></div>
                    <div class="tc-accordion-content">
                        <div class="tc-row"><span>缓存上限 (页)</span><span><input type="number" id="cfg-max-pages" value="${cfg.maxCachePages}" style="width:40px;"></span></div>
                    </div>
                    
                    <button id="btn-tutorial" style="width:100%; margin-top:10px; padding:6px; border:1px solid #2196F3; background:white; color:#2196F3; border-radius:4px; font-size:10px; cursor:pointer;">📖 新手必读 / 详细教程</button>
                </div>
            </div>`;
        document.body.appendChild(panel);
        bindEvents();
    }

    function bindEvents() {
        const $ = id => document.getElementById(id);
        
        // UI 更新函数：负责界面的显隐联动
        const updatePanelUI = () => {
            $('tc-body').style.display = cfg.isCollapsed ? 'none' : 'block';
            $('tc-panel').style.width = cfg.isCollapsed ? '120px' : '240px';
            $('tc-arrow').textContent = cfg.isCollapsed ? '▼' : '▲';
            $('color-row').style.display = cfg.feedbackStyle === 'emoji' ? 'none' : 'flex';
            
            // 模式切换按钮联动
            $('btn-pause').style.display = cfg.isManualMode ? 'none' : 'block';
            $('btn-manual-act').style.display = cfg.isManualMode ? 'block' : 'none';
            
            // 收起面板时强制关闭设置菜单
            if(cfg.isCollapsed) $('tc-settings').style.display = 'none';
        };

        // 【修复】更新暂停按钮UI的独立函数
        const updatePauseButtonUI = () => {
            const btnPause = $('btn-pause');
            if(btnPause) {
                btnPause.textContent = cfg.isPaused ? '▶ 恢复自动抓取' : '⏸ 暂停自动抓取';
                btnPause.style.background = cfg.isPaused ? '#ff9800' : '#4CAF50';
            }
        };

        // 基础交互
        $('tc-header').onclick = () => { cfg.isCollapsed = !cfg.isCollapsed; updatePanelUI(); saveCfg(); };
        $('btn-settings').onclick = () => { const s = $('tc-settings'); s.style.display = s.style.display==='none'?'block':'none'; };
        
        // 手风琴折叠逻辑
        document.querySelectorAll('.tc-accordion-header').forEach(header => {
            header.onclick = function() {
                const content = this.nextElementSibling;
                const isActive = content.classList.contains('active');
                // 关闭其他所有
                document.querySelectorAll('.tc-accordion-content').forEach(c => c.classList.remove('active'));
                // 切换当前
                if(!isActive) content.classList.add('active');
            };
        });

        // 教程弹窗
        $('btn-tutorial').onclick = () => {
            const msg = `📚 Manga Canvas Hunter 教程\n\n` +
                        `1. 【自动模式】(默认)：\n   脚本会自动侦测屏幕上的漫画 Canvas 并抓取。适合大多数情况。\n\n` +
                        `2. 【手动模式】：\n   在设置中开启。开启后自动抓取暂停。\n   - 点击"🎯 暴力抓取"按钮抓取屏幕中心的图。\n   - 按键盘 [D] 键抓取鼠标指向的图。\n\n` +
                        `3. 【常见问题】：\n   - 如果 D 键没反应，可能是被透明层挡住了，脚本已内置穿透功能，请确保鼠标放在漫画上。\n   - 如果遇到"虚空"反馈，请调整"忽略查重"设置。\n\n` +
                        `4. 【防弹逻辑】：\n   已内置防重复、防跨域报错、防遮罩层拦截机制。`;
            alert(msg);
        };

        // 【修复】暂停按钮点击事件 - 直接调用独立的更新函数
        $('btn-pause').onclick = () => { 
            cfg.isPaused = !cfg.isPaused; 
            updatePauseButtonUI();  // 立即更新按钮UI
            saveCfg(); 
        };
        
        $('btn-hq-toggle').onclick = () => { cfg.isHQ = !cfg.isHQ; $('btn-hq-toggle').innerHTML = `画质方案: <b>${cfg.isHQ ? 'PNG' : 'JPG'}</b>`; saveCfg(); };
        
        // 设置项绑定
        $('cfg-manual').onchange = (e) => { cfg.isManualMode = e.target.checked; updatePanelUI(); saveCfg(); };
        $('cfg-skip-hash').onchange = (e) => { cfg.skipHashOnManual = e.target.checked; saveCfg(); };
        $('cfg-show-fb').onchange = (e) => { cfg.showFeedback = e.target.checked; saveCfg(); };
        $('cfg-style').onchange = (e) => { cfg.feedbackStyle = e.target.value; updatePanelUI(); saveCfg(); };
        $('cfg-fb-op').oninput = (e) => { cfg.feedbackOpacity = e.target.value / 10; saveCfg(); };
        $('cfg-fb-size').oninput = (e) => { if(cfg.feedbackStyle==='box') cfg.highlightWidth = e.target.value; else cfg.feedbackSize = e.target.value/10; saveCfg(); };
        $('cfg-color').oninput = (e) => { cfg.highlightColor = e.target.value; saveCfg(); };
        $('cfg-max-pages').onchange = (e) => { cfg.maxCachePages = parseInt(e.target.value)||500; saveCfg(); };

        // 核心功能绑定
        const findCenter = () => {
            const cvs = Array.from(document.querySelectorAll('canvas')).filter(c => c.width > 200);
            const cy = window.innerHeight / 2;
            if(!cvs.length) return null;
            return cvs.reduce((p, c) => Math.abs(c.getBoundingClientRect().top + c.getBoundingClientRect().height/2 - cy) < Math.abs(p.getBoundingClientRect().top + p.getBoundingClientRect().height/2 - cy) ? c : p);
        };

        $('btn-manual-act').onclick = () => { const c = findCenter(); if(c) enqueueCapture(c, true); };
        $('btn-undo').onclick = () => { if(STATE.images.length > 0) { const last = STATE.images.pop(); STATE.hashes.delete(last.hash); STATE.totalSizeBytes -= last.blob.size; updateUI(); } };
        $('btn-clear').onclick = () => { if(confirm('确定清空所有缓存图片吗？')) { STATE.images = []; STATE.hashes.clear(); STATE.totalSizeBytes = 0; updateUI(); } };
        
        $('btn-dl').onclick = async () => {
            if(!STATE.images.length) return;
            const b = $('btn-dl'); b.innerText = "打包中...";
            const z = new JSZip(); STATE.images.forEach((img, i) => z.file(`${i+1}.${img.ext}`, img.blob));
            const c = await z.generateAsync({type:'blob'});
            saveAs(c, `${document.title.split(/[-_]/)[0].trim()}.zip`);
            b.innerText = "💾 下载 ZIP 压缩包";
        };

        // 穿透查找逻辑
        document.addEventListener('mousemove', e => { STATE.mousePos.x = e.clientX; STATE.mousePos.y = e.clientY; });
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'd') {
                const els = document.elementsFromPoint(STATE.mousePos.x, STATE.mousePos.y);
                // 过滤出宽度>200的 canvas，如果没有则尝试找屏幕中心的保底
                const hover = els.find(el => el.tagName === 'CANVAS' && el.width > 200) || findCenter();
                if(hover) enqueueCapture(hover, true);
            }
        });
        updatePanelUI();
        updatePauseButtonUI(); // 初始化时也调用一次
    }

    function updateUI() {
        document.getElementById('tc-count').textContent = STATE.images.length;
        document.getElementById('tc-memory').textContent = `${(STATE.totalSizeBytes/1024/1024).toFixed(1)} MB`;
    }

    // ==========================================
    // 5. 初始化入口 (Initialization)
    // ==========================================
    function init() {
        createUI();
        // IntersectionObserver: 高效监听页面滚动出现的元素
        STATE.io = new IntersectionObserver((es) => es.forEach(e => e.isIntersecting && enqueueCapture(e.target)), { threshold: 0.15 });
        // MutationObserver: 监听 DOM 变化，捕获动态加载的 Canvas
        STATE.mo = new MutationObserver(() => document.querySelectorAll('canvas').forEach(cvs => { if(!STATE.observed.has(cvs) && cvs.width > 200) { STATE.observed.add(cvs); STATE.io.observe(cvs); } }));
        STATE.mo.observe(document.body, { childList: true, subtree: true });
    }

    init();
})();