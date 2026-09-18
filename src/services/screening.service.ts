const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";


// ================================
// TYPES
// ================================

export type ScreeningDecision =
  | "pass"
  | "hold"
  | "reject";

export type ScreeningResult = {
  id: number;

  applicationId: number;

  decision: ScreeningDecision;

  note: string | null;

  updatedAt: string;

  applicationStatus: string;
};

// ================================
// GET SCREENING DECISION
// ================================

export async function getScreeningDecision(
  applicationId: number,
): Promise<ScreeningResult | null> {
  const response = await fetch(
    `${API_URL}/hiring/screening/application/${applicationId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to load screening decision.",
    );
  }

  return data.data ?? null;
}

// ================================
// SAVE SCREENING DECISION
// ================================

export async function saveScreeningDecision(
  applicationId: number,
  decision: ScreeningDecision,
  note: string,
): Promise<ScreeningResult> {
  const response = await fetch(
    `${API_URL}/hiring/screening/application/${applicationId}`,
    {
      method: "POST",

      credentials: "include",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        decision,
        note,
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to save screening decision.",
    );
  }

  return data.data as ScreeningResult;
}