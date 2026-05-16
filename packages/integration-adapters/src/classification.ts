export type ClassificationType =
  | "STOP"
  | "QUOTE_REQUEST"
  | "POSITIVE_INTENT"
  | "WRONG_NUMBER"
  | "ANGRY"
  | "NEUTRAL";

export interface ClassificationResult {
  type: ClassificationType;
  confidence: number;
  reasoning?: string;
}

export class ClassificationService {
  /**
   * Heuristic-based classification (Placeholder for AI/LLM classifier)
   */
  static classify(message: string): ClassificationResult {
    const text = message.toUpperCase();

    // 1. STOP Detection (Mission Critical)
    if (
      ["STOP", "UNSUBSCRIBE", "REMOVE", "CANCEL", "OPT OUT", "DNC"].some((k) =>
        text.includes(k)
      )
    ) {
      return { type: "STOP", confidence: 1.0 };
    }

    // 2. Angry/Escalation Detection
    if (
      [
        "LAWYER",
        "SUING",
        "ILLEGAL",
        "HARASS",
        "FUCK",
        "SHIT",
        "STOP CALLING",
      ].some((k) => text.includes(k))
    ) {
      return {
        type: "ANGRY",
        confidence: 0.8,
        reasoning: "Detected aggressive language or legal threats",
      };
    }

    // 3. Quote Request Detection
    if (
      [
        "QUOTE",
        "RATE",
        "PAYMENT",
        "COST",
        "PRICE",
        "HOW MUCH",
        "SCENARIO",
      ].some((k) => text.includes(k))
    ) {
      return { type: "QUOTE_REQUEST", confidence: 0.9 };
    }

    // 4. Wrong Number Detection
    if (
      ["WRONG PERSON", "NOT ME", "WHO IS THIS", "DONT KNOW YOU"].some((k) =>
        text.includes(k)
      )
    ) {
      return { type: "WRONG_NUMBER", confidence: 0.7 };
    }

    // 5. Positive Intent
    if (
      [
        "YES",
        "YEAH",
        "OK",
        "SURE",
        "TELL ME MORE",
        "INTERESTED",
        "CALL ME",
      ].some((k) => text.includes(k))
    ) {
      return { type: "POSITIVE_INTENT", confidence: 0.6 };
    }

    return { type: "NEUTRAL", confidence: 0.5 };
  }
}
