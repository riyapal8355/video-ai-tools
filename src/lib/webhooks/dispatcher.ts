import crypto from "crypto";
import { prisma } from "../db";

export interface WebhookEventPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

export async function dispatchWebhookEvent(
  workspaceId: string,
  event: string,
  data: Record<string, any>
): Promise<void> {
  try {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: { workspaceId },
    });

    if (!endpoints || endpoints.length === 0) {
      return;
    }

    const payload: WebhookEventPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };
    const payloadString = JSON.stringify(payload);

    for (const endpoint of endpoints) {
      const subscribed = endpoint.subscribedEvents
        .split(",")
        .map((s) => s.trim().toLowerCase());

      if (
        !subscribed.includes("*") &&
        !subscribed.includes(event.toLowerCase()) &&
        !subscribed.includes(event.split(".")[0] + ".*")
      ) {
        continue;
      }

      // Compute HMAC-SHA256 signature
      const hmac = crypto.createHmac("sha256", endpoint.secret);
      hmac.update(payloadString);
      const signature = hmac.digest("hex");

      // Attempt delivery
      let statusCode: number | null = null;
      let responseBody: string | null = null;
      let status = "failed";

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(endpoint.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-VidoAI-Signature": `sha256=${signature}`,
            "X-VidoAI-Event": event,
            "User-Agent": "VidoAI-Webhooks/1.0",
          },
          body: payloadString,
          signal: controller.signal,
        });
        clearTimeout(timeout);

        statusCode = res.status;
        responseBody = await res.text().catch(() => "");
        if (res.ok) {
          status = "success";
        }
      } catch (err: any) {
        responseBody = err?.message || "Delivery request timed out or network unreachable";
      }

      // Record delivery log in database
      await prisma.webhookDelivery.create({
        data: {
          endpointId: endpoint.id,
          event,
          payload: payloadString,
          signature,
          statusCode,
          responseBody: responseBody ? responseBody.slice(0, 1000) : null,
          status,
          deliveredAt: new Date(),
        },
      });
    }
  } catch (err) {
    console.warn("Error in dispatchWebhookEvent:", err);
  }
}
