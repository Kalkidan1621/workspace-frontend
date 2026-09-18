export type ScreeningDecision =
  | "pass"
  | "hold"
  | "reject";

export type ScreeningDecisionData = {
  decision: ScreeningDecision;
  note: string | null;
  updatedAt: string;
};

export type ScreeningDecisionResponse = {
  success: boolean;
  data: ScreeningDecisionData | null;
  message?: string;
};