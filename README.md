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
