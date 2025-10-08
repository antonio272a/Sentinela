import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { v4 as uuid } from "uuid";

async function authenticate(formData: FormData) {
  "use server";

  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const userName = name.length ? name : "Sentinela";
  const userId = uuid();

  const cookieStore = await cookies();
  cookieStore.set("userId", userId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  cookieStore.set("userName", userName, {
    httpOnly: false,
    path: "/",
    sameSite: "lax",
  });

  redirect("/home");
}

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="max-w-xl w-full rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl shadow-blue-900/50 p-10 space-y-8">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-900 to-indigo-700 text-white text-2xl font-semibold">
            S
          </div>
          <h1 className="text-3xl font-semibold text-white">Sentinela</h1>
          <p className="text-slate-300">
            Sua central de inteligência emocional para manter a equipe no seu melhor ritmo.
          </p>
        </div>
        <form action={authenticate} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-slate-200">
              Como devemos te chamar?
            </label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Ex.: Inspetora Martins"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-blue-900 to-amber-400 px-4 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-amber-500/30 transition hover:shadow-amber-500/50"
          >
            Entrar no painel
          </button>
        </form>
      </div>
    </main>
  );
}
