export type BehaviorDimensionId =
  | "planning"
  | "consistency"
  | "recovery"
  | "awareness"
  | "emotion"
  | "environment";

export type BehaviorQuestion = {
  id: string;
  prompt: string;
  reverse?: boolean;
};

export const BEHAVIOR_QUESTIONS: BehaviorQuestion[] = [
  { id: "q1", prompt: "我通常會事先想好接下來幾餐要吃什麼，或先準備容易執行的選擇。" },
  { id: "q2", prompt: "即使工作忙、行程亂，我多半還是能維持基本的飲食節奏。" },
  { id: "q3", prompt: "偶爾吃多或偏離計畫後，我能在下一餐恢復正常，而不是乾脆整天放棄。" },
  { id: "q4", prompt: "吃東西前，我通常能分辨自己是真的餓，還是只是嘴饞、無聊或習慣性想吃。" },
  { id: "q5", prompt: "壓力大、心情差或很累時，我很容易靠食物讓自己舒服一點。", reverse: true },
  { id: "q6", prompt: "我的家中、公司或常去的地方，通常有方便取得的高蛋白或原型食物。" },
  { id: "q7", prompt: "即使短期體重沒有下降，我仍能維持原本該做的行動一段時間。" },
  { id: "q8", prompt: "遇到聚餐、旅行、加班時，我能調整份量或餐次，而不是把整個計畫丟掉。" },
];

export const ANSWER_OPTIONS = [
  { value: 1, label: "非常不像我" },
  { value: 2, label: "比較不像我" },
  { value: 3, label: "一半一半" },
  { value: 4, label: "比較像我" },
  { value: 5, label: "非常像我" },
] as const;

export const DIMENSION_LABELS: Record<BehaviorDimensionId, string> = {
  planning: "計畫性",
  consistency: "穩定執行",
  recovery: "彈性恢復",
  awareness: "飢餓覺察",
  emotion: "情緒調節",
  environment: "環境支持",
};

function normalizeScore(value: number) {
  return Math.round(((value - 1) / 4) * 100);
}

function reverseValue(value: number) {
  return 6 - value;
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function scoreBehaviorAssessment(answers: Record<string, number>) {
  const q = (id: string) => Math.min(5, Math.max(1, Number(answers[id] ?? 3)));
  const emotionRegulation = reverseValue(q("q5"));

  const raw: Record<BehaviorDimensionId, number> = {
    planning: average([q("q1"), q("q8")]),
    consistency: average([q("q2"), q("q7")]),
    recovery: average([q("q3"), q("q8")]),
    awareness: q("q4"),
    emotion: emotionRegulation,
    environment: average([q("q6"), q("q2")]),
  };

  const dimensions = (Object.keys(raw) as BehaviorDimensionId[]).map((id) => ({
    id,
    label: DIMENSION_LABELS[id],
    score: normalizeScore(raw[id]),
  }));

  const scores = dimensions.map((item) => item.score);
  const mean = average(scores);
  const risk = Math.round(100 - mean);
  const tension = Math.round(Math.max(...scores) - Math.min(...scores));
  const strongest = [...dimensions].sort((a, b) => b.score - a.score)[0];
  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0];

  return {
    version: "behavior-v1",
    dimensions,
    risk,
    behaviorTension: tension,
    strongest,
    weakest,
  };
}
