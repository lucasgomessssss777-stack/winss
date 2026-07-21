import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  amount: z.number().positive().max(100000),
  nome: z.string().min(3).max(200),
  cpf: z.string().min(11).max(14),
  premio_valor: z.number().nonnegative().max(1000000).optional(),
  banco: z.string().max(100).optional(),
});

export const createPixTransaction = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data }) => {
    const token = process.env.BUCKPAY_API_TOKEN;
    if (!token) throw new Error("BUCKPAY_API_TOKEN não configurado.");

    const cpfDigits = data.cpf.replace(/\D/g, "");
    const amountCents = Math.round(data.amount * 100);
    const external_id = `mag-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const body = {
      external_id,
      payment_method: "pix",
      amount: amountCents,
      buyer: {
        name: data.nome,
        email: `${cpfDigits}@magazine-brasil.com`,
        document: cpfDigits,
      },
    };

    const res = await fetch("https://api.realtechdev.com.br/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "BuckPay API",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      /* noop */
    }

    if (!res.ok) {
      const message =
        json?.error?.message ||
        json?.error?.detail ||
        `Falha ao criar transação Pix (status ${res.status}).`;
      console.error("[buckpay] erro:", res.status, text);
      throw new Error(typeof message === "string" ? message : "Falha ao criar transação Pix.");
    }

    const pixCode: string | undefined = json?.data?.pix?.code;
    const qrBase64: string | undefined = json?.data?.pix?.qrcode_base64;
    const transactionId: string | undefined = json?.data?.id;

    if (!pixCode) throw new Error("Resposta inválida da API Pix.");

    // Best-effort tracking
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("payments").insert({
        amount: data.amount,
        premio_valor: data.premio_valor ?? null,
        nome: data.nome,
        banco: data.banco ?? null,
      });
      await Promise.all([
        supabaseAdmin.rpc("increment_daily_payment", { amount: data.amount }),
        supabaseAdmin.rpc("increment_hourly_payment", { amount: data.amount }),
      ]);
    } catch (e) {
      console.error("[buckpay] tracking falhou", e);
    }

    return {
      ok: true as const,
      external_id,
      transaction_id: transactionId ?? null,
      pix_code: pixCode,
      qrcode_base64: qrBase64 ?? null,
    };
  });