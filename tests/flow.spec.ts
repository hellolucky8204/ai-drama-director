import { test, expect } from "@playwright/test";
test("demo walks through all eight steps, persists and exports both formats", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("button", { name: /体验完整制作流程/ }).click();
  await expect(
    page.getByRole("heading", { name: "先把故事讲清楚" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "确认，进入人物" }).click();
  await expect(
    page.getByRole("button", { name: "确认，进入剧本" }),
  ).toBeDisabled();
  await page.getByLabel("服装", { exact: true }).first().fill("蓝色风衣");
  for (let i = 0; i < 3; i++)
    await page
      .getByRole("button", { name: "确认并锁定", exact: true })
      .first()
      .click();
  await page.getByRole("button", { name: "确认，进入剧本" }).click();
  await expect(page.getByText("总时长 60 秒")).toBeVisible();
  await page.getByRole("button", { name: "确认，进入分镜" }).click();
  await expect(page.getByText("镜头 01 · 3 秒")).toBeVisible();
  await page.getByRole("button", { name: "确认，进入画面" }).click();
  await page
    .getByRole("button", { name: "生成这一镜", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "复制画面 Prompt" }).first().click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "蓝色风衣",
  );
  await page.getByRole("button", { name: "确认，进入视频" }).click();
  await page.getByRole("button", { name: "复制视频 Prompt" }).first().click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "不要变脸",
  );
  await page.getByRole("button", { name: "确认，进入剪辑" }).click();
  await expect(page.getByText("55–60秒")).toBeVisible();
  await page.getByRole("button", { name: "确认，进入成片" }).click();
  for (const format of ["markdown", "json"]) {
    await page.getByLabel("导出格式").selectOption(format);
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "导出制作包" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(
      format === "json" ? /\.json$/ : /\.md$/,
    );
    const stream = await file.createReadStream();
    const chunks = [];
    for await (const chunk of stream!) chunks.push(chunk);
    const content = Buffer.concat(chunks).toString();
    expect(content).toContain("蓝色风衣");
    if (format === "json") expect(JSON.parse(content).prompts).toHaveLength(12);
  }
  await page.reload();
  await page.getByRole("button", { name: /已导出 · 60秒/ }).click();
  await expect(
    page.getByRole("heading", { name: "你的第一集制作包，准备好了" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("all three entry types create projects and survive reload", async ({
  page,
}) => {
  await page.goto("/");
  for (const [i, entry] of [
    "我有一个故事想法",
    "我不知道拍什么",
    "我有小说 / 文案 / 故事",
  ].entries()) {
    await page.getByRole("button", { name: "开始制作第一部短剧" }).click();
    await page.getByRole("button", { name: entry, exact: true }).click();
    await page.getByLabel("项目名称").fill(`测试项目${i}`);
    if (i === 1)
      await page
        .getByRole("button", { name: "失踪母亲寄来的生日礼物", exact: true })
        .click();
    else
      await page
        .getByLabel(i === 2 ? "粘贴已有文本" : "用一句话描述你的故事")
        .fill("一位女孩发现失踪母亲寄来的信");
    await page.getByRole("button", { name: "创建项目并进入故事" }).click();
    await expect(
      page.getByRole("heading", { name: `测试项目${i}`, exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "← 我的项目" }).click();
  }
  await page.reload();
  await expect(page.locator(".project-card")).toHaveCount(3);
});
test("mobile layout has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /体验完整制作流程/ }).click();
  for (const label of [
    "故事",
    "人物",
    "剧本",
    "分镜",
    "画面",
    "视频",
    "剪辑",
    "成片",
  ]) {
    await page
      .getByRole("navigation")
      .getByRole("button", { name: new RegExp(label) })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
