import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Plus, Settings, BookOpen, FileSpreadsheet, Scale, Printer, Check, Info, FileText } from 'lucide-react';
import { BodilyInjuryCategory, ForensicLaudoAnalysis } from '../types';
import { showToast } from './Toast';

const INITIAL_CATEGORIES: BodilyInjuryCategory[] = [
  { id: 'ortho_limb_upper', name: 'Membro Superior Dominante', description: 'Perda funcional, muscular ou osteoarticular de braço, antebraço ou punho.', weight: 70, estimatedLoss: 0 },
  { id: 'ortho_limb_lower', name: 'Membros Inferiores & Quadril', description: 'Comprometimento articular de marcha, encurtamentos ou consolidação viciosa.', weight: 60, estimatedLoss: 0 },
  { id: 'neuro_cognition', name: 'Neurológico & Cognitivo', description: 'Déficit neuropsicológico, sequela de TCE ou distúrbios motores reflexos.', weight: 100, estimatedLoss: 0 },
  { id: 'sensory_vision_audio', name: 'Sensorial (Visão ou Audição)', description: 'Diminuição da acuidade visual bilateral ou perda auditiva neurossensorial.', weight: 45, estimatedLoss: 0 },
  { id: 'cardio_internal', name: 'Órgãos Internos & Torácicos', description: 'Capacidade respiratória reduzida, trauma toracoabdominal ou visceral.', weight: 80, estimatedLoss: 0 }
];

