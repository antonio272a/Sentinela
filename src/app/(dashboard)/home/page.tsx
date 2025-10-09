import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { getDashboardSummary } from "@/lib/checkIns";
import { CheckInSuccessToast } from "@/components/check-in-success-toast";

const formatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

export default async function HomePage({
  searchParams,
}: {
  searchParams: { checkInSuccess?: string };
}) {
  const user = await requireUser();
  const summary = getDashboardSummary(user.id);
  const latest = summary.latest;
  const showCheckInToast = searchParams?.checkInSuccess === "1";

  return (
    <div className="space-y-8">
      {showCheckInToast && (
        <CheckInSuccessToast message="Obrigado por manter a rotina. Continue registrando diariamente para fortalecer a tropa." />
      )}
      <section className="rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/70 to-slate-950/90 p-8 shadow-xl shadow-blue-900/30">
        <h1 className="text-2xl font-semibold text-white">Bem-vindo de volta, {user.name.split(" ")[0]}!</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-300">
          Mantenha o radar emocional da equipe afiado. Revise o panorama do último mês e sinalize ajustes de rotina com um check-in diário.
        </p>
        <div className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wide text-amber-300">Último check-in</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {latest ? formatter.format(new Date(latest.date)) : "Sem registros"}
            </p>
            {latest && (
              <p className="mt-1 text-xs text-slate-400">
                Humor {latest.moodScore}/5 · Estresse {latest.stressScore}/10
              </p>
            )}
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wide text-amber-300">Estresse médio (30 dias)</p>
            <p className="mt-2 text-lg font-semibold text-white">
              {summary.averageStress !== null ? summary.averageStress.toFixed(1) : "-"}
            </p>
            <p className="mt-1 text-xs text-slate-400">Evolução para calibrar ritmo e demandas.</p>
          </div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5">
            <p className="text-xs uppercase tracking-wide text-amber-300">Sequência ativa</p>
            <p className="mt-2 text-lg font-semibold text-white">{summary.currentStreak} dia(s)</p>
            <p className="mt-1 text-xs text-slate-400">Disciplina que inspira toda a corporação.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-800/60 bg-slate-900/70 p-8">
          <h2 className="text-xl font-semibold text-white">Check-in diário</h2>
          <p className="mt-3 text-sm text-slate-300">
            Em menos de dois minutos, registre humor, energia e gatilhos. Use os dados para ajustar escalas, pausas e reforços positivos.
          </p>
          <Link
            href="/daily-check-in"
            className="mt-6 inline-flex cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-blue-900 to-amber-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:shadow-amber-500/50"
          >
            Fazer check-in de hoje
          </Link>
        </article>
        <article className="rounded-3xl border border-slate-800/60 bg-slate-900/70 p-8">
          <h2 className="text-xl font-semibold text-white">Painel Analytics</h2>
          <p className="mt-3 text-sm text-slate-300">
            Visualize o comportamento do estresse ao longo das últimas semanas e antecipe picos com ações preventivas.
          </p>
          <Link
            href="/analytics"
            className="mt-6 inline-flex items-center justify-center rounded-2xl border border-amber-300/60 bg-transparent px-5 py-3 text-sm font-semibold text-amber-200 transition hover:border-amber-200 hover:text-amber-100"
          >
            Abrir analytics
          </Link>
        </article>
      </section>

      <section className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-8">
        <h2 className="text-xl font-semibold text-white">Resumo dos últimos check-ins</h2>
        {summary.recentCheckIns.length === 0 ? (
          <p className="mt-4 text-sm text-slate-400">
            Nenhum registro por enquanto. Que tal inaugurar o painel com um check-in?
          </p>
        ) : (
          <ul className="mt-4 space-y-3 text-sm text-slate-200">
            {summary.recentCheckIns.slice(0, 5).map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-slate-800/70 bg-slate-950/40 px-4 py-3"
              >
                <span className="font-medium text-slate-100">
                  {formatter.format(new Date(item.date))}
                </span>
                <span className="text-xs text-slate-300">
                  Humor {item.moodScore}/5 · Estresse {item.stressScore}/10
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
