import{c as h,r as b,j as e,M as V,d as E,g as k,i as ae,h as oe,a as A,f as re,X as se,E as ne,S as ie,e as ce}from"./index-DOv-21NI.js";import{a as le,c as de,b as B,u as pe,d as me}from"./index-CIJexotC.js";import{a as H,u as ue}from"./hooks-Bs50L3nc.js";import{u as xe,C as P,t as _e,P as q}from"./zod-DFYDwcOi.js";import{u as fe,C as U,a as ge}from"./CustomSelect-mwkfQ_aS.js";import{u as ye}from"./profile-LzrlSw99.js";import{u as ve,U as be}from"./usePlanGate-C8PCF_xD.js";import{r as he}from"./markdown-CBrub0zd.js";import{u as je}from"./plan-DISRHT_P.js";import{P as Ce}from"./printer-BaUgHNZE.js";import"./useQuery-B8QMyXrZ.js";import"./useMutation-DEcHMpE5.js";import"./types-Biq_JdnO.js";/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ne=h("Bold",[["path",{d:"M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8",key:"mg9rjx"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Te=h("Eye",[["path",{d:"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",key:"1nclc0"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ae=h("Heading2",[["path",{d:"M4 12h8",key:"17cfdx"}],["path",{d:"M4 18V6",key:"1rz3zl"}],["path",{d:"M12 18V6",key:"zqpxq5"}],["path",{d:"M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1",key:"9jr5yi"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Oe=h("List",[["line",{x1:"8",x2:"21",y1:"6",y2:"6",key:"7ey8pc"}],["line",{x1:"8",x2:"21",y1:"12",y2:"12",key:"rjfblc"}],["line",{x1:"8",x2:"21",y1:"18",y2:"18",key:"c3b1m8"}],["line",{x1:"3",x2:"3.01",y1:"6",y2:"6",key:"1g7gq3"}],["line",{x1:"3",x2:"3.01",y1:"12",y2:"12",key:"1pjlvk"}],["line",{x1:"3",x2:"3.01",y1:"18",y2:"18",key:"28t2mc"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ke=h("Lock",[["rect",{width:"18",height:"11",x:"3",y:"11",rx:"2",ry:"2",key:"1w4ew1"}],["path",{d:"M7 11V7a5 5 0 0 1 10 0v4",key:"fwvmzm"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we=h("Minus",[["path",{d:"M5 12h14",key:"1ays0h"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const W=h("Send",[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]);/**
 * @license lucide-react v0.441.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Re=h("Type",[["polyline",{points:"4 7 4 4 20 4 20 7",key:"1nosan"}],["line",{x1:"9",x2:"15",y1:"20",y2:"20",key:"swin9y"}],["line",{x1:"12",x2:"12",y1:"4",y2:"20",key:"1tx1rr"}]]),ze=[{icon:e.jsx(Ae,{size:14}),label:"Título",prefix:"## ",block:!0,placeholder:"Título da seção"},{icon:e.jsx(Ne,{size:14}),label:"Negrito",prefix:"**",suffix:"**",placeholder:"texto em negrito"},{icon:e.jsx(Re,{size:14}),label:"Itálico",prefix:"*",suffix:"*",placeholder:"texto em itálico"},{icon:e.jsx(Oe,{size:14}),label:"Lista",prefix:"- ",block:!0,placeholder:"item da lista"},{icon:e.jsx(we,{size:14}),label:"Divisor",prefix:`
---
`,block:!0}];function Ee({value:o,onChange:s,rows:d=14,error:p}){const m=b.useRef(null);function y(a){var O;const l=m.current;if(!l)return;const i=l.selectionStart,j=l.selectionEnd,x=o.slice(0,i),t=o.slice(i,j),u=o.slice(j);let v,C;if(a.block){const _=x.lastIndexOf(`
`)+1,N=t||a.placeholder||"";v=x.slice(0,_)+a.prefix+x.slice(_)+N+u,C=_+a.prefix.length+N.length}else{const _=t||a.placeholder||"";v=x+a.prefix+_+(a.suffix??"")+u,C=i+a.prefix.length+_.length+(((O=a.suffix)==null?void 0:O.length)??0)}s(v),requestAnimationFrame(()=>{l.focus(),l.setSelectionRange(C,C)})}return e.jsxs("div",{className:"flex flex-col rounded-input border overflow-hidden",style:{borderColor:p?"var(--status-overdue)":"var(--border)"},children:[e.jsxs("div",{className:"flex items-center gap-0.5 px-2 py-1.5 border-b",style:{background:"var(--bg-1)",borderColor:"var(--border)"},children:[ze.map(a=>e.jsx("button",{type:"button",title:a.label,onClick:()=>y(a),className:"flex items-center justify-center w-7 h-7 rounded transition-all hover:opacity-70",style:{color:"var(--text-secondary)",background:"transparent"},children:a.icon},a.label)),e.jsx("div",{className:"ml-auto text-xs",style:{color:"var(--text-tertiary)"},children:"Markdown"})]}),e.jsx("textarea",{ref:m,value:o,onChange:a=>s(a.target.value),rows:d,className:"w-full px-3 py-2.5 text-xs outline-none resize-y font-mono",style:{background:"var(--bg-2)",color:"var(--text-primary)",lineHeight:"1.7",borderColor:"transparent"},placeholder:"Escreva o conteúdo do contrato…",spellCheck:!1})]})}const w=`
## 6. Confidencialidade

As partes comprometem-se a manter em sigilo todas as informações confidenciais trocadas durante a execução deste contrato, incluindo dados técnicos, comerciais e estratégicos, pelo prazo de 2 (dois) anos após o término do contrato.`,De=`
## 7. Propriedade intelectual

Após o pagamento integral, todos os direitos patrimoniais sobre os entregáveis produzidos neste contrato são transferidos ao **CONTRATANTE**. O **CONTRATADO** mantém o direito de exibir o trabalho em seu portfólio, salvo solicitação expressa em contrário.`,R=`
## 8. Rescisão

Qualquer das partes pode rescindir este contrato mediante notificação escrita com antecedência mínima de 15 (quinze) dias. Em caso de rescisão pelo **CONTRATANTE** após o início dos trabalhos, será devida ao **CONTRATADO** a remuneração proporcional ao trabalho realizado até a data de rescisão.`,z=`
## 9. Foro

Fica eleito o foro da comarca de domicílio do **CONTRATADO** para dirimir quaisquer conflitos oriundos deste contrato, com renúncia a qualquer outro, por mais privilegiado que seja.`,G=[{id:"web-development",name:"Desenvolvimento web",category:"Tecnologia",content:`# Contrato de Prestação de Serviços de Desenvolvimento Web

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
${w}
${De}
${R}
${z}

---

**CONTRATANTE:** {{client_name}}
Assinatura: ___________________________

**CONTRATADO:** {{contractor_name}}
Assinatura: ___________________________`},{id:"design",name:"Design gráfico / UI",category:"Design",content:`# Contrato de Prestação de Serviços de Design

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
${w}
${R}
${z}

---

**CONTRATANTE:** {{client_name}}
Assinatura: ___________________________

**CONTRATADO:** {{contractor_name}}
Assinatura: ___________________________`},{id:"consultoria",name:"Consultoria",category:"Serviços",content:`# Contrato de Consultoria

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
${w}
${R}
${z}

---

**CONTRATANTE:** {{client_name}}
Assinatura: ___________________________

**CONTRATADO:** {{contractor_name}}
Assinatura: ___________________________`},{id:"fotografia",name:"Fotografia",category:"Criativo",content:`# Contrato de Serviços Fotográficos

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
${w}
${R}
${z}

---

**CONTRATANTE:** {{client_name}}
Assinatura: ___________________________

**CONTRATADO:** {{contractor_name}}
Assinatura: ___________________________`}];function Se(o,s){const d=s.end_date?`, com previsão de conclusão em **${s.end_date}**`:"",p=s.client_company?` — ${s.client_company}`:"";return o.replace(/{{client_name}}/g,s.client_name).replace(/{{client_company}}/g,p).replace(/{{contractor_name}}/g,s.contractor_name).replace(/{{project_name}}/g,s.project_name).replace(/{{value}}/g,s.value).replace(/{{start_date}}/g,s.start_date).replace(/{{end_date_clause}}/g,d).replace(/{{today}}/g,s.today)}function Pe({open:o,onClose:s,onCreated:d}){var M,L,$,F;const p=le(),{data:m=[]}=H(),{data:y=[]}=ue(),{profile:a}=ye(),l=ve(),[i,j]=b.useState(""),[x,t]=b.useState("template"),[u,v]=b.useState(""),{register:C,handleSubmit:O,watch:_,setValue:N,reset:Y,control:D,formState:{errors:f,isDirty:J}}=xe({resolver:_e(de),defaultValues:{projectId:"",clientId:"",title:"",content:""}}),{handleClose:I,dialog:K}=fe(x==="form"&&J,s),S=_("clientId"),Q=_("projectId"),X=y.filter(r=>!S||r.clientId===S);b.useEffect(()=>{o||(t("template"),j(""),Y())},[o]);function Z(r){const c=G.find(T=>T.id===r);if(!c)return;const g=m.find(T=>T.id===S),n=y.find(T=>T.id===Q),te=Se(c.content,{client_name:(g==null?void 0:g.name)??"[Nome do cliente]",client_company:(g==null?void 0:g.company)??"",contractor_name:a.name||"[Seu nome]",project_name:(n==null?void 0:n.name)??"[Nome do projeto]",value:n?re(n.value):"[Valor]",start_date:n?A(n.startDate):"[Data de início]",end_date:n!=null&&n.endDate?A(n.endDate):void 0,today:A(new Date)});N("title",c.name,{shouldDirty:!0}),N("content",te,{shouldDirty:!0}),j(r),t("form")}function ee(r){p.mutate(r,{onSuccess:c=>{d==null||d(c.id),s()}})}return e.jsxs(e.Fragment,{children:[K,e.jsx(be,{open:!!u,onClose:()=>v(""),reason:u}),e.jsx(V,{open:o,onClose:I,title:"Novo contrato",size:"lg",children:x==="template"?e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx("p",{className:"text-sm",style:{color:"var(--text-secondary)"},children:'Escolha um template para começar, ou clique em "Em branco" para escrever do zero.'}),e.jsx("div",{className:"grid grid-cols-2 gap-3",children:G.map((r,c)=>{const g=l.check("contract-template",c),n=!g.allowed;return e.jsxs("button",{onClick:()=>{if(n){v(g.reason);return}Z(r.id)},className:"flex flex-col items-start gap-1.5 p-4 rounded-card border text-left transition-all duration-fast",style:{background:"var(--bg-2)",borderColor:n?"var(--border)":"var(--blueprint-border)",opacity:n?.65:1,cursor:n?"default":"pointer"},children:[e.jsxs("div",{className:"flex items-center gap-2",children:[n?e.jsx(ke,{size:14,style:{color:"var(--text-tertiary)"}}):e.jsx(E,{size:14,style:{color:"var(--primary)"}}),e.jsx("span",{className:"text-sm font-semibold",style:{color:n?"var(--text-tertiary)":"var(--text-primary)"},children:r.name})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-xs",style:{color:"var(--text-tertiary)"},children:r.category}),n&&e.jsx("span",{className:"text-xs font-semibold px-1.5 py-0.5 rounded-badge",style:{background:"var(--primary-subtle)",color:"var(--primary)"},children:"Pro"})]})]},r.id)})}),e.jsx("button",{onClick:()=>t("form"),className:"w-full py-2.5 rounded-input border text-sm font-medium transition-all hover:opacity-80",style:{borderColor:"var(--border)",color:"var(--text-secondary)"},children:"Em branco — escrever do zero"})]}):e.jsxs("form",{onSubmit:O(ee),className:"flex flex-col gap-4",children:[e.jsxs("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[e.jsx(k,{label:"Cliente *",error:(M=f.clientId)==null?void 0:M.message,children:e.jsx(P,{name:"clientId",control:D,render:({field:r})=>e.jsx(U,{options:m.map(c=>({value:c.id,label:c.name})),placeholder:"Selecione…",value:r.value,onChange:r.onChange,onBlur:r.onBlur,error:!!f.clientId})})}),e.jsx(k,{label:"Projeto *",error:(L=f.projectId)==null?void 0:L.message,children:e.jsx(P,{name:"projectId",control:D,render:({field:r})=>e.jsx(U,{options:X.map(c=>({value:c.id,label:c.name})),placeholder:"Selecione…",value:r.value,onChange:r.onChange,onBlur:r.onBlur,error:!!f.projectId})})})]}),e.jsx(k,{label:"Título do contrato *",error:($=f.title)==null?void 0:$.message,children:e.jsx("input",{...C("title"),placeholder:"Ex: Contrato de desenvolvimento web",className:oe(!!f.title),style:ae(!!f.title)})}),e.jsx(k,{label:"Conteúdo *",error:(F=f.content)==null?void 0:F.message,children:e.jsx(P,{name:"content",control:D,render:({field:r})=>e.jsx(Ee,{value:r.value,onChange:r.onChange,error:!!f.content})})}),e.jsxs("div",{className:"flex justify-between items-center pt-2",children:[e.jsx("button",{type:"button",onClick:()=>t("template"),className:"text-sm transition-all hover:opacity-70",style:{color:"var(--text-tertiary)"},children:"← Trocar template"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{type:"button",onClick:I,className:"px-4 py-2 rounded-input text-sm border transition-all hover:opacity-80",style:{borderColor:"var(--border)",color:"var(--text-secondary)"},children:"Cancelar"}),e.jsx("button",{type:"submit",disabled:p.isPending,className:"px-4 py-2 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50",style:{background:"var(--primary)"},children:p.isPending?"Criando…":"Criar contrato"})]})]})]})})]})}const Ie=`
  @media print {
    body * { visibility: hidden !important; }
    #contract-print, #contract-print * { visibility: visible !important; }
    #contract-print {
      position: fixed !important;
      inset: 0 !important;
      padding: 40px 60px !important;
      background: white !important;
      color: black !important;
      font-family: Georgia, serif !important;
      font-size: 12pt !important;
      line-height: 1.7 !important;
    }
    #contract-print h1 { font-size: 18pt; margin-bottom: 8px; }
    #contract-print h2 { font-size: 14pt; margin-top: 24px; margin-bottom: 6px; }
    #contract-print h3 { font-size: 12pt; margin-top: 16px; }
    #contract-print p, #contract-print li { margin-bottom: 6px; }
    #contract-print hr { border-top: 1px solid #ccc; margin: 20px 0; }
    #contract-print ul { padding-left: 20px; }
    #contract-print strong { font-weight: bold; }
  }
`,Me=`
  @media print {
    #contract-print::after {
      content: "MEIFlow — Plano Gratuito";
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-size: 52pt;
      color: rgba(0, 0, 0, 0.07);
      white-space: nowrap;
      pointer-events: none;
      z-index: 9999;
      font-family: Georgia, serif;
      font-weight: bold;
      letter-spacing: 2px;
    }
  }
`;function Le({contract:o,onClose:s}){const d=B(),{plan:p}=je(),m=b.useRef(null);function y(){if(!m.current){const i=document.createElement("style");document.head.appendChild(i),m.current=i}m.current.innerHTML=Ie+(p==="free"?Me:""),window.print()}function a(){o.status==="draft"&&d.mutate(o.id);const i=`${window.location.origin}/contract/${o.slug}`;navigator.clipboard.writeText(i).then(()=>alert(`Link copiado!

${i}`))}const l=he(o.content);return e.jsxs(V,{open:!0,title:o.title,onClose:s,size:"lg",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4 -mt-1",children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsxs("button",{onClick:y,className:"flex items-center gap-2 px-3 py-1.5 rounded-input border text-xs font-medium transition-all hover:opacity-80",style:{borderColor:"var(--border)",color:"var(--text-secondary)"},children:[e.jsx(Ce,{size:13})," Exportar PDF"]}),e.jsxs("button",{onClick:a,className:"flex items-center gap-2 px-3 py-1.5 rounded-input text-xs font-semibold text-white transition-all hover:opacity-90",style:{background:"var(--primary)"},children:[e.jsx(W,{size:13}),o.status==="draft"?"Enviar para aceite":"Copiar link"]})]}),e.jsx("button",{onClick:s,className:"p-1.5 rounded-input hover:opacity-70",style:{color:"var(--text-tertiary)"},children:e.jsx(se,{size:16})})]}),e.jsxs("div",{id:"contract-print",className:"rounded-card border p-6 overflow-auto max-h-[60vh]",style:{background:"var(--bg-2)",borderColor:"var(--border)"},children:[e.jsx("style",{children:`
          #contract-print h1 { font-size: 20px; font-weight: 800; margin-bottom: 4px; color: var(--text-primary); }
          #contract-print h2 { font-size: 15px; font-weight: 700; margin-top: 24px; margin-bottom: 6px; color: var(--text-primary); padding-top: 16px; border-top: 1px solid var(--border); }
          #contract-print h3 { font-size: 13px; font-weight: 600; margin-top: 14px; color: var(--text-primary); }
          #contract-print p { font-size: 13px; line-height: 1.7; margin-bottom: 8px; color: var(--text-secondary); }
          #contract-print ul { padding-left: 20px; margin-bottom: 8px; }
          #contract-print li { font-size: 13px; line-height: 1.6; color: var(--text-secondary); margin-bottom: 4px; }
          #contract-print strong { font-weight: 700; color: var(--text-primary); }
          #contract-print em { font-style: italic; }
          #contract-print code { font-family: monospace; font-size: 12px; background: var(--bg-1); padding: 1px 4px; border-radius: 3px; }
          #contract-print hr { border: none; border-top: 1px solid var(--border); margin: 20px 0; }
        `}),e.jsx("div",{dangerouslySetInnerHTML:{__html:l}})]})]})}function Xe(){const{data:o=[],isLoading:s}=pe(),{data:d=[]}=H(),p=me(),m=B(),[y,a]=b.useState(!1),[l,i]=b.useState(null);function j(t){confirm("Remover este contrato?")&&p.mutate(t)}function x(t){t.status==="draft"&&m.mutate(t.id);const u=`${window.location.origin}/contract/${t.slug}`;navigator.clipboard.writeText(u).then(()=>alert(`Link copiado!

${u}`))}return e.jsxs("div",{className:"max-w-4xl mx-auto animate-fade-in",children:[e.jsxs("div",{className:"mb-5 sm:mb-6 flex items-start justify-between gap-3",children:[e.jsxs("div",{className:"min-w-0",children:[e.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[e.jsx(E,{size:20,style:{color:"var(--primary)"}}),e.jsx("h1",{className:"text-2xl sm:text-h2 font-bold leading-tight",style:{color:"var(--text-primary)"},children:"Contratos"})]}),e.jsxs("p",{className:"text-sm",style:{color:"var(--text-secondary)"},children:[o.length," contrato",o.length!==1?"s":""]})]}),e.jsxs("button",{onClick:()=>a(!0),"data-pwa-tap":!0,"aria-label":"Novo contrato",className:"flex items-center justify-center gap-2 px-4 py-2.5 rounded-input text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0 min-h-[44px]",style:{background:"var(--primary)"},children:[e.jsx(q,{size:16}),e.jsx("span",{className:"hidden xs:inline",children:"Novo"})]})]}),s?e.jsx("div",{className:"flex justify-center py-16",children:e.jsx("div",{className:"w-7 h-7 rounded-full border-2 border-t-transparent animate-spin",style:{borderColor:"var(--primary)",borderTopColor:"transparent"}})}):o.length===0?e.jsx(ne,{icon:e.jsx(E,{size:22}),title:"Nenhum contrato ainda",description:"Crie seu primeiro contrato a partir de um template ou do zero.",action:e.jsxs("button",{onClick:()=>a(!0),"data-pwa-tap":!0,className:"flex items-center gap-2 px-5 py-2.5 rounded-input text-sm font-semibold text-white",style:{background:"var(--primary)"},children:[e.jsx(q,{size:15})," Novo contrato"]})}):e.jsx("div",{className:"flex flex-col gap-2.5",children:o.map(t=>{const u=d.find(v=>v.id===t.clientId);return e.jsxs("div",{className:"rounded-card border overflow-hidden",style:{background:"var(--bg-1)",borderColor:"var(--border)"},children:[e.jsxs("button",{onClick:()=>i(t),"data-pwa-tap":!0,className:"w-full flex items-start gap-3 px-4 pt-3.5 pb-3 text-left",children:[e.jsx("div",{className:"w-10 h-10 rounded-input flex items-center justify-center shrink-0",style:{background:"var(--primary-subtle)",color:"var(--primary)"},children:e.jsx(E,{size:16})}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsxs("div",{className:"flex items-start justify-between gap-2 mb-1",children:[e.jsx("p",{className:"text-sm font-semibold leading-snug break-words",style:{color:"var(--text-primary)"},children:t.title}),e.jsx(ie,{status:t.status})]}),u&&e.jsx("p",{className:"text-xs truncate font-medium",style:{color:"var(--text-secondary)"},children:u.name}),e.jsxs("div",{className:"flex items-center gap-1.5 mt-1 text-[11px]",style:{color:"var(--text-tertiary)"},children:[e.jsx(ge,{size:11}),e.jsxs("span",{children:["Criado em ",A(t.createdAt),t.acceptedAt&&` · Aceito em ${A(t.acceptedAt)}`]})]})]})]}),e.jsxs("div",{className:"flex items-stretch border-t",style:{borderColor:"var(--border)"},children:[e.jsxs("button",{onClick:()=>i(t),"data-pwa-tap":!0,className:"flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all hover:opacity-70",style:{color:"var(--text-secondary)"},children:[e.jsx(Te,{size:13})," Ver"]}),t.status!=="accepted"&&e.jsxs(e.Fragment,{children:[e.jsx("div",{className:"w-px",style:{background:"var(--border)"}}),e.jsxs("button",{onClick:()=>x(t),"data-pwa-tap":!0,className:"flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all hover:opacity-70",style:{color:"var(--primary)"},children:[e.jsx(W,{size:13})," Enviar"]})]}),e.jsx("div",{className:"w-px",style:{background:"var(--border)"}}),e.jsx("button",{onClick:()=>j(t.id),"data-pwa-tap":!0,"aria-label":"Remover",className:"px-4 flex items-center justify-center transition-all hover:opacity-70",style:{color:"var(--status-overdue)"},children:e.jsx(ce,{size:14})})]})]},t.id)})}),e.jsx(Pe,{open:y,onClose:()=>a(!1)}),l&&e.jsx(Le,{contract:l,onClose:()=>i(null)})]})}export{Xe as default};
