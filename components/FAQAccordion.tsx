import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Sparkles, Scale, ShieldCheck, FileText, Activity } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  category: 'pericia' | 'longevidade' | 'seguranca';
  icon: React.ReactNode;
}

const FAQ_ITEMS: FAQItemProps[] = [
  {
    category: 'pericia',
    icon: <Scale size={16} className="text-[#B5A475]" />,
    question: "O que é a Assistência Técnica Médica e como ela diferencia-se da Perícia Judicial?",
    answer: "A Perícia Judicial é conduzida pelo perito nomeado pelo juiz, agindo como um agente imparcial da justiça. A Assistência Técnica, por outro lado, é contratada pela própria parte (por intermédio de seu advogado) para garantir a paridade de armas técnica. Nós estruturamos a estratégia médica do processo: elaboramos quesitos científicos perspicazes, acompanhamos fisicamente o exame pericial judicial para garantir a boa técnica e emitimos um Parecer Técnico Médico irrefutável, blindando ou impugnando o laudo judicial com absoluto rigor científico."
  },
  {
    category: 'pericia',
    icon: <FileText size={16} className="text-[#B5A475]" />,
    question: "Como o Parecer Médico de Alto Valor aumenta a chance de concessão de benefícios previdenciários e assistenciais?",
    answer: "Bancas de advocacia previdenciária enfrentam alta taxa de indeferimento de novos benefícios por incapacidade e BPC devido a laudos superficiais do INSS. Entregamos um Parecer de alto valor científico baseado no nexo documental. Traduzimos termos clínicos complexos para o código processual civil, correlacionando diagnósticos e exames retrospectivos a limitações funcionais biológicas específicas do trabalhador. Desenvolvemos quesitos personalizados que impedem que o perito oficial dê respostas genéricas ou monossilábicas (como 'sim' ou 'não')."
  },
  {
    category: 'pericia',
    icon: <ShieldCheck size={16} className="text-[#B5A475]" />,
    question: "De que maneira a análise documental médica atesta o direito de Isenção de IRPF por moléstia grave?",
    answer: "A isenção do Imposto de Renda (IRPF) para aposentados e pensionistas que sofrem de doenças graves exige comprovação documental retrospectiva irrefutável. Analisamos detalhadamente todo o histórico clínico do cliente (prontuários, laudos de cirurgias, exames laboratoriais e anatomopatológicos) para reconstruir uma linha do tempo clínica incontestável. Produzimos laudos minuciosos que atestam a existência e a data de eclosão da patologia em estrito alinhamento com os critérios legais e jurisprudenciais vigentes."
  },
  {
    category: 'longevidade',
    icon: <Sparkles size={16} className="text-[#B5A475]" />,
    question: "Por que focar em Longevidade Celular e Ativa e não em abordagens paliativas genéricas?",
    answer: "Enquanto a medicina convencional costuma atuar de maneira reativa apenas tratando o sintoma de patologias já manifestadas, a medicina focada em Longevidade Celular e Ativa atua na raiz metabólica celular e mitocondrial. Analisamos biomarcadores funcionais de alta sensibilidade para identificar disfunções subclínicas muito antes da manifestação de doenças. Estruturamos planos metabólicos contínuos com foco em nutracêutica avançada, epigenética e modulação ativa de biomotores para assegurar mais 'Healthspan' — tempo de vida produtivo, vigoroso e saudável."
  },
  {
    category: 'longevidade',
    icon: <Activity size={16} className="text-[#B5A475]" />,
    question: "Como funciona a primeira avaliação de Longevidade Celular?",
    answer: "É um processo elegante com alto rigor diagnóstico. Iniciamos com uma consulta preliminar minuciosa para compreender seu histórico pessoal de bio-performance, fadiga crônica, sono e metabolismo. Com base nisso, solicitamos exames laboratoriais especializados. Na avaliação de retorno, desenhamos seu Protocolo de Otimização Celular Personalizado, englobando cronobiologia alimentar, planos de suplementação celular ativa e acompanhamento clínico contínuo para aferir a evolução de cada marcador."
  },
  {
    category: 'seguranca',
    icon: <ShieldCheck size={16} className="text-[#B5A475]" />,
    question: "Como as informações médicas e processos dos clientes são protegidos na plataforma?",
    answer: "A confidencialidade é tratada como prioridade jurídica e ética máxima. Nosso sistema é integrado ao Google Cloud e à LGPD através de criptografia total ponta-a-ponta. Os advogados e pacientes têm acesso ao 'Drive Cabinet' integrado diretamente ao Google Drive institucional seguro. Todos os prontuários, documentos processuais anexados e dados pessoais coletados permanecem em repositórios controlados por tokens biométricos de segurança."
  }
];

