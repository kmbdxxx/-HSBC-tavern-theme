README.md
# 测试 · HSBC UK Tavern Skin

为 SillyTavern 制作的离线第三方界面扩展，按项目提供的 HSBC UK 手机端参考图调整。项目保持独立目录，可从 GitHub 安装和更新。图标与抽屉插画使用内联 SVG，不请求外部图片、字体或运行服务。

## 0.4.0

- 统一接管酒馆主聊天区域和输入栏样式，移除旧主题造成的聊天框、快捷图标和字体残留；原生输入框占位符直接设为 `Start chat`。
- 移除聊天顶部快捷横条；将原生选项和扩展菜单集中到输入框左侧的 HSBC 对话入口，支持三个分页、默认页、收藏复制、移除和拖拽排序。每个操作仍调用对应的酒馆原生项目。
- 添加 Cards persona 卡面页、每个 persona 独立卡面上传、内置 Debit/Premier/Global 风格，以及轮播开关和纵向列表。
- 重做从右侧滑出的 Library 抽屉，修复图文重叠并连接角色列表、World Info、背景设置、高级格式化和用户设置原生面板。
- 保留离线 SVG 开屏转场并按参考图中的问候页重新排版。

## 安装

在 SillyTavern 的扩展管理中选择 **Install extension**，填入：

`https://github.com/kmbdxxx/tavern-test`

仓库根目录的 `manifest.json`、`index.js` 和 `style.css` 即是可安装扩展文件。安装后启用“测试”；更新可在扩展管理中执行。

## 交互映射

| HSBC UI | SillyTavern |
| --- | --- |
| Home | 预设与提示词面板 |
| Pay | API Connections（只打开设置，不自动连接或发送请求） |
| Cards | persona 卡面与切换 |
| Save & Invest | Extensions 面板 |
| Library / Products and services | 角色列表 |
| Money trends | World Info |
| Insurance | 背景选择与外观面板 |
| Security and fraud | Advanced Formatting |
| Library 用户图标 | User Settings |

部分 SillyTavern 版本的背景、API 或 World Info 入口标识不同；扩展通过原生 drawer 按钮执行映射。找不到入口时会保持安全，不修改酒馆数据。

## 本地偏好

快捷分页默认项、拖拽顺序、收藏条目、卡面轮播状态和上传卡面保存在浏览器 `localStorage` 的 `hsbc-tavern.preferences.v2`。卡面上传内容保存在当前浏览器本机；卸载扩展不会清除这些偏好。

## 兼容与安全

扩展只重设前端布局并触发 SillyTavern 已有的控件，不修改角色、聊天、世界书、预设或 API 凭据。启用/禁用由酒馆扩展管理器控制。
