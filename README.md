# Magic History · World History

世界史唯一提交仓库：`gangstfany/magic-history-apwh`，日常分支 `main`。

这里管理世界史内容与所有课程功能：地图、Study points、49条因果链225环、6张商路与交流网络、练习以及Today’s Pick数据与行为。首页通过稳定消息接口加载本课程；本仓库提交不会构建、提交或部署首页/账号/艺术史。

## 修改与预览

- 内容：`src/apwh/content-corrected.json`、`src/apwh/causal-chains.json`。
- 地图、商路与停靠样式：`src/apwh/`。
- 世界史工具栏、左右栏及课程界面：`src/workspace/index.template.html`。
- 不直接编辑生成的 `index.html`、`world-map.html`。

```sh
python3 scripts/build-site.py
node --test src/apwh/test-*.cjs tests/*.test.mjs src/workspace/*/*.test.cjs
python3 -m unittest discover -s src/apwh -p 'test_*.py'
node src/apwh/verify-content.cjs
python3 -m http.server 8032 --directory _site --bind 127.0.0.1
```

打开 http://127.0.0.1:8032/ 。提交修改到本仓库main后，独立Pages流程只发布世界史。

## 与首页的接口

嵌入地址为 `index.html?hostOrigin=<首页origin>`；模块接收带版本的`init`和`open-today`，发送`ready`、`resize`及纯文本`today-pick`。仅接受指定父来源与父窗口消息，接口版本1。单独访问不依赖首页或登录代码。模块内部地图与学习侧栏属于同一课程，可以继续正常协作。

收藏按钮位于 Study point 卡片、当前时间线事件和因果链当前环。`favorites.mjs` 管理按钮及独立访问时的本地收藏；`src/apwh/favorites-api.js` 从课程原始数据解析稳定 ID，构建时加入地图 API。收藏不会复制或修改教学正文。

首页 `init` 可提供本课程 `favorites` 数组，并通过 `favorites-sync {items}` 更新。课程发送 `favorite-change {action,item}`；首次连接某个首页来源时，可发送一次 `favorites-import {items}` 导入独立访问收藏。首页通过 `open-favorite {item:{id,kind}}` 打开指定对象，课程返回 `favorite-opened {ok,id,kind}`。消息沿用 namespace `magic-history`、version 1、module `apwh`，并严格核对父窗口与来源。

收藏 `kind` 为 `study-point`、`event`、`chain`。ID 分别沿用 Study point ID、时间线 `world-event-*` ID，以及 `<chainId>:step:<zero-based-index>`；重开时从完整课程数据验证 ID，清除不兼容筛选，再定位到具体卡片、事件或链环。元数据仅包含 `id/kind/title/subtitle/unit` 纯文本。

## 迁移来源

来自旧公开仓库 `gangstfany/magic-history` 提交 `cd4401845ad5e688a0b33d930c61b8f3bcabb432`。保留源码、内容审查记录与构建基线；已移除“资料与勘误”显示入口，正文整改保留。原始历史仍可在旧仓库恢复。构建基线 `src/apwh/source-map-snapshot.html` 只用于提取原地图，不能作为发布入口。

## 其他仓库

- 首页框架： https://github.com/gangstfany/magic-history-site
- 登录账号： https://github.com/gangstfany/magic-history-auth
- 艺术史： https://github.com/gangstfany/magic-history-art

## U1 / U2 学习界面

U1 使用六个地区比较主题，A、B 地区的文字在右侧逐项展开；比较解释通过右侧入口显示在地图浮窗。U2 保留主链与五条补充链，以紧凑条目区分因果支持、共同条件、并行支付办法与反馈，并同步左侧事件配图。运行时资源由 `src/workspace/u1-comparison/`、`u1-integration.js` 和 `u2-visual/` 构建至 `assets/`，直接访问及首页嵌入均使用同一正式入口。图片出处保留在图注及资源记录中，后续可继续补图。
