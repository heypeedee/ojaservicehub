import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

type AssistInput = {
  kind:
    | "business_description"
    | "service_description"
    | "pricing_suggestion"
    | "review_reply"
    | "business_tip"
    | "recommend_pros"
    | "estimate_price"
    | "suggest_services";
  context: string;
};

const systemFor: Record<AssistInput["kind"], string> = {
  business_description:
    "You write concise, warm 2–3 sentence business descriptions for service pros on a marketplace. Focus on trust, specialty, and outcome. Plain prose. No markdown, no hashtags, no emojis.",
  service_description:
    "You write a single service listing: 2 short paragraphs (what's included, ideal for whom). Concrete, benefit-first. Plain prose, no markdown or emojis.",
  pricing_suggestion:
    "You are a pricing advisor for Nigerian local-service pros. Suggest 3 tiers (Basic, Standard, Premium) with a one-line justification each. Use ₦ and realistic Lagos ranges. Return as short lines: 'Tier — ₦amount — reason'.",
  review_reply:
    "You draft polite, professional 2–3 sentence replies to customer reviews. Match the tone (thank positive, empathize with negative, invite to resolve). No emojis, no fake promises.",
  business_tip:
    "You give one short actionable tip (1–2 sentences) tailored to a Nigerian local-service pro's situation. Practical, specific, non-generic.",
  recommend_pros:
    "You recommend 3 types of professionals that match a customer's need. Format each as: 'Category — why it fits — what to look for'. Be concrete.",
  estimate_price:
    "You estimate a realistic price range in Naira for a service request in Lagos. Return 'Range: ₦X – ₦Y' then 2 short bullets on what drives the price. Note it's an estimate.",
  suggest_services:
    "You suggest 3 add-on services a customer with the given need often benefits from. Format each: 'Service — 1-line reason'.",
};

export const runAiAssist = createServerFn({ method: "POST" })
  .inputValidator((input: AssistInput) => input)
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3.6-flash");
    const result = await generateText({
      model,
      system: systemFor[data.kind],
      prompt: data.context.slice(0, 2000),
    });
    return { text: result.text };
  });
