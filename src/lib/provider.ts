import { Character, Project, Story } from "./domain";
export interface AIProvider {
  createProject(
    title: string,
    source: string,
    sourceType: string,
    demo?: boolean,
  ): Project;
  optimize(story: Story): Story;
}
const character = (
  id: string,
  name: string,
  age: number,
  gender: string,
  outfit: string,
  secret: string,
): Character => ({
  id,
  name,
  age,
  gender,
  role: id === "c1" ? "主角" : id === "c2" ? "关键人物" : "神秘来客",
  appearance: "中国人，五官自然",
  hair: gender === "女性" ? "黑色中长发" : "黑色短发",
  outfit,
  temperament: "克制",
  personality: "细腻，遇事冷静",
  desire: "守住家庭，查明真相",
  secret,
  speech_style: "短句，低声，留有停顿",
  visual_prompt: "自然肤质，真实生活感",
  locked: false,
});
export const directions = [
  "婚姻里的一笔神秘转账",
  "失踪母亲寄来的生日礼物",
  "重逢的同学竟是面试官",
  "外卖袋里出现十年前的照片",
  "爷爷留下的钥匙打开陌生房门",
  "每天凌晨响起的旧手机",
];
export class MockAIProvider implements AIProvider {
  createProject(
    title: string,
    source: string,
    sourceType: string,
    demo = false,
  ): Project {
    const story: Story = demo
      ? {
          premise:
            "林妍发现丈夫连续五年，每月给陌生女人转账2万元，追查后发现这与自己的生死有关。",
          hook: "手机亮起：向沈岚转账20,000元。林妍的手停住了。",
          conflict: "林妍怀疑丈夫背叛，周川却坚持隐瞒收款人的身份。",
          escalation: "连续五年的转账记录，第一笔竟在结婚第二天。",
          twist: "这笔钱可能不是婚外情开销，而与林妍五年前活下来有关。",
          ending:
            "沈岚：“你老公没告诉你，五年前你为什么能活下来吗？”周川从浴室出来：“你给她打电话了？”",
        }
      : {
          premise: source,
          hook: `一个异常线索突然出现：${source.slice(0, 80)}`,
          conflict: "主角想查明线索，最信任的人却拒绝解释。",
          escalation: "主角发现这件事已持续多年，只有自己被蒙在鼓里。",
          twist: "以为是背叛，线索却指向一场曾经的保护。",
          ending: "电话那头说：“你确定，自己记得那天发生的事吗？”",
        };
    const characters = [
      character(
        "c1",
        demo ? "林妍" : "许宁",
        32,
        "女性",
        "米白针织衫",
        "对五年前的一段记忆缺失",
      ),
      character(
        "c2",
        demo ? "周川" : "陈安",
        35,
        "男性",
        "深灰居家服",
        "隐瞒五年前的秘密",
      ),
      character(
        "c3",
        demo ? "沈岚" : "陆青",
        42,
        "女性",
        "深色衬衫",
        "知道主角过去的真相",
      ),
    ];
    characters[0].temperament = "知性克制";
    characters[1].temperament = "温和可靠";
    characters[2].temperament = "成熟克制，略显疲惫";
    const rows = [
      [
        3,
        demo
          ? "客厅桌面的手机显示转账20,000元"
          : "客厅桌面的手机出现一条异常消息",
        "主角拿起手机",
        demo ? "两万？" : "这是什么？",
        "平静变疑惑",
        "c1",
      ],
      [
        5,
        "客厅，主角注视手机",
        "主角查看记录",
        demo ? "每个月……整整五年。" : "这些记录，竟然持续了这么久。",
        "疑惑变紧张",
        "c1",
      ],
      [
        5,
        "手机记录的日期特写",
        "手指停在第一条记录",
        demo ? "结婚第二天？" : "从那一天就开始了？",
        "震惊",
        "c1",
      ],
      [5, "浴室门外透出暖光", "主角抬头看向浴室", "", "压抑不安", "c1"],
      [
        5,
        "主角靠在客厅桌边",
        "主角深呼吸",
        demo ? "沈岚，你是谁？" : "这个人到底是谁？",
        "不安变坚定",
        "c1",
      ],
      [5, "手机拨号界面", "主角拨出号码", "", "犹豫", "c1"],
      [
        5,
        "另一间房，神秘女人接起电话",
        "女人接听电话",
        "喂？",
        "疲惫变警觉",
        "c3",
      ],
      [
        5,
        "客厅，主角握紧手机",
        "主角低声询问",
        demo ? "你为什么每月收我丈夫两万块？" : "为什么你一直和他联系？",
        "克制愤怒",
        "c1",
      ],
      [
        5,
        "神秘女人坐在窗边",
        "女人垂下眼睛",
        "他还是没告诉你。",
        "迟疑变沉重",
        "c3",
      ],
      [
        7,
        "神秘女人的脸部特写",
        "女人缓慢抬眼",
        demo
          ? "你老公没告诉你，五年前你为什么能活下来吗？"
          : "你确定，自己记得那天发生的事吗？",
        "沉重",
        "c3",
      ],
      [
        5,
        "客厅，浴室门在主角身后打开",
        "丈夫停在门口",
        "你给她打电话了？",
        "温和变警觉",
        "c2",
      ],
      [5, "主角转身，画面渐暗", "主角缓缓转头", "", "震惊，留白", "c1"],
    ] as const;
    const script = rows.map((r, i) => ({
      id: `s${i + 1}`,
      duration: r[0],
      visual: r[1],
      action: r[2],
      dialogue: r[3],
      emotion: r[4],
      character_ids: [r[5]],
    }));
    return {
      id: crypto.randomUUID(),
      title,
      source_type: sourceType,
      source,
      genre: "悬疑情感",
      audience: "成年短剧观众",
      platform: "竖屏短视频",
      status: "制作中",
      current_step: 0,
      updated_at: new Date().toISOString(),
      story,
      characters,
      episode: {
        id: crypto.randomUUID(),
        episode_number: 1,
        title: "第一集 · 秘密的来电",
        duration: 60,
        script,
      },
      shots: script.map((s, i) => ({
        ...s,
        order: i + 1,
        framing: i % 3 === 0 ? "近景" : "中景",
        director_note: `${s.dialogue ? "需要配音，口型建议后期处理" : "无需说话"}；固定镜头；单一动作；文字请在剪辑时叠加，避免生成乱码。`,
      })),
      generated: [],
      editing: {
        bgm: "低音悬疑氛围，台词时降低音乐音量",
        sound: "开场手机提示音；尾段浴室开门声",
        transition: "直接切换，最后一镜渐黑",
        cover: demo ? "每月2万，她到底是谁？" : title,
        publish_title: title,
        copy: demo
          ? "结婚五年，我第一次发现这笔转账。真相却比背叛更可怕。"
          : "一条意外线索，让平静生活出现裂缝。你会继续追查吗？",
        teaser: "下一集：五年前，被隐瞒的那一天。",
      },
    };
  }
  optimize(story: Story): Story {
    return {
      ...story,
      hook:
        story.hook.length >= 10
          ? story.hook
          : "开场手机弹出一条神秘消息，主角的笑容突然凝固。",
      conflict:
        story.conflict.length >= 10
          ? story.conflict
          : "主角想查明真相，最信任的人却阻止调查。",
      escalation:
        story.escalation.length >= 10
          ? story.escalation
          : "旧记录显示秘密已持续多年，只有主角不知情。",
      twist:
        story.twist.length >= 10
          ? story.twist
          : "以为是背叛，却发现这是对方保护自己的代价。",
      ending:
        story.ending.length >= 10
          ? story.ending
          : "电话突然响起：“你真的记得那一天吗？”",
    };
  }
}
export const provider: AIProvider = new MockAIProvider();
