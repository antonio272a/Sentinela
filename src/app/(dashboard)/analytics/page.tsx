import { requireUser } from "@/lib/auth";
import { listCheckInsByUser } from "@/lib/checkIns";
import { StressTrendChart, StressPoint } from "@/components/dashboard/StressTrendChart";

const formatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

function buildStressSeries(checkIns: ReturnType<typeof listCheckInsByUser>) {
  const today = new Date();
  const stressByDate = new Map<string, number>();

  for (const checkIn of checkIns) {
    const key = new Date(checkIn.date).toISOString().slice(0, 10);
    if (!stressByDate.has(key)) {
      stressByDate.set(key, checkIn.stressScore);
    }
  }

  const series: StressPoint[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    const fallback = 5 + Math.round(Math.abs(Math.sin(date.getTime())) * 40) / 10;
    const stressValue = stressByDate.get(key) ?? Math.min(10, Math.max(1, fallback));
    series.push({
      date: formatter.format(date),
      stress: Math.round(stressValue * 10) / 10,
    });
  }

  return series;
}

function computeStats(series: StressPoint[]) {
  if (!series.length) {
    return { average: 0, peak: 0, peakDate: "-" };
  }

  const total = series.reduce((acc, item) => acc + item.stress, 0);
  const average = Math.round((total / series.length) * 10) / 10;
  const peakPoint = series.reduce((acc, item) => (item.stress > acc.stress ? item : acc), series[0]);

  return { average, peak: peakPoint.stress, peakDate: peakPoint.date };
}

export default async function AnalyticsPage() {
  const user = await requireUser();
  const checkIns = listCheckInsByUser(user.id);
  const series = buildStressSeries(checkIns);
  const stats = computeStats(series);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Inteligência</p>
        <h1 className="text-3xl font-semibold text-white">Analytics de estresse</h1>
        <p className="text-sm text-slate-300">
          Explore a curva dos últimos 30 dias para antecipar picos e alinhar recursos antes que a pressão extrapole.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-800/70 bg-slate-900/80 p-6 shadow-xl shadow-blue-900/30">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="lg:w-2/3">
            <StressTrendChart data={series} />
          </div>
          <div className="flex flex-1 flex-col gap-4">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-300">Média 30 dias</p>
              <p className="mt-2 text-3xl font-semibold text-white">{stats.average.toFixed(1)}</p>
              <p className="text-xs text-slate-400">Base para calibrar pausas e reforços positivos.</p>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-300">Pico observado</p>
              <p className="mt-2 text-3xl font-semibold text-white">{stats.peak.toFixed(1)}</p>
              <p className="text-xs text-slate-400">Registrado em {stats.peakDate}. Sinal amarelo para ação preventiva.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800/60 bg-slate-900/70 p-6 text-sm text-slate-300">
        <p>
          Enquanto aguardamos a integração com biometria operacional, alimentamos o gráfico com projeções mockadas combinadas com seus check-ins reais. Essa visão já permite acompanhar tendências e reforçar hábitos regenerativos.
        </p>
      </section>
    </div>
  );
}
