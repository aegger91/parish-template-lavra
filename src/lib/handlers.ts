/*
  Placeholder handlers. Nothing here sends data anywhere.
  Each function returns a sample confirmation so the UI can be tested end to end.
  Replace the TODO blocks when the builder connects real services.
*/
import { site } from "./content";

export interface HandlerResult {
  ok: boolean;
  reference: string;
  sample: true;
}

function sampleResult(prefix: string): Promise<HandlerResult> {
  const reference = `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  return new Promise((resolve) => setTimeout(() => resolve({ ok: true, reference, sample: true }), 700));
}

export interface PaymentLine {
  id: string;
  description: string;
  quantity: number;
  unitAmount: number;
}

export interface PaymentRequest {
  kind: "donation" | "order" | "commemoration";
  amount: number;
  currency: string;
  recurring: "once" | "monthly";
  lines: PaymentLine[];
  metadata?: Record<string, string>;
}

/** One payment entry point shared by Donate, Store checkout and Zapiski. */
export async function startPayment(req: PaymentRequest): Promise<HandlerResult> {
  switch (site.donate.provider) {
    case "stripe":
      // TODO(stripe): create a Checkout Session on your server and redirect to session.url.
      // For monthly gifts use mode "subscription" with a recurring price.
      break;
    case "authorize-net":
      // TODO(authorize-net): request an Accept Hosted form token on your server and post to the hosted page.
      // For monthly gifts create an ARB subscription after the first payment.
      break;
    default:
      break;
  }
  void req;
  return sampleResult(req.kind === "order" ? "ORD" : req.kind === "commemoration" ? "COM" : "GIFT");
}

export async function submitContactMessage(data: Record<string, string>): Promise<HandlerResult> {
  // TODO(contact): post to the parish office inbox or the OrthodoxConnect messages endpoint.
  void data;
  return sampleResult("MSG");
}

export async function submitServiceRequest(data: Record<string, string>): Promise<HandlerResult> {
  // TODO(service-request): deliver to the priest or parish office (email or OrthodoxConnect).
  void data;
  return sampleResult("REQ");
}

export async function submitCommemorations(data: unknown): Promise<HandlerResult> {
  // TODO(zapiski): deliver names to the altar list. Store names only as long as the parish policy allows.
  void data;
  return sampleResult("COM");
}

export async function subscribeNewsletter(email: string): Promise<HandlerResult> {
  // TODO(orthodoxconnect): subscribe to site.orthodoxConnect.newsletter.listId.
  void email;
  return sampleResult("NEWS");
}

export async function connectSignUp(input: { kind: "event" | "need"; id: string; slotId?: string }): Promise<HandlerResult> {
  // TODO(orthodoxconnect): authenticate with the member's OrthodoxConnect account, then RSVP or claim the slot.
  void input;
  return sampleResult("OC");
}

export function connectLink(name: keyof typeof site.orthodoxConnect.deepLinks, vars: Record<string, string> = {}) {
  const template = site.orthodoxConnect.deepLinks[name];
  const all: Record<string, string> = { parishId: site.orthodoxConnect.parishId, ...vars };
  return template
    .replace("{appUrl}", site.orthodoxConnect.appUrl.replace(/\/$/, ""))
    .replace(/\{(\w+)\}/g, (_, k) => encodeURIComponent(all[k] ?? ""));
}
