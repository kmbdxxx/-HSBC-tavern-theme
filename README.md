# 测试 · HSBC UK Tavern Skin

为 SillyTavern 提供独立全屏的 HSBC UK 风格前端扩展。插件以本地内联 SVG 和随包附带的银行卡卡面素材绘制界面，不依赖第三方图片服务或远程字体。

## 本版更新 0.9.0

- Home 与导航栏分隔线改为居中的 22px 细线；首页欢迎卡只保留 HSBC Bank A/C 信息，日期按本地时钟生成，并可展开最近聊天记录。
- 最近聊天通过 SillyTavern 聊天搜索接口读取当前角色或群组历史，点选后交由酒馆原生聊天加载方法切换。
- Cards 页面支持全部 User Personas、称谓选择、Swipe/List 模式、四组遮罩卡号点、自定义上传和本地 HSBC 卡面图库；图库卡面采用银行卡比例、圆角裁切，图片原始黑色角不会显示。
- 新增 11 张用户提供的 HSBC 卡面到 `assets/cards/`，可从卡面选择器的 HSBC card gallery 中选用；所有卡面资源离线随插件分发。
- Character 列表增加收藏过滤、搜索、原生排序/导入/创建入口和整洁的角色行；角色点击仍调用酒馆原生事件。
- 人设管理、Presets、API、Extensions、World Info、背景、高级格式化和用户设置维持原生控件及存储事件，并统一使用高对比 HSBC 表单和分组卡片样式。
- 修复关闭子页面时原生抽屉没有收起的问题；编辑人设备注时不再重绘输入区，确保连续输入。
- Library 的快捷入口、三列功能区、滚动内容和固定底部版本/Log off 均按 HSBC 风格整理。

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