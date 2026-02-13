# 📖 Manga Canvas Hunter V20.1 (Final Ultimate)

[![Version](https://img.shields.io/badge/Version-20.1-blue.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Tampermonkey-orange.svg)]()
[![AI-Assisted](https://img.shields.io/badge/AI-Collaborated-blueviolet.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

> **这是一份献给所有漫画汉化组的礼物：让生肉采集回归纯粹与高效。**
> **A specialized toolkit for Manga Translation Groups. Precision, Stability, and Speed.**

---

## 🌹 致敬与鸣谢 (Dedication)

本项目特别献给日以继夜工作的**漫画汉化组**。是你们的热爱让优秀的漫画跨越了语言的国界。
为了优化汉化工作流中的第一步——“素材采集”，本项目经历了 30 余次实测重构，旨在提供最稳健的原画捕获方案。
**“献给那些让故事得以延续的人们。”**

---

## 📑 项目核心结构 (Structure)

本项目通过以下四大模块，构建了从“页面嗅探”到“本地导出”的完整闭环：

### 1️⃣ 穿透与识别模块 (Detection & Penetration)
* **物理穿透算法**：针对 Kadokomi (Comic Walker) 等站点的透明防盗层，利用 `elementsFromPoint` 算法绕过 DOM 遮障。
* **全域匹配引擎**：内置 25+ 主流平台规则，配合 `/episode/` 等模糊匹配逻辑，实现“开箱即用”。

### 2️⃣ 智能过滤模块 (Filtering & Fingerprinting)
* **视觉指纹查重**：自研 **5 点像素采样哈希** 逻辑。通过对 Canvas 关键坐标进行色彩采样生成唯一 ID，彻底杜绝翻页过程中的重复采集。
* **多维度筛选**：支持按 Canvas 宽高比例过滤广告与无关元素。

### 3️⃣ 任务管理模块 (Task Management)
* **异步生产流水线**：基于 JSZip 的非阻塞打包技术。Canvas -> Blob -> Zip 的转换在后台静默完成，不影响浏览体验。
* **内存平衡系统**：实时监控缓存负载，支持自定义存储上限，保护浏览器在高负载下不崩溃。

### 4️⃣ 交互反馈模块 (UI & Interface)
* **手风琴折叠面板**：所有高级设置（画质、反馈颜色、查重开关）分类收纳，保持界面整洁。
* **实时状态联动**：UI 状态机与核心逻辑毫秒级同步，确保“采集状态”所见即所得。

---

## 🚀 深度适配列表 (Site Support)

| 平台级别 | 适配站点 (部分列举) |
| :--- | :--- |
| **S级 (深度优化)** | Kadokomi (カドコミ), Comic Walker, Shonen Jump+, Comic Days |
| **A级 (完美适配)** | Magapoke, Sunday Webry, Manga Park, Tonari no Young Jump |
| **B级 (通用兼容)** | 理论支持所有包含 `/viewer/` 或 `/episode/` URL 结构的漫画站 |

---

## 🤖 开发者与 AI 协作声明

本项目由 **[FiveTomcat11451](https://github.com/FiveTomcat11451)** 深度主导。
* **核心逻辑**：开发者经历了 30+ 版本的压力测试，攻克了 Kadokomi 穿透及 UI 同步等核心难题。
* **AI 协作 (Gemini)**：辅助进行多站点匹配规则编写、Markdown 交互设计及代码重构建议。

---

## 📦 安装方式 (Installation)

1.  确保浏览器已安装 [Tampermonkey](https://www.tampermonkey.net/) 插件。
2.  访问本仓库中的 [manga-canvas-hunter.user.js](https://github.com/FiveTomcat11451/Manga-Canvas-Hunter/raw/main/manga-canvas-hunter.user.js)。
3.  点击“安装/更新”。

---

## ⚖️ 免责声明
本工具仅供技术研究及汉化组内部交流使用。请务必尊重原作者版权，严禁将本工具采集的内容用于商业传播。使用者需自行承担因违反目标网站服务条款而产生的风险。

---
