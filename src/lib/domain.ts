export const steps = [
  "故事",
  "人物",
  "剧本",
  "分镜",
  "画面",
  "视频",
  "剪辑",
  "成片",
] as const;
export type Story = {
  premise: string;
  hook: string;
  conflict: string;
  escalation: string;
  twist: string;
  ending: string;
};
export type Character = {
  id: string;
  name: string;
  role: string;
  age: number;
  gender: string;
  appearance: string;
  hair: string;
  outfit: string;
  temperament: string;
  personality: string;
  desire: string;
  secret: string;
  speech_style: string;
  visual_prompt: string;
  locked: boolean;
};
export type Scene = {
  id: string;
  visual: string;
  action: string;
  dialogue: string;
  emotion: string;
  duration: number;
  character_ids: string[];
};
export type Episode = {
  id: string;
  episode_number: number;
  title: string;
  duration: number;
  script: Scene[];
};
export type Shot = Scene & {
  order: number;
  framing: string;
  director_note: string;
};
export type PromptAsset = {
  shot_id: string;
  image_prompt: string;
  video_prompt: string;
  negative_prompt: string;
  references: string[];
  parameters: string;
};
export type Project = {
  id: string;
  title: string;
  source_type: string;
  source: string;
  genre: string;
  audience: string;
  platform: string;
  status: string;
  current_step: number;
  updated_at: string;
  story: Story;
  characters: Character[];
  episode: Episode;
  shots: Shot[];
  generated: string[];
  editing: {
    bgm: string;
    sound: string;
    transition: string;
    cover: string;
    publish_title: string;
    copy: string;
    teaser: string;
  };
};
export type ExportPackage = {
  project_id: string;
  markdown: string;
  json: string;
};
export function prompts(p: Project): PromptAsset[] {
  return p.shots.map((s) => {
    const chars = p.characters.filter((c) => s.character_ids.includes(c.id));
    const identity = chars
      .map(
        (c) =>
          `${c.name}，${c.age}岁，${c.gender}，${c.appearance}，${c.hair}，${c.outfit}，${c.temperament}，${c.visual_prompt}`,
      )
      .join("；");
    return {
      shot_id: s.id,
      references: chars.map((c) => c.name),
      parameters: "9:16 竖屏 · 写实电影感 · 柔和侧光",
      image_prompt: `${identity}。场景：${s.visual}。${s.framing}，主体清晰，柔和侧光，写实电影感，9:16竖屏，保持角色外貌与服装一致。`,
      negative_prompt: "模糊、水印、多余肢体、变脸、改变服装、新增人物",
      video_prompt: `以本镜生成图为首帧。主动作：${s.action}。表情变化：${s.emotion}。镜头固定，持续${s.duration}秒，背景与光线稳定。不要变脸，不要改变服装，不要新增人物，不要出现多余肢体，不要复杂大幅动作。`,
    };
  });
}
export function health(story: Story) {
  return [
    ["前3秒钩子", story.hook],
    ["明确冲突", story.conflict],
    ["信息差", story.escalation],
    ["反转", story.twist],
    ["尾钩 / 追下一集动机", story.ending],
  ].map(([label, value]) => ({ label, passed: value.trim().length >= 10 }));
}
export function timeline(p: Project) {
  let time = 0;
  return p.shots.map((s) => {
    const start = time;
    time += s.duration;
    return { ...s, start, end: time, subtitle: s.dialogue };
  });
}
export function exportPackage(p: Project): ExportPackage {
  const assets = prompts(p);
  const data = {
    version: 1,
    project: p,
    prompts: assets,
    timeline: timeline(p),
  };
  const sections = [
    `# ${p.title}`,
    "> V1 mock 制作包；图片、视频和自动剪辑需在外部工具完成。",
    "## 故事设定",
    ...Object.entries(p.story).map(
      ([k, v]) =>
        `- ${({ premise: "一句话故事", hook: "开场钩子", conflict: "核心冲突", escalation: "冲突升级", twist: "第一次反转", ending: "尾钩" } as Record<string, string>)[k]}：${v}`,
    ),
    "## 人物卡",
    ...p.characters.map(
      (c) =>
        `### ${c.name}\n${Object.entries(c)
          .filter(([k]) => k !== "id")
          .map(([k, v]) => `- ${k}：${v}`)
          .join("\n")}`,
    ),
    "## 60秒剧本",
    ...p.episode.script.map(
      (s, i) =>
        `### ${i + 1} · ${s.duration}秒\n画面：${s.visual}\n\n动作：${s.action}\n\n台词：${s.dialogue || "无"}\n\n情绪：${s.emotion}`,
    ),
    "## 分镜表",
    ...p.shots.map(
      (s) =>
        `- ${s.order}｜${s.duration}秒｜${s.framing}｜${s.visual}｜${s.action}｜${s.emotion}｜${s.director_note}`,
    ),
    "## 生图 / 视频 Prompt",
    ...assets.map(
      (a, i) =>
        `### 镜头 ${i + 1}\n角色引用：${a.references.join("、")}\n\n画面参数：${a.parameters}\n\n正向：${a.image_prompt}\n\n负向：${a.negative_prompt}\n\n视频：${a.video_prompt}`,
    ),
    "## 剪辑时间轴与字幕",
    ...timeline(p).map(
      (s) =>
        `- ${s.start}–${s.end}秒｜镜头${s.order}｜字幕/台词：${s.subtitle || "无"}｜${p.editing.transition}`,
    ),
    "## 配音、音乐与发布",
    "配音：按人物分别录制，保留停顿，语速与镜头时长对应。",
    ...Object.entries(p.editing).map(([k, v]) => `- ${k}：${v}`),
  ];
  return {
    project_id: p.id,
    markdown: sections.join("\n\n"),
    json: JSON.stringify(data, null, 2),
  };
}
