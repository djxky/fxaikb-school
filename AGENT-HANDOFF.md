# AGENT HANDOFF · 飞象老师校园版最终 demo

> 给下一个 AI agent 的交接备忘。新对话第一件事读本文件，不要再把归档 demo 当主线。

## 1. 项目背景

- 路径：`demo/feixiangai/校园版/`
- 性质：飞象老师校园版最终 demo，静态 HTML/CSS/JS 多页面原型，无后端依赖。
- 当前定位：这是后续产品稿、过稿、埋点、发布同步的唯一主线 demo；`demo/feixiangai/归档/` 和旧 v28 资料只可作为历史参考，不可当作当前版本事实。
- 发布目标：本地 `校园版/` 内容同步到现有 GitHub Pages 项目 `djxky/fxaikb-school`，线上地址为 `https://djxky.github.io/fxaikb-school/`。
- 页面结构：
  - 首页 / 工作台：`index.html`
  - 对话：`chat.html`、`chat-history.html`
  - 知识库：`school-wiki.html`、`my-wiki.html`、`wiki-entry.html`、`file-preview.html`、`upload-onboarding.html`
  - 应用：`app-square.html`、`my-apps.html`、`app-detail.html`
  - 资源：`resource-square.html`、`resource-detail.html`
  - 题库 / 录题 / 组题：`ai-qbank.html`、`ai-record-jobs.html`、`ai-review.html`、`compose-sheet.html`
  - 学校 / 管理：`join-school.html`、`admin-teachers.html`
- 共享底座：
  - `assets/feixiang-shell.*`：校园版主壳、侧栏、通知、基础导航。
  - `assets/page-header.*`：页面标题区。
  - `assets/v28.*`、`assets/v28-shell.*`、`assets/v28-folder.js`：沿用并演化自 v28 的知识库、搜索、浮层、文件夹等能力。
  - `assets/shared/v28-modals.*`：下载 / 分享等通用浮层底座。
  - `assets/shared/pin-comments.js`：多人评论 pin 层。

## 2. 已对齐的产品决策（不必再讨论）

