# 简言 Saylit

Next.js App Router、React 和 TypeScript 构建的 Markdown 排版工作台。文章在浏览器本地处理，无需账号或后端。

## 运行

```sh
npm ci
npm run dev
```

访问 http://127.0.0.1:3000 。生产预览使用 `npm run build` 后 `npm start`；静态输出位于 `out/`。线上 PWA 需要 HTTPS，离线使用需先在线打开生产版本，安装入口取决于浏览器支持。

## 功能

- Markdown 编辑、实时预览、工具栏和撤销重做。
- 36 套主题，六个类别；标题、正文节奏、引用、列表、表格、代码、分隔线与图片样式共同组成版式。
- 当前文章缩略图、主题搜索收藏、同文双主题对比。
- 每篇文章独立保存字号、密度和强调色。
- 复制富文本与纯文本，导出 Markdown、内联样式 HTML、工作台 JSON 备份；恢复备份追加文章。
- 浏览器自动保存，离开前同步写入；保存时合并最新文章快照，同文章以更新时间决定胜出版本，收藏冲突提示重选。此机制不提供协同编辑或版本历史。
- 窄屏切换写作、预览和主题视图，通过侧栏抽屉访问文章。

## 当前边界

公众号后台最终粘贴效果尚未验证。复制后检查图片、表格、代码和文章尾部；本地图片需要在公众号后台上传。公式与 Mermaid 暂以原文显示。Word 导入、云同步、公众号自动发布和原生客户端未实现。

清理网站数据会移除本地文章，请定期导出工作台备份。存储异常会提示，避免覆盖无法读取的原数据。

## 验证与设计

`npm test`、`npm run typecheck`、`npm run build`。测试覆盖内容保留、主题结构、内联样式、安全过滤、编号判重、备份校验及快照合并。

本轮按用户指定 product-ui-ux-polish 技能执行，观察了 [UI Notes 的应用截图](https://uinotes.com/pin/219709674532508721) 与 [Doocs 工作区](https://md.doocs.org/)。截图只用于视觉判断。工作台使用暖白与墨色，钴蓝强调主动作和选择状态；文章主题用相同内容比较，并展示具体版式说明。

## 网站发布

生产域名： https://saylit.agentclub.dev 。仓库： https://github.com/agent-club/saylit 。

Cloudflare Workers 托管 Next.js 静态产物 `out/`；域名和资源目录由 `wrangler.jsonc` 管理。

GitHub Flow：功能分支提交 PR，测试、类型检查、构建和部署预检通过后合并到 `main`，GitHub Actions 自动发布。PR 不使用生产令牌；检查失败不会发布。生产部署串行执行，发布前跳过已经落后于 `main` 的提交。

仓库 Actions Secrets 设置 `CLOUDFLARE_API_TOKEN`，Actions Variables 设置 `CLOUDFLARE_ACCOUNT_ID`。令牌仅授权目标账户的 Workers Scripts 编辑，以及 `agentclub.dev` 的 Zone 读取和 Workers Routes 编辑。不要将令牌提交到代码。首次绑定前确认子域名没有被其他服务占用。

回滚：revert 引入问题的 PR，检查通过并合并到 `main` 后自动发布恢复版本。
