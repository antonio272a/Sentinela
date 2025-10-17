export function TermsOfConfidentiality() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4 text-left text-xs leading-relaxed text-slate-200">
      <div>
        <h3 className="text-sm font-semibold text-white">Termo de Confidencialidade e Proteção de Dados</h3>
        <p className="text-[11px] uppercase tracking-wide text-slate-400">Aplicativo Sentinela – Teste de MVP</p>
      </div>

      <p>
        Pelo presente instrumento, de um lado: IMPACT TANK - PROJETO SENTINELA, representado por Jéssica Katyany
        Cazarin, responsável pelo desenvolvimento e aplicação do MVP (Minimum Viable Product Sentinela), doravante
        denominado DESENVOLVEDOR, e, de outro lado, o(a) participante identificado no cadastro do aplicativo, doravante
        denominado USUÁRIO(A), resolvem firmar o presente Termo de Confidencialidade e Proteção de Dados, mediante as
        cláusulas e condições abaixo:
      </p>

      <section className="space-y-2">
        <h4 className="text-sm font-semibold text-white">1. Objeto</h4>
        <p>
          O presente termo tem por objeto assegurar a confidencialidade das informações fornecidas pelo USUÁRIO(A)
          durante o uso experimental do aplicativo Sentinela, destinado a avaliar o nível de estresse e bem-estar
          ocupacional para fins exclusivos de testes de funcionalidade do MVP.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-semibold text-white">2. Natureza dos dados coletados</h4>
        <p>Durante o período de testes, o aplicativo poderá coletar:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Respostas a questionários de autoavaliação emocional e cognitiva;</li>
          <li>Informações demográficas básicas (sexo, faixa etária, setor de atuação);</li>
          <li>Dados técnicos de uso (tempo de resposta, frequência de acesso, eventuais falhas).</li>
        </ul>
        <p>
          Não serão coletados dados sensíveis adicionais nem informações de identificação pessoal direta (como nome, CPF,
          e-mail corporativo ou cargo), exceto o mínimo necessário para o funcionamento do sistema.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-semibold text-white">3. Finalidade e limitação de uso</h4>
        <p>Os dados coletados:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Não serão compartilhados com as empresas empregadoras dos participantes;</li>
          <li>
            Serão utilizados exclusivamente para fins de análise técnica e científica da funcionalidade do aplicativo
            Sentinela, incluindo testes de usabilidade, estabilidade e coerência das respostas;
          </li>
          <li>Não poderão ser usados para fins disciplinares, de desempenho ou de avaliação profissional.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-semibold text-white">4. Sigilo e segurança</h4>
        <p>O DESENVOLVEDOR compromete-se a:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Manter sigilo absoluto sobre todas as informações individuais obtidas;</li>
          <li>Adotar medidas técnicas e administrativas adequadas para proteger os dados contra acessos não autorizados, perda ou vazamento;</li>
          <li>Tratar os dados de forma anônima e agregada, sem possibilidade de identificação pessoal.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-semibold text-white">5. Consentimento do usuário</h4>
        <ul className="list-disc space-y-1 pl-5">
          <li>O USUÁRIO(A) declara ter compreendido que sua participação é voluntária;</li>
          <li>O USUÁRIO(A) concorda com a coleta e o uso dos dados conforme descrito neste termo.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-semibold text-white">6. Prazo e descarte dos dados</h4>
        <p>
          Os dados serão armazenados apenas durante o período de testes do MVP e eliminados definitivamente após a
          conclusão da análise, no prazo máximo de 90 (noventa) dias após o encerramento do projeto-piloto.
        </p>
      </section>

      <section className="space-y-2">
        <h4 className="text-sm font-semibold text-white">7. Foro</h4>
        <p>
          Para dirimir quaisquer controvérsias oriundas deste termo, as partes elegem o foro da Comarca de Biguaçu/SC,
          com renúncia a qualquer outro, por mais privilegiado que seja.
        </p>
      </section>

      <p>
        E, por estarem de acordo, as partes firmam o presente termo eletronicamente, para que produza seus efeitos legais.
        O aceite registrado no aplicativo substitui a necessidade de assinaturas físicas.
      </p>

      <p>Biguaçu/SC, {formattedDate}.</p>
    </div>
  );
}

export default TermsOfConfidentiality;
