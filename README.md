# 测试 · HSBC UK Tavern Skin

面向 SillyTavern 的离线第三方前端扩展。项目独立存放在 `hsbc-tavern` 文件夹，可从 GitHub 安装和更新。界面参考项目提供的 HSBC UK 手机端图片；图标、品牌标识和抽屉插画均由内联 SVG 绘制，不加载外部图片或字体。

## 0.5.0

- 改为独立全屏应用根节点 `#hsbc-uk-app`，不再把酒馆主布局节点当作美化容器；启用时停用 `#custom-style`，使旧主题留在底层。
- 将原生 `#chat` 消息流挂入 HSBC 聊天视口；底部使用独立输入框，并通过原生 textarea 的 `input` 事件和原生发送按钮桥接消息。
- 新增全屏覆盖子页。Presets、API Connections、Extensions、角色列表、World Info、背景、高级格式化和用户设置使用酒馆现有抽屉内容，打开时临时挂载，返回聊天时还原位置和状态。
- 重做 52px 顶部导航、HSBC 聊天输入栏、三页工具浮层、persona Cards 页面和 88% 宽右侧 Library 抽屉。
- 支持快捷项复制、移除和排序，卡片轮播开关以及每个 persona 独立上传卡面图。

## 安装

在 SillyTavern 扩展管理中选择 **Install extension**，填入：

`https://github.com/kmbdxxx/tavern-test`

安装后启用“测试”。更新可在扩展管理器中执行。仓库根目录包含 `manifest.json`、`index.js`、`style.css` 和本说明文件。

## 按键映射

| HSBC UI | SillyTavern 原生功能 |
| --- | --- |
| Home | AI response configuration / Presets |
| Pay | API Connections 和模型设置 |
| Cards | persona 选择与自定义卡面 |
| Save & Invest | Extensions |
| Products and services | Character management |
| Money trends | World Info |
| Insurance | Backgrounds |
| Security and fraud | Advanced Formatting |
| Library 用户图标 | User Settings |

本扩展通过触发酒馆现有控件打开面板；不会连接 API、发送请求或修改酒馆持久数据。返回聊天时，临时挂载的原生面板会归还到原容器。

## 本地偏好

快捷页默认项、快捷工具顺序、收藏项、Cards 轮播状态和用户上传的卡面保存在当前浏览器的 `localStorage`（`hsbc-tavern.preferences.v3`）。卡面图会缩放并压缩后保存在本机浏览器。

## 停用

在 SillyTavern 扩展管理中关闭本扩展并重新载入页面，即可回到酒馆原生界面。页面卸载时会还原聊天节点、已挂载的面板和原 `#custom-style` 启用状态。
