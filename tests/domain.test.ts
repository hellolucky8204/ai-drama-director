import { test } from "node:test";
import assert from "node:assert/strict";
import { provider } from "../src/lib/provider";
import { exportPackage, prompts, timeline, health } from "../src/lib/domain";
import { repository, STORAGE_KEY } from "../src/lib/storage";
test("demo has 12 shots totaling 60 seconds and exact ending", () => {
  const p = provider.createProject("Demo", "", "demo", true);
  assert.equal(p.shots.length, 12);
  assert.equal(
    p.shots.reduce((n, s) => n + s.duration, 0),
    60,
  );
  assert.equal(timeline(p).at(-1)?.end, 60);
  assert.match(p.episode.script[9].dialogue, /五年前你为什么能活下来/);
  assert.equal(p.episode.script[10].dialogue, "你给她打电话了？");
  assert.ok(health(p.story).every((x) => x.passed));
});
test("prompts reflect edited character identity and exports contain all assets", () => {
  const p = provider.createProject("Demo", "", "demo", true);
  p.characters[0].outfit = "蓝色风衣";
  p.characters[0].locked = true;
  assert.match(prompts(p)[0].image_prompt, /蓝色风衣/);
  const out = exportPackage(p);
  const json = JSON.parse(out.json);
  assert.equal(json.prompts.length, 12);
  assert.equal(json.timeline.length, 12);
  assert.match(out.markdown, /剪辑时间轴与字幕/);
  assert.match(out.markdown, /蓝色风衣/);
});
test("new project preserves user input and uses independent IDs", () => {
  const a = provider.createProject("旧手机", "每天凌晨响起的旧手机", "idea");
  const b = provider.createProject("小说", "用户原文", "text");
  assert.equal(a.story.premise, "每天凌晨响起的旧手机");
  assert.equal(b.source, "用户原文");
  assert.notEqual(a.id, b.id);
});
test("health optimization fills missing story fields", () => {
  const p = provider.createProject("Test", "Test", "idea");
  p.story.hook = "";
  assert.equal(health(p.story)[0].passed, false);
  assert.equal(health(provider.optimize(p.story))[0].passed, true);
});
test("repository round trips and rejects corrupt data without writing", () => {
  const values = new Map<string, string>();
  Object.defineProperty(globalThis, "localStorage", {
    value: {
      getItem: (k: string) => values.get(k) ?? null,
      setItem: (k: string, v: string) => values.set(k, v),
    },
    configurable: true,
  });
  const p = provider.createProject("Test", "Input", "idea");
  repository.save([p]);
  assert.deepEqual(repository.load(), [p]);
  values.set(STORAGE_KEY, "bad json");
  assert.throws(() => repository.load());
  assert.equal(values.get(STORAGE_KEY), "bad json");
});
