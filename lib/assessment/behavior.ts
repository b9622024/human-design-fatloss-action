export type BehaviorDimensionId =
  | "regularity"
  | "hungerAwareness"
  | "emotionalRegulation"
  | "environmentDesign"
  | "recovery"
  | "flexibility";

export type BehaviorOption = {
  value: number;
  label: string;
};

export type BehaviorQuestion = {
  id: string;
  prompt: string;
  dimensions: BehaviorDimensionId[];
  options: BehaviorOption[];
};

export const BEHAVIOR_ASSESSMENT_VERSION = "behavior-v0.1";

export const DIMENSION_LABELS: Record<BehaviorDimensionId, string> = {
  regularity: "規律結構",
  hungerAwareness: "飢餓覺察",
  emotionalRegulation: "情緒調節",
  environmentDesign: "環境管理",
  recovery: "睡眠恢復",
  flexibility: "行動彈性",
};

const frequencyOptions: BehaviorOption[] = [
  { value: 0, label: "幾乎不會" },
  { value: 1, label: "偶爾" },
  { value: 2, label: "大多數時候" },
  { value: 3, label: "幾乎都能做到" },
];

export const BEHAVIOR_QUESTIONS: BehaviorQuestion[] = [
  {
    id: "q1",
    prompt: "忙碌的日子裡，我仍能大致維持固定的用餐節奏，不會一路餓到最後才一次吃很多。",
    dimensions: ["regularity"],
    options: frequencyOptions,
  },
  {
    id: "q2",
    prompt: "我通常能分辨自己是真的肚子餓，還是只是嘴饞、無聊、看到食物就想吃。",
    dimensions: ["hungerAwareness"],
    options: frequencyOptions,
  },
  {
    id: "q3",
    prompt: "壓力大、心情差或很累的時候，我還能避免用大量食物來讓自己舒服一點。",
    dimensions: ["emotionalRegulation"],
    options: frequencyOptions,
  },
  {
    id: "q4",
    prompt: "我會主動調整家裡、工作環境或外食選擇，讓比較適合我的食物更容易取得。",
    dimensions: ["environmentDesign"],
    options: frequencyOptions,
  },
  {
    id: "q5",
    prompt: "即使最近工作或生活繁忙，我仍能維持足以恢復精神的睡眠與休息。",
    dimensions: ["recovery"],
    options: frequencyOptions,
  },
  {
    id: "q6",
    prompt: "某一餐吃多、聚餐或計畫被打亂後，我通常能在下一餐回到原本節奏，而不是乾脆整天放棄。",
    dimensions: ["flexibility"],
    options: frequencyOptions,
  },
  {
    id: "q7",
    prompt: "我有一套自己做得到的基本飲食或活動規則，就算沒有很強的動力也能執行。",
    dimensions: ["regularity"],
    options: frequencyOptions,
  },
  {
    id: "q8",
    prompt: "當我很想吃高熱量食物時，我通常能先停一下，知道自己現在需要的是食物、休息、放鬆，還是情緒出口。",
    dimensions: ["emotionalRegulation", "hungerAwareness"],
    options: frequencyOptions,
  },
];

export type BehaviorAssessmentResult = {
  version: string;
  answers: Record<string, number>;
  dimensions: Record<BehaviorDimensionId, number>;
  overallSupportScore: number;
  riskScore: number;
  behaviorTension: number;
  strongestDimension: BehaviorDimensionId;
  priorityDimension: BehaviorDimensionId;
};

export function scoreBehaviorAssessment(answers: Record<string, number>): BehaviorAssessmentResult {
  const buckets = new Map<BehaviorDimensionId, number[]>();
  (Object.keys(DIMENSION_LABELS) as BehaviorDimensionId[]).forEach((id) => buckets.set(id, []));

  for (const question of BEHAVIOR_QUESTIONS) {
    const raw = Number(answers[question.id]);
    const score = Number.isFinite(raw) ? Math.max(0, Math.min(3, raw)) : 0;
    for (const dimension of question.dimensions) buckets.get(dimension)!.push(score);
  }

  const dimensions = {} as Record<BehaviorDimensionId, number>;
  for (const [dimension, scores] of buckets) {
    const average = scores.length ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    dimensions[dimension] = Math.round((average / 3) * 100);
  }

  const values = Object.values(dimensions);
  const overallSupportScore = Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
  const riskScore = 100 - overallSupportScore;
  const behaviorTension = Math.max(...values) - Math.min(...values);
  const entries = Object.entries(dimensions) as [BehaviorDimensionId, number][];
  entries.sort((a, b) => b[1] - a[1]);

  return {
    version: BEHAVIOR_ASSESSMENT_VERSION,
    answers,
    dimensions,
    overallSupportScore,
    riskScore,
    behaviorTension,
    strongestDimension: entries[0][0],
    priorityDimension: entries[entries.length - 1][0],
  };
}
