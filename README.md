# 测试 · HSBC UK Tavern Skin

面向 SillyTavern 的离线第三方前端扩展。项目独立存放在 `hsbc-tavern` 文件夹，可从 GitHub 安装和更新。界面参考项目提供的 HSBC UK 手机端图片；图标、品牌标识和抽屉插画均由内联 SVG 绘制，不加载外部图片或字体。

## 0.7.1

- 保留 Font Awesome 原生图标字体，修复 API、扩展与世界书子页中的叉号方框；重设原生抽屉标题和表单为 HSBC 白灰卡片。
- 底部输入栏只保留 SVG 图标，工具菜单支持第 1 页排序、收藏即时红星反馈和第 3 页垃圾桶移除。
- Bank A/C 顶卡显示酒馆版本并可关闭；Cards 页面从酒馆上下文和人设列表合并读取所有 persona，支持标准、Prime、Global 和上传卡面。
- 开屏改为清晰的红白几何 SVG，可在 Extensions 中上传或重置自定义开屏图。

## 0.6.1

- 在 index.js 内嵌 HSBC CSS，并在 head 末尾创建 #hsbc-master-style；head 观察器仅在该样式不为最后元素时移动它。
- 壳层和开屏先完整挂载，再启用 ody.hsbc-ui-mounted；库抽屉、快捷浮层和子页启动时默认隐藏。
- 启用期间隐藏酒馆背景和弹窗遮罩；独立项目与已安装扩展目录使用同一份文件。

## 0.6.0

- 将扩展主样式复制到 document.head 最后一个 style 节点，并持续维持其最后位置；继续停用酒馆自定义 CSS，原生布局整体移出视口。
- 新增按设备本地时间显示的 HSBC 风格开屏插画、问候、登录按钮与 FSCS 锁形标识；Library 的 Log off 会重新显示开屏。
- 重绘 Library 多色 SVG 插画，并把银行、安全和帮助项目改为居中三列图标网格。
- 收紧窄屏顶部导航和快捷菜单分页行，避免汉堡菜单误触及默认页选项溢出。

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