- 【2026-06-03】当前最终 demo 只认 `demo/feixiangai/校园版/`。其他历史 demo 不重要，不再作为主线维护。
- 校园版对外发布默认进入现有 `djxky/fxaikb-school`，不要新建仓库，不要从父级 `/飞象 AI` 仓库直接推送。
- 发布时源头是本地 `校园版/` 文件夹；安全做法是临时 clone `djxky/fxaikb-school` 后同步该文件夹内容，避免父级仓库大量无关文件进入线上项目。
- 可见文案统一叫「学校知识库」，不要再写「学校共建库」；内部 id 如 `school` 可保持不变。
- 首页 `index.html` 和新对话页 `chat.html` 的输入框交互必须保持一致，不只做视觉相似。
- 输入框前置模式包含 AI / 搜索 / 创作三类；选择搜索时，必须继续保留直接可见的知识库范围选择。
- 搜索范围提供「全部知识库 / 我的知识库 / 学校知识库」等直接入口；不能把范围选择完全藏到 `+` 菜单里。
- AI 创作、AI 搜索等能力应围绕老师已有知识库上下文工作，文案上强调“基于你选的知识库回答 / 引用可查看原文”。
- 校园版壳层的核心导航为学校知识库、应用广场、资源广场，以及老师个人工作区相关入口。
- AI 题库、AI 录题、AI 批改 / 组题等是校园版演示的重要能力入口，页面可用静态 mock，但入口应真实跳转，不要只 toast 占位。
- AI 录题页的心智是“上传本地 PDF / Word -> AI 解析 -> 老师校对 -> 入题库”；知识库文件会自动识别入题库，无需老师在录题页手动审核。
- 过稿文字阶段按 `productdemo` skill：单文件 HTML 项目应在对应页面内联 `<aside class="review-panel">`，不生成 `docs/prd/*.md`。
- 【2026-06-03】产品稿文字必须输出在 HTML 页面内；切换方式参考用户给的图 2，在页面右上角提供「演示 / 过稿」segmented tab。演示模式隐藏过稿 panel，过稿模式显示页面主体 + 右侧产品稿说明。
- 【2026-06-03】`index-workbench.html` 和 `index-launcher.html` 不进入最终演示链路，不写产品稿；已从最终 demo 目录删除，首页只保留 `index.html`。
- 【2026-06-03】第一版过稿模式已落地：新增 `assets/review.css` / `assets/review.js`，19 个最终 HTML 页面均内联 `review-template` 产品稿数据，并挂载右上角「演示 / 过稿」切换。切换使用 `?review=1`，同时兼容 `?mode=review`；为避免与 `compose-sheet.html?mode=basket` 等业务参数冲突，默认 tab 写入 `review=1`。
- 【2026-06-03】产品稿文字已从摘要升级为结构化过稿稿：每个模块按“是什么 / 为什么 / 触发条件 / 执行动作 / 结果反馈 / 数据口径 / 边界 / 关联页面”等字段展开。`assets/review.js` 支持 `details` 字段渲染，19 个 HTML 的 `review-template` 已补充结构化内容。
- 【2026-06-03】为保证明天研发过稿稳定，新增 `assets/review-content.js` 作为集中式产品稿兜底数据源。`review.js` 优先读页面内联 `review-template`；若当前页面没有模板或模板为空，则按当前 HTML 文件名从 `window/globalThis.REVIEW_CONTENT` 读取。19 个 HTML 均已在 `review.js` 前加载 `review-content.js`。
- 【2026-06-03】过稿切换样式参考用户给的龙老师数据驾驶舱 demo：切换按钮改为右下角低透明度小胶囊，hover 才强化，避免遮挡内容；过稿 panel 改为可拖动、可关闭、可右下角缩放的浮窗，而不是固定右侧大栏。
- 【2026-06-03】过稿 panel 拖拽必须用 Pointer Events + `setPointerCapture`，不要只绑定 `mousedown/mousemove`；否则部分浏览器、触控板或触屏环境会出现“不能拖动”。
- 【2026-06-03】产品稿文字要服务研发过稿，核心写交互和逻辑，不写成啰嗦 PRD，也不能把多步交互压成一条大 bullet。`review.js` 兼容两种结构：旧版 `flow/states/dataRules`；新版 `blocks`，可按“功能说明 / 交互流程 / 业务规则 / 数据说明 / 异常场景 / 关联模块”写清楚，支持列表、表格和 callout。首页已按新版 `blocks` 重写，作为后续逐页补稿标准。
- 【2026-06-03】19 个最终 HTML 页面已按首页标准补齐结构化产品稿：每个 section 都写入 `blocks`，至少包含“功能说明 / 交互流程 / 业务规则 / 数据说明 / 异常场景 / 关联模块 / QA 检查点”。`assets/review-content.js` 与各页面内联 `review-template` 已同步，避免兜底数据和页面画板不一致。
- 【2026-06-05】过稿 panel 的产品稿 section 默认全部折叠，不再自动展开 CORE 或第一部分内容；只有模板显式写 `expanded: true` 时才默认展开。

## 3. 反模式清单（不要走回头路）

- 不要再把旧 v28 归档 `AGENT-HANDOFF.md` 当成当前校园版的事实来源；只能迁移仍适用的原则。
- 不要把“最终 demo”拆回多个候选版本或继续维护一堆旧方案；当前主线就是 `校园版/`。
- 不要把校园版更新推到父级 `/飞象 AI` 仓库，父级仓库有大量归档和无关文件。
- 不要新建 GitHub Pages 项目；用户已确认后续校园版都放在 `djxky/fxaikb-school`。
- 不要只改 `index.html` 或只改 `chat.html` 的输入交互；这两页是强关联页面，必须做交互对齐。
- 不要在搜索模式隐藏知识库范围选择，只留下 `+` 菜单；用户已经指出老师点击知识库搜索后仍需要继续限定范围。
- 不要把可见文案写回「学校共建库」。
- 不要在阶段二直接写产品稿；必须先读本文件并扫当前页面 / `data-doc`，输出对账清单后再写。
- 不要生成独立 `docs/prd/*.md` 作为产品稿主产物；过稿文字应进入右侧 review panel。
- 不要把过稿 panel 写成大段价值阐释或“是什么 / 为什么”说明卡；也不要为了短而把触发、动作、反馈、业务规则全挤在一条 bullet 里。研发过稿优先看清晰具体的步骤、状态边界、数据口径和跨页关联。

