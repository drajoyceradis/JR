# Gerador de Evolução PS - Meridional Serra

Ferramenta estática, em HTML único, para apoio à redação de evolução e reavaliação no PS do Hospital Meridional Serra, com saída em texto puro para MV/SoulMV.

## O que esta versão entrega

- Modo **EVOLUÇÃO**.
- Modo **REAVALIAÇÃO**, com HDA da admissão, bloco **EM TEMPO** e **EXAMES COMPLEMENTARES**.
- Formatação reforçada:
  - QP em linha única no padrão `# QP: "..."`.
  - Itens internos com hífen simples.
  - Sem asterisco, bullets gráficos ou travessão.
  - `ABD` em vez de `ABDOME`.
- HDA em bloco corrido mais rico:
  - acompanhado/desacompanhado;
  - queixa;
  - descrição;
  - tempo;
  - sintomas associados;
  - queixas secundárias;
  - negativas/red flags.
- Bloco próprio para **MEDICAÇÕES DE USO CONTÍNUO**, com linhas extras para completar à mão.
- Exame físico ampliado:
  - GERAL;
  - ACV;
  - AR;
  - ABD;
  - NEUROLÓGICO;
  - MMII com pesquisa de TVP;
  - OUTROS, incluindo PSIQ/TEGUMENTAR/ORO/OTO.
- Hipótese diagnóstica e conduta com múltiplas linhas.
- Transformador de exames crus para padrão de evolução:
  - hemograma;
  - creatinina/RFG;
  - ureia;
  - TGO/TGP;
  - PCR;
  - amilase/lipase;
  - EAS;
  - TC;
  - RX;
  - ECG/laudos genéricos.

## Observação técnica

A conexão GitHub disponível neste ambiente não expôs uma ação para criar repositório novo do zero. Por isso, a entrega foi criada como um projeto novo, isolado, dentro do repositório `drajoyceradis/JR`, na pasta:

`gerador-evolucao-ps-meridional-serra/`

Se desejar, essa pasta pode ser movida depois para um repositório próprio pelo GitHub.

## Arquivo principal

Abra:

`gerador-evolucao-ps-meridional-serra/index.html`

O arquivo é standalone: CSS, HTML e JavaScript estão no mesmo arquivo.

## Privacidade

Não inserir nome, CPF, SAME, carteirinha, data de nascimento completa, chave de acesso ou qualquer identificador do paciente. A ferramenta roda localmente no navegador e não envia dados para servidor.