export const runtime = "nodejs";
import { requireUser } from "@/lib/auth";
import { listCheckInsByUser } from "@/lib/checkIns";
import {
  NeuroMetricsTrendChart,
  NeuroMetricPoint,
} from "@/components/dashboard/NeuroMetricsTrendChart";

type MetricKey = "energy" | "focus" | "emotionalBalance" | "sleep";

const formatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

const metricLabels: Record<MetricKey, string> = {
  energy: "Energia",
  focus: "Foco",
  emotionalBalance: "Equilíbrio emocional",
  sleep: "Sono",
};

const metricNarratives: Record<MetricKey, string> = {
  energy: "Proteja a motivação com micro-pausas e recompensas imediatas.",
  focus: "Reduza multitarefas e reforce briefings claros para preservar foco.",
  emotionalBalance: "Ative válvulas de escape emocionais antes de escalonar conflitos.",
  sleep: "Garanta janelas de recuperação e higiene do sono após plantões.",
};

type Alert = {
  metric: MetricKey;
  type: "average" | "drop";
  message: string;
};

function average(values: readonly (number | null)[] | null | undefined) {
  const numericValues = Array.isArray(values)
    ? values.filter((value): value is number => typeof value === "number")
    : [];

  if (numericValues.length === 0) {
    return null;
  }

  const total = numericValues.reduce((sum, value) => sum + value, 0);
  return Math.round((total / numericValues.length) * 10) / 10;
}

function buildSeries(checkIns: ReturnType<typeof listCheckInsByUser>): NeuroMetricPoint[] {
  const today = new Date();
  const byDate = new Map<string, ReturnType<typeof listCheckInsByUser>[number]>();

  for (const checkIn of checkIns) {
    const key = new Date(checkIn.date).toISOString().slice(0, 10);
    if (!byDate.has(key)) {
      byDate.set(key, checkIn);
    }
  }

  const series: NeuroMetricPoint[] = [];
  for (let i = 20; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const entry = byDate.get(key);

    series.push({
      date: formatter.format(date),
      energy: entry?.energyScore ?? null,
      focus: entry?.focusScore ?? null,
      emotionalBalance: entry?.emotionalBalanceScore ?? null,
      sleep: entry?.sleepQualityScore ?? null,
    });
  }

  return series;
}

function computeWeeklyAverages(series: NeuroMetricPoint[]) {
  const recent = series.slice(-7);
  const result: Record<MetricKey, number | null> = {
    energy: null,
    focus: null,
    emotionalBalance: null,
    sleep: null,
  };

  (Object.keys(result) as MetricKey[]).forEach((metric) => {
    const values = recent.map((item) => item[metric]);
    result[metric] = average(values);
  });

  return result;
}

function detectAlerts(series: NeuroMetricPoint[]): Alert[] {
  const alerts: Alert[] = [];

  const recentAverages = computeWeeklyAverages(series);
  (Object.keys(recentAverages) as MetricKey[]).forEach((metric) => {
    const value = recentAverages[metric];
    if (value !== null && value < 6) {
      alerts.push({
        metric,
        type: "average",
        message: `${metricLabels[metric]} com média semanal ${value.toFixed(
          1
        )} (< 6). Recomende acompanhamento psicológico.`,
      });
    }
  });

  (Object.keys(metricLabels) as MetricKey[]).forEach((metric) => {
    const streak: { value: number; date: string }[] = [];
    const seenWindows = new Set<string>();

    series.forEach((point) => {
      const value = point[metric];
      if (typeof value !== "number") {
        streak.length = 0;
        return;
      }

      streak.push({ value, date: point.date });
      if (streak.length === 3) {
        const drop = streak[0].value - streak[2].value;
        if (drop > 2) {
          const signature = `${metric}:${streak[0].date}->${streak[2].date}`;
          if (!seenWindows.has(signature)) {
            seenWindows.add(signature);
            alerts.push({
              metric,
              type: "drop",
              message: `${metricLabels[metric]} caiu ${drop.toFixed(
                1
              )} pontos entre ${streak[0].date} e ${streak[2].date}. Acione rede de suporte.`,
            });
          }
        }

        streak.shift();
      }
    });
  });

  return alerts;
}

export default async function AnalyticsPage() {
  const user = await requireUser();
  const checkIns = listCheckInsByUser(user.id);
  const series = buildSeries(checkIns);
  const weeklyAverages = computeWeeklyAverages(series);
  const alerts = detectAlerts(series);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Inteligência</p>
        <h1 className="text-3xl font-semibold text-white">Painel neurofuncional</h1>
        <p className="text-sm text-slate-300">
          Visualize como energia, foco, equilíbrio emocional e sono evoluem nas últimas semanas e antecipe sinais de burnout.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-xl shadow-blue-900/30">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center">
          <div className="xl:w-3/5">
            <NeuroMetricsTrendChart data={series} />
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-300">Médias dos últimos 7 dias</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(Object.keys(metricLabels) as MetricKey[]).map((metric) => (
                  <div key={metric} className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">{metricLabels[metric]}</p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {weeklyAverages[metric] !== null
                        ? weeklyAverages[metric]!.toFixed(1)
                        : "-"}
                    </p>
                    <p className="text-xs text-slate-400">{metricNarratives[metric]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6">
        <h2 className="text-lg font-semibold text-white">Alertas neuropsicológicos</h2>
        {alerts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-300">
            Todos os indicadores estão dentro das zonas seguras. Mantenha a rotina de check-ins para preservar a visão preventiva.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {alerts.map((alert, index) => (
              <li
                key={`${alert.metric}-${alert.type}-${index}`}
                className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
              >
                <span className="mr-2 inline-flex items-center rounded-full bg-amber-400/20 px-2 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-amber-200">
                  {alert.type === "average" ? "Média" : "Queda"}
                </span>
                {alert.message}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-slate-500">
          Critérios: média semanal abaixo de 6 ou queda superior a 2 pontos em três registros consecutivos.
        </p>
      </section>
    </div>
  );
}