## 4. 边界条件 / 异常处理

- 静态 demo 无真实后端，业务数据、列表、通知、任务状态均为 mock 或 localStorage 演示数据。
- 本地浏览器如果因 `file://` 安全策略导致预览不稳定，优先用静态脚本解析或启动轻量本地服务验证，不要据此误判页面坏了。
- 发布校验应同时看 GitHub 远端 main 分支 tip 和 Pages 上具体页面是否可访问，首页缓存不能作为唯一判断。
- `chat.html` 与 `index.html` 由于实现未完全共享，任何 composer 改动都要同时检查两边状态、placeholder、chips、send button、范围选择和跳转参数。
- 个人 / 学校知识库的内部状态可用 localStorage 保存；如果用户反馈演示数据异常，先考虑 localStorage 残留。
- pin-comments 使用 Supabase 配置；评论层失败不应阻塞静态 demo 主流程。

## 5. 视觉 / 交互约定

- 视觉方向：浅色、克制、面向老师日常工作，不做过度营销式页面。
- 重要入口应真实跳转；低优先级或未实现能力可以 toast 标注“演示”。
- 页面主体保持正式产品感，变更说明、过稿标记只放 review panel，不在演示主体上贴角标。
- 演示 / 过稿切换控件参考图 2：右上固定的轻量 segmented control，「演示」为默认高亮，「过稿」切换后显示产品稿；控件本身不能遮挡页面核心操作。
- 最新交互以龙老师数据驾驶舱 demo 为准：切换控件放右下角、低透明度、轻量 hover；过稿说明是浮窗，可以拖动和缩放。
- 输入框交互是核心体验：模式 chip、知识库范围、附件 / 语音 / 发送状态要稳定，不允许因为某个模式切换造成布局跳动或范围丢失。
- 图标使用 lucide 风格；按钮尽量用图标表达常见动作，文字按钮用于明确命令。
- 页面文案用简体中文，称呼统一为「飞象」或「飞象 AI」，避免“系统”“小助手”等泛称。

## 6. 已知技术债 / 悬而未决

- 当前 `校园版/` 已补齐第一版每页过稿 `review-template` 和右侧 `review-panel`；后续修改页面时要同步改对应页面的模板文字。
- 当前只有部分元素有 `data-doc`，且 `data-track` 覆盖情况未完整确认；出埋点前需要逐页扫描。
- 旧 v28 handoff 中有大量下载、分享、通知、AI 录题、题库等决策，其中一部分可能仍适用，但必须按当前 `校园版/` 页面重新核对后再迁移。
- 首页最终入口已收敛为 `index.html`。
- `assets/v28*` 命名仍保留历史版本痕迹，当前可继续使用，但文档口径应称为校园版最终 demo。
- `checkpoint.md` 位于父级目录，当前不作为校园版最终 demo 的可靠阶段状态来源，除非后续专门整理。

## 7. 用户工作偏好（务必遵守）

- 非 trivial / 有歧义的产品问题，先简短讨论清楚再动手。
- 但对于明确的校园版发布请求，如“更新到 git 上 / 再更新一版 / 更新一版”，默认直接同步 `校园版/` 到 `djxky/fxaikb-school` 并验证。
- 产品和 UI 判断从第一性原理出发，偏好简单、清晰、克制的方案。
- 用户不希望为了流程而维护无关旧 demo；当前最终 demo 之外的历史内容都降级为参考。
- 每次修改 demo 前先读本文件；如果产生新产品决策、反模式、边界或视觉交互约定，当回合写回本文件并在回复末尾输出 `[记忆更新]`。
- 回复使用简体中文。
