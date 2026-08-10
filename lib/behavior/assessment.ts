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
  dimension: BehaviorDimensionId;
  reverse?: boolean;
};

export const BEHAVIOR_QUESTIONS: BehaviorQuestion[] = [
  { id: "q1", dimension: "planning", prompt: "忙碌的一週開始前，我通常已經想好幾個容易執行的飲食選擇。" },
  { id: "q2", dimension: "emotion", prompt: "壓力大、心情差或很累時，我很容易靠食物讓自己舒服一點。", reverse: true },
  { id: "q3", dimension: "consistency", prompt: "即使工作忙、行程亂，我多半還是能守住最低限度的飲食原則。" },
  { id: "q4", dimension: "awareness", prompt: "想吃東西時，我通常能分辨是真的餓，還是嘴饞、無聊或習慣性想吃。" },
  { id: "q5", dimension: "recovery", prompt: "某一餐吃多或偏離計畫後，我通常能從下一餐重新回到節奏。" },
  { id: "q6", dimension: "environment", prompt: "我的家中、公司或常去的地方，通常有方便取得的高蛋白或原型食物。" },
  { id: "q7", dimension: "planning", prompt: "如果知道隔天會聚餐或外食，我會提前調整前後餐或先想好選擇。" },
  { id: "q8", dimension: "consistency", prompt: "短期體重沒有下降時，我仍能維持原本該做的行動一段時間。" },
  { id: "q9", dimension: "emotion", prompt: "情緒起伏時，我能先處理情緒，再決定自己是否真的需要吃東西。" },
  { id: "q10", dimension: "recovery", prompt: "只要一天沒照計畫，我很容易覺得前面都白做了，乾脆之後也不管。", reverse: true },
  { id: "q11", dimension: "awareness", prompt: "吃到七八分飽時，我通常能察覺並停下來，而不是一定要把眼前食物吃完。" },
  { id: "q12", dimension: "environment", prompt: "身邊的人、工作環境或家庭習慣，常讓我很難按照自己的減脂安排。", reverse: true },
  { id: "q13", dimension: "planning", prompt: "我會準備一兩個『臨時也做得到』的備用方案，而不是只能照完美計畫執行。" },
  { id: "q14", dimension: "consistency", prompt: "即使當天動力不高，我通常仍能完成最基本的行動，而不是完全停掉。" },
  { id: "q15", dimension: "awareness", prompt: "我常常吃到很撐之後，才發現自己其實早就不餓了。", reverse: true },
  { id: "q16", dimension: "emotion", prompt: "當我很想吃高熱量食物時，我通常能先停一下，確認是情緒需求還是身體需求。" },
  { id: "q17", dimension: "environment", prompt: "我會主動調整環境，例如準備食物、減少誘惑或和身邊的人溝通，讓自己更容易做到。" },
  { id: "q18", dimension: "recovery", prompt: "聚餐、旅行或加班打亂原本節奏後，我通常能在一兩餐內重新找到可行的做法。" },
];

export const ANSWER_OPTIONS = [
  { value: 1, label: "非常不像我" },
  { value: 2, label: "比較不像我" },
  { value: 3, label: "一半一半" },
  { value: 4, label: "比較像我" },
  { value: 5, label: "非常像我" },
] as const;

export const DIMENSION_LABELS: Record<BehaviorDimensionId, string> = {
  planning: "計畫與準備",
  consistency: "穩定執行",
  recovery: "彈性恢復",
  awareness: "飢餓與飽足覺察",
  emotion: "情緒調節",
  environment: "環境支持",
};

function normalizeScore(value: number) {
  return Math.round(((value - 1) / 4) * 100);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function scoreBehaviorAssessment(answers: Record<string, number>) {
  const dimensionValues: Record<BehaviorDimensionId, number[]> = {
    planning: [],
    consistency: [],
    recovery: [],
    awareness: [],
    emotion: [],
    environment: [],
  };

  const scoredAnswers = BEHAVIOR_QUESTIONS.map((question) => {
    const raw = Math.min(5, Math.max(1, Number(answers[question.id] ?? 3)));
    const scored = question.reverse ? 6 - raw : raw;
    dimensionValues[question.dimension].push(scored);
    return { id: question.id, raw, scored, dimension: question.dimension, reverse: Boolean(question.reverse) };
  });

  const dimensions = (Object.keys(dimensionValues) as BehaviorDimensionId[]).map((id) => ({
    id,
    label: DIMENSION_LABELS[id],
    score: normalizeScore(average(dimensionValues[id])),
  }));

  const byId = Object.fromEntries(dimensions.map((item) => [item.id, item.score])) as Record<BehaviorDimensionId, number>;
  const scores = dimensions.map((item) => item.score);
  const mean = average(scores);
  const risk = Math.round(100 - mean);
  const behaviorTension = Math.round(Math.max(...scores) - Math.min(...scores));
  const strongest = [...dimensions].sort((a, b) => b.score - a.score)[0];
  const weakest = [...dimensions].sort((a, b) => a.score - b.score)[0];

  const executionReadiness = Math.round(average([byId.planning, byId.consistency, byId.recovery]));
  const selfRegulation = Math.round(average([byId.awareness, byId.emotion]));
  const externalSupport = byId.environment;
  const planFlexBalance = Math.round(byId.planning - byId.recovery);
  const regulationGap = Math.round(Math.abs(byId.awareness - byId.emotion));

  return {
    version: "behavior-v2-18q",
    dimensions,
    risk,
    behaviorTension,
    strongest,
    weakest,
    derived: {
      executionReadiness,
      selfRegulation,
      externalSupport,
      planFlexBalance,
      regulationGap,
    },
    scoredAnswers,
  };
}
