const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export type HiringDecision =
  | "approve"
  | "hold"
  | "reject";

export type HiringDecisionResult = {
  id: number;
  applicationId: number;
  decision: HiringDecision;
  note: string | null;
  updatedAt: string;
};

type HiringDecisionResponse = {
  success: boolean;
  message?: string;
  data: HiringDecisionResult | null;
};

export async function getHiringDecision(
  applicationId: number,
): Promise<HiringDecisionResult | null> {
  const response = await fetch(
    `${API_URL}/hiring/decision/application/${applicationId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const result =
    (await response.json()) as HiringDecisionResponse;

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to load hiring decision.",
    );
  }

  return result.data ?? null;
}

export async function saveHiringDecision(
  applicationId: number,
  decision: HiringDecision,
  note?: string,
): Promise<HiringDecisionResult> {
  const response = await fetch(
    `${API_URL}/hiring/decision/application/${applicationId}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        decision,
        note: note?.trim() || undefined,
      }),
    },
  );

  const result =
    (await response.json()) as HiringDecisionResponse;

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to save hiring decision.",
    );
  }

  if (!result.data) {
    throw new Error(
      "Hiring decision was not returned by the server.",
    );
  }

  return result.data;
}
export async function reviewHiringDecision(
  applicationId: number,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/hiring/decision/application/${applicationId}/review`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to review application again.",
    );
  }
}
export async function markApplicationAsHired(
  applicationId: number,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/hiring/decision/application/${applicationId}/hire`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to mark application as hired.",
    );
  }
}