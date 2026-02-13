# 📖 Manga Canvas Hunter

> **为稳健而生的 Canvas 漫画采集利器。** 穿透遮罩、智能查重、极致交互。

[![Version](https://img.shields.io/badge/Version-20.0-blue.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Tampermonkey-orange.svg)]()
[![AI-Assisted](https://img.shields.io/badge/AI-Collaborated-blueviolet.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

---

## 🤖 AI 项目声明 (AI Project Disclosure)
本项目由 **Five（本人）** 构思并主导，核心逻辑由开发者与 **Gemini AI、Claude** 协同开发完成。
* **逻辑控制**：由开发者进行代码审查、UI 状态同步修复及核心防弹逻辑校验。
* **架构完善**：由 AI 辅助完成代码注释、README 编写及 UI 折叠组件的布局优化。
* **版本状态**：本版本 (V20.0) 已通过开发者深度实测。

---

## 💎 项目核心优势

针对 Canvas 渲染的漫画抓取痛点，本项目通过以下技术闭环完美解决了问题：

* **🛡️ 物理级穿透 (Penetration Logic)**：内置 `elementsFromPoint` 算法，无视任何覆盖在 Canvas 上的透明防盗 div。
* **🧠 智能指纹 (Canvas Fingerprinting)**：抽取 Canvas 5 个关键像素点生成唯一 Hash。脚本**绝对不会重复抓取**同一页。
* **🎯 暴力手动模式**：当自动检测失效时，开启手动模式，按 **`D`** 键强制捕获鼠标指向的内容。
* **⚡ 异步打包系统**：集成 `JSZip` 库，在后台静默生成压缩包，不卡顿浏览器。
* **🎨 现代手风琴 UI**：界面清爽，设置项分类折叠，支持透明度自定义，不遮挡阅读。

---

## 📖 操作指南

### 1. 快捷键列表
| 按键 | 功能 | 触发条件 |
| :--- | :--- | :--- |
| **D** | **强制采集 (Direct)** | 鼠标悬停在目标 Canvas 上 |
| **⚙️ 图标** | **设置面板** | 实时调整画质、反馈样式与内存上限 |

### 2. 核心模式说明
* **自动模式 (Auto)**：基于 `IntersectionObserver` 监听，进入视口即采集。
* **手动模式 (Manual)**：完全接管控制权，适合需要精准点对点采集的场景。

---

## 🛠️ 技术实现细节

脚本采用了高度解耦的结构，确保 UI 刷新与采集逻辑互不干扰：
1.  **监听层**：使用 `MutationObserver` 实时扫描 DOM 树。
2.  **过滤层**：通过宽高筛选和 Fingerprint 哈希池过滤。
3.  **显示层**：动态 CSS 注入反馈动画，实时同步 `updatePauseButtonUI` 状态。

---

## 🚀 安装与贡献

1.  安装 [Tampermonkey](https://www.tampermonkey.net/) 插件。
2.  新建脚本并粘贴源码。
3.  **适配站点**：理论支持所有 Canvas 渲染站点（如 TakeComic, Shonen Jump+ 等）。

---

## ⚖️ 免责声明
本工具仅用于前端技术研究。请尊重创作者版权，禁止用于商业传播或非法用途。
