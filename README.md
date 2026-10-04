# Saylit · 简言

A browser-based Markdown editor for styling articles for WeChat Official Accounts. Built with Next.js App Router, React, and TypeScript. Write, preview, choose a layout, and export—all without an account or backend.

[Try Saylit](https://saylit.agentclub.dev/) · [English](#english) · [简体中文](#简体中文)

## English

### Features

- **Write and preview:** Markdown editing, live preview, a formatting toolbar, and undo/redo.
- **36 themes across six categories:** layouts style headings, paragraph spacing, quotes, lists, tables, code, dividers, and images together.
- **Find your layout:** article thumbnails, theme search and favorites, and side-by-side previews of the same article in two themes.
- **Adjust each article:** save its font size, density, and accent color independently.
- **Copy and export:** rich text or plain text; Markdown, HTML with inline styles, and workspace JSON backups. Restoring a backup adds articles to the workspace.
- **Local autosave:** articles are processed and saved in your browser. Saves merge the latest workspace snapshots; the most recently updated version wins for the same article. Conflicting favorite changes prompt a new selection. This is not collaborative editing or version history.
- **Small-screen support:** switch between writing, preview, and themes; open articles from the sidebar drawer.
- **Offline access:** the production site includes a service worker. Open it online first; PWA installation depends on browser support and requires HTTPS.

### Run locally

Use Node.js 24 to match CI.

```sh
npm ci
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

To preview the production build:

```sh
npm run build
npm start
```

The static build is written to `out/`.

### Checks

```sh
npm test
npm run typecheck
npm run build
npm run deploy:check
```

Tests cover content preservation, theme structure, inline styles, HTML sanitization, numbering deduplication, backup validation, and snapshot merging. The deployment check runs Wrangler in dry-run mode.

### Deployment and contributions

Saylit is hosted on Cloudflare Workers at [saylit.agentclub.dev](https://saylit.agentclub.dev/). `wrangler.jsonc` defines the custom domain, account, and static asset directory.

Use GitHub Flow: make changes on a feature branch and open a pull request. Tests, type checking, the static build, and the deployment dry run must pass before merging into `main`. GitHub Actions then deploys automatically and checks the production HTTPS page, manifest, and service worker. Pull requests do not use the production token. Production deployments run serially and skip commits already superseded on `main`.

For your own deployment, update the account and domain in `wrangler.jsonc`, and update the production URLs in `.github/workflows/deploy.yml`. Set the repository's `CLOUDFLARE_API_TOKEN` Actions secret. The token needs Workers Scripts edit permission for the target account and Zone read permission for the target zone. Keep tokens out of source control and confirm that the subdomain is available before its first binding.

To roll back, revert the problematic pull request and merge the revert into `main` after its checks pass.

### Limitations and data

Final paste fidelity in the WeChat editor has not yet been verified. After copying, check images, tables, code blocks, and the end of the article. Upload local images in the WeChat editor. Formulas and Mermaid diagrams currently appear as source text. Word import, cloud sync, automatic WeChat publishing, and a native desktop app are not implemented.

Clearing site data removes locally saved articles. Export workspace backups regularly. Storage errors are reported so unreadable data is not overwritten.

### Design

The workspace uses warm white, ink tones, and cobalt blue for primary actions and selection states. Themes are compared using the same content, with explanations of their layout choices. Visual references include [UI Notes](https://uinotes.com/pin/219709674532508721) and the [Doocs editor](https://md.doocs.org/).

## 简体中文

简言是一款面向微信公众号文章排版的浏览器 Markdown 编辑器，使用 Next.js App Router、React 和 TypeScript 构建。写作、预览、选择版式、导出均无需账号或后端。

[在线使用](https://saylit.agentclub.dev/) · [返回 English](#english)

### 功能

- **写作与预览：** Markdown 编辑、实时预览、格式工具栏和撤销重做。
- **36 套主题、六个类别：** 标题、正文间距、引用、列表、表格、代码、分隔线与图片样式共同组成版式。
- **选择版式：** 文章缩略图、主题搜索收藏，以及同一篇文章的双主题对比。
- **逐篇调整：** 每篇文章独立保存字号、密度和强调色。
- **复制与导出：** 复制富文本或纯文本，导出 Markdown、内联样式 HTML 和工作台 JSON 备份；恢复备份会向工作台追加文章。
- **本地自动保存：** 文章在浏览器中处理和保存。保存时合并最新工作台快照，同一篇文章以更新时间决定胜出版本；收藏冲突会提示重新选择。此机制不提供协同编辑或版本历史。
- **小屏支持：** 切换写作、预览和主题视图，通过侧栏抽屉访问文章。
- **离线访问：** 生产版本包含 service worker，离线前需先在线打开；PWA 安装取决于浏览器支持，并需要 HTTPS。

### 本地运行

使用 Node.js 24，与 CI 保持一致。

```sh
npm ci
npm run dev
```

访问 [http://127.0.0.1:3000](http://127.0.0.1:3000)。预览生产版本：

```sh
npm run build
npm start
```

静态构建产物位于 `out/`。

### 检查

```sh
npm test
npm run typecheck
npm run build
npm run deploy:check
```

测试覆盖内容保留、主题结构、内联样式、HTML 安全过滤、编号判重、备份校验及快照合并。部署预检以 Wrangler dry-run 模式执行。

### 发布与贡献

简言由 Cloudflare Workers 托管，地址为 [saylit.agentclub.dev](https://saylit.agentclub.dev/)。`wrangler.jsonc` 管理自定义域名、账户和静态资源目录。

采用 GitHub Flow：在功能分支修改并提交 PR，测试、类型检查、静态构建和部署预检通过后合并到 `main`。GitHub Actions 随后自动发布，并检查生产环境的 HTTPS 页面、manifest 和 service worker。PR 不使用生产令牌；生产部署串行执行，并跳过已落后于 `main` 的提交。

部署自己的实例时，修改 `wrangler.jsonc` 中的账户与域名，并同步修改 `.github/workflows/deploy.yml` 中的生产地址。在仓库 Actions Secrets 中设置 `CLOUDFLARE_API_TOKEN`。令牌需要目标账户的 Workers Scripts 编辑权限和目标 Zone 的读取权限。不要将令牌提交到代码，首次绑定前确认子域名可用。

回滚时，revert 引入问题的 PR，检查通过并合并到 `main` 后自动发布恢复版本。

### 使用边界与数据

公众号后台最终粘贴效果尚未验证。复制后请检查图片、表格、代码和文章尾部；本地图片需要在公众号后台上传。公式与 Mermaid 暂以原文显示。Word 导入、云同步、公众号自动发布和原生客户端未实现。

清理网站数据会移除本地文章，请定期导出工作台备份。存储异常会提示，避免覆盖无法读取的原数据。

### 设计

工作台使用暖白与墨色，钴蓝强调主动作和选择状态。文章主题使用相同内容对比，并提供具体版式说明。视觉参考包括 [UI Notes](https://uinotes.com/pin/219709674532508721) 与 [Doocs 编辑器](https://md.doocs.org/)。
