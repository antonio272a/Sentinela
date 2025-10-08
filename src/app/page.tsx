import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

const ArrowIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 12h14m0 0-5-5m5 5-5 5"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SparkIcon = () => (
  <svg
    className="h-5 w-5"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="m12 3 1.7 4.6L18 9.5l-4.3 1.9L12 16l-1.7-4.6L6 9.5l4.3-1.9L12 3Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
    <path
      d="m6.5 17.5.9 2.5.9-2.5 2.4-.9-2.4-.9-.9-2.5-.9 2.5-2.4.9 2.4.9Z"
      stroke="currentColor"
      strokeWidth={1.3}
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3.5 5.5 6v6c0 4.5 2.9 7.8 6.5 8.5 3.6-.7 6.5-4 6.5-8.5V6L12 3.5Z"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
    <path
      d="m9.5 12 1.8 1.8 3.2-3.1"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PulseIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 12h3.2l1.5-3.8L12 19l2.8-7H20"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RadarIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx={12} cy={12} r={8} stroke="currentColor" strokeWidth={1.4} />
    <path
      d="M12 12V5.5M12 12l4.5 4.5"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    />
    <circle cx={12} cy={12} r={2} fill="currentColor" />
  </svg>
);

const InsightIcon = () => (
  <svg
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 16.5 9.8 12l3 3 5-6"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 4v2M4 12h2M18 12h2M12 18v2"
      stroke="currentColor"
      strokeWidth={1.2}
      strokeLinecap="round"
    />
    <circle cx={12} cy={12} r={8} stroke="currentColor" strokeWidth={1.2} />
  </svg>
);

const metrics = [
  {
    label: "Servidores protegidos",
    value: "128",
    trend: "+12%",
  },
  {
    label: "Alertas tratados",
    value: "342",
    trend: "-28%",
  },
  {
    label: "Tempo médio de resposta",
    value: "4min",
    trend: "-18%",
  },
];

const features = [
  {
    title: "Alertas inteligentes",
    description:
      "Correlacionamos sinais críticos em segundos e priorizamos o que exige atenção imediata.",
    icon: <ShieldIcon />,
    accent: "alert" as const,
    highlight: "Segurança",
  },
  {
    title: "Monitoramento ativo",
    description:
      "Dashboards responsivas com análise contínua de disponibilidade, consumo e performance.",
    icon: <RadarIcon />,
    accent: "info" as const,
    highlight: "Operação",
  },
  {
    title: "Insights acionáveis",
    description:
      "Sugerimos próximos passos com base em dados históricos e benchmarks do setor.",
    icon: <InsightIcon />,
    accent: "success" as const,
    highlight: "Estratégia",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen w-full">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-20 px-6 py-16 sm:gap-24 sm:py-20 lg:px-10 xl:px-12">
        <header className="grid gap-12 lg:grid-cols-[1.1fr_minmax(0,0.9fr)] lg:items-center">
          <div className="space-y-8 text-balance">
            <span className="inline-flex max-w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[var(--color-text-muted)]">
              Nova versão
            </span>
            <div className="space-y-6">
              <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl">
                Monitoramento inteligente com
                {" "}
                <span className="bg-gradient-to-r from-[#f6c46d] via-[#f1b95b] to-[#f1a63f] bg-clip-text text-transparent">
                  insights em tempo real
                </span>
              </h1>
              <p className="max-w-2xl text-base text-[var(--color-text-muted)] sm:text-lg">
                Transforme os dados críticos da sua operação em decisões rápidas com visualizações dinâmicas,
                alertas inteligentes e componentes reutilizáveis em toda a plataforma.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button icon={<ArrowIcon />} iconPosition="end">
                Começar agora
              </Button>
              <Button variant="secondary" href="#features" icon={<SparkIcon />}>
                Ver recursos
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-3 w-3 rounded-full bg-[var(--color-success)]" aria-hidden />
                SLA médio 99,98%
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-3 w-3 rounded-full bg-[var(--color-alert)]" aria-hidden />
                Alertas críticos caíram 28%
              </div>
            </div>
          </div>
          <div className="relative overflow-hidden rounded-[32px] border border-white/20 bg-white/10 p-8 shadow-[0_40px_120px_-70px_rgba(8,22,48,0.9)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-[#f6c46d]/20" aria-hidden />
            <div className="relative space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white/90">Painel ao vivo</h2>
                <span className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/80">
                  <PulseIcon />
                  Atualizado
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl border border-white/10 bg-[rgba(7,28,61,0.6)] p-4 text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                      {metric.label}
                    </p>
                    <p className="mt-3 text-2xl font-semibold">{metric.value}</p>
                    <p
                      className={`mt-2 text-xs font-medium ${
                        metric.trend.startsWith("-")
                          ? "text-[var(--color-success)]"
                          : "text-[var(--color-alert)]"
                      }`}
                    >
                      {metric.trend} vs. última semana
                    </p>
                  </div>
                ))}
              </div>
              <div className="grid gap-4 rounded-2xl border border-white/10 bg-[rgba(7,28,61,0.6)] p-4">
                <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                  <span>Serviços monitorados</span>
                  <span>Disponibilidade</span>
                </div>
                <div className="space-y-3 text-sm text-white/90">
                  {["API Central", "Auth Proxy", "Data Lake"].map((service) => (
                    <div key={service} className="flex items-center justify-between">
                      <span>{service}</span>
                      <span className="flex items-center gap-2">
                        <span className="inline-flex h-2 w-2 rounded-full bg-[var(--color-success)]" aria-hidden />
                        99,9%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <section id="features" className="space-y-10">
          <div className="flex flex-col gap-6 text-balance sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                Confiabilidade
              </span>
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">
                Componentes reutilizáveis para acelerar seus projetos
              </h2>
            </div>
            <p className="max-w-xl text-sm text-[var(--color-text-muted)] sm:text-base">
              Combine cartões, botões e layouts responsivos para construir experiências consistentes e escaláveis.
              Cada componente foi desenhado para refletir o material gráfico apresentado.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <Card
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                accent={feature.accent}
                highlight={feature.highlight}
                actions={
                  <Button variant="ghost" href="#" icon={<ArrowIcon />} iconPosition="end">
                    Detalhes
                  </Button>
                }
              >
                <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-aurum-glow)]" aria-hidden />
                    Integração com equipes SOC e NOC
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-aurum-glow)]" aria-hidden />
                    Layout responsivo com grade flexível
                  </li>
                </ul>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
