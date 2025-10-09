import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getTodayCheckIn } from "@/lib/checkIns";

async function submitCheckIn(formData: FormData) {
  "use server";

  const moodScore = Number(formData.get("moodScore"));
  const stressScore = Number(formData.get("stressScore"));
  const energyLevel = formData.get("energyLevel") as string | null;
  const triggers = (formData.get("triggers") as string | null)?.trim() ?? "";
  const highlight = (formData.get("highlight") as string | null)?.trim() ?? "";
  const intention = (formData.get("intention") as string | null)?.trim() ?? "";

  const notes = [
    energyLevel ? `Energia: ${energyLevel}` : null,
    triggers ? `Gatilhos: ${triggers}` : null,
    highlight ? `Ponto alto: ${highlight}` : null,
    intention ? `Intenção: ${intention}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  if (Number.isNaN(moodScore) || Number.isNaN(stressScore)) {
    redirect("/daily-check-in?error=1");
  }

  const body = {
    moodScore,
    stressScore,
    notes,
  };

  const origin = headers().get("origin") ?? process.env.APP_URL ?? "http://localhost:3000";
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");

  const response = await fetch(`${origin}/api/check-ins`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    redirect("/daily-check-in?error=1");
  }

  revalidatePath("/home");
  redirect("/home?checkInSuccess=1");
}

export default async function DailyCheckInPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await requireUser();
  const todaysCheckIn = getTodayCheckIn(user.id);
  const parsedNotes = parseNotes(todaysCheckIn?.notes ?? null);
  const defaultMood = todaysCheckIn?.moodScore ?? 3;
  const defaultStress = todaysCheckIn?.stressScore ?? 5;
  const defaultEnergy = parsedNotes.energyLevel ?? "Estável";
  const showError = searchParams?.error === "1";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.25em] text-amber-300">Rotina</p>
        <h1 className="text-3xl font-semibold text-white">Radar emocional diário</h1>
        <p className="text-sm text-slate-300">
          Reserve dois minutos para perceber como você chega hoje. Essas pistas orientam ajustes de escala, pausas táticas e rituais que mantêm a sua saúde.
        </p>
      </header>

      {showError && (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          Não conseguimos salvar seu check-in. Tente novamente em instantes.
        </div>
      )}
      {todaysCheckIn && !showError && (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Você já registrou seu check-in hoje. Ajuste os dados abaixo caso queira atualizar o relato.
        </div>
      )}

      <form action={submitCheckIn} className="space-y-8">
        <section className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">1. Como está o humor geral?</h2>
          <p className="mt-2 text-sm text-slate-400">Use a escala para sinalizar se você chega leve, neutro ou sob pressão.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((value) => (
              <label
                key={value}
                className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-2 text-sm text-slate-200 hover:border-amber-300/60"
              >
                <input
                  type="radio"
                  name="moodScore"
                  value={value}
                  defaultChecked={value === defaultMood}
                  className="accent-amber-400"
                  required
                />
                {value}
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">2. Nível de energia física</h2>
          <p className="mt-2 text-sm text-slate-400">Indique se o corpo acompanha o ritmo do dia.</p>
          <div className="mt-6 grid grid-cols-5 gap-2 text-center text-xs text-slate-300">
            {["Baixa", "Cautela", "Estável", "Firme", "Turbo"].map((label) => (
              <label
                key={label}
                className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/40 px-3 py-3 hover:border-amber-300/60"
              >
                <input
                  type="radio"
                  name="energyLevel"
                  value={label}
                  defaultChecked={label === defaultEnergy}
                  className="accent-amber-400"
                  required
                />
                <span className="text-xs text-slate-200">{label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6">
          <h2 className="text-lg font-semibold text-white">3. Nível de estresse percebido</h2>
          <p className="mt-2 text-sm text-slate-400">Deslize para indicar a pressão do dia. 1 é tranquilo, 10 é alerta máximo.</p>
          <div className="mt-6">
            <input
              type="range"
              name="stressScore"
              min="1"
              max="10"
              defaultValue={defaultStress}
              className="w-full accent-amber-400"
            />
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>Sereno</span>
              <span>Alerta máximo</span>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-white">4. Houve algum gatilho ou preocupação central?</h2>
            <textarea
              name="triggers"
              rows={3}
              className="mt-2 w-full rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
              placeholder="Ex.: Comunicação truncada, ocorrência noturna..."
              defaultValue={parsedNotes.triggers ?? ""}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              Ponto alto das últimas 24h
              <input
                type="text"
                name="highlight"
                className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                placeholder="Treino bem-sucedido, reconhecimento..."
                defaultValue={parsedNotes.highlight ?? ""}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-200">
              Intenção para hoje
              <input
                type="text"
                name="intention"
                className="rounded-2xl border border-slate-800/80 bg-slate-950/40 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
                placeholder="Oferecer feedback, reforçar alinhamentos..."
                defaultValue={parsedNotes.intention ?? ""}
              />
            </label>
          </div>
        </section>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-blue-900 to-amber-400 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:shadow-amber-500/50"
        >
          {todaysCheckIn ? "Atualizar check-in" : "Enviar check-in"}
        </button>
      </form>
    </div>
  );
}

function parseNotes(notes: string | null) {
  const parsed: {
    energyLevel: string | null;
    triggers: string | null;
    highlight: string | null;
    intention: string | null;
  } = {
    energyLevel: null,
    triggers: null,
    highlight: null,
    intention: null,
  };

  if (!notes) {
    return parsed;
  }

  const segments = notes.split(" | ");
  for (const segment of segments) {
    const [rawKey, ...rest] = segment.split(":");
    if (!rawKey || rest.length === 0) {
      continue;
    }

    const key = rawKey.trim().toLowerCase();
    const value = rest.join(":").trim();

    if (!value) {
      continue;
    }

    if (key.startsWith("energia")) {
      parsed.energyLevel = value;
    } else if (key.startsWith("gatilho")) {
      parsed.triggers = value;
    } else if (key.startsWith("ponto alto")) {
      parsed.highlight = value;
    } else if (key.startsWith("intenção")) {
      parsed.intention = value;
    }
  }

  return parsed;
}
