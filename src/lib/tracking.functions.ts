import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const trackVisit = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await Promise.all([
    supabaseAdmin.rpc("increment_visits"),
    supabaseAdmin.rpc("increment_daily_visits"),
    supabaseAdmin.rpc("increment_hourly_visits"),
  ]);
  return { ok: true as const };
});

export const trackDoubleClick = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await Promise.all([
    supabaseAdmin.rpc("increment_double_clicks"),
    supabaseAdmin.rpc("increment_daily_double_click"),
    supabaseAdmin.rpc("increment_hourly_double_click"),
  ]);
  return { ok: true as const };
});

export const trackQuizStart = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await Promise.all([
    supabaseAdmin.rpc("increment_daily_quiz_start"),
    supabaseAdmin.rpc("increment_hourly_quiz_start"),
  ]);
  return { ok: true as const };
});

export const trackQuizCompletion = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await Promise.all([
    supabaseAdmin.rpc("increment_daily_quiz_completion"),
    supabaseAdmin.rpc("increment_hourly_quiz_completion"),
  ]);
  return { ok: true as const };
});

export const trackFormStart = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await Promise.all([
    supabaseAdmin.rpc("increment_daily_form_start"),
    supabaseAdmin.rpc("increment_hourly_form_start"),
  ]);
  return { ok: true as const };
});

export const recordPayment = createServerFn({ method: "POST" })
  .inputValidator((d: { amount: number; premio_valor?: number; nome?: string; banco?: string }) =>
    z
      .object({
        amount: z.number().positive().max(100000),
        premio_valor: z.number().nonnegative().max(1000000).optional(),
        nome: z.string().max(200).optional(),
        banco: z.string().max(100).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("payments").insert({
      amount: data.amount,
      premio_valor: data.premio_valor ?? null,
      nome: data.nome ?? null,
      banco: data.banco ?? null,
    });
    if (error) throw new Error(error.message);
    await Promise.all([
      supabaseAdmin.rpc("increment_daily_payment", { amount: data.amount }),
      supabaseAdmin.rpc("increment_hourly_payment", { amount: data.amount }),
    ]);
    return { ok: true as const };
  });
