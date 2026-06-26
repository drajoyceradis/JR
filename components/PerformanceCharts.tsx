import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  CalendarDays, 
  FileCheck, 
  Activity, 
  CheckCircle 
} from 'lucide-react';

interface TrendItem {
  month: string;
  Clinico: number;
  Pericial: number;
  Total: number;
}

interface ReportDocType {
  name: string;
  value: number;
  color: string;
}

// Glassmorphism Custom Tooltips utilizing high-contrast, beautiful brand colors (black, gold, charcoal - no pink)
const GlassmorphicAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border border-stone-200/60 dark:border-stone-800/60 p-4 rounded-2xl shadow-xl flex flex-col gap-2.5 min-w-[210px] transition-all duration-150">
        <div className="border-b border-stone-100 dark:border-stone-900/50 pb-1.5 flex justify-between items-center gap-3">
          <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider text-stone-400 dark:text-stone-550">Período</span>
          <span className="font-sans text-xs font-black text-[#B5A475]">{label}</span>
        </div>
        <div className="space-y-1.5">
          {payload.map((pld: any) => (
            <div key={pld.name} className="flex items-center justify-between text-xs gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: pld.stroke || pld.color }} />
                <span className="text-stone-605 dark:text-stone-300 font-medium font-sans">{pld.name}</span>
              </div>
              <span className="font-mono font-black text-stone-900 dark:text-stone-100">{pld.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const GlassmorphicPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/80 dark:bg-stone-950/80 backdrop-blur-xl border border-stone-200/60 dark:border-stone-800/60 p-4 rounded-2xl shadow-xl flex flex-col gap-2 min-w-[190px] transition-all duration-150">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: data.color }} />
          <span className="text-stone-900 dark:text-stone-100 font-serif font-bold text-xs truncate max-w-[150px]">{data.name}</span>
        </div>
        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-stone-100 dark:border-stone-900/50">
          <span className="text-stone-400 dark:text-stone-550 uppercase font-mono text-[9px] tracking-wider font-extrabold">Doc. Emitidos</span>
          <span className="font-mono font-black text-[#B5A475]">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const APPOINTMENT_TREND_DATA: TrendItem[] = [
  { month: 'Dez/25', Clinico: 34, Pericial: 45, Total: 79 },
  { month: 'Jan/26', Clinico: 42, Pericial: 52, Total: 94 },
  { month: 'Fev/26', Clinico: 38, Pericial: 48, Total: 86 },
  { month: 'Mar/26', Clinico: 48, Pericial: 60, Total: 108 },
  { month: 'Abr/26', Clinico: 45, Pericial: 58, Total: 103 },
  { month: 'Mai/26', Clinico: 55, Pericial: 68, Total: 123 },
];

export const PerformanceCharts: React.FC = () => {
  const [selectedScope, setSelectedScope] = useState<'Todos' | 'Clínicos' | 'Periciais'>('Todos');

  const filteredReportData = useMemo<ReportDocType[]>(() => {
    // Serious, high-corporate brand colors: Brown & Gold (#B5A475), Pitch Black (#1C1917), Deep Indigo/Purple (#3B2F9B), Sage Gray (#5F6B85)
    if (selectedScope === 'Clínicos') {
      return [
        { name: 'Laudos de Prática Médica', value: 15, color: '#5F6B85' },
        { name: 'Exames Metabólicos Integrativos', value: 10, color: '#3B2F9B' },
      ];
    }
    if (selectedScope === 'Periciais') {
      return [
        { name: 'Dano Corporal (TNI)', value: 45, color: '#B5A475' },
        { name: 'Assistência Cível', value: 30, color: '#3B2F9B' },
        { name: 'Contestação de Nexo', value: 25, color: '#1C1917' },
        { name: 'Pareceres Técnicos', value: 10, color: '#78716C' },
      ];
    }
    return [
      { name: 'Dano Corporal (TNI)', value: 45, color: '#B5A475' },
      { name: 'Assistência Cível', value: 30, color: '#3B2F9B' },
      { name: 'Contestação de Nexo', value: 25, color: '#1C1917' },
      { name: 'Laudos de Prática Médica', value: 15, color: '#5F6B85' },
      { name: 'Pareceres Técnicos', value: 20, color: '#78716C' },
    ];
  }, [selectedScope]);

  const totalReportsCount = useMemo(() => {
    return filteredReportData.reduce((acc, curr) => acc + curr.value, 0);
  }, [filteredReportData]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-stone-50/50 dark:bg-stone-950/20 rounded-3xl p-6 md:p-8 border border-stone-200 dark:border-stone-850 space-y-8 mt-12"
    >
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200/60 dark:border-stone-800/60 pb-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#B5A475]/10 text-[#B5A475] rounded-2xl shrink-0">
            <BarChart3 size={24} />
          </div>
          <div>
            <h4 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">Métricas & Produtividade Clientes</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-sans mt-0.5">Laudos emitidos, fluxos de assistência e nexo de causalidade para advocacia e clínica.</p>
          </div>
        </div>
        
        {/* Scope Filter Pill Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-stone-100 dark:bg-stone-900/60 p-1 rounded-xl self-start md:self-auto">
          {(['Todos', 'Clínicos', 'Periciais'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedScope(filter)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                selectedScope === filter
                  ? 'bg-stone-900 dark:bg-[#B5A475] text-white shadow-sm'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Numerical Indicators Metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-stone-900/40 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-850 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold dark:text-stone-500">Volume de Consultas</span>
            <h5 className="font-serif text-3xl font-black text-stone-900 dark:text-stone-100">
              {selectedScope === 'Todos' ? 593 : selectedScope === 'Clínicos' ? 262 : 331}
            </h5>
            <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-500 font-bold">
              <ArrowUpRight size={12} />
              <span>+14.2% frente ao quadrimestre</span>
            </div>
          </div>
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CalendarDays size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900/40 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-850 flex items-center justify-between shadow-sm">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold dark:text-stone-500">Documentos Emitidos</span>
            <h5 className="font-serif text-3xl font-black text-[#B5A475]">
              {selectedScope === 'Todos' ? 135 : selectedScope === 'Clínicos' ? 25 : 110}
            </h5>
            <div className="flex items-center gap-1 text-[10px] text-stone-400 font-mono">
              <span>Rigores Forenses</span>
            </div>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-[#B5A475] rounded-xl">
            <FileCheck size={20} />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900/40 p-5 rounded-2xl border border-stone-200/80 dark:border-stone-850 flex items-center justify-between shadow-sm col-span-1 sm:col-span-2 md:col-span-1">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold dark:text-stone-500">Taxa de Homologação</span>
            <h5 className="font-serif text-3xl font-black text-stone-900 dark:text-stone-100">98.4%</h5>
            <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-bold">
              <CheckCircle size={12} className="shrink-0" />
              <span>Consistência Probatória</span>
            </div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 rounded-xl">
            <Activity size={20} />
          </div>
        </div>
      </div>

      {/* Main Charts Side-by-Side Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Trend Area Chart (3 Cols/5) */}
        <div className="lg:col-span-3 bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-[#3B2F9B]" />
              <h5 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Volume de Atendimentos</h5>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-md text-stone-500 dark:text-stone-400">Mensal</span>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={APPOINTMENT_TREND_DATA}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="clinicGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B2F9B" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#3B2F9B" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="periciaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B5A475" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#B5A475" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBEB" className="dark:stroke-stone-800" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#888888', fontSize: 10, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fill: '#888888', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<GlassmorphicAreaTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                
                {(selectedScope === 'Todos' || selectedScope === 'Clínicos') && (
                  <Area 
                    type="monotone" 
                    name="Medicina Avançada"
                    dataKey="Clinico" 
                    stroke="#3B2F9B" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#clinicGrad)" 
                  />
                )}
                {(selectedScope === 'Todos' || selectedScope === 'Periciais') && (
                  <Area 
                    type="monotone" 
                    name="Suporte Técnico Forense"
                    dataKey="Pericial" 
                    stroke="#B5A475" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#periciaGrad)" 
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 font-sans leading-relaxed text-center">
            * <strong className="font-semibold text-stone-700 dark:text-stone-300">Medicina Avançada</strong> compreende imunologia celular e longevidade integrativa. <strong className="font-semibold text-stone-700 dark:text-stone-300">Suporte Técnico Forense</strong> compreende a formulação científica de quesitos, contestações e laudos de incapacidade (TNI).
          </p>
        </div>

        {/* Categories Pie Chart (2 Cols/5) */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 p-6 md:p-8 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PieChartIcon size={18} className="text-[#B5A475]" />
                <h5 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Distribuição por Tipos</h5>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded text-stone-500 dark:text-stone-400">Laudos</span>
            </div>

            <div className="h-[210px] w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={filteredReportData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {filteredReportData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<GlassmorphicPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Pie center metric values */}
              <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-serif font-black text-stone-900 dark:text-stone-100">
                  {totalReportsCount}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500">Documentos</span>
              </div>
            </div>
          </div>

          {/* Luxury Branded Legend List with Percentages & custom items */}
          <div className="space-y-2.5">
            {filteredReportData.map((entry) => {
              const percentage = totalReportsCount > 0 ? ((entry.value / totalReportsCount) * 100).toFixed(1) : '0';
              return (
                <div key={entry.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: entry.color }} 
                    />
                    <span className="text-stone-600 dark:text-stone-300 font-medium truncate">{entry.name}</span>
                  </div>
                  <span className="font-mono text-stone-400 dark:text-stone-500 font-bold">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </motion.div>
  );
};
