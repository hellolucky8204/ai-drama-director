"use client";
import { useEffect, useState } from "react";
import {
  Character,
  Project,
  Story,
  exportPackage,
  health,
  prompts,
  steps,
  timeline,
} from "@/lib/domain";
import { directions, provider } from "@/lib/provider";
import { repository } from "@/lib/storage";
const storyLabels: Record<keyof Story, string> = {
  premise: "一句话故事",
  hook: "前3秒 · 开场钩子",
  conflict: "核心冲突",
  escalation: "冲突升级 / 信息差",
  twist: "第一次反转",
  ending: "尾钩",
};
const charLabels: Record<string, string> = {
  name: "姓名",
  role: "角色",
  age: "年龄",
  gender: "性别",
  appearance: "外貌",
  hair: "发型",
  outfit: "服装",
  temperament: "气质",
  personality: "性格",
  desire: "核心欲望",
  secret: "隐藏秘密",
  speech_style: "说话方式",
  visual_prompt: "视觉关键词",
};
export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]),
    [active, setActive] = useState<string | null>(null),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [creating, setCreating] = useState(false),
    [sourceType, setSourceType] = useState("idea"),
    [title, setTitle] = useState(""),
    [source, setSource] = useState(""),
    [format, setFormat] = useState("markdown");
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setProjects(repository.load());
      } catch {
        setError(
          "无法读取本地项目。创建新项目会替换无法读取的数据，请先备份浏览器数据。",
        );
      }
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  const p = projects.find((x) => x.id === active);
  function persist(next: Project[]) {
    try {
      repository.save(next);
      setError("");
      setNotice("已保存到本机");
    } catch {
      setError(
        "本地保存失败，可能空间不足或浏览器禁用了存储。请立即导出制作包备份。",
      );
    }
    setProjects(next);
  }
  function update(next: Project) {
    persist(
      projects.map((x) =>
        x.id === next.id
          ? { ...next, updated_at: new Date().toISOString() }
          : x,
      ),
    );
  }
  function create(demo = false) {
    const project = provider.createProject(
      demo ? "丈夫每月给陌生女人2万元" : title.trim(),
      demo ? "丈夫连续五年每月给陌生女人转账2万元" : source.trim(),
      demo ? "demo" : sourceType,
      demo,
    );
    persist([...projects, project]);
    setActive(project.id);
    setCreating(false);
    setNotice(
      demo
        ? "已载入 Demo，可逐步确认制作包"
        : "已创建 mock 草稿，请按自己的故事修改。通用模板不会自动理解原文。",
    );
  }
  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("已复制 Prompt");
    } catch {
      setNotice("复制失败，请展开高级区域手动选择文本。");
    }
  }
  function download() {
    if (!p) return;
    const pack = exportPackage(p);
    const blob = new Blob([format === "json" ? pack.json : pack.markdown], {
      type:
        format === "json"
          ? "application/json;charset=utf-8"
          : "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${p.title.replace(/[\\/:*?"<>|]/g, "_")}.${format === "json" ? "json" : "md"}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    update({ ...p, status: "已导出" });
    setNotice("制作包已导出");
  }
  const locked = !!p?.characters.every((c) => c.locked);
  function next() {
    if (!p) return;
    if (p.current_step === 1 && !locked) {
      setNotice("请先确认并锁定全部角色，再进入剧本。");
      return;
    }
    update({ ...p, current_step: Math.min(7, p.current_step + 1) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function changeCharacter(id: string, key: string, value: string) {
    if (!p) return;
    update({
      ...p,
      characters: p.characters.map((c) =>
        c.id === id
          ? {
              ...c,
              [key]:
                key === "age"
                  ? Math.max(1, Math.min(120, Number(value)))
                  : value,
            }
          : c,
      ),
      generated: [],
    });
  }
  return (
    <>
      <header className="topbar">
        <button
          className="brand"
          onClick={() => {
            setActive(null);
            setCreating(false);
          }}
        >
          ▣{" "}
          <span>
            短剧导演<span className="brand-en">AI DRAMA DIRECTOR</span>
          </span>
        </button>
        <span className="mode">V1 · 本地创作工作台</span>
      </header>
      <main>
        {error && (
          <div role="alert" className="error">
            {error}
          </div>
        )}
        <div role="status" className="notice">
          {notice}
        </div>
        {!ready ? (
          <p>正在读取项目…</p>
        ) : !p ? (
          <>
            <section className="hero">
              <div className="eyebrow">从第一个灵感，到第一集作品</div>
              <h1>
                把一个想法，变成
                <br />
                <em>第一部 AI 短剧</em>
              </h1>
              <p>
                不需要懂编剧，也不用从空白开始。
                <br />
                跟着八个步骤，准备好你的第一集制作包。
              </p>
              <button
                className={creating ? "" : "primary"}
                onClick={() => setCreating(true)}
              >
                开始制作第一部短剧 <span>↗</span>
              </button>
              <div className="hero-note">
                约 10–20 分钟 · 无需 API Key · 本机保存
              </div>
              <div className="hero-mark" aria-hidden="true">
                01
                <span>
                  YOUR FIRST
                  <br />
                  STORY STARTS HERE
                </span>
              </div>
            </section>
            {creating && (
              <section className="panel" id="create">
                <div className="section-heading">
                  <h2>从哪里开始？</h2>
                  <button onClick={() => setCreating(false)}>收起</button>
                </div>
                <div className="entry-grid">
                  {[
                    ["idea", "我有一个故事想法"],
                    ["discover", "我不知道拍什么"],
                    ["text", "我有小说 / 文案 / 故事"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      className={sourceType === value ? "selected" : ""}
                      onClick={() => {
                        setSourceType(value);
                        setSource("");
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    create();
                  }}
                >
                  <label>
                    项目名称
                    <input
                      required
                      maxLength={80}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="给你的第一部短剧起个名字"
                    />
                  </label>
                  {sourceType === "discover" && (
                    <div className="directions">
                      {directions.map((d) => (
                        <button
                          type="button"
                          key={d}
                          onClick={() => {
                            setSource(d);
                            if (!title) setTitle(d);
                          }}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  )}
                  <label>
                    {sourceType === "text"
                      ? "粘贴已有文本"
                      : "用一句话描述你的故事"}
                    <textarea
                      required
                      maxLength={10000}
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      placeholder="谁遇到了什么事？最意外的地方是什么？"
                    />
                  </label>
                  <p className="muted">
                    当前使用 mock
                    模板；输入会保存在故事设定中，后续内容可手动修改。
                  </p>
                  <button
                    className="primary"
                    type="submit"
                    disabled={!title.trim() || !source.trim()}
                  >
                    创建项目并进入故事 →
                  </button>
                </form>
              </section>
            )}
            <section>
              <div className="section-heading">
                <h2>
                  我的项目{" "}
                  <small>{projects.length.toString().padStart(2, "0")}</small>
                </h2>
                <span className="muted">每一个故事，都值得一个开始</span>
              </div>
              <div className="project-grid">
                <button className="demo-card" onClick={() => create(true)}>
                  <span className="tag">内置 DEMO · 悬疑情感</span>
                  <h3>
                    丈夫每月给
                    <br />
                    陌生女人2万元
                  </h3>
                  <p>一笔转账，一段被隐瞒了五年的秘密。</p>
                  <strong>体验完整制作流程 ↗</strong>
                </button>
                {projects.map((x) => (
                  <button
                    className="project-card"
                    key={x.id}
                    onClick={() => {
                      setActive(x.id);
                      setNotice("");
                    }}
                  >
                    <span className="tag">{x.status} · 60秒</span>
                    <h3>{x.title}</h3>
                    <p>
                      第 {x.current_step + 1} / 8 步 · {steps[x.current_step]}
                    </p>
                    <div className="mini-progress">
                      <i
                        style={{
                          width: `${((x.current_step + 1) / 8) * 100}%`,
                        }}
                      />
                    </div>
                    <span>继续制作 →</span>
                  </button>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <div className="project-title">
              <div>
                <button className="back" onClick={() => setActive(null)}>
                  ← 我的项目
                </button>
                <h1>{p.title}</h1>
                <p className="muted">
                  第一集 · 60 秒 · 竖屏短视频{" "}
                  <span className="tag">MOCK 草稿</span>
                </p>
              </div>
              <span className="saved">本机项目 · {p.status}</span>
            </div>
            <nav aria-label="制作步骤" className="steps">
              {steps.map((step, i) => (
                <button
                  key={step}
                  aria-current={i === p.current_step ? "step" : undefined}
                  className={i === p.current_step ? "current" : ""}
                  onClick={() => update({ ...p, current_step: i })}
                >
                  <span>{i + 1}</span>
                  {step}
                </button>
              ))}
            </nav>
            <section className="workspace">
              <div className="step-intro">
                <span className="eyebrow">
                  STEP {String(p.current_step + 1).padStart(2, "0")} / 08
                </span>
                <h2>
                  {
                    [
                      "先把故事讲清楚",
                      "让观众记住你的人物",
                      "把故事变成60秒的画面",
                      "一次只拍好一个动作",
                      "为每个镜头准备画面",
                      "让画面动起来",
                      "把所有镜头连成故事",
                      "你的第一集制作包，准备好了",
                    ][p.current_step]
                  }
                </h2>
                <p>
                  {
                    [
                      "确认故事的冲突与悬念，再开始塑造人物。",
                      "修改角色设定后，确认并锁定，后续画面会引用同一套外观。",
                      "逐段检查画面、动作和台词。修改会同步到分镜。",
                      "每镜聚焦一个动作，降低后续生成难度。",
                      "先确认角色。点击生成这一镜，准备 mock 画面 Prompt。",
                      "复制每镜的动作描述，在外部视频工具中使用。",
                      "按下面的顺序，在剪映等工具中组装素材。",
                      "导出故事、角色、剧本、分镜、Prompt 和剪辑信息。",
                    ][p.current_step]
                  }
                </p>
              </div>
              {p.current_step === 0 && (
                <div className="story-layout">
                  <div className="panel">
                    {Object.entries(storyLabels).map(([key, label]) => (
                      <label key={key}>
                        {label}
                        <textarea
                          value={p.story[key as keyof Story]}
                          onChange={(e) =>
                            update({
                              ...p,
                              story: { ...p.story, [key]: e.target.value },
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>
                  <aside className="panel health">
                    <span className="tag">STORY HEALTH CHECK</span>
                    <h3>故事体检</h3>
                    <p className="muted">
                      本地规则检查：仅检查要素是否填写充分，不代表真实 AI
                      质量评分。
                    </p>
                    {health(p.story).map((h) => (
                      <div className="check" key={h.label}>
                        <span>{h.label}</span>
                        <b className={h.passed ? "pass" : "warn"}>
                          {h.passed ? "✓ 通过" : "需优化"}
                        </b>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        update({ ...p, story: provider.optimize(p.story) });
                        setNotice(
                          "Mock 优化已补齐缺失要素，请检查与故事是否一致。",
                        );
                      }}
                    >
                      AI 帮我优化 · Mock
                    </button>
                  </aside>
                </div>
              )}
              {p.current_step === 1 && (
                <div className="character-grid">
                  {p.characters.map((c) => (
                    <article className="panel" key={c.id}>
                      <div className="avatar">{c.name.slice(0, 1)}</div>
                      <h3>
                        {c.name}{" "}
                        <small>{c.locked ? "角色已锁定" : "待确认"}</small>
                      </h3>
                      {Object.entries(charLabels).map(([key, label]) => (
                        <label key={key}>
                          {label}
                          <input
                            disabled={c.locked}
                            type={key === "age" ? "number" : "text"}
                            min={1}
                            max={120}
                            value={String(c[key as keyof Character])}
                            onChange={(e) =>
                              changeCharacter(c.id, key, e.target.value)
                            }
                          />
                        </label>
                      ))}
                      <div className="actions">
                        <button
                          onClick={() =>
                            update({
                              ...p,
                              characters: p.characters.map((x) =>
                                x.id === c.id ? { ...x, locked: !x.locked } : x,
                              ),
                            })
                          }
                        >
                          {c.locked ? "解锁并修改" : "确认并锁定"}
                        </button>
                        {!c.locked && (
                          <button
                            onClick={() =>
                              changeCharacter(
                                c.id,
                                "temperament",
                                c.temperament === "温柔坚定"
                                  ? "知性克制"
                                  : "温柔坚定",
                              )
                            }
                          >
                            换一种感觉
                          </button>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {p.current_step === 2 && (
                <>
                  <div className="summary">
                    12 段画面{" "}
                    <b>
                      总时长{" "}
                      {p.episode.script.reduce((n, s) => n + s.duration, 0)} 秒
                    </b>
                    <span>台词建议先试读，再进入剪辑。</span>
                  </div>
                  {p.episode.script.map((s, i) => (
                    <article className="panel script-row" key={s.id}>
                      <div className="shot-number">
                        {String(i + 1).padStart(2, "0")}
                        <small>{s.duration} 秒</small>
                      </div>
                      <div>
                        {(
                          ["visual", "action", "dialogue", "emotion"] as const
                        ).map((key) => (
                          <label key={key}>
                            {
                              {
                                visual: "画面",
                                action: "动作",
                                dialogue: "台词",
                                emotion: "情绪",
                              }[key]
                            }
                            <textarea
                              value={s[key]}
                              onChange={(e) =>
                                update({
                                  ...p,
                                  episode: {
                                    ...p.episode,
                                    script: p.episode.script.map((x) =>
                                      x.id === s.id
                                        ? { ...x, [key]: e.target.value }
                                        : x,
                                    ),
                                  },
                                  shots: p.shots.map((x) =>
                                    x.id === s.id
                                      ? { ...x, [key]: e.target.value }
                                      : x,
                                  ),
                                  generated: [],
                                })
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </article>
                  ))}
                </>
              )}
              {p.current_step === 3 && (
                <div className="shot-grid">
                  {p.shots.map((s) => (
                    <article className="panel" key={s.id}>
                      <span className="tag">
                        镜头 {s.order.toString().padStart(2, "0")} ·{" "}
                        {s.duration} 秒
                      </span>
                      <h3>{s.visual}</h3>
                      <p>
                        {s.action} · {s.emotion}
                      </p>
                      <p className="muted">
                        人物：
                        {p.characters
                          .filter((c) => s.character_ids.includes(c.id))
                          .map((c) => c.name)
                          .join("、")}
                      </p>
                      <details>
                        <summary>拍摄建议与高级参数</summary>
                        <p>
                          {s.framing} · {s.director_note}
                        </p>
                      </details>
                    </article>
                  ))}
                </div>
              )}
              {(p.current_step === 4 || p.current_step === 5) && (
                <>
                  {!locked && (
                    <p className="error">
                      角色尚未全部锁定。请返回人物页确认，保证画面一致。
                    </p>
                  )}
                  <div className="shot-grid">
                    {prompts(p).map((a, i) => (
                      <article className="panel" key={a.shot_id}>
                        <div className="prompt-preview">
                          <span>镜头 {String(i + 1).padStart(2, "0")}</span>
                          <strong>{p.shots[i].visual}</strong>
                          <small>
                            {p.current_step === 4
                              ? "画面描述 · 未生成图片"
                              : "动作描述 · 未生成视频"}
                          </small>
                        </div>
                        <p>
                          {p.current_step === 4
                            ? a.references.join(" / ")
                            : p.shots[i].action}
                        </p>
                        {p.current_step === 4 && (
                          <button
                            disabled={!locked}
                            onClick={() => {
                              update({
                                ...p,
                                generated: [
                                  ...new Set([...p.generated, a.shot_id]),
                                ],
                              });
                              setNotice(
                                "本镜 mock Prompt 已准备好，可复制到外部生图工具。",
                              );
                            }}
                          >
                            {p.generated.includes(a.shot_id)
                              ? "已准备 · 重新生成"
                              : "生成这一镜"}
                          </button>
                        )}
                        <button
                          disabled={!locked}
                          onClick={() =>
                            copy(
                              p.current_step === 4
                                ? a.image_prompt
                                : a.video_prompt,
                            )
                          }
                        >
                          复制{p.current_step === 4 ? "画面" : "视频"} Prompt
                        </button>
                        <details>
                          <summary>高级 · 查看完整 Prompt</summary>
                          <p>
                            {p.current_step === 4
                              ? a.image_prompt
                              : a.video_prompt}
                          </p>
                          <p>禁止项：{a.negative_prompt}</p>
                          <p>角色引用：{a.references.join("、")}</p>
                          <p>{a.parameters}</p>
                        </details>
                      </article>
                    ))}
                  </div>
                </>
              )}
              {p.current_step === 6 && (
                <>
                  <div className="panel table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>时间轴</th>
                          <th>镜头</th>
                          <th>台词 / 字幕</th>
                          <th>动作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {timeline(p).map((s) => (
                          <tr key={s.id}>
                            <td>
                              {s.start}–{s.end}秒
                            </td>
                            <td>{s.order}</td>
                            <td>{s.dialogue || "无台词，保留环境声"}</td>
                            <td>{s.action}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="panel">
                    <h3>声音与发布准备</h3>
                    <p>
                      配音：按人物分别录制，保留停顿；台词过长时适当加快语速或精简文字。
                    </p>
                    {Object.entries({
                      bgm: "BGM 建议",
                      sound: "音效",
                      transition: "转场",
                      cover: "封面标题",
                      publish_title: "发布标题",
                      copy: "发布文案",
                      teaser: "下一集预告",
                    }).map(([key, label]) => (
                      <label key={key}>
                        {label}
                        <textarea
                          value={p.editing[key as keyof Project["editing"]]}
                          onChange={(e) =>
                            update({
                              ...p,
                              editing: { ...p.editing, [key]: e.target.value },
                            })
                          }
                        />
                      </label>
                    ))}
                  </div>
                </>
              )}
              {p.current_step === 7 && (
                <section className="panel export-panel">
                  <div className="export-icon">↗</div>
                  <h3>把故事带到制作现场</h3>
                  <p>
                    制作包包含故事设定、{p.characters.length} 张角色卡、60
                    秒剧本、{p.shots.length} 镜分镜、画面 / 视频
                    Prompt、时间轴、字幕及发布文案。
                  </p>
                  <p className="muted">
                    当前为 mock
                    制作包。图片、视频、配音与剪辑需使用外部工具完成。
                  </p>
                  {!locked && (
                    <p className="warn">
                      部分角色未锁定，导出后请继续核对人物一致性。
                    </p>
                  )}
                  <label>
                    导出格式
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                    >
                      <option value="markdown">
                        Markdown · 适合阅读与复制
                      </option>
                      <option value="json">JSON · 完整结构化数据</option>
                    </select>
                  </label>
                  <details>
                    <summary>预览制作包</summary>
                    <pre>{exportPackage(p).markdown}</pre>
                  </details>
                </section>
              )}
              <footer className="step-footer">
                <div>
                  <strong>
                    {p.current_step + 1} / 8 — {steps[p.current_step]}
                  </strong>
                  <p>
                    {p.current_step < 7
                      ? `下一步：${steps[p.current_step + 1]}`
                      : "下一步：下载制作包，开始准备外部素材"}
                  </p>
                </div>
                <div className="actions">
                  {p.current_step > 0 && (
                    <button
                      onClick={() =>
                        update({ ...p, current_step: p.current_step - 1 })
                      }
                    >
                      上一步
                    </button>
                  )}
                  <button
                    className="primary"
                    disabled={p.current_step === 1 && !locked}
                    onClick={p.current_step === 7 ? download : next}
                  >
                    {p.current_step === 7
                      ? "导出制作包 ↓"
                      : `确认，进入${steps[p.current_step + 1]} →`}
                  </button>
                </div>
              </footer>
            </section>
          </>
        )}
        <footer className="site-footer">
          AI 短剧导演 · 让第一个故事发生{" "}
          <span>数据仅保存在当前浏览器，请及时导出备份</span>
        </footer>
      </main>
    </>
  );
}
