# 项目目录结构

```
md2wechat/
├── README.md                          # 项目说明
├── package.json                       # 根 workspace 配置 (pnpm workspace)
├── pnpm-workspace.yaml                # pnpm workspace 定义
├── tsconfig.json                      # 根 TypeScript 配置
├── .gitignore
│
├── apps/
│   └── web/                           # 主应用（Web 编辑器）
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── src/
│       │   ├── main.tsx               # 应用入口
│       │   ├── App.tsx                # 根组件（布局）
│       │   ├── index.css              # 全局样式 + Tailwind
│       │   │
│       │   ├── components/
│       │   │   ├── layout/
│       │   │   │   ├── AppLayout.tsx          # 整体布局（上工具栏，下面双栏）
│       │   │   │   ├── SplitPane.tsx          # 可拖拽分栏容器
│       │   │   │   └── Resizer.tsx            # 分隔线拖拽 handle
│       │   │   │
│       │   │   ├── toolbar/
│       │   │   │   ├── Toolbar.tsx            # 顶部工具栏容器
│       │   │   │   ├── FileMenu.tsx           # 文件菜单（新建/打开/保存）
│       │   │   │   ├── EditMenu.tsx           # 编辑菜单（撤销/重做/查找）
│       │   │   │   ├── FormatMenu.tsx         # 格式菜单（标题/列表/代码）
│       │   │   │   ├── InsertMenu.tsx         # 插入菜单（链接/图片/表格/公式）
│       │   │   │   ├── ThemeSwitcher.tsx      # 主题下拉切换
│       │   │   │   └── HelpMenu.tsx           # 帮助菜单（快捷键/关于）
│       │   │   │
│       │   │   ├── editor/
│       │   │   │   ├── MarkdownEditor.tsx     # CodeMirror 编辑器封装
│       │   │   │   ├── TabBar.tsx             # 多标签页栏
│       │   │   │   ├── TabItem.tsx            # 单个标签页
│       │   │   │   └── EditorStatusBar.tsx    # 底部状态栏（行列/字数）
│       │   │   │
│       │   │   ├── preview/
│       │   │   │   ├── PreviewPane.tsx        # 预览区容器
│       │   │   │   ├── WechatPreview.tsx      # 微信模拟容器（手机宽度）
│       │   │   │   ├── MermaidDiagram.tsx     # Mermaid 图表渲染组件
│       │   │   │   ├── CopyButton.tsx         # 复制 HTML 按钮
│       │   │   │   └── DownloadButton.tsx     # 下载 HTML 按钮
│       │   │   │
│       │   │   ├── theme/
│       │   │   │   ├── ThemePanel.tsx         # 主题设置侧边面板
│       │   │   │   ├── ThemeList.tsx          # 主题列表
│       │   │   │   ├── StyleEditor.tsx        # 自定义样式编辑器
│       │   │   │   └── CustomThemeModal.tsx   # 导入自定义主题弹窗
│       │   │   │
│       │   │   ├── import/
│       │   │   │   ├── ImportDialog.tsx       # 导入弹窗主容器
│       │   │   │   ├── FeishuImportForm.tsx   # 飞书导入表单
│       │   │   │   ├── NotionImportForm.tsx   # Notion 导入表单
│       │   │   │   ├── FileImportButton.tsx   # 本地文件导入
│       │   │   │   └── ImportProgress.tsx     # 导入进度条
│       │   │   │
│       │   │   ├── publish/
│       │   │   │   ├── PublishDialog.tsx      # 发布弹窗
│       │   │   │   ├── WechatPublishForm.tsx  # 微信发布表单
│       │   │   │   └── PublishPreview.tsx     # 发布前预览
│       │   │   │
│       │   │   └── ui/                        # shadcn/ui 组件库
│       │   │       ├── button.tsx
│       │   │       ├── dialog.tsx
│       │   │       ├── dropdown-menu.tsx
│       │   │       ├── input.tsx
│       │   │       ├── select.tsx
│       │   │       ├── tooltip.tsx
│       │   │       ├── toast.tsx
│       │   │       └── ... (按需添加)
│       │   │
│       │   ├── hooks/
│       │   │   ├── useMarkdownParser.ts       # Markdown 解析 hook
│       │   │   ├── useTheme.ts                # 主题切换 hook
│       │   │   ├── useClipboard.ts            # 剪贴板操作 hook
│       │   │   ├── useWechatCompat.ts         # 微信兼容处理 hook
│       │   │   ├── useAutoSave.ts             # 自动保存 hook
│       │   │   ├── useSyncScroll.ts           # 同步滚动 hook
│       │   │   ├── useFileOperations.ts       # 文件操作 hook
│       │   │   ├── useImport.ts               # 导入操作 hook
│       │   │   └── useKeybinding.ts           # 快捷键 hook
│       │   │
│       │   ├── stores/
│       │   │   ├── editorStore.ts             # 编辑器状态
│       │   │   ├── themeStore.ts              # 主题状态
│       │   │   ├── settingsStore.ts           # 设置状态
│       │   │   └── importStore.ts             # 导入状态
│       │   │
│       │   ├── types/
│       │   │   └── index.ts                   # 全局类型定义
│       │   │
│       │   └── utils/
│       │       ├── file.ts                    # 文件读写工具
│       │       ├── download.ts                # 下载工具
│       │       └── constants.ts               # 常量
│       │
│       └── public/
│           └── favicon.svg
│
├── packages/
│   ├── core/                          # 核心渲染引擎包（可独立发布 npm）
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── src/
│   │   │   ├── index.ts               # 包入口，导出全部 API
│   │   │   ├── parser.ts              # markdown-it 配置 + 初始化
│   │   │   ├── renderer.ts            # 自定义 token renderer
│   │   │   ├── wechat.ts              # 微信兼容后处理器
│   │   │   ├── types.ts               # 核心类型定义
│   │   │   │
│   │   │   ├── plugins/
│   │   │   │   ├── katex.ts           # KaTeX 数学公式插件
│   │   │   │   ├── mermaid.ts         # Mermaid 图表插件
│   │   │   │   ├── footnote.ts        # 脚注插件（基于 markdown-it-footnote）
│   │   │   │   ├── alert.ts           # GFM Alert 插件
│   │   │   │   ├── toc.ts             # 目录插件
│   │   │   │   └── container.ts       # 自定义容器插件
│   │   │   │
│   │   │   ├── theme/
│   │   │   │   ├── types.ts           # Theme Schema 类型
│   │   │   │   ├── renderer.ts        # Theme → inline CSS 渲染器
│   │   │   │   └── presets/
│   │   │   │       ├── default.ts     # 默认主题
│   │   │   │       ├── tech.ts        # 技术风主题
│       │   │   │       ├── elegant.ts       # 优雅主题
│       │   │   │       ├── minimal.ts       # 极简主题
│       │   │   │       ├── dark.ts          # 暗色主题
│       │   │   │       └── index.ts         # 主题导出汇总
│       │   │   │
│       │   │   └── wechat/
│       │   │       ├── imageProcessor.ts     # 图片处理（外链检测/上传替换）
│       │   │       ├── styleInliner.ts       # CSS 样式内联化
│       │   │       ├── codeBlockProcessor.ts # 代码块微信兼容处理
│       │   │       ├── sanitizer.ts          # HTML 清理（移除微信不支持标签）
│       │   │       └── utils.ts              # 微信工具函数
│       │   │
│       │   └── __tests__/                    # 单元测试
│       │       ├── parser.test.ts
│       │       ├── theme.test.ts
│       │       └── wechat.test.ts
│       │
│       └── vitest.config.ts                  # 测试配置
│
│   └── connectors/                           # 文档连接器共享包
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── index.ts
│           ├── types.ts                      # DocumentConnector / ResolvedDocument
│           ├── local.ts                      # 本地 Markdown/HTML/导出包解析
│           ├── feishu.ts                     # 飞书 block -> Markdown/HTML 转换
│           ├── notion.ts                     # Notion Enhanced Markdown 清理
│           └── assets.ts                     # 图片资源清单提取
│
├── server/                            # 后端服务（可选阶段引入）
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── main.ts                    # 服务入口
│   │   ├── config.ts                  # 配置（环境变量）
│   │   ├── middleware/
│   │   │   ├── cors.ts                # CORS 中间件
│   │   │   ├── auth.ts                # 认证中间件（预留）
│   │   │   └── error.ts               # 错误处理中间件
│   │   ├── routes/
│   │   │   ├── connectors.ts          # 飞书/Notion 文档连接器 API
│   │   │   ├── assets.ts              # 图片下载、上传和 URL 替换
│   │   │   └── wechat.ts              # 微信 API 封装（素材上传/草稿发布）
│   │   ├── services/
│   │   │   ├── feishuService.ts       # 飞书 API 调用封装
│   │   │   ├── notionService.ts       # Notion API 调用封装
│       │   │   └── wechatService.ts      # 微信 API 调用封装
│       │   └── types/
│       │       └── index.ts              # 后端类型
│       │
│       └── tests/
│           └── api.test.ts
│
└── docs/                              # 文档（如需要）
    ├── api.md
    └── theme-guide.md
```

## 关键目录说明

| 目录 | 说明 |
|------|------|
| `apps/web` | 用户直接交互的 Web 应用 |
| `packages/core` | 与 UI 无关的纯逻辑包，可独立发布到 npm |
| `packages/connectors` | 外部文档导入的共享类型、转换器和资源清单 |
| `server` | API 代理、图片搬运、微信发布；初期可跳过 |
| `docs` | 开发文档 |

## Monorepo 优势

1. **packages/core 独立**：渲染引擎可独立发布，供其他项目使用
2. **代码复用**：前端和后端可共享类型定义（通过 `packages/types` 未来可扩展）
3. **统一构建**：pnpm workspace 统一管理依赖版本
4. **逐步扩展**：初期只开发 `apps/web` 和 `packages/core`，后期按需添加 `server`