export const ForensicTools: React.FC = () => {
  const [categories, setCategories] = useState<BodilyInjuryCategory[]>(INITIAL_CATEGORIES);
  const [clientName, setClientName] = useState<string>('');
  const [caseNumber, setCaseNumber] = useState<string>('');
  const [comarca, setComarca] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [rehabilitationRequired, setRehabilitationRequired] = useState<boolean>(false);
  
  const [finalIncapacity, setFinalIncapacity] = useState<number>(0);
  const [savedSimulations, setSavedSimulations] = useState<ForensicLaudoAnalysis[]>([]);

  // Calculate incapacity using Balthazard Formula:
  // Incapacidade acumulada = 100 - (100 * (1 - d1) * (1 - d2) * ...)
  useEffect(() => {
    let capacity = 100; // start with 100% capacity
    
    categories.forEach((cat) => {
      if (cat.estimatedLoss > 0) {
        const factor = (cat.weight * cat.estimatedLoss) / 100; // value from 0 to weight/100
        capacity = capacity * (1 - factor);
      }
    });

    const incapacityTotal = 100 - capacity;
    setFinalIncapacity(parseFloat(incapacityTotal.toFixed(1)));
  }, [categories]);

  const handleSliderChange = (id: string, value: number) => {
    setCategories(prev => prev.map(cat => cat.id === id ? { ...cat, estimatedLoss: value } : cat));
  };

  const handleSaveSimulation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !caseNumber) {
      showToast('Por favor, informe ao menos o Nome do Periciando e o Número do Processo.', 'error');
      return;
    }

    const sim: ForensicLaudoAnalysis = {
      clientName,
      caseNumber,
      expertName: comarca || 'Geral',
      comarca: comarca || 'Geral',
      injuries: [...categories],
      notes,
      rehabilitationRequired,
      finalIncapacityPct: finalIncapacity
    };

    setSavedSimulations(prev => [sim, ...prev]);
    // reset form
    setClientName('');
    setCaseNumber('');
    setComarca('');
    setNotes('');
    setRehabilitationRequired(false);
    setCategories(prev => prev.map(c => ({ ...c, estimatedLoss: 0 })));
    showToast('Simulação salva com sucesso no histórico da sessão!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const getIncapacityBadgeColor = (val: number) => {
    if (val === 0) return 'text-stone-400 bg-stone-50';
    if (val < 15) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (val < 40) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50/50 border-red-200';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Dynamic Calculator Form */}
      <div className="lg:col-span-8 bg-white border border-stone-150 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-[#B5A475] block font-mono">Pareceres Técnicos Judiciais & Isenções de Alto Valor</span>
          <h3 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mt-1">Simulador Pericial Auxiliar</h3>
          <p className="text-stone-500 text-xs mt-2 leading-relaxed">
            Desenvolvido sob o rigor científico da formulação de <b>Balthazard</b>, este simulador auxilia advogados na modelagem de incapacidades laborais e danos biológicos residuais. Um prontuário tecnicamente indubitável e um laudo detalhado são ferramentas decisivas para <strong>aumentar as chances de concessão de benefícios previdenciaristas (INSS, BPC/LOAS)</strong> e para provar de forma cristalina moléstias graves voltadas à <strong>isenção definitiva de IRPF</strong> em sede judicial ou administrativa.
          </p>
        </div>

        {/* Sliders Grid */}
        <div className="space-y-5">
          {categories.map((cat) => {
            const lossPercentage = Math.round(cat.weight * cat.estimatedLoss);
            return (
              <div key={cat.id} className="p-4 bg-stone-50/50 rounded-2xl border border-stone-100 space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-serif font-black text-stone-800">{cat.name}</h4>
                    <p className="text-[10px] text-stone-400 max-w-lg mt-0.5 leading-normal">{cat.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-mono uppercase font-extrabold text-stone-400 block bg-stone-100 px-1.5 py-0.2 rounded">
                      Inércia Máxima: {cat.weight}%
                    </span>
                    <span className="text-xs font-black text-[#B5A475] block mt-1">
                      Estimado: {lossPercentage}% {cat.estimatedLoss > 0 && `(${Math.round(cat.estimatedLoss * 100)}%)`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-[10px] font-bold text-stone-400 shrink-0">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={cat.estimatedLoss}
                    onChange={(e) => handleSliderChange(cat.id, parseFloat(e.target.value))}
                    className="w-full accent-[#B5A475] cursor-pointer h-1.5 bg-stone-200 rounded-lg appearance-none"
                  />
                  <span className="text-[10px] font-bold text-stone-400 shrink-0">100%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Metadata Details to save reports */}
        <form onSubmit={handleSaveSimulation} className="pt-4 border-t border-stone-100 space-y-4">
          <h4 className="font-serif text-sm font-black text-stone-800">Dossier Informativo do Periciando</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-600 block">Nome do Periciando *</label>
              <input
                type="text"
                placeholder="Ex: João da Silva"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B5A475] shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-600 block">Número do Processo *</label>
              <input
                type="text"
                placeholder="Ex: 5001234-56.2026.8.26"
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B5A475] shadow-inner"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-600 block">Comarca / Vara Judicial</label>
              <input
                type="text"
                placeholder="Ex: 2ª Vara Cível de Vitória/ES"
                value={comarca}
                onChange={(e) => setComarca(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B5A475] shadow-inner"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-stone-600 block font-sans">Histórico e Nexo de Causalidade (Notas Rápidas)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva fraturas, traumas sofridos na atividade laboral ou tratamentos cirúrgicos..."
              className="w-full bg-white border border-stone-200 rounded-xl p-4 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B5A475] shadow-inner"
            />
          </div>

          {/* Toggle professional rehab */}
          <div className="flex items-center gap-3 py-1">
            <input
              type="checkbox"
              id="rehab_needed"
              checked={rehabilitationRequired}
              onChange={(e) => setRehabilitationRequired(e.target.checked)}
              className="rounded border-stone-300 text-[#B5A475] focus:ring-[#B5A475] h-4 w-4"
            />
            <label htmlFor="rehab_needed" className="text-xs font-bold text-stone-650 cursor-pointer">
              Exige Reabilitação Assistencial Profissional formal? (Exigência de Nexo Técnico Laboral)
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 py-3.5 bg-stone-900 hover:bg-[#B5A475] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
            >
              Gravar Simulação de Dano
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-6 py-3.5 border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center gap-2"
            >
              <Printer size={13} /> Imprimir Laudo
            </button>
          </div>
        </form>
      </div>

      {/* Calculator Result Box */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Real-time score indicator */}
        <div className="bg-stone-950 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden text-center space-y-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B5A475]/10 rounded-full blur-2xl"></div>
          
          <span className="text-[9px] font-mono font-black text-[#B5A475] uppercase tracking-widest bg-[#B5A475]/10 px-3 py-1 rounded-full border border-[#B5A475]/20 inline-block">
            Incapacidade Acumulada
          </span>
          
          <div className="py-4">
            <span className="text-7xl font-serif font-black tracking-tight text-white">{finalIncapacity}%</span>
            <p className="text-[11px] text-stone-400 font-semibold mt-1">Dano Biológico Residual Estático</p>
          </div>

          <div className={`p-3 rounded-2xl border text-xs font-bold leading-normal ${
            finalIncapacity === 0 ? 'bg-stone-900 border-stone-800 text-stone-500' :
            finalIncapacity < 15 ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400' :
            finalIncapacity < 45 ? 'bg-amber-950/20 border-amber-500/20 text-amber-400' :
            'bg-red-950/20 border-red-500/20 text-red-400'
          }`}>
            {finalIncapacity === 0 ? 'Sem sequelas aparentes na TNI.' :
             finalIncapacity < 15 ? 'Incapacidade Leve: Sequelas mínimas toleradas sem comprometimento total de ofício dominante.' :
             finalIncapacity < 45 ? 'Incapacidade Moderada: Limitação crônica. Recomenda-se ponderação técnica e análise forense imediata.' :
             'Incapacidade Grave e Extrema: Alto impacto funcional e psicomotor. Indispensável parecer cirúrgico assistencial definitivo.'}
          </div>

          <p className="text-[10px] text-stone-500 leading-normal italic">
            * Cômputo baseado estritamente na capacidade de trabalho restante pós-lesões conforme regramento médico de Balthazard.
          </p>
        </div>

        {/* History drawer */}
        <div className="bg-stone-50 border border-stone-150 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-serif text-sm font-black text-stone-800">Simulações Recentes</h4>
            <span className="text-[9px] font-mono bg-stone-200 text-stone-600 px-2 py-0.5 rounded-full font-bold">
              {savedSimulations.length}
            </span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {savedSimulations.length === 0 ? (
              <div className="py-12 text-center text-xs text-stone-400 border border-dashed border-stone-250 rounded-2xl bg-white">
                <FileText size={18} className="mx-auto text-stone-300 mb-2" />
                Nenhuma simulação salva ainda.
              </div>
            ) : (
              savedSimulations.map((sim, index) => (
                <div key={index} className="p-3 bg-white border border-stone-200 rounded-xl space-y-1.5 hover:border-[#B5A475] transition-colors cursor-pointer">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-[#B5A475]">{sim.comarca || 'Geral'}</span>
                    <span className="text-[10px] font-mono font-black bg-stone-100 text-stone-700 px-1.5 py-0.2 rounded">
                      {sim.finalIncapacityPct}%
                    </span>
                  </div>
                  <h5 className="text-xs font-serif font-extrabold text-stone-800 truncate leading-snug">{sim.clientName}</h5>
                  <p className="text-[9px] font-mono text-stone-400 font-bold truncate">Processo: {sim.caseNumber}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
