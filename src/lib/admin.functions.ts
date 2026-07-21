import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const buildSessionConfig = () => ({
  password: process.env.ADMIN_SESSION_SECRET!,
  name: "mb-admin-session",
  maxAge: 60 * 60 * 8,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none" as const,
    path: "/",
  },
});

type AdminSession = { authenticated?: boolean };

function timingSafeEq(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i];
  return diff === 0;
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { username: string; password: string }) =>
    z.object({ username: z.string().min(1), password: z.string().min(1) }).parse(d),
  )
  .handler(async ({ data }) => {
    const expectedUser = process.env.ADMIN_USER ?? "";
    const expectedPass = process.env.ADMIN_PASSWORD ?? "";
    if (!expectedUser || !expectedPass) {
      return { ok: false as const, error: "Admin não configurado." };
    }
    if (!timingSafeEq(data.username, expectedUser) || !timingSafeEq(data.password, expectedPass)) {
      return { ok: false as const, error: "Usuário ou senha incorretos." };
    }
    const { useSession } = await import("@tanstack/react-start/server");
    const session = await useSession<AdminSession>(buildSessionConfig());
    await session.update({ authenticated: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { useSession } = await import("@tanstack/react-start/server");
  const session = await useSession<AdminSession>(buildSessionConfig());
  await session.clear();
  return { ok: true as const };
});

export type AdminStats = {
  visits: number;
  doubleClicks: number;
  totalAmount: number;
  paymentsCount: number;
  payments: Array<{
    id: string;
    amount: number;
    premio_valor: number | null;
    nome: string | null;
    banco: string | null;
    created_at: string;
  }>;
};

export const getAdminStats = createServerFn({ method: "GET" }).handler(async (): Promise<
  { ok: true; data: AdminStats } | { ok: false; error: "unauthorized" }
> => {
  const { useSession } = await import("@tanstack/react-start/server");
  const session = await useSession<AdminSession>(buildSessionConfig());
  if (!session.data.authenticated) return { ok: false, error: "unauthorized" };

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [statsRes, paymentsRes] = await Promise.all([
    supabaseAdmin.from("site_stats").select("visits, double_clicks").eq("id", 1).maybeSingle(),
    supabaseAdmin
      .from("payments")
      .select("id, amount, premio_valor, nome, banco, created_at")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const visits = Number(statsRes.data?.visits ?? 0);
  const doubleClicks = Number(statsRes.data?.double_clicks ?? 0);
  const payments = (paymentsRes.data ?? []).map((p: any) => ({
    id: p.id as string,
    amount: Number(p.amount),
    premio_valor: p.premio_valor != null ? Number(p.premio_valor) : null,
    nome: (p.nome as string | null) ?? null,
    banco: (p.banco as string | null) ?? null,
    created_at: p.created_at as string,
  }));
  const totalAmount = payments.reduce((s: number, p: { amount: number }) => s + p.amount, 0);

  return {
    ok: true,
    data: { visits, doubleClicks, totalAmount, paymentsCount: payments.length, payments },
  };
});

export const checkAdminSession = createServerFn({ method: "GET" }).handler(async () => {
  const { useSession } = await import("@tanstack/react-start/server");
  const session = await useSession<AdminSession>(buildSessionConfig());
  return { authenticated: !!session.data.authenticated };
});

export type DailyFunnel = {
  days: number;
  totals: {
    visits: number;
    quizStarts: number;
    quizCompletions: number;
    formStarts: number;
    doubleClicks: number;
    paymentsCount: number;
    paymentsAmount: number;
  };
};

export const getDailyFunnel = createServerFn({ method: "GET" })
  .inputValidator((d: { days: number }) =>
    z.object({ days: z.number().int().min(1).max(365) }).parse(d),
  )
  .handler(async ({ data }): Promise<
    { ok: true; data: DailyFunnel } | { ok: false; error: "unauthorized" }
  > => {
    const { useSession } = await import("@tanstack/react-start/server");
    const session = await useSession<AdminSession>(buildSessionConfig());
    if (!session.data.authenticated) return { ok: false, error: "unauthorized" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (data.days - 1));
    const startDateStr = startDate.toISOString().split("T")[0];

    const { data: rows } = await supabaseAdmin
      .from("daily_stats")
      .select("visits, quiz_starts, quiz_completions, form_starts, double_clicks, payments_count, payments_amount")
      .gte("date", startDateStr);

    const totals = (rows ?? []).reduce(
      (acc, row: any) => ({
        visits: acc.visits + Number(row.visits ?? 0),
        quizStarts: acc.quizStarts + Number(row.quiz_starts ?? 0),
        quizCompletions: acc.quizCompletions + Number(row.quiz_completions ?? 0),
        formStarts: acc.formStarts + Number(row.form_starts ?? 0),
        doubleClicks: acc.doubleClicks + Number(row.double_clicks ?? 0),
        paymentsCount: acc.paymentsCount + Number(row.payments_count ?? 0),
        paymentsAmount: acc.paymentsAmount + Number(row.payments_amount ?? 0),
      }),
      {
        visits: 0,
        quizStarts: 0,
        quizCompletions: 0,
        formStarts: 0,
        doubleClicks: 0,
        paymentsCount: 0,
        paymentsAmount: 0,
      },
    );

    return { ok: true, data: { days: data.days, totals } };
  });

export type HourlyPoint = {
  date: string; // YYYY-MM-DD
  hour: number; // 0-23
  visits: number;
  quizStarts: number;
  quizCompletions: number;
  formStarts: number;
  doubleClicks: number;
  paymentsCount: number;
};

export const getHourlyStats = createServerFn({ method: "GET" })
  .inputValidator((d: { days: number }) =>
    z.object({ days: z.number().int().min(1).max(30) }).parse(d),
  )
  .handler(async ({ data }): Promise<
    { ok: true; data: HourlyPoint[] } | { ok: false; error: "unauthorized" }
  > => {
    const { useSession } = await import("@tanstack/react-start/server");
    const session = await useSession<AdminSession>(buildSessionConfig());
    if (!session.data.authenticated) return { ok: false, error: "unauthorized" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (data.days - 1));
    const startDateStr = startDate.toISOString().split("T")[0];
    const { data: rows } = await supabaseAdmin
      .from("hourly_stats")
      .select("date, hour, visits, quiz_starts, quiz_completions, form_starts, double_clicks, payments_count")
      .gte("date", startDateStr)
      .order("date", { ascending: true })
      .order("hour", { ascending: true });

    const points: HourlyPoint[] = (rows ?? []).map((r: any) => ({
      date: r.date as string,
      hour: Number(r.hour),
      visits: Number(r.visits ?? 0),
      quizStarts: Number(r.quiz_starts ?? 0),
      quizCompletions: Number(r.quiz_completions ?? 0),
      formStarts: Number(r.form_starts ?? 0),
      doubleClicks: Number(r.double_clicks ?? 0),
      paymentsCount: Number(r.payments_count ?? 0),
    }));
    return { ok: true, data: points };
  });

export type AdminSiteSettings = {
  header_logo_url: string;
  footer_logo_url: string;
  home_promo_url: string;
};

export const getAdminSettings = createServerFn({ method: "GET" }).handler(async (): Promise<
  { ok: true; data: AdminSiteSettings } | { ok: false; error: "unauthorized" }
> => {
  const { useSession } = await import("@tanstack/react-start/server");
  const session = await useSession<AdminSession>(buildSessionConfig());
  if (!session.data.authenticated) return { ok: false, error: "unauthorized" };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("site_settings").select("key, value");
  const map: Record<string, string> = {};
  (data ?? []).forEach((r: { key: string; value: string | null }) => {
    map[r.key] = r.value ?? "";
  });
  return {
    ok: true,
    data: {
      header_logo_url: map["header_logo_url"] ?? "",
      footer_logo_url: map["footer_logo_url"] ?? "",
      home_promo_url: map["home_promo_url"] ?? "",
    },
  };
});

export const updateAdminSettings = createServerFn({ method: "POST" })
  .inputValidator((d: { header_logo_url?: string; footer_logo_url?: string; home_promo_url?: string }) =>
    z
      .object({
        header_logo_url: z.string().max(2000).optional(),
        footer_logo_url: z.string().max(2000).optional(),
        home_promo_url: z.string().max(2000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }): Promise<{ ok: true } | { ok: false; error: "unauthorized" }> => {
    const { useSession } = await import("@tanstack/react-start/server");
    const session = await useSession<AdminSession>(buildSessionConfig());
    if (!session.data.authenticated) return { ok: false, error: "unauthorized" };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const rows = Object.entries(data)
      .filter(([, v]) => typeof v === "string")
      .map(([key, value]) => ({ key, value: value as string, updated_at: new Date().toISOString() }));
    if (rows.length > 0) {
      await supabaseAdmin.from("site_settings").upsert(rows, { onConflict: "key" });
    }
    return { ok: true };
  });
