# Home

个人笔记站点：技术笔记与生活记录。基于 [VitePress](https://vitepress.dev/) 搭建，通过 GitHub Actions 自动部署到 GitHub Pages。

在线访问：<https://michael-moo.github.io/home/>

## 文档目录

### 技术

- [Git 常用操作](./docs/tech/git.md)
- [前端构建工具链](./docs/tech/build.md)
- [前端状态管理：从 React Hooks 到 Pinia](./docs/tech/state-management.md)
- [面试经验：AI 应用方向资深前端的能力清单](./docs/tech/interview.md)

### 推荐

- [书单](./docs/recommend/book.md)
- [影视](./docs/recommend/video.md)
- [动漫](./docs/recommend/anime.md)
- [游戏](./docs/recommend/game.md)

### 生活

- [广东周边游](./docs/life/travel.md)
- [金句摘抄](./docs/life/quote.md)
- [ISFJ 性格介绍](./docs/life/isfj.md)

## 项目结构

```
.
├── .github/workflows/deploy.yml   # 推送 master 后自动构建并部署到 GitHub Pages
├── docs/                          # 站点文档
│   ├── .vitepress/config.mts      # 站点配置（导航栏、侧边栏等）
│   ├── index.md                   # 首页
│   ├── tech/                      # 技术
│   ├── recommend/                 # 推荐
│   └── life/                      # 生活
├── demo/                          # 早期学习用的小示例（Babel、Grunt、Koa、Vue、WebSocket），不参与站点构建
└── package.json
```

## 本地开发

需要 Node.js 22（与 CI 保持一致）。

```bash
npm install          # 安装依赖
npm run docs:dev     # 启动本地开发服务器
npm run docs:build   # 构建，产物输出到 docs/.vitepress/dist
npm run docs:preview # 本地预览构建产物
```

## 新增文档

1. 在 `docs/tech/`、`docs/recommend/` 或 `docs/life/` 下新建 Markdown 文件。
2. 在 `docs/.vitepress/config.mts` 对应分类的列表（`techItems`、`recommendItems`、`lifeItems`）里加一行，侧边栏才会显示。
3. 如有需要，同步更新首页 `docs/index.md` 的分类说明和本文件的文档目录。

## 部署

推送到 `master` 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages，也可以在 Actions 页面手动触发。

站点的 `base` 配置为 `/home/`，与仓库名一致；如果仓库改名，需要同步修改 `docs/.vitepress/config.mts` 中的 `base`。
