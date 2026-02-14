# 📖 Manga Canvas Hunter V21.0 Enhanced

[![Version](https://img.shields.io/badge/Version-21.0-blue.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Tampermonkey-orange.svg)]()
[![AI-Assisted](https://img.shields.io/badge/AI-Collaborated-blueviolet.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

> **这是一份献给所有漫画汉化组的礼物：让生肉采集回归纯粹与高效。**  
> **A specialized toolkit for Manga Translation Groups. Precision, Stability, and Speed.**

---

## 🌹 致敬与鸣谢 (Dedication)

本项目特别献给日以继夜工作的**漫画汉化组**。是你们的热爱让优秀的漫画跨越了语言的国界。

为了优化汉化工作流中的第一步——"素材采集"，本项目经历了 **30 余次实测重构**，旨在提供最稳健的原画捕获方案。

**"献给那些让故事得以延续的人们。"**

---

## ✨ 核心特性 (Core Features)

### 🎯 自动采集 + 手动狙击双模式
- **自动模式**：滚动页面自动捕获视口内的 Canvas 元素，零操作完成整话采集
- **手动模式**：按 `D` 键精准狙击鼠标指向的图片，适合处理特殊页面

### 🛡️ 工业级稳定性保障
- ✅ **异常全路径兜底**：toBlob 失败时自动记录并继续运行
- ✅ **失败可视化**：UI 实时显示失败页数，支持查看详细原因
- ✅ **内存保护机制**：200MB 自动触发保护，防止浏览器崩溃
- ✅ **跨域容错**：Tainted Canvas 自动降级处理

### 🎨 极致视觉反馈
- 3 种反馈样式：**丝滑边框** / **对号✔** / **表情😋**
- 可自定义颜色、透明度、大小
- 采集瞬间的视觉确认，零延迟手感

### 📊 智能去重算法
- **5 点像素采样哈希**：中心 + 四角关键点色彩指纹
- **RGB 降噪技术**：`>> 4` 位压缩，防 WebGL 微差干扰
- **手动模式可选忽略查重**：强制重新采集问题页

### 💾 高效打包系统
- **实时进度显示**：打包中 0% → 45% → 压缩中 → ✅ 完成
- **智能文件名**：自动提取"第X话"或章节标题
- **内存优化**：流式压缩，支持 500+ 页大容量导出

---

## 📑 项目核心结构 (Architecture)

本项目通过以下四大模块，构建了从"页面嗅探"到"本地导出"的完整闭环：

### 1️⃣ 穿透与识别模块 (Detection & Penetration)
* **物理穿透算法**：针对 Kadokomi (Comic Walker) 等站点的透明防盗层，利用 `elementsFromPoint` 算法绕过 DOM 遮障
* **全域匹配引擎**：内置 25+ 主流平台规则，配合 `/episode/` 等模糊匹配逻辑，实现"开箱即用"
* **自适应检测**：IntersectionObserver + MutationObserver 双观察者架构，自动捕获动态加载内容

### 2️⃣ 智能过滤模块 (Filtering & Fingerprinting)
* **视觉指纹查重**：自研 **5 点像素采样哈希** 逻辑。通过对 Canvas 关键坐标进行色彩采样生成唯一 ID
* **降噪处理**：RGB 值右移 4 位压缩，提升指纹稳定性
* **多维度筛选**：支持按 Canvas 宽高比例过滤广告与无关元素（最小宽度 200px）

### 3️⃣ 任务管理模块 (Task Management)
* **异步生产流水线**：基于 JSZip 的非阻塞打包技术。Canvas → Blob → Zip 的转换在后台静默完成
* **内存平衡系统**：实时监控缓存负载（默认上限 200MB），超限自动暂停并提示
* **并发控制**：队列系统限制同时处理数（默认 2 并发），防止浏览器卡顿
* **失败追踪**：完整记录转换失败的页面，支持导出时查看

### 4️⃣ 交互反馈模块 (UI & Interface)
* **手风琴折叠面板**：所有高级设置（画质、反馈颜色、查重开关）分类收纳，保持界面整洁
* **实时状态联动**：UI 状态机与核心逻辑毫秒级同步，确保"采集状态"所见即所得
* **内存警告系统**：70% 橙色预警 / 90% 红色危险
* **教程内置**：新手指引一键查看

---

## 🚀 深度适配列表 (Site Support)

| 平台级别 | 适配站点 (部分列举) | 备注 |
| :--- | :--- | :--- |
| **S级 (深度优化)** | Kadokomi (カドコミ), Comic Walker, Shonen Jump+, Comic Days | 穿透层、动态加载完美支持 |
| **A级 (完美适配)** | Magapoke, Sunday Webry, Manga Park, Tonari no Young Jump | 标准 Canvas 渲染 |
| **B级 (通用兼容)** | Kuragebunch, Comic Action, Comic Zenon, Storia 等 | 符合通用规则 |
| **C级 (理论支持)** | 所有包含 `/viewer/` 或 `/episode/` 的漫画站 | 需手动模式辅助 |

### 完整适配列表
```
✅ kadokomi.com (カドコミ)
✅ comic-walker.com
✅ comic-days.com
✅ shonenjumpplus.com
✅ tonarinoyj.jp
✅ magapoke.com
✅ sunday-webry.com
✅ kuragebunch.com
✅ pash-up.jp
✅ comic-action.com
✅ comic-ogyaaa.com
✅ corocoro.jp
✅ heros-ultraman.com / heros-web.com
✅ comic-zenon.com
✅ manga-park.com
✅ comic-trail.com / comic-border.com / comic-gardo.com
✅ storia.takeshobo.co.jp
✅ takecomic.jp (备用)
```

---

## 📦 安装方式 (Installation)

### 方法一：自动安装（推荐）
1. 确保浏览器已安装 [Tampermonkey](https://www.tampermonkey.net/) 或 [Violentmonkey](https://violentmonkey.github.io/)
2. 访问本项目的 GitHub 仓库，找到 `manga-canvas-hunter.user.js` 文件
3. 点击 "Raw" 按钮，Tampermonkey 会自动识别并弹出安装页面
4. 点击"安装"完成

### 方法二：手动安装
1. 下载本项目中的 `manga-canvas-hunter.user.js` 文件
2. 打开 Tampermonkey 管理面板
3. 点击 "+" 新建脚本
4. 粘贴代码并保存

---

## 🎮 使用教程 (Quick Start)

### 基础使用（自动模式）

1. **访问支持的漫画网站**，打开任意章节阅读页面
2. **右上角出现蓝色悬浮面板**，显示 "HUNTER V21.0"
3. **正常阅读漫画**，滚动页面时脚本会自动捕获
4. **观察计数变化**：
   - `15 pages` - 已捕获页数
   - `12.3 MB` - 内存占用
   - `失败: 2` - 失败页数（如果有）
5. **点击 "💾 下载 ZIP 压缩包"**，等待打包完成
6. **保存到本地**，解压即可获得所有图片

### 高级使用（手动模式）

适用于自动模式失效或需要精确控制的情况：

1. **点击 ⚙️ 设置按钮**
2. **展开 "🛡️ 采集模式方案"**
3. **勾选 "启用手动模式"**
4. **使用方式**：
   - 点击 **"🎯 暴力抓取当前页"** 按钮 → 抓取屏幕中心的图
   - 按键盘 **`D`** 键 → 抓取鼠标指向的图（穿透遮罩层）
5. **可选勾选 "手动强制忽略查重"** → 允许重复抓取同一页

### 视觉反馈自定义

1. **展开 "🎨 视觉反馈设置"**
2. **调整选项**：
   - **样式**：丝滑边框 / 对号✔ / 表情😋
   - **透明度**：0.1 ~ 1.0
   - **粗细/大小**：边框粗细或图标大小
   - **颜色**：点击色块选择喜欢的颜色

### 内存管理

- **查看内存占用**：面板右上角实时显示
- **颜色警告**：
  - 灰色 < 140MB（正常）
  - 橙色 140MB ~ 180MB（预警）
  - 红色 > 180MB（危险）
- **超限保护**：达到 200MB 自动暂停并弹窗提示
- **建议**：每采集 100 页左右下载一次，然后清空缓存

### 常见问题排查

**Q: 按 D 键没反应？**  
A: 确保鼠标放在漫画图片上，脚本会穿透遮罩层自动查找 Canvas

**Q: 出现"虚空反馈"（闪了一下但没捕获）？**  
A: 开启手动模式 → 勾选"忽略查重" → 重新抓取

**Q: 失败页数不为 0？**  
A: 点击浏览器 F12 查看 Console 日志，通常是跨域限制导致

**Q: 下载的 ZIP 文件名乱码？**  
A: 脚本会自动提取"第X话"，如果网页标题特殊字符过多会被替换为 `_`

---

## 🔧 技术细节 (Technical Details)

### 核心算法

#### 5 点像素采样指纹
```javascript
采样点布局：
┌─────┬─────┬─────┐
│  1  │     │  2  │  (0.1, 0.1) (0.9, 0.1)
├─────┼─────┼─────┤
│     │  5  │     │  (0.5, 0.5) 中心点
├─────┼─────┼─────┤
│  3  │     │  4  │  (0.1, 0.9) (0.9, 0.9)
└─────┴─────┴─────┘

Hash = Math.imul(hash, 31) + (RGB >> 4)
```

#### 内存保护机制
```javascript
if (totalSize >= 200MB) {
  自动暂停()
  弹窗提示("请下载后清空缓存")
}

if (totalSize > 180MB) 显示红色警告
if (totalSize > 140MB) 显示橙色预警
```

#### 穿透算法
```javascript
document.elementsFromPoint(mouseX, mouseY)
  .filter(el => el.tagName === 'CANVAS' && el.width > 200)
  .find(最佳匹配)
```

### 性能优化

- **并发控制**：最多同时处理 2 个 Canvas，防止卡顿
- **视口裁剪**：屏幕外的元素不触发反馈动画
- **懒加载支持**：MutationObserver 自动捕获动态插入的 Canvas
- **内存估算**：实时累加 Blob.size，无需遍历数组

### 兼容性

- ✅ Chrome 90+
- ✅ Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+ (部分功能可能受限)

---

## 🤖 开发者与 AI 协作声明

本项目由 **[FiveTomcat11451](https://github.com/FiveTomcat11451)** 深度主导。

### 人类贡献
* **核心逻辑设计**：穿透算法、指纹系统、UI 状态机
* **30+ 版本压力测试**：攻克 Kadokomi 穿透、UI 同步等核心难题
* **跨站兼容性调试**：针对 25+ 漫画站的实际测试与优化

### AI 协作 (Gemini & Claude)
* **代码重构建议**：模块化结构、异常处理增强
* **多站点规则编写**：批量生成 @match 规则
* **文档与注释**：Markdown 交互设计、代码注释完善
* **算法优化**：Rolling Hash、内存管理策略

**协作模式**：人类主导创新与决策，AI 辅助实现与优化

---

## 📄 开源协议 (License)

本项目采用 [MIT License](LICENSE) 开源协议。

**这意味着你可以：**
- ✅ 自由使用、修改、分发
- ✅ 用于个人或商业项目
- ✅ 闭源使用（但需保留版权声明）

**但你需要：**
- ⚠️ 保留原作者版权信息
- ⚠️ 声明使用了本项目

---

## ⚖️ 免责声明 (Disclaimer)

**本工具仅供技术研究及汉化组内部交流使用。**

1. **版权尊重**：请务必尊重原作者版权，不得将采集内容用于商业传播
2. **使用风险**：使用者需自行承担因违反目标网站服务条款而产生的一切后果
3. **适用范围**：建议仅用于个人学习、备份或非盈利性汉化工作
4. **法律责任**：开发者不对使用本工具产生的任何法律纠纷负责

**正确使用方式**：  
✅ 汉化组内部采集生肉素材  
✅ 个人学习研究 Canvas 技术  
✅ 备份自己购买的正版漫画  

**禁止使用方式**：  
❌ 大规模爬取并公开传播  
❌ 用于盈利性质的盗版网站  
❌ 绕过付费墙窃取付费内容  

---

## 🙏 致谢 (Acknowledgments)

### 技术栈
- [JSZip](https://stuk.github.io/jszip/) - ZIP 文件生成
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/) - 文件下载
- [Tampermonkey](https://www.tampermonkey.net/) - 用户脚本管理

### 灵感来源
- 所有日以继夜工作的漫画汉化组
- 开源社区的无私分享精神
- 每一位提出改进建议的用户

### 特别鸣谢
- **Gemini AI** - 协作完成代码重构与文档编写
- **Claude AI** - 提供算法优化与稳定性建议
- **所有测试用户** - 提供真实场景反馈

---

## 📮 联系方式 (Contact)

- **GitHub Issues**: [提交问题 / 功能建议](https://github.com/FiveTomcat11451/Manga-Canvas-Hunter/issues)
- **Pull Requests**: 欢迎贡献代码改进
- **Email**: [即将开放]

---

## 🗺️ 更新日志 (Changelog)

### V21.0 Enhanced
- ✅ **稳定性增强**：toBlob 全路径异常兜底
- ✅ **失败可视化**：UI 实时显示失败页数
- ✅ **内存保护**：200MB 硬上限自动保护
- ✅ **下载优化**：实时进度显示 + 智能文件名
- ✅ **指纹优化**：RGB 降噪处理

### V20.1 Final
- 🐛 修复暂停按钮 UI 不刷新的 bug
- 📝 完善代码注释

### V20.0 Final
- ✨ 手动模式 + 自动模式双轨制
- ✨ 穿透算法支持透明遮罩层
- ✨ 手风琴折叠 UI 设计
- ✨ 内置详细教程

### 早期版本
- V1.0 ~ V19.x：核心功能迭代与多站点适配

---

<div align="center">

**Made with ❤️ for Manga Translation Community**

**如果这个工具帮到了你，请给个 ⭐ Star 支持一下！**

[⬆ 回到顶部](#-manga-canvas-hunter-v210-enhanced)

</div>
