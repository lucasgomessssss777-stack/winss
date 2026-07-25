import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({
  amount: z.number().positive().max(100000),
  nome: z.string().min(3).max(200),
  cpf: z.string().max(200).optional(),
  premio_valor: z.number().nonnegative().max(1000000).optional(),
  banco: z.string().max(100).optional(),
});

function isValidCpf(value: string) {
  const cpf = value.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number);
  const firstSum = digits.slice(0, 9).reduce((sum, digit, index) => sum + digit * (10 - index), 0);
  const firstCheck = (firstSum * 10) % 11;
  if ((firstCheck === 10 ? 0 : firstCheck) !== digits[9]) return false;

  const secondSum = digits.slice(0, 10).reduce((sum, digit, index) => sum + digit * (11 - index), 0);
  const secondCheck = (secondSum * 10) % 11;
  return (secondCheck === 10 ? 0 : secondCheck) === digits[10];
}

function readProviderMessage(json: any, fallback: string) {
  const detail = json?.error?.detail;
  const buyerDetail = Array.isArray(detail?.buyer) ? detail.buyer.join(" ") : undefined;
  return json?.message || buyerDetail || json?.error?.message || json?.error?.detail || fallback;
}

export const createPixTransaction = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => inputSchema.parse(d))
  .handler(async ({ data }) => {
    const token = process.env.BUCKPAY_API_TOKEN;
    if (!token) throw new Error("BUCKPAY_API_TOKEN não configurado.");

    // Fixed CPF used for all Pix API requests (per project requirement).
    const cpfDigits = "62929950978";

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
        phone: "5511999999999",
      },
    };


    let res: Response | null = null;
    let text = "";
    let json: any = null;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      res = await fetch("https://api.realtechdev.com.br/v1/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token.trim()}`,
          "User-Agent": "Buckpay API",
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
        return {
          ok: false as const,
          error:
            "A chave da API Pix está sem permissão para criar transações. Ative a permissão de transações na BuckPay ou atualize BUCKPAY_API_TOKEN com uma chave autorizada.",
        };
      }

      if ([502, 503, 504].includes(res.status)) {
        console.error("[buckpay] provedor indisponível:", res.status, text.slice(0, 300));
        return {
          ok: false as const,
          error: "A API Pix está temporariamente indisponível. Tente novamente em alguns instantes.",
        };
      }

      const message = readProviderMessage(json, `Falha ao criar transação Pix (status ${res.status}).`);
      console.error("[buckpay] erro:", res.status, text);
      return {
        ok: false as const,
        error: typeof message === "string" ? message : "Falha ao criar transação Pix.",
      };
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
        external_id,
        transaction_id: transactionId ?? null,
        status: "pending",
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

const statusInputSchema = z.object({
  external_id: z.string().min(1).max(200),
});

export const checkPixStatus = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => statusInputSchema.parse(d))
  .handler(async ({ data }) => {
    const token = process.env.BUCKPAY_API_TOKEN;
    if (!token) throw new Error("BUCKPAY_API_TOKEN não configurado.");

    const res = await fetch(
      `https://api.realtechdev.com.br/v1/transactions/external_id/${encodeURIComponent(data.external_id)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.trim()}`,
          "User-Agent": "Buckpay API",
        },
      },
    );

    const text = await res.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      /* noop */
    }

    if (!res.ok) {
      console.error("[buckpay] status erro:", res.status, text.slice(0, 300));
      return { ok: false as const, status: "unknown", paid: false };
    }

    const transaction = json?.transaction ?? json?.data ?? json;
    const rawStatus: string = String(
      transaction?.status ?? transaction?.payment_status ?? "",
    ).toLowerCase();

    const paidStatuses = ["paid", "approved", "completed", "confirmed", "success"];
    const isPaid = paidStatuses.includes(rawStatus);

    if (isPaid) {
      try {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("payments")
          .update({ status: "paid", paid_at: new Date().toISOString() })
          .eq("external_id", data.external_id)
          .neq("status", "paid");
      } catch (e) {
        console.error("[buckpay] update status falhou", e);
      }
    }

    return {
      ok: true as const,
      status: isPaid ? "paid" : rawStatus || "pending",
      paid: isPaid,
    };
  });