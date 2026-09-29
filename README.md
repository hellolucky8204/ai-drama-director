# AI短剧导演（AI Drama Director）

面向**从未做过短剧的新手**的 AI 短剧生产系统。

目标：用户只需要完成“选择 / 确认 / 修改”，系统一步步带领用户从一个想法生成第一集短剧制作包。

## V1 核心流程

创建项目 → 选题/输入故事 → 故事骨架 → AI检查 → 人物设定 → 60秒剧本 → 自动分镜 → 生图 Prompt → 视频 Prompt → 剪辑时间轴 → 导出制作包

## 产品原则

- 小白优先：不要求理解编剧、分镜、Prompt 等专业知识
- 单一下一步：每个页面只突出一个主操作
- 专业能力后置：复杂参数默认折叠
- 生成后检查：关键阶段支持 AI Health Check
- V1 先跑通生产链，不追求一键出片

## 内置 Demo

**《丈夫每月给陌生女人2万元》**

用于 V1 端到端验收。

## 技术栈建议

- Next.js
- TypeScript
- Tailwind CSS
- 数据层先用本地 mock + adapter，后续切 Supabase
- AI 使用 provider abstraction
- 图片/视频 V1 先生成结构化 Prompt，后续再接模型 API

## 开发任务

见 Issue #1。

## 本地运行

要求 Node.js 22 LTS 或更新的受支持版本。

```bash
npm install
npm run dev
```

打开 http://localhost:3000。无需环境变量或 API Key。

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

浏览器测试默认使用 Playwright Chromium（首次执行 `npx playwright install chromium`）。可通过 `PLAYWRIGHT_CHROME_PATH` 指定已有 Chrome 可执行文件。

## 已实现的 V1 第一阶段

- 中文首页、三种故事入口、六个推荐方向、我的项目。
- 八步导航：故事 → 人物 → 剧本 → 分镜 → 画面 → 视频 → 剪辑 → 成片。
- 内置 Demo：指定人物、12 镜 / 60 秒、指定悬念结尾。
- 故事编辑、本地规则体检和 mock 补齐；角色编辑、风格切换、锁定。
- 剧本编辑同步分镜；画面 / 视频 Prompt 从当前角色和镜头派生，可复制。
- 剪辑时间轴、字幕、声音建议、封面、发布文案和预告。
- localStorage 自动保存、Markdown / JSON 制作包导出。

## 架构与边界

`src/lib/domain.ts` 定义 Project、Character、Episode、Scene、Shot、PromptAsset 和 ExportPackage，并负责派生 Prompt、时间轴和导出。

`src/lib/provider.ts` 提供 AIProvider 接口和 MockAIProvider；`src/lib/storage.ts` 提供 ProjectRepository 接口及 localStorage 实现，后续可替换 provider/repository。

新建项目使用通用悬疑情感模板，保存用户输入但不会真实理解小说或生成定制剧情。故事调整不会自动重写后续剧本，需用户手动核对修改。故事体检只判断五个要素是否达到基本填写长度，不提供真实 AI 评分。角色与剧本修改实时同步到后续 Prompt；画面页“生成这一镜”准备 mock 描述，不会生成图片。

数据仅存于当前浏览器，清除站点数据或更换浏览器会丢失；请及时导出备份。JSON 是输出格式，V1 不包含导入恢复功能。存储读取/写入错误会在页面提示。

未接入真实 AI、图片/视频生成、Seedance、可灵、Supabase、登录、自动剪辑或自动发布。成片页导出的是制作包，不是视频文件。

在限制文件监听数量的开发环境，如遇 `EMFILE`，可使用 `WATCHPACK_POLLING=true npm run dev`。GitHub Actions 会在 Linux Chromium 中验证 Demo 八步、下载内容、三种创建入口、刷新恢复及移动端宽度。
