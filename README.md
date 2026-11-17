# 测试 · HSBC UK Tavern Skin

为 SillyTavern 提供独立全屏的 HSBC UK 风格前端扩展。插件以本地内联 SVG 和随包附带的银行卡卡面素材绘制界面，不依赖第三方图片服务或远程字体。

## 本版更新 1.0.1

- The Home header and inset divider match the reference; the HSBC Bank A/C card is the only welcome entry.
- The native SillyTavern welcome panel is hidden. Bank A/C loads chat history for all characters and opens the selected chat through SillyTavern native APIs.
- Cards supports all personas, honorifics, Swipe/List modes, upload-first skin selection, custom images, and offline artwork without printed account digits.
- The Standard Debit image has been retouched to remove its printed card number; supplied card corners remain clipped by the rounded card viewport.
- Persona management keeps a two-column action grid and adds the saved Chinese Subtitles toggle.
- Mounted pages use centered HSBC white cards, inset dividers, high-contrast labels, custom ranges, and red checkboxes.
- The true four-triangle HSBC emblem replaces the hollow ring on the Bank A/C card and AI message avatars.

## 安装

在 SillyTavern 扩展管理的第三方扩展安装器中输入：

`https://github.com/kmbdxxx/tavern-test`

仓库根目录包含扩展所需的 `manifest.json`、`index.js`、`style.css` 和 `assets/cards/` 图片资源。安装后启用“测试”；更新也从第三方扩展管理器执行。

## 功能映射

| HSBC 页面 | SillyTavern 原生功能 |
| --- | --- |
| Home | Presets / 生成参数 |
| Pay | API Connections / 模型连接 |
| Cards | User Personas |
| Save & Invest | Extensions |
| Products and services | Characters |
| Money trends | World Info |
| Insurance | Backgrounds / Theme |
| Security and fraud | Advanced Formatting |
| Library 用户图标 | User Settings |

插件通过原生按钮、面板和事件映射功能，不创建替代的角色、聊天或人设数据存储。人设名称和描述由酒馆原生界面保存；称谓、卡面图库选择、上传图和视图偏好保存在当前浏览器本地。

## 本地开发

项目目录可独立用于 GitHub。修改后将项目完整文件同步到酒馆扩展安装目录，或通过扩展管理器从仓库重新安装。外部图片素材位于 `assets/cards/`，运行时从扩展相对路径加载。

## 停用

在第三方扩展管理器中关闭扩展并重新加载页面即可还原酒馆原生界面和自定义 CSS 状态。
- Replaced the hollow hexagon with the four-triangle HSBC emblem and hid the native SillyTavern welcome panel. The Bank A/C card is the welcome entry.
- Bank A/C loads recent chats for every character and sorts them by their latest message; selecting one uses SillyTavern native character and chat switching.
- Added a card-skin picker with upload first, a bilingual Persona actions toggle, and centered grouped HSBC controls across mounted pages.
- Added a card-skin picker with upload first, a bilingual Persona actions toggle, and centered grouped HSBC controls across mounted pages.
