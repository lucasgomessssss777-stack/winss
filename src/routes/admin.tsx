import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  LogOut,
  Lock,
  Eye,
  MousePointerClick,
  Wallet,
  Receipt,
  RefreshCw,
  Play,
  CheckCircle,
  FileText,
  TrendingUp,
  Image as ImageIcon,
  Save,
} from "lucide-react";
import {
  adminLogin,
  adminLogout,
  checkAdminSession,
  getAdminStats,
  getDailyFunnel,
  getHourlyStats,
  getAdminSettings,
  updateAdminSettings,
  type HourlyPoint,
} from "../lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Admin — Magazine Brasil" },
      { name: "description", content: "Área restrita de administração." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const router = useRouter();
  const check = useServerFn(checkAdminSession);
  const sessionQ = useQuery({
    queryKey: ["admin-session"],
    queryFn: () => check(),
    staleTime: 0,
  });

  if (sessionQ.isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16 text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }

  if (!sessionQ.data?.authenticated) {
    return <LoginForm onSuccess={() => router.invalidate()} />;
  }

  return <Dashboard onLogout={() => router.invalidate()} />;
}

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const login = useServerFn(adminLogin);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login({ data: { username, password } });
      if (!res.ok) setError(res.error);
      else onSuccess();
    } catch {
      setError("Falha ao entrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-16">
      <div className="rounded-md border border-border bg-white p-6">
        <div className="mb-5 flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Painel Admin</h1>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">Usuário</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="rounded-md border border-input bg-white px-3 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">Senha</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="rounded-md border border-input bg-white px-3 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-primary px-6 py-3 text-lg font-extrabold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary-strong disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const getStats = useServerFn(getAdminStats);
  const getFunnel = useServerFn(getDailyFunnel);
  const getHourly = useServerFn(getHourlyStats);
  const logout = useServerFn(adminLogout);

  const statsQ = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => getStats(),
    refetchInterval: 15000,
  });

  const funnelQ = useQuery({
    queryKey: ["admin-funnel", 7],
    queryFn: () => getFunnel({ data: { days: 7 } }),
    refetchInterval: 15000,
  });

  const hourlyQ = useQuery({
    queryKey: ["admin-hourly", 7],
    queryFn: () => getHourly({ data: { days: 7 } }),
    refetchInterval: 30000,
  });

  if (statsQ.isLoading || funnelQ.isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted-foreground sm:px-5">
        Carregando dados...
      </div>
    );
  }

  const data = statsQ.data?.ok ? statsQ.data.data : null;
  const funnel = funnelQ.data?.ok ? funnelQ.data.data : null;
  const hourly = hourlyQ.data?.ok ? hourlyQ.data.data : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-5 sm:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">Painel Admin</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              statsQ.refetch();
              funnelQ.refetch();
              hourlyQ.refetch();
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-primary-soft"
          >
            <RefreshCw className="h-4 w-4" /> Atualizar
          </button>
          <button
            type="button"
            onClick={async () => {
              await logout();
              onLogout();
            }}
            className="inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Eye className="h-5 w-5" />}
          label="Visitas ao site"
          value={data?.visits ?? 0}
        />
        <StatCard
          icon={<MousePointerClick className="h-5 w-5" />}
          label="Cliques em 'Dobrar prêmio'"
          value={data?.doubleClicks ?? 0}
        />
        <StatCard
          icon={<Receipt className="h-5 w-5" />}
          label="Pagamentos gerados"
          value={data?.paymentsCount ?? 0}
        />
        <StatCard
          icon={<Wallet className="h-5 w-5" />}
          label="Saldo total gerado"
          value={`R$ ${(data?.totalAmount ?? 0).toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Play className="h-5 w-5" />}
          label="Início do quiz (7 dias)"
          value={funnel?.totals.quizStarts ?? 0}
        />
        <StatCard
          icon={<CheckCircle className="h-5 w-5" />}
          label="Conclusão do quiz (7 dias)"
          value={funnel?.totals.quizCompletions ?? 0}
        />
        <StatCard
          icon={<FileText className="h-5 w-5" />}
          label="Início do formulário (7 dias)"
          value={funnel?.totals.formStarts ?? 0}
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Taxa de conversão quiz"
          value={conversionRate(funnel?.totals.quizStarts ?? 0, funnel?.totals.quizCompletions ?? 0)}
        />
      </div>

      <div className="mt-8">
        <div className="rounded-md border border-border bg-white p-3 sm:p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">Atividade por dia da semana e horário (últimos 7 dias)</h2>
          </div>
          <LineChart points={hourly} />
        </div>
      </div>

      <div className="mt-8">
        <SettingsCard />
      </div>

      <div className="mt-8 rounded-md border border-border bg-white">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-base font-bold text-foreground">Histórico de pagamentos</h2>
            <p className="text-xs text-muted-foreground">Últimos 200 pagamentos gerados (pagos ou não).</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-primary-soft/50 text-left text-xs uppercase tracking-wide text-primary-strong">
                <tr>
                  <th className="px-4 py-2">Data / Hora</th>
                  <th className="px-4 py-2">Nome</th>
                  <th className="px-4 py-2">Banco</th>
                  <th className="px-4 py-2 text-right">Prêmio</th>
                  <th className="px-4 py-2 text-right">Valor pago</th>
                </tr>
              </thead>
              <tbody>
                {(data?.payments ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Nenhum pagamento gerado ainda.
                    </td>
                  </tr>
                ) : (
                  (data?.payments ?? []).map((p) => (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-2 text-foreground">
                        {new Date(p.created_at).toLocaleString("pt-BR")}
                      </td>
                      <td className="px-4 py-2 text-foreground">{p.nome ?? "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{p.banco ?? "—"}</td>
                      <td className="px-4 py-2 text-right text-muted-foreground">
                        {p.premio_valor != null ? `R$ ${p.premio_valor.toLocaleString("pt-BR")}` : "—"}
                      </td>
                      <td className="px-4 py-2 text-right font-semibold text-foreground">
                        R${" "}
                        {p.amount.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-strong">
        {icon} {label}
      </div>
      <p className="mt-2 text-2xl font-black text-foreground">{value}</p>
    </div>
  );
}

function conversionRate(starts: number, completions: number): string {
  if (!starts) return "0%";
  return `${((completions / starts) * 100).toFixed(1)}%`;
}

const WEEKDAYS_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type SeriesKey = "visits" | "quizStarts" | "quizCompletions" | "formStarts" | "doubleClicks" | "paymentsCount";

const SERIES: Array<{ key: SeriesKey; label: string; color: string }> = [
  { key: "visits", label: "Visitas", color: "#2563eb" },
  { key: "quizStarts", label: "Início quiz", color: "#0ea5e9" },
  { key: "quizCompletions", label: "Fim quiz", color: "#10b981" },
  { key: "formStarts", label: "Início saque", color: "#f59e0b" },
  { key: "doubleClicks", label: "Dobrar prêmio", color: "#ef4444" },
  { key: "paymentsCount", label: "Pagamentos", color: "#111827" },
];

function LineChart({ points }: { points: HourlyPoint[] }) {
  const [active, setActive] = useState<Record<SeriesKey, boolean>>({
    visits: true,
    quizStarts: true,
    quizCompletions: true,
    formStarts: false,
    doubleClicks: false,
    paymentsCount: false,
  });

  // Build 7-day x 24-hour timeline ending today
  const buckets = useMemo(() => {
    const map = new Map<string, HourlyPoint>();
    for (const p of points) map.set(`${p.date}-${p.hour}`, p);
    const days = 7;
    const now = new Date();
    const startDay = new Date(now);
    startDay.setHours(0, 0, 0, 0);
    startDay.setDate(startDay.getDate() - (days - 1));
    const arr: Array<{ date: Date; hour: number; point?: HourlyPoint }> = [];
    for (let d = 0; d < days; d++) {
      const day = new Date(startDay);
      day.setDate(startDay.getDate() + d);
      const key = day.toISOString().slice(0, 10);
      for (let h = 0; h < 24; h++) {
        arr.push({ date: day, hour: h, point: map.get(`${key}-${h}`) });
      }
    }
    return arr;
  }, [points]);

  const width = 720;
  const height = 260;
  const padding = { top: 16, right: 12, bottom: 44, left: 32 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const n = buckets.length;

  const maxY = Math.max(
    1,
    ...buckets.flatMap((b) =>
      SERIES.filter((s) => active[s.key]).map((s) => (b.point ? Number(b.point[s.key] ?? 0) : 0)),
    ),
  );

  const xFor = (i: number) => padding.left + (i / Math.max(1, n - 1)) * innerW;
  const yFor = (v: number) => padding.top + innerH - (v / maxY) * innerH;

  function pathFor(key: SeriesKey) {
    return buckets
      .map((b, i) => {
        const v = b.point ? Number(b.point[key] ?? 0) : 0;
        return `${i === 0 ? "M" : "L"}${xFor(i).toFixed(1)} ${yFor(v).toFixed(1)}`;
      })
      .join(" ");
  }

  // Day boundaries (every 24 buckets) for weekday labels
  const dayTicks = buckets
    .map((b, i) => ({ i, b }))
    .filter(({ b }) => b.hour === 0);

  // Hour ticks (every 6h) for smaller labels
  const hourTicks = buckets
    .map((b, i) => ({ i, b }))
    .filter(({ b }) => b.hour % 6 === 0);

  const yTicks = 4;

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {SERIES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive((a) => ({ ...a, [s.key]: !a[s.key] }))}
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
              active[s.key]
                ? "border-transparent text-white"
                : "border-border bg-white text-muted-foreground"
            }`}
            style={active[s.key] ? { backgroundColor: s.color } : undefined}
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[640px] w-full"
          role="img"
          aria-label="Gráfico de linhas de atividade por dia da semana e horário"
        >
          {/* Y grid */}
          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const y = padding.top + (i / yTicks) * innerH;
            const val = Math.round(maxY - (i / yTicks) * maxY);
            return (
              <g key={`y-${i}`}>
                <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e5e7eb" strokeWidth={1} />
                <text x={padding.left - 6} y={y + 3} textAnchor="end" fontSize={10} fill="#6b7280">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Day dividers */}
          {dayTicks.map(({ i, b }) => (
            <g key={`d-${i}`}>
              <line
                x1={xFor(i)}
                x2={xFor(i)}
                y1={padding.top}
                y2={padding.top + innerH}
                stroke="#cbd5e1"
                strokeDasharray="3 3"
                strokeWidth={1}
              />
              <text
                x={xFor(i) + 2}
                y={padding.top + innerH + 30}
                fontSize={11}
                fontWeight={700}
                fill="#374151"
              >
                {WEEKDAYS_PT[b.date.getDay()]}{" "}
                {String(b.date.getDate()).padStart(2, "0")}/
                {String(b.date.getMonth() + 1).padStart(2, "0")}
              </text>
            </g>
          ))}

          {/* Hour ticks */}
          {hourTicks.map(({ i, b }) => (
            <g key={`h-${i}`}>
              <line
                x1={xFor(i)}
                x2={xFor(i)}
                y1={padding.top + innerH}
                y2={padding.top + innerH + 4}
                stroke="#94a3b8"
                strokeWidth={1}
              />
              <text
                x={xFor(i)}
                y={padding.top + innerH + 14}
                textAnchor="middle"
                fontSize={9}
                fill="#6b7280"
              >
                {String(b.hour).padStart(2, "0")}h
              </text>
            </g>
          ))}

          {/* Lines */}
          {SERIES.filter((s) => active[s.key]).map((s) => (
            <path
              key={s.key}
              d={pathFor(s.key)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function SettingsCard() {
  const getSettings = useServerFn(getAdminSettings);
  const updateSettings = useServerFn(updateAdminSettings);
  const queryClient = useQueryClient();

  const settingsQ = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => getSettings(),
  });

  const [header, setHeader] = useState("");
  const [footer, setFooter] = useState("");
  const [promo, setPromo] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settingsQ.data?.ok) {
      setHeader(settingsQ.data.data.header_logo_url);
      setFooter(settingsQ.data.data.footer_logo_url);
      setPromo(settingsQ.data.data.home_promo_url);
    }
  }, [settingsQ.data]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      await updateSettings({
        data: {
          header_logo_url: header,
          footer_logo_url: footer,
          home_promo_url: promo,
        },
      });
      setSaved(true);
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-md border border-border bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">Imagens do site</h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Cole a URL pública das imagens. Deixe em branco para exibir o espaço vazio (header/rodapé)
        ou o banner padrão (home).
      </p>
      <form onSubmit={onSave} className="grid gap-4 sm:grid-cols-2">
        <ImageField
          label="Logo do Header"
          value={header}
          onChange={setHeader}
          placeholder="https://.../logo-header.png"
        />
        <ImageField
          label="Logo do Rodapé"
          value={footer}
          onChange={setFooter}
          placeholder="https://.../logo-rodape.png"
        />
        <div className="sm:col-span-2">
          <ImageField
            label="Banner promocional (/home)"
            value={promo}
            onChange={setPromo}
            placeholder="https://.../banner-home.jpg"
            preview="wide"
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-extrabold uppercase tracking-wide text-primary-foreground hover:bg-primary-strong disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar imagens"}
          </button>
          {saved && <span className="text-sm font-medium text-success">Salvo!</span>}
        </div>
      </form>
    </div>
  );
}

function ImageField({
  label,
  value,
  onChange,
  placeholder,
  preview,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  preview?: "wide" | "square";
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md border border-input bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      <div
        className={`mt-1 flex ${preview === "wide" ? "aspect-video" : "h-16"} w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-primary-soft/30`}
      >
        {value ? (
          <img src={value} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="text-xs text-muted-foreground">Pré-visualização</span>
        )}
      </div>
    </label>
  );
}