export const FAQAccordion: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | 'pericia' | 'longevidade'>('all');

  const filteredItems = FAQ_ITEMS.filter(item => 
    activeCategory === 'all' ? true : item.category === activeCategory
  );

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-stone-50/50 dark:bg-stone-950/20 border-t border-stone-200/50 dark:border-stone-900/60 py-20 px-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header Block */}
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase font-mono tracking-widest bg-[#B5A475]/10 dark:bg-[#B5A475]/5 text-[#B5A475] px-4 py-1.5 rounded-full border border-[#B5A475]/15 font-bold inline-flex items-center gap-2">
            <ShieldCheck size={12} /> Esclarecimentos e Rigor Técnico
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-stone-900 dark:text-stone-50 font-normal tracking-tight">
            Perguntas Frequentes
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-xs max-w-lg mx-auto leading-relaxed">
            Consulte respostas claras sobre os pilares da Assistência Técnica Médico-Forense e as consultas de Longevidade Celular e Estilo de Vida Ativo.
          </p>
        </div>

        {/* Tab Filter Button Row */}
        <div className="flex justify-center gap-2 max-w-md mx-auto p-1 bg-stone-100 dark:bg-stone-900/40 rounded-xl border border-stone-200/40 dark:border-stone-850">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'pericia', label: 'Perícias & Assistência' },
            { id: 'longevidade', label: 'Longevidade Celular' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                setOpenIndex(null);
              }}
              className={`flex-1 py-1.5 px-3 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeCategory === cat.id 
                  ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm font-black'
                  : 'text-stone-550 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {filteredItems.map((item, idx) => {
              const isFirst = idx === 0;
              const isOpen = openIndex === idx;
              return (
                <motion.div
                  key={item.question}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className={`bg-white dark:bg-stone-900/60 border rounded-2xl transition-all duration-300 overflow-hidden ${
                    isOpen 
                      ? 'border-[#B5A475]/40 shadow-md ring-1 ring-[#B5A475]/10' 
                      : 'border-stone-200/60 dark:border-stone-850 hover:border-stone-300 dark:hover:border-stone-800'
                  }`}
                >
                  {/* Collapsed Header */}
                  <button
                    onClick={() => toggleItem(idx)}
                    className="w-full flex items-center justify-between p-5 md:p-6 text-left cursor-pointer transition-colors duration-200"
                  >
                    <div className="flex items-center gap-4 pr-4">
                      <div className={`p-2 rounded-xl border transition-colors ${
                        isOpen 
                          ? 'bg-[#B5A475]/10 border-[#B5A475]/25 text-[#B5A475]' 
                          : 'bg-stone-50 dark:bg-stone-950 border-stone-200/60 dark:border-stone-850 text-stone-450'
                      }`}>
                        {item.icon}
                      </div>
                      <span className="font-serif text-sm md:text-base text-stone-900 dark:text-stone-100 leading-tight font-medium hover:text-[#B5A475] dark:hover:text-[#B5A475] transition-colors">
                        {item.question}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="text-stone-400 dark:text-stone-600"
                    >
                      <ChevronDown size={18} />
                    </motion.div>
                  </button>

                  {/* Expanded Body Content */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <div className="px-5 pb-6 md:px-16 md:pb-7 text-xs md:text-sm text-stone-600 dark:text-stone-300 font-sans leading-relaxed border-t border-stone-100 dark:border-stone-850 pt-4">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Minimal Subtle Trust Badge */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200/50 dark:border-stone-850/80 text-[10px] uppercase font-mono tracking-widest text-[#B5A475] font-bold">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#B5A475] rounded-full" />
            <span>Ética Profissional Inabalável</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#B5A475] rounded-full" />
            <span>Associação Brasileira de Perícias Médicas</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#B5A475] rounded-full" />
            <span>Rigor Científico Colegiado</span>
          </div>
        </div>

      </div>
    </section>
  );
};
