export interface ContractTemplate {
  id: string
  name: string
  category: string
  content: string
}

const CLAUSE_CONFIDENCIALIDADE = `
## 6. Confidencialidade

As partes comprometem-se a manter em sigilo todas as informações confidenciais trocadas durante a execução deste contrato, incluindo dados técnicos, comerciais e estratégicos, pelo prazo de 2 (dois) anos após o término do contrato.`

const CLAUSE_PROPRIEDADE = `
## 7. Propriedade intelectual

Após o pagamento integral, todos os direitos patrimoniais sobre os entregáveis produzidos neste contrato são transferidos ao **CONTRATANTE**. O **CONTRATADO** mantém o direito de exibir o trabalho em seu portfólio, salvo solicitação expressa em contrário.`

const CLAUSE_RESOLUCAO = `
## 8. Rescisão

Qualquer das partes pode rescindir este contrato mediante notificação escrita com antecedência mínima de 15 (quinze) dias. Em caso de rescisão pelo **CONTRATANTE** após o início dos trabalhos, será devida ao **CONTRATADO** a remuneração proporcional ao trabalho realizado até a data de rescisão.`

const CLAUSE_FORO = `
## 9. Foro

Fica eleito o foro da comarca de domicílio do **CONTRATADO** para dirimir quaisquer conflitos oriundos deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.`

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'web-development',
    name: 'Desenvolvimento web',
    category: 'Tecnologia',
    content: `# Contrato de Prestação de Serviços de Desenvolvimento Web

**CONTRATANTE:** {{client_name}}{{client_company}}
**CONTRATADO:** {{contractor_name}}
**Data:** {{today}}

---

## 1. Objeto

O **CONTRATADO** se compromete a desenvolver o projeto **"{{project_name}}"**, conforme escopo acordado entre as partes.

### Entregáveis previstos:
- Desenvolvimento front-end e back-end conforme briefing aprovado
- Código-fonte versionado em repositório Git
- Deploy em ambiente de produção
- Documentação técnica básica
- 30 dias de suporte pós-entrega para correção de bugs

## 2. Prazo

O projeto terá início em **{{start_date}}**{{end_date_clause}}.

Atrasos causados por demora na entrega de materiais, conteúdo ou feedback pelo **CONTRATANTE** por mais de 5 dias úteis implicarão reprogramação proporcional do prazo.

## 3. Remuneração

O valor total acordado é de **{{value}}**, a ser pago conforme cronograma financeiro acordado entre as partes.

O não pagamento na data acordada sujeita o **CONTRATANTE** a multa de 2% ao mês sobre o valor em aberto, além de juros de mora de 1% ao mês.

## 4. Responsabilidades do Contratante

- Fornecer materiais, conteúdos e acessos necessários em até 5 dias úteis após solicitação
- Revisar e aprovar entregas em até 5 dias úteis
- Designar um interlocutor para comunicação e decisões

## 5. Responsabilidades do Contratado

- Executar os serviços com qualidade técnica adequada
- Comunicar impedimentos com antecedência mínima de 3 dias úteis
- Manter backup do código durante toda a vigência do contrato
${CLAUSE_CONFIDENCIALIDADE}
${CLAUSE_PROPRIEDADE}
${CLAUSE_RESOLUCAO}
${CLAUSE_FORO}

---

**CONTRATANTE:** {{client_name}}
Assinatura: ___________________________

**CONTRATADO:** {{contractor_name}}
Assinatura: ___________________________`,
  },

  {
    id: 'design',
    name: 'Design gráfico / UI',
    category: 'Design',
    content: `# Contrato de Prestação de Serviços de Design

**CONTRATANTE:** {{client_name}}{{client_company}}
**CONTRATADO:** {{contractor_name}}
**Data:** {{today}}

---

## 1. Objeto

O **CONTRATADO** realizará serviços de design para o projeto **"{{project_name}}"**, incluindo criação de identidade visual, peças gráficas e/ou interfaces digitais conforme briefing aprovado.

### Entregáveis previstos:
- Arquivos editáveis nos formatos acordados (AI, PSD, Figma ou equivalente)
- Exportações em formatos finais (PDF, PNG, SVG)
- Guia de uso básico dos elementos criados
- Até 2 rodadas de revisão por entregável

## 2. Prazo

O projeto terá início em **{{start_date}}**{{end_date_clause}}.

Cada rodada de revisão tem prazo de resposta de 5 dias úteis pelo **CONTRATANTE**. Revisões adicionais serão cobradas à parte.

## 3. Remuneração

O valor total acordado é de **{{value}}**.

## 4. Direitos de Uso

Após pagamento integral, o **CONTRATANTE** recebe licença exclusiva e irrevogável para uso comercial dos materiais produzidos. O **CONTRATADO** mantém o direito moral de autoria.
${CLAUSE_CONFIDENCIALIDADE}
${CLAUSE_RESOLUCAO}
${CLAUSE_FORO}

---

**CONTRATANTE:** {{client_name}}
Assinatura: ___________________________

**CONTRATADO:** {{contractor_name}}
Assinatura: ___________________________`,
  },

  {
    id: 'consultoria',
    name: 'Consultoria',
    category: 'Serviços',
    content: `# Contrato de Consultoria

**CONTRATANTE:** {{client_name}}{{client_company}}
**CONTRATADO:** {{contractor_name}}
**Data:** {{today}}

---

## 1. Objeto

O **CONTRATADO** prestará serviços de consultoria especializada para o projeto **"{{project_name}}"**, fornecendo análises, recomendações e acompanhamento estratégico conforme necessidade do **CONTRATANTE**.

### Escopo dos serviços:
- Diagnóstico da situação atual
- Elaboração de recomendações e plano de ação
- Reuniões periódicas de acompanhamento
- Relatórios de progresso

## 2. Prazo e Dedicação

Início em **{{start_date}}**{{end_date_clause}}.

A carga horária e periodicidade das reuniões serão acordadas separadamente entre as partes.

## 3. Remuneração

O valor acordado é de **{{value}}**.

## 4. Independência Profissional

O **CONTRATADO** atua como prestador autônomo, sem vínculo empregatício. As recomendações emitidas são de natureza consultiva; as decisões de implementação são de responsabilidade exclusiva do **CONTRATANTE**.
${CLAUSE_CONFIDENCIALIDADE}
${CLAUSE_RESOLUCAO}
${CLAUSE_FORO}

---

**CONTRATANTE:** {{client_name}}
Assinatura: ___________________________

**CONTRATADO:** {{contractor_name}}
Assinatura: ___________________________`,
  },

  {
    id: 'fotografia',
    name: 'Fotografia',
    category: 'Criativo',
    content: `# Contrato de Serviços Fotográficos

**CONTRATANTE:** {{client_name}}{{client_company}}
**CONTRATADO:** {{contractor_name}}
**Data:** {{today}}

---

## 1. Objeto

O **CONTRATADO** realizará serviços fotográficos para **"{{project_name}}"**, incluindo captação, seleção e tratamento das imagens conforme briefing aprovado.

### Entregáveis:
- Imagens tratadas entregues em alta resolução (JPEG/TIFF)
- Galeria online para seleção prévia
- Prazo de entrega: até 15 dias úteis após a sessão

## 2. Data e Local

Início em **{{start_date}}**{{end_date_clause}}.

Local e horário da sessão serão confirmados com antecedência mínima de 3 dias úteis.

## 3. Remuneração

O valor total acordado é de **{{value}}**.

Deslocamentos superiores a 50 km do domicílio do **CONTRATADO** serão cobrados à parte, mediante acordo prévio.

## 4. Uso das Imagens

As imagens entregues poderão ser utilizadas pelo **CONTRATANTE** para as finalidades descritas no briefing. Usos adicionais (publicidade, licenciamento a terceiros) requerem autorização prévia e poderão implicar remuneração adicional.

O **CONTRATADO** mantém o direito de usar as imagens em portfólio, salvo solicitação contrária expressa.
${CLAUSE_CONFIDENCIALIDADE}
${CLAUSE_RESOLUCAO}
${CLAUSE_FORO}

---

**CONTRATANTE:** {{client_name}}
Assinatura: ___________________________

**CONTRATADO:** {{contractor_name}}
Assinatura: ___________________________`,
  },
]

// ─── Interpolação de variáveis ──────────────────────────────────
export interface TemplateVars {
  client_name: string
  client_company: string
  contractor_name: string
  project_name: string
  value: string
  start_date: string
  end_date?: string
  today: string
}

export function interpolate(template: string, vars: TemplateVars): string {
  const endDateClause = vars.end_date
    ? `, com previsão de conclusão em **${vars.end_date}**`
    : ''
  const clientCompany = vars.client_company
    ? ` — ${vars.client_company}`
    : ''

  return template
    .replace(/{{client_name}}/g, vars.client_name)
    .replace(/{{client_company}}/g, clientCompany)
    .replace(/{{contractor_name}}/g, vars.contractor_name)
    .replace(/{{project_name}}/g, vars.project_name)
    .replace(/{{value}}/g, vars.value)
    .replace(/{{start_date}}/g, vars.start_date)
    .replace(/{{end_date_clause}}/g, endDateClause)
    .replace(/{{today}}/g, vars.today)
}
