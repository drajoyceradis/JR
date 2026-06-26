import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Award, 
  Calendar, 
  FileText, 
  Briefcase, 
  Scale, 
  BookOpen, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Star, 
  ChevronRight, 
  ChevronLeft,
  Quote,
  LayoutGrid,
  SlidersHorizontal,
  Lock,
  Sparkles, 
  Menu, 
  X,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sun,
  Moon,
  Check,
  MessageCircle,
  Linkedin
} from 'lucide-react';

import { initAuth, googleSignIn, logout, getAccessToken, setAccessToken } from './firebase';
import { BookingCalendar } from './components/BookingCalendar';
import { DriveCabinet } from './components/DriveCabinet';
import { ForensicTools } from './components/ForensicTools';
import { VideoGenerator } from './components/VideoGenerator';
import { WorkspaceHub } from './components/WorkspaceHub';
import { ToastContainer } from './components/Toast';
import { EliteLogo } from './components/EliteLogo';
import { FAQAccordion } from './components/FAQAccordion';

import { PatientPortalOnHome } from './components/PatientPortalOnHome';
import { UserProfileSettings } from './components/UserProfileSettings';

interface Testimonial {
  id: number;
  author: string;
  role: string;
  category: 'juridico' | 'clinica';
  text: string;
  date: string;
  badge: string;
  rating: number;
  highlight: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    author: "Dr. Arthur M.",
    role: "Advogado Sócio em Direito Civil & Indenizações",
    category: "juridico",
    text: "O laudo pericial complementar elaborado para nossa banca foi o fiel da balança em uma disputa cível de altíssima complexidade. A precisão científica em refutar queixas sem nexo causal e o rigor impecável na resposta aos nossos quesitos garantiram o acolhimento fundamentado pelo juiz sentenciante.",
    date: "Maio de 2026",
    badge: "Parceiro de Advocacia",
    rating: 5,
    highlight: "Precisão científica impecável e nexo causal indubitável."
  },
  {
    id: 2,
    author: "P. S., Engenheiro Aeroespacial",
    category: "clinica",
    role: "Paciente de Medicina Integrativa & Funcional",
    text: "Após meses peregrinando por pronto-atendimentos que tratavam apenas meus sintomas de fadiga extrema de maneira superficial, a investigação molecular de base integrativa conduzida pela Dra. Joyce identificou e corrigiu minhas disfunções metabólicas celulares. Minha qualidade de vida diária renasceu.",
    date: "Março de 2026",
    badge: "Paciente Clínico",
    rating: 5,
    highlight: "Olhar investigativo avançado que mudou minha vida."
  },
  {
    id: 3,
    author: "Dra. Carolina F.",
    role: "Assessora Jurídica e Especialista em Responsabilidade Civil",
    category: "juridico",
    text: "Atuar em assistência técnica médica exige extrema destreza contra-argumentativa. O suporte intelectual oferecido pela Dra. Joyce, pautado na perfeita articulação doutrinária e conformidade total com a LGPD e o Código de Processo Civil, confereu a nossa tese defensiva uma solidez técnica irrefutável.",
    date: "Junho de 2026",
    badge: "Assistência Médica Premium",
    rating: 5,
    highlight: "Conformidade técnico-legal absoluta em sede civil."
  },
  {
    id: 4,
    author: "M. R., Executiva C-Level",
    category: "clinica",
    role: "Acompanhamento Preventivo & Alta Performance",
    text: "Buscava uma profissional de saúde soberana, capaz de planejar longevidade ativa sem cartilhas genéricas. A consulta minuciosa de quase duas horas e o mapeamento personalizado de marcadores preventivos me deram o direcionamento exato para conciliar imunidade excelente e alta performance executiva.",
    date: "Janeiro de 2026",
    badge: "Suporte Preventivo Integrado",
    rating: 5,
    highlight: "Planejamento de longevidade customizado e sem pressa."
  },
  {
    id: 5,
    author: "Dr. Felipe G.",
    role: "Advogado de Bancas Trabalhistas",
    category: "juridico",
    text: "O domínio analítico da Dra. Joyce sobre as escalas de avaliação de sequelas e o cômputo matemático da incapacidade física (como a aplicação criteriosa das tabelas de Dano Corporal) desarma argumentos infundados de supostas lesões ocupacionais. Um trabalho forense de extrema idoneidade.",
    date: "Fevereiro de 2026",
    badge: "Defesa Técnico-Forense",
    rating: 5,
    highlight: "Domínio analítico de incapacidades e dano corporal."
  },
  {
    id: 6,
    author: "T. B., Economista Sênior",
    category: "clinica",
    role: "Tratamento Integrado de Dor Crônica",
    text: "Enxergar o organismo humano como uma constelação integrada de fatores bioquímicos e físicos, e não apenas prescrever analgésicos genéricos, é a grande virtude da Dra. Joyce. O seu acolhimento empático e o direcionamento de rotina mudaram severamente minhas recorrências de enxaqueca.",
    date: "Abril de 2026",
    badge: "Cuidado de Alta Complexidade",
    rating: 5,
    highlight: "Acolhimento empático e melhora palpável de dor crônica."
  }
];

export const App: React.FC = () => {
  // Navigation / Custom App States
  const [activeTab, setActiveTab] = useState<'home' | 'booking' | 'cabinet' | 'simulator' | 'lawyers' | 'about' | 'connect'>('home');
  const [portalView, setPortalView] = useState<'dashboard' | 'profile'>('dashboard');
  const [user, setUser] = useState<any>(null);
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Testimonials States
  const [testimonialIndex, setTestimonialIndex] = useState<number>(0);
  const [testimonialFilter, setTestimonialFilter] = useState<'all' | 'juridico' | 'clinica'>('all');
  const [testimonialLayout, setTestimonialLayout] = useState<'slider' | 'grid'>('slider');

  // Dark Mode State
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Initialize Auth state on mount
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessTokenState(token);
        setAuthLoading(false);
      },
      () => {
        setUser(null);
        setAccessTokenState(null);
        setAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const response = await googleSignIn();
      if (response) {
        setUser(response.user);
        setAccessTokenState(response.accessToken);
        setActiveTab('home');
      }
    } catch (e) {
      console.error('Falha de login:', e);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setUser(null);
    setAccessTokenState(null);
    handleTabChange('home');
  };

  const handleTabChange = (tab: 'home' | 'booking' | 'cabinet' | 'simulator' | 'lawyers' | 'about' | 'connect') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Apple-like transition variables
  const animationVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  // Scroll Effects for Nav
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0A0A0A] text-stone-900 dark:text-stone-50 font-sans antialiased text-base selection:bg-[#C5B485]/30 transition-colors duration-300">
      
      {/* Toast Notifications container */}
      <ToastContainer />

      {/* Highly Interactive Floating WhatsApp Button (Elite Concierge Style) */}
      <div className="fixed bottom-6 right-6 z-[9990] flex items-center gap-3">
        <a
          href="https://wa.me/5527998134032?text=Olá%20Dra.%20Joyce,%20gostaria%20de%20saber%20mais%20sobre%20seus%20serviços."
          target="_blank"
          rel="noopener noreferrer"
          className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-full shadow-2xl hover:shadow-[#25D366]/20 transition-all duration-300 hover:scale-110 group cursor-pointer border border-[#25D366]/40"
          aria-label="Falar no WhatsApp"
        >
          {/* Pulsing ring indicator */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-30 animate-pulse group-hover:scale-110 transition-all" />
          <span className="absolute -inset-3 rounded-full bg-[#C5B485] opacity-10 animate-ping pointer-events-none" />

          {/* Icon */}
          <MessageCircle size={25} className="fill-white text-[#25D366] relative z-10 transition-transform duration-500 group-hover:rotate-12" />
          
          {/* Slide-out tooltip to the LEFT */}
          <span className="absolute right-16 bg-stone-900/95 dark:bg-[#0A0A0A]/95 text-[#F5F5F0] border border-[#C5B485]/30 text-[10px] uppercase tracking-widest font-extrabold px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 whitespace-nowrap shadow-xl pointer-events-none select-none flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#25D366] rounded-full animate-ping" />
            Fale com a Doutora
          </span>
        </a>
      </div>

      {/* ==================== GLOBAL PREMIUM MENU ==================== */}
      <nav 
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${isScrolled ? 'glass-header py-2' : 'bg-transparent py-5'}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          
          {/* Logo Name */}
          <div 
            onClick={() => handleTabChange('home')}
            className="flex items-center cursor-pointer group"
          >
            <EliteLogo />
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {[
              { id: 'home', label: 'Início' },
              { id: 'about', label: 'A Médica' },
              { id: 'booking', label: 'Pacientes' },
              { id: 'lawyers', label: 'Advogados' }
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as any)}
                  className={`text-[11px] font-semibold uppercase tracking-[0.1em] transition-all relative py-1 ${
                    isSelected 
                      ? 'text-stone-900 dark:text-stone-100' 
                      : 'text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
                  }`}
                >
                  <span className="relative z-10">{tab.label}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C5B485]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Login / Auth Control Panel & Dark Mode Toggle */}
          <div className="hidden md:flex items-center gap-4">
            {/* Quick Dark Mode Toggle (Desktop) */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-all cursor-pointer active:scale-95"
              title={isDark ? "Modo Claro" : "Modo Escuro"}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {authLoading ? (
              <span className="text-[10px] uppercase tracking-widest text-[#C5B485] font-semibold">...</span>
            ) : !user ? (
              <button
                onClick={handleSignIn}
                className="px-5 py-2.5 bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-950 border-0 text-xs font-semibold uppercase tracking-widest transition-all hover:bg-stone-800 dark:hover:bg-stone-200 cursor-pointer"
              >
                Área Restrita
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right shrink-0">
                  <span className="text-xs font-serif font-semibold text-stone-900 dark:text-stone-100 block">{user.displayName}</span>
                  <span className="text-[9px] uppercase tracking-wider text-[#A1B886] font-semibold block">Conectado</span>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="h-8 w-8 rounded-full border border-stone-200 dark:border-stone-800 shrink-0" referrerPolicy="no-referrer" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-[#C5B485] text-white flex items-center justify-center font-bold text-xs shrink-0 uppercase">
                    {user.email[0]}
                  </div>
                )}
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white shrink-0 transition-all cursor-pointer"
                  title="Sair"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 text-stone-500 dark:text-stone-400 transition-all"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-900 dark:text-stone-100 transition-all"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white dark:bg-[#0A0A0A] border-b border-stone-100 dark:border-stone-900 overflow-hidden flex flex-col px-6 pb-6"
            >
              <div className="flex flex-col space-y-4 pt-4">
                {[
                  { id: 'home', label: 'Início' },
                  { id: 'about', label: 'A Médica' },
                  { id: 'booking', label: 'Agendar Consulta' },
                  { id: 'lawyers', label: 'Solicitar Laudo' },
                  { id: 'simulator', label: 'Ferramentas' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as any)}
                    className={`text-left text-sm font-semibold uppercase tracking-widest transition-all ${
                      activeTab === tab.id 
                        ? 'text-[#C5B485]' 
                        : 'text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="pt-6 mt-6 border-t border-stone-100 dark:border-stone-900">
                {!user ? (
                  <button
                    onClick={handleSignIn}
                    className="w-full py-3 bg-stone-950 dark:bg-stone-50 text-white dark:text-stone-950 font-semibold text-xs uppercase tracking-widest cursor-pointer"
                  >
                    Área Restrita
                  </button>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-serif font-semibold text-stone-900 dark:text-stone-100 block">{user.displayName}</span>
                      <span className="text-[10px] text-stone-400 uppercase tracking-widest block">{user.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="p-2 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white cursor-pointer"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ==================== CONTENT PORTAL (PAGINATED VIEW) ==================== */}
      <div className="flex flex-col min-h-[60vh] pt-24">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={animationVariants}
            >
              {/* HOMEPAGE - PORTFOLIO VIEW */}
              <section
                id="home"
                className="space-y-20 max-w-7xl mx-auto px-6 pb-12"
              >
            {/* Elegant Cinematic Hero */}
            <header className="relative py-8 md:py-16 flex flex-col md:flex-row gap-12 items-center justify-between">
              <div className="space-y-8 md:w-1/2 relative z-10">
                <div className="space-y-4">
                  <h1 className="font-serif text-5xl md:text-7xl font-normal text-stone-950 dark:text-stone-50 leading-[1.1]">
                    Elegância <br/>
                    <span className="italic text-[#C5B485]">Clínica & Pericial.</span>
                  </h1>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed max-w-sm text-base">
                    Acolhimento humano para pacientes. Rigor científico exigido pelos tribunais para bancas jurídicas.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <button
                    onClick={() => handleTabChange('booking')}
                    className="px-8 py-4 bg-stone-950 dark:bg-stone-50 hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-stone-950 text-xs font-semibold uppercase tracking-[0.15em] transition-all cursor-pointer text-center"
                  >
                    Marcar Consulta
                  </button>
                  <button
                    onClick={() => handleTabChange('lawyers')}
                    className="px-8 py-4 border border-stone-200 dark:border-stone-800 hover:border-[#C5B485] dark:hover:border-[#C5B485] text-stone-900 dark:text-stone-100 text-xs font-semibold uppercase tracking-[0.15em] transition-all cursor-pointer text-center"
                  >
                    Solicitar Laudo
                  </button>
                </div>
              </div>

              {/* Elegant Graphic Illustration / Avatar Placeholder */}
              <div className="md:w-1/2 flex justify-end relative w-full">
                <div className="relative h-[32rem] w-full md:w-[28rem] overflow-hidden group">
                  <img src="/src/assets/images/minimalist_clinic_office_1782157322056.jpg" alt="Estrutura Clínica e Pericial" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105" />
                </div>
              </div>
            </header>

            {user && (
              <section className="space-y-6 mt-12 bg-white dark:bg-stone-900/40 p-6 md:p-8 rounded-3xl border border-stone-200/80 dark:border-stone-855 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-150 dark:border-stone-800 pb-5">
                  <div>
                    <h3 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-105">Portal do Correntista Paciente</h3>
                    <p className="text-stone-400 text-xs mt-1">Configure suas preferências e sincronize as agendas médicas periciais.</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-950 p-1 rounded-2xl border border-stone-200/40 dark:border-stone-800/60 w-fit">
                    <button 
                      onClick={() => setPortalView('dashboard')} 
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        portalView === 'dashboard' 
                          ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' 
                          : 'text-stone-500 hover:text-stone-910 dark:text-stone-405'
                      }`}
                    >
                      Resumo da Conta
                    </button>
                    <button 
                      onClick={() => setPortalView('profile')} 
                      className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                        portalView === 'profile' 
                          ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' 
                          : 'text-stone-500 hover:text-stone-910 dark:text-stone-405'
                      }`}
                    >
                      Preferenciais & Perfil
                    </button>
                  </div>
                </div>

                {portalView === 'dashboard' ? (
                  <PatientPortalOnHome user={user} accessToken={accessToken} onNavigate={handleTabChange} />
                ) : (
                  <UserProfileSettings user={user} />
                )}
              </section>
            )}

            {/* Eixos de Atuação Section */}
            <section className="space-y-12">
               <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-2xl mx-auto space-y-2"
              >
                <span className="text-[10px] uppercase font-mono tracking-widest bg-[#B5A475]/10 dark:bg-stone-900 border border-[#B5A475]/20 text-[#B5A475] px-3 py-1 rounded-full font-semibold">
                  Especialidades e Consultoria
                </span>
                <h3 className="font-serif text-3xl md:text-4xl text-stone-900 dark:text-stone-100 font-medium">Atendimento Especializado</h3>
                <p className="text-stone-500 dark:text-stone-400 text-xs">Clareza e direcionamento para pacientes e escritórios advocatícios.</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Pacientes / Longevidade */}
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-3xl p-8 space-y-5 hover:shadow-xl transition-all group shadow-sm flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#B5A475]/10 to-transparent pointer-events-none" />
                  <div className="inline-flex p-3 rounded-xl bg-stone-100 dark:bg-stone-950 text-[#B5A475] w-fit border border-stone-200/50 dark:border-stone-850">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#B5A475] font-extrabold mb-1 block font-mono">Para Pacientes</span>
                    <h4 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#B5A475] transition-colors">Longevidade e Vitalidade</h4>
                  </div>
                  <p className="text-stone-500 dark:text-stone-400 text-xs leading-relaxed font-sans flex-grow">
                    Acompanhamento focado em medicina de estilo de vida, longevidade mitocondrial e prevenção ativa. Abordagem empática, elegante e personalizada para maximizar sua performance biológica e anos de vida saudáveis.
                  </p>
                  <ul className="space-y-2 text-[11px] text-stone-605 dark:text-stone-300 font-semibold border-t border-stone-100 dark:border-stone-800 pt-4">
                    <li className="flex items-center gap-2"><Check size={12} className="text-[#B5A475] shrink-0" /> Planejamento de Longevidade Celular</li>
                    <li className="flex items-center gap-2"><Check size={12} className="text-[#B5A475] shrink-0" /> Gestão Nutracêutica & Estilo de Vida</li>
                    <li className="flex items-center gap-2"><Check size={12} className="text-[#B5A475] shrink-0" /> Protocolos Preventivos de Envelhecimento</li>
                  </ul>
                  <button
                    onClick={() => handleTabChange('booking')}
                    className="w-full py-3 mt-4 bg-[#B5A475]/10 dark:bg-[#B5A475]/5 text-[#B5A475] border border-[#B5A475]/20 hover:bg-[#B5A475] hover:text-[#0c0a09] dark:hover:text-[#0c0a09] rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer font-sans"
                  >
                    Agendar Longevidade
                  </button>
                </motion.div>

                {/* Advogados - Benefícios INSS Previdenciários */}
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-3xl p-8 space-y-5 hover:shadow-xl transition-all group shadow-sm flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#B5A475]/10 to-transparent pointer-events-none" />
                  <div className="inline-flex p-3 rounded-xl bg-stone-100 dark:bg-stone-950 text-[#B5A475] w-fit border border-stone-200/50 dark:border-stone-850">
                    <Scale size={20} />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#B5A475] font-extrabold mb-1 block font-mono">Para Bancas de Advocacia</span>
                    <h4 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#B5A475] transition-colors">Laudos de Alto Valor</h4>
                  </div>
                  <p className="text-stone-550 dark:text-stone-400 text-xs leading-relaxed font-sans flex-grow">
                    Pareceres e documentos médicos periciais de alto valor científico. Conexão rigorosa para aumentar drasticamente as chances de concessão e restabelecimento de benefícios previdenciários e assistenciais (INSS, incapacidades).
                  </p>
                  <ul className="space-y-2 text-[11px] text-stone-650 dark:text-stone-300 font-semibold border-t border-stone-100 dark:border-stone-800 pt-4">
                    <li className="flex items-center gap-2"><Check size={12} className="text-[#B5A475] shrink-0" /> Quesitação Científica para Benefícios INSS</li>
                    <li className="flex items-center gap-2"><Check size={12} className="text-[#B5A475] shrink-0" /> Impugnação de Laudos Administrativos</li>
                    <li className="flex items-center gap-2"><Check size={12} className="text-[#B5A475] shrink-0" /> Parecer de Nexo Causal e Funcionalidade</li>
                  </ul>
                  <button
                    onClick={() => handleTabChange('simulator')}
                    className="w-full py-3 mt-4 bg-[#B5A475]/10 dark:bg-[#B5A475]/5 text-[#B5A475] border border-[#B5A475]/20 hover:bg-[#B5A475] hover:text-[#0c0a09] dark:hover:text-[#0c0a09] rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer font-sans"
                  >
                    Espaço Pericial
                  </button>
                </motion.div>

                {/* Advogados - Comprovação IRPF Isenções */}
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 rounded-3xl p-8 space-y-5 hover:shadow-xl transition-all group shadow-sm flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#B5A475]/10 to-transparent pointer-events-none" />
                  <div className="inline-flex p-3 rounded-xl bg-stone-100 dark:bg-stone-950 text-[#B5A475] w-fit border border-stone-200/50 dark:border-stone-850">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-widest text-[#B5A475] font-extrabold mb-1 block font-mono">Para Bancas de Advocacia</span>
                    <h4 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100 group-hover:text-[#B5A475] transition-colors">Isenção Fiscal de IRPF</h4>
                  </div>
                  <p className="text-stone-550 dark:text-stone-400 text-xs leading-relaxed font-sans flex-grow">
                    Laudos periciais e análises documentais médicos profundas para comprovação cabal de moléstias graves em sede administrativa ou judicial, fundamentando pedidos de isenção de IRPF aos contribuintes.
                  </p>
                  <ul className="space-y-2 text-[11px] text-stone-650 dark:text-stone-300 font-semibold border-t border-stone-100 dark:border-stone-800 pt-4">
                    <li className="flex items-center gap-2"><Check size={12} className="text-[#B5A475] shrink-0" /> Comprovação de Moléstias Graves</li>
                    <li className="flex items-center gap-2"><Check size={12} className="text-[#B5A475] shrink-0" /> Históricos Médicos Retrospectivos Irrefutáveis</li>
                    <li className="flex items-center gap-2"><Check size={12} className="text-[#B5A475] shrink-0" /> Embasamento Técnico p/ Isenção de IRPF</li>
                  </ul>
                  <button
                    onClick={() => handleTabChange('simulator')}
                    className="w-full py-3 mt-4 bg-[#B5A475]/10 dark:bg-[#B5A475]/5 text-[#B5A475] border border-[#B5A475]/20 hover:bg-[#B5A475] hover:text-[#0c0a09] dark:hover:text-[#0c0a09] rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer font-sans"
                  >
                    Análise Documental
                  </button>
                </motion.div>

              </div>
            </section>

            {/* Bento Grid Features */}
            <section className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-2xl mx-auto space-y-2"
              >
                <span className="text-[10px] uppercase font-mono tracking-widest bg-[#B5A475]/10 dark:bg-stone-900 border border-[#B5A475]/20 text-[#B5A475] px-3 py-1 rounded-full font-semibold">
                  Elegância & Praticidade Digital
                </span>
                <h3 className="font-serif text-3xl md:text-4xl text-stone-900 dark:text-stone-105 font-medium">Estrutura de Apoio</h3>
                <p className="text-stone-550 dark:text-stone-400 text-xs">Conveniência e segurança em todo o ciclo de contato com a Dra. Joyce.</p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card 1: Calendario */}
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 flex flex-col justify-between h-72 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider text-[#B5A475] font-semibold">Paciente</span>
                    <h5 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-101">Agendamento Simples</h5>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-sans leading-normal">
                      Organize sua consulta médica pelo nosso calendário. Integrado ao seu ecossistema sem burocracias.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleTabChange('booking')}
                    className="text-xs text-[#B5A475] hover:text-[#C5B485] font-medium flex items-center gap-1.5 hover:underline text-left mt-4 cursor-pointer"
                  >
                    Acessar Calendário <ChevronRight size={14} />
                  </button>
                </motion.div>

                {/* Card 2: Armario Drive */}
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 1.0, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 flex flex-col justify-between h-72 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider text-[#B5A475] font-semibold">Documentação</span>
                    <h5 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-101">Armário de Exames</h5>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-sans leading-normal">
                      Centralize laudos, pedidos e exames laboratoriais na sua área do cliente de forma confidencial.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleTabChange('cabinet')}
                    className="text-xs text-[#B5A475] hover:text-[#C5B485] font-medium flex items-center gap-1.5 hover:underline text-left mt-4 cursor-pointer"
                  >
                    Acessar Dossiê <ChevronRight size={14} />
                  </button>
                </motion.div>

                {/* Card 3: Segurança */}
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 1.0, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-stone-50/50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 flex flex-col justify-between h-72 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider text-stone-500 font-semibold">Forense</span>
                    <h5 className="font-serif text-xl font-medium text-stone-900 dark:text-stone-101">Simulador de Danos</h5>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-sans leading-normal">
                      Uma ferramenta exclusiva para escritórios advocatícios simularem tabelas de incapacidade baseadas na teoria.
                    </p>
                  </div>
                  <button 
                    onClick={() => handleTabChange('simulator')}
                    className="text-xs text-[#B5A475] dark:text-[#B5A475] hover:text-[#C5B485] font-medium flex items-center gap-1.5 hover:underline text-left mt-4 cursor-pointer"
                  >
                    Acessar Área do Advogado <ChevronRight size={14} />
                  </button>
                </motion.div>

              </div>
            </section>

            {/* ==================== TESTIMONIALS SECTION ==================== */}
            <section className="space-y-12 pt-8 border-t border-stone-200/50">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-center max-w-2xl mx-auto space-y-3"
              >
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-widest bg-[#B5A475]/10 text-[#B5A475] px-3.5 py-1 rounded-full font-black">
                  <Sparkles size={10} /> Depoimentos & Reconhecimento
                </span>
                <h3 className="font-serif text-3xl md:text-4xl text-stone-900 font-bold">Vozes de Confiança</h3>
                <p className="text-stone-500 text-xs">
                  Relatos reais de superação e precisão técnica sob absoluto sigilo e ética profissional.
                </p>
              </motion.div>

              {/* Controls: Filter and Layout View Switcher */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200/50 max-w-5xl mx-auto">
                {/* Categorized Filter Tabs */}
                <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                  <button
                    onClick={() => { setTestimonialFilter('all'); setTestimonialIndex(0); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      testimonialFilter === 'all'
                        ? 'bg-stone-950 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-150 hover:text-stone-900'
                    }`}
                  >
                    Todos ({TESTIMONIALS.length})
                  </button>
                  <button
                    onClick={() => { setTestimonialFilter('juridico'); setTestimonialIndex(0); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      testimonialFilter === 'juridico'
                        ? 'bg-stone-950 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-150 hover:text-stone-900'
                    }`}
                  >
                    Perícia & Justiça ({TESTIMONIALS.filter(t => t.category === 'juridico').length})
                  </button>
                  <button
                    onClick={() => { setTestimonialFilter('clinica'); setTestimonialIndex(0); }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      testimonialFilter === 'clinica'
                        ? 'bg-stone-950 text-white shadow-sm'
                        : 'text-stone-600 hover:bg-stone-150 hover:text-stone-900'
                    }`}
                  >
                    Clínica & Bem-Estar ({TESTIMONIALS.filter(t => t.category === 'clinica').length})
                  </button>
                </div>

                {/* Grid vs Slider View Toggle */}
                <div className="flex gap-1 bg-stone-200/50 p-1 rounded-xl">
                  <button
                    onClick={() => setTestimonialLayout('slider')}
                    title="Visualização em Carrossel"
                    className={`p-2 rounded-lg transition-all cursor-pointer ${
                      testimonialLayout === 'slider'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <SlidersHorizontal size={14} />
                  </button>
                  <button
                    onClick={() => setTestimonialLayout('grid')}
                    title="Visualização em Grade"
                    className={`p-2 rounded-lg transition-all cursor-pointer ${
                      testimonialLayout === 'grid'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <LayoutGrid size={14} />
                  </button>
                </div>
              </div>

              {/* Dynamic Views Pane */}
              {(() => {
                const filtered = TESTIMONIALS.filter(t => 
                  testimonialFilter === 'all' ? true : t.category === testimonialFilter
                );
                const current = filtered[testimonialIndex] || filtered[0] || TESTIMONIALS[0];
                
                return (
                  <div className="max-w-5xl mx-auto min-h-[340px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                      {testimonialLayout === 'slider' ? (
                        /* CAROUSEL / SLIDER VIEW */
                        <motion.div
                          key={`slider-${testimonialFilter}-${testimonialIndex}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="bg-white border border-[#B5A475]/15 rounded-[32px] p-8 md:p-12 shadow-xl hover:shadow-2xl transition-all relative overflow-hidden flex flex-col justify-between"
                        >
                          {/* Decorative elements */}
                          <div className="absolute top-6 right-8 text-stone-100 font-serif text-8xl md:text-9xl pointer-events-none select-none italic font-black text-right opacity-80 leading-none">
                            ”
                          </div>

                          <div className="space-y-6 relative z-10">
                            {/* Rating and category */}
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1 text-[#B5A475]">
                                {Array.from({ length: current.rating }).map((_, i) => (
                                  <Star key={i} size={13} className="fill-[#B5A475]" />
                                ))}
                              </div>
                              <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-stone-100 text-[#B5A475] px-2.5 py-1 rounded-lg flex items-center gap-1 border border-stone-200/50">
                                <Lock size={9} /> {current.badge}
                              </span>
                            </div>

                            {/* Highlight */}
                            <h4 className="font-serif italic text-lg md:text-xl text-[#B5A475] font-semibold leading-relaxed max-w-4xl">
                              "{current.highlight}"
                            </h4>

                            {/* Testimonial body */}
                            <p className="text-stone-600 font-sans text-xs md:text-sm leading-relaxed max-w-4xl">
                              {current.text}
                            </p>
                          </div>

                          {/* Footer Info & Slider Arrows */}
                          <div className="border-t border-stone-100 pt-6 mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
                            <div>
                              <cite className="not-italic text-sm font-bold text-stone-900 block font-sans">
                                {current.author}
                              </cite>
                              <span className="text-xs text-stone-500 font-sans">
                                {current.role}
                              </span>
                            </div>

                            {/* Carousel Arrows */}
                            <div className="flex items-center gap-3">
                              <span className="text-[11px] font-mono text-stone-400">
                                {testimonialIndex + 1} de {filtered.length}
                              </span>
                              
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setTestimonialIndex(prev => prev === 0 ? filtered.length - 1 : prev - 1);
                                  }}
                                  className="p-2.5 rounded-full border border-stone-200 hover:border-stone-400 bg-white text-stone-700 hover:text-stone-900 transition-all shadow-xs cursor-pointer active:scale-95"
                                  title="Anterior"
                                >
                                  <ChevronLeft size={16} />
                                </button>
                                <button
                                  onClick={() => {
                                    setTestimonialIndex(prev => prev === filtered.length - 1 ? 0 : prev + 1);
                                  }}
                                  className="p-2.5 rounded-full border border-stone-200 hover:border-[#B5A475] bg-[#FCFAF6] text-[#B5A475] hover:bg-[#B5A475] hover:text-white transition-all shadow-xs cursor-pointer active:scale-95"
                                  title="Próximo"
                                >
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        /* GRID VIEW */
                        <motion.div
                          key={`grid-${testimonialFilter}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                          {filtered.map((item, idx) => {
                            const isMainFeatured = idx === 0 || idx === 3;
                            return (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className={`rounded-3xl p-6 border flex flex-col justify-between min-h-[300px] hover:scale-[1.01] transition-all duration-300 ${
                                  isMainFeatured
                                    ? 'bg-stone-950 text-white border-stone-800 shadow-lg'
                                    : 'bg-white text-stone-800 border-stone-150 shadow-xs'
                                }`}
                              >
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex gap-0.5">
                                      {Array.from({ length: item.rating }).map((_, i) => (
                                        <Star 
                                          key={i} 
                                          size={11} 
                                          className="fill-[#B5A475] text-[#B5A475]" 
                                        />
                                      ))}
                                    </div>
                                    <span className={`text-[8px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-md flex items-center gap-1 ${
                                      isMainFeatured 
                                        ? 'bg-white/10 text-[#B5A475] border border-white/10' 
                                        : 'bg-stone-100 text-stone-500 border border-stone-250/60'
                                    }`}>
                                      <Lock size={8} /> {item.badge}
                                    </span>
                                  </div>

                                  <p className={`text-xs leading-relaxed font-sans italic ${
                                    isMainFeatured ? 'text-stone-300' : 'text-stone-600'
                                  }`}>
                                    "{item.text}"
                                  </p>
                                </div>

                                <div className={`border-t pt-4 mt-4 ${
                                  isMainFeatured ? 'border-white/10' : 'border-stone-100'
                                }`}>
                                  <cite className="not-italic text-xs font-bold block font-sans">
                                    {item.author}
                                  </cite>
                                  <span className={`text-[10px] block truncate ${
                                    isMainFeatured ? 'text-[#B5A475]' : 'text-stone-500'
                                  }`}>
                                    {item.role}
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })()}

              {/* Verified Badge and Compliance disclaimer */}
              <div className="text-center max-w-xl mx-auto bg-stone-100/50 p-4 rounded-2xl border border-stone-200/40">
                <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-bold text-stone-400">
                  <ShieldCheck size={12} className="text-emerald-500" /> Identidade Protegida via LGPD & Código de Ética do CFM
                </span>
                <p className="text-[9.5px] text-stone-400 mt-1 sm:px-6 leading-normal font-sans">
                  Em estrito cumprimento ao Artigo 75 do Código de Ética Médica e à Lei Geral de Proteção de Dados, as narrativas foram anonimizadas de forma a preservar plenamente o sigilo profissional de pacientes e a discrição processual de contrapartes.
                </p>
              </div>
            </section>
          </section>
        </motion.div>
      )}

          {activeTab === 'booking' && (
            <motion.div
              key="booking"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={animationVariants}
            >
              {/* BOOKING ENGINE VIEW */}
              <section
                id="booking"
                className="max-w-7xl mx-auto px-6 py-12"
              >
                <BookingCalendar 
                  user={user} 
                  accessToken={accessToken} 
                  onLoginNeeded={handleSignIn} 
                />
              </section>
            </motion.div>
          )}

          {activeTab === 'cabinet' && (
            <motion.div
              key="cabinet"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={animationVariants}
            >
              {/* DOCUMENT CABINET (GOOGLE DRIVE) VIEW */}
              <section
                id="cabinet"
                className="max-w-7xl mx-auto px-6 py-12"
              >
                <DriveCabinet 
                  user={user} 
                  accessToken={accessToken} 
                  onLoginNeeded={handleSignIn} 
                />
              </section>
            </motion.div>
          )}

          {activeTab === 'lawyers' && (
            <motion.div
              key="lawyers"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={animationVariants}
            >
              {/* LAWYERS DIRECT CONTACT VIEW */}
              <section
                id="lawyers"
                className="max-w-4xl mx-auto px-6 py-12"
              >
                <div className="text-center space-y-4 mb-10">
                  <span className="text-[10px] bg-[#B5A475]/10 text-[#B5A475] border border-[#B5A475]/20 px-4 py-1.5 rounded-full uppercase tracking-widest font-black inline-flex items-center gap-2">
                    <Scale size={12} /> Exclusivo para Bancas Jurídicas
                  </span>
                  <h2 className="font-serif text-3xl md:text-5xl font-medium text-stone-900 dark:text-stone-100 mt-2">
                    Solicitação de Parecer Pericial
                  </h2>
                  <p className="text-stone-500 dark:text-stone-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                    Precisa de um laudo minucioso ou assistência técnica contundente em processos previdenciários e tributários? Envie os detalhes preliminares do caso para uma análise ágil de viabilidade e agendamento de despacho.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* WhatsApp Quick CTA */}
                  <div className="bg-white dark:bg-stone-900 border border-[#25D366]/30 rounded-3xl p-8 hover:shadow-xl transition-all flex flex-col items-center text-center space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#25D366]/10 to-transparent pointer-events-none" />
                    <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                      <MessageCircle size={32} className="text-[#25D366]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">WhatsApp Direto</h3>
                      <p className="text-stone-500 dark:text-stone-400 text-xs">Resposta mais rápida para alinhamento inicial do caso e documentação.</p>
                    </div>
                    <a
                      href="https://wa.me/5527998134032?text=Olá%20Dra.%20Joyce,%20sou%20advogado%20e%20gostaria%20de%20solicitar%20um%20laudo%20pericial/assistência%20técnica."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto px-8 py-3 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md group-hover:scale-105"
                    >
                      Solicitar via WhatsApp
                    </a>
                  </div>

                  {/* Email CTA */}
                  <div className="bg-white dark:bg-stone-900 border border-[#B5A475]/30 rounded-3xl p-8 hover:shadow-xl transition-all flex flex-col items-center text-center space-y-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#B5A475]/10 to-transparent pointer-events-none" />
                    <div className="w-16 h-16 rounded-full bg-[#B5A475]/10 flex items-center justify-center">
                      <Mail size={32} className="text-[#B5A475]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-100">E-mail Profissional</h3>
                      <p className="text-stone-500 dark:text-stone-400 text-xs">Para o envio inicial de prontuários em PDF, quesitação e históricos longos.</p>
                    </div>
                    <a
                      href="mailto:admin@drajoyceradis.com?subject=Solicitação de Laudo/Assistência Técnica Jurídica"
                      className="mt-auto px-8 py-3 bg-stone-900 dark:bg-[#B5A475] hover:bg-stone-800 dark:hover:bg-[#a99767] text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md group-hover:scale-105"
                    >
                      Enviar E-mail com Anexos
                    </a>
                  </div>
                </div>

              </section>
            </motion.div>
          )}

          {activeTab === 'simulator' && (
            <motion.div
              key="simulator"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={animationVariants}
            >
              {/* INCARSION SIMULATOR VIEW */}
              <section
                id="simulator"
                className="max-w-7xl mx-auto px-6 py-12 space-y-12"
              >
                <ForensicTools />
                <VideoGenerator />
              </section>
            </motion.div>
          )}

          {activeTab === 'connect' && (
            <motion.div
              key="connect"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={animationVariants}
            >
              {/* WORKSPACE HUB VIEW */}
              <section
                id="connect"
                className="max-w-7xl mx-auto px-6 py-12"
              >
                <WorkspaceHub />
              </section>
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div
              key="about"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={animationVariants}
            >
              {/* ABOUT BIOGRAPHY VIEW - ELITE CURRICULUM VITAE */}
              <section
                id="about"
                className="max-w-7xl mx-auto px-6 py-12 md:py-24"
              >
                <div className="flex flex-col lg:flex-row gap-16 items-start">
                  
                  {/* Portrait Column (High-End Editorial Sidebar) */}
                  <div className="w-full lg:w-[35%] lg:sticky lg:top-32 space-y-6">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-stone-200/60 dark:border-stone-850 group bg-stone-100 dark:bg-stone-900">
                      {/* Premium Accent Corner lines reflecting luxury architecture */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#B5A475] z-20 pointer-events-none" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#B5A475] z-20 pointer-events-none" />
                      
                      <div className="aspect-[3/4] overflow-hidden relative">
                        <img 
                          src="/src/assets/images/elegant_medical_pericia_1782157337837.jpg" 
                          alt="Dra. Joyce Radis - Rigor Médico-Pericial" 
                          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-stone-950/20" />
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-8 text-white space-y-2">
                        <span className="text-[9px] uppercase font-mono tracking-[0.24em] text-[#B5A475] font-bold block">
                          CRM/ES 21188 • RQE Pericial
                        </span>
                        <h3 className="font-serif text-3xl font-light tracking-tight text-white leading-tight">
                          Dra. Joyce Radis
                        </h3>
                        <p className="text-[10.5px] text-stone-300 font-sans tracking-wide leading-relaxed">
                          Médica graduada com distinção clínica, especialista dedicada ao auxílio de tribunais de justiça e à promoção ativa da vitalidade celular integral.
                        </p>
                      </div>
                    </div>

                    {/* Quick Professional Credentials Block */}
                    <div className="bg-stone-50/80 dark:bg-[#0c0a09]/80 border border-stone-150 dark:border-stone-850 p-6 rounded-2xl space-y-4">
                      <span className="text-[8.5px] uppercase font-mono tracking-widest text-stone-400 font-extrabold block">REGISTROS E CONSELHOS</span>
                      <div className="space-y-3.5 text-xs text-stone-600 dark:text-stone-350">
                        <div className="flex justify-between items-center border-b border-stone-150 dark:border-stone-800 pb-2">
                          <span className="font-sans font-medium">Inscrição CRM Principal:</span>
                          <span className="font-mono font-bold text-stone-900 dark:text-white">CRM/ES 21188</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-stone-150 dark:border-stone-800 pb-2">
                          <span className="font-sans font-medium">Atuação Forense Federal:</span>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">Credenciada TRF-2</span>
                        </div>
                        <div className="flex justify-between items-center pb-1">
                          <span className="font-sans font-medium">Membro Colegiado Principal:</span>
                          <span className="font-mono font-bold text-[#B5A475]">SBPM Perícias</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comprehensive Curriculum Content (Impeccable & Huge) */}
                  <div className="w-full lg:w-[65%] space-y-16">
                    
                    {/* Header Introduction */}
                    <div className="space-y-4">
                      <span className="text-[10px] bg-[#B5A475]/10 text-[#B5A475] px-3.5 py-1.5 rounded-full uppercase tracking-widest font-black inline-block font-mono border border-[#B5A475]/15">
                        REGISTRO DE QUALIFICAÇÃO E RECONHECIMENTO
                      </span>
                      <h2 className="font-serif text-4xl md:text-5xl font-light text-stone-900 dark:text-stone-100 leading-tight">
                        Currículo Profissional <br/>
                        <span className="italic font-medium text-[#B5A475]">Elegância e Rigor Científico</span>
                      </h2>
                      <p className="text-stone-550 dark:text-stone-400 font-sans text-xs md:text-sm leading-relaxed pt-2">
                        O percurso profissional da Dra. Joyce Radis pauta-se no entrelaçamento de dois campos científicos exigentes: o <b>rigor pericial normativo</b> necessário para garantir a idoneidade técnica em litígios judiciais de alta monta, e a <b>ciência da longevidade celular</b> voltada à promoção ativa da integridade físico-química de seus pacientes particulares.
                      </p>
                    </div>

                    {/* Bento CV Blocks - Large Multi-Section Grid */}
                    <div className="space-y-10">
                      
                      {/* Section 1: Academics (Formação Superior de Base) */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-stone-950 dark:text-stone-50 border-b border-stone-150 dark:border-stone-800 pb-3">
                          <BookOpen className="text-[#B5A475] shrink-0" size={20} />
                          <h3 className="font-serif text-xl font-semibold tracking-tight">Formação Acadêmica de Base & Lato Sensu</h3>
                        </div>
                        
                        <div className="relative border-l border-[#B5A475]/30 pl-6 ml-3 space-y-8">
                          
                          {/* Item 1 */}
                          <div className="relative">
                            <span className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full bg-stone-950 dark:bg-[#B5A475] border-2 border-white dark:border-stone-950 shadow-md" />
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold font-mono text-[#B5A475] uppercase">Graduação em Medicina</span>
                              <h4 className="font-serif text-sm md:text-md text-stone-900 dark:text-stone-100 font-semibold">
                                Escola Superior de Ciências da Santa Casa de Misericórdia de Vitória (EMESCAM)
                              </h4>
                              <p className="text-stone-500 dark:text-stone-405 text-xs font-sans leading-relaxed">
                                Formada em uma das instituições de maior prestígio clínico do país. Residência observacional intensa com ênfase em diagnóstico clínico diferencial complexo, clínica médica geral e semiologia médica avançada.
                              </p>
                            </div>
                          </div>

                          {/* Item 2 */}
                          <div className="relative">
                            <span className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full bg-stone-950 dark:bg-[#B5A475] border-2 border-white dark:border-stone-950 shadow-md" />
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold font-mono text-[#B5A475] uppercase">Pós-Graduação Lato Sensu</span>
                              <h4 className="font-serif text-sm md:text-md text-stone-900 dark:text-stone-100 font-semibold">
                                Perícia Médica & Ciências Forenses de Alta Performance
                              </h4>
                              <p className="text-stone-500 dark:text-stone-405 text-xs font-sans leading-relaxed">
                                Foco direcionado à avaliação cível e trabalhista do dano corporal, computação do nexo epidemiológico e causal em patologias laborais, simulações de invalidez, e aplicação rigorosa das escalas de incapacidade segundo as doutrinas de Balthazard e as diretrizes do CPC (Código de Processo Civil).
                              </p>
                            </div>
                          </div>

                          {/* Item 3 */}
                          <div className="relative">
                            <span className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full bg-stone-950 dark:bg-[#B5A475] border-2 border-white dark:border-stone-950 shadow-md" />
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold font-mono text-[#B5A475] uppercase">Especialização Avançada</span>
                              <h4 className="font-serif text-sm md:text-md text-stone-900 dark:text-stone-100 font-semibold">
                                Medicina de Longevidade Celular e Estilo de Vida Ativo
                              </h4>
                              <p className="text-stone-500 dark:text-stone-405 text-xs font-sans leading-relaxed">
                                Formação específica em biohacking clínico, fisiologia molecular baseada na integridade mitocondrial, equilíbrio hormonal avançado, marcadores inflamatórios crônicos subclínicos e nutracêutica celular preventiva.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Forensic Expertise (A Atuação Pericial Detalhada) */}
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 text-stone-950 dark:text-stone-50 border-b border-stone-150 dark:border-stone-800 pb-3">
                          <Scale className="text-[#B5A475] shrink-0" size={20} />
                          <h3 className="font-serif text-xl font-semibold tracking-tight">Experiência Forense & Consultoria Médico-Legal</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                          
                          <div className="border border-stone-150 dark:border-stone-850 p-5 rounded-2xl bg-white/20 dark:bg-stone-900/10 space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-[#B5A475]/10 flex items-center justify-center text-[#B5A475]">
                              <Award size={16} />
                            </div>
                            <h4 className="font-serif font-bold text-stone-900 dark:text-white text-xs md:text-sm">Auxiliar da Justiça (Justiça Estadual e Federal)</h4>
                            <p className="text-stone-500 dark:text-stone-400 text-xs font-sans leading-relaxed">
                              Nomeada recorrentemente como Perita de Confiança do Juízo em varas previdenciárias e cíveis. Total domínio na redação de laudos periciais criminais e civis conclusivos e incontestáveis.
                            </p>
                          </div>

                          <div className="border border-stone-150 dark:border-stone-850 p-5 rounded-2xl bg-white/20 dark:bg-stone-900/10 space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-[#B5A475]/10 flex items-center justify-center text-[#B5A475]">
                              <Briefcase size={16} />
                            </div>
                            <h4 className="font-serif font-bold text-stone-900 dark:text-white text-xs md:text-sm">Assistência Técnica de Alta Performance</h4>
                            <p className="text-stone-500 dark:text-stone-400 text-xs font-sans leading-relaxed">
                              Elaboração de pareceres técnicos divergentes e formulação de quesitos estratégicos de alta complexidade para escritórios de advocacia que buscam a reforma de decisões desfavoráveis.
                            </p>
                          </div>

                          <div className="border border-stone-150 dark:border-stone-850 p-5 rounded-2xl bg-white/20 dark:bg-stone-900/10 space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-[#B5A475]/10 flex items-center justify-center text-[#B5A475]">
                              <FileText size={16} />
                            </div>
                            <h4 className="font-serif font-bold text-stone-900 dark:text-white text-xs md:text-sm">Nexo de Causalidade Previdenciário (INSS)</h4>
                            <p className="text-stone-500 dark:text-stone-400 text-xs font-sans leading-relaxed">
                              Investigação profunda de histórico ocupacional com a formulação de nexo patológico para reverter indeferimentos administrativos junto à Previdência Social.
                            </p>
                          </div>

                          <div className="border border-stone-150 dark:border-stone-850 p-5 rounded-2xl bg-white/20 dark:bg-stone-900/10 space-y-2">
                            <div className="w-8 h-8 rounded-lg bg-[#B5A475]/10 flex items-center justify-center text-[#B5A475]">
                              <ShieldCheck size={16} />
                            </div>
                            <h4 className="font-serif font-bold text-stone-900 dark:text-white text-xs md:text-sm">Isenção Fiscal de Moléstia Grave (IRPF)</h4>
                            <p className="text-stone-500 dark:text-stone-400 text-xs font-sans leading-relaxed">
                              Análise crítica exaustiva de prontuários históricos em consonância com a Lei 7.713/88 de modo a fundamentar o direito adquirido do contribuinte portador de enfermidade grave.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Longevity Practice (Metodologia de Longevidade Celular) */}
                      <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-3 text-stone-950 dark:text-stone-50 border-b border-stone-150 dark:border-stone-800 pb-3">
                          <Sparkles className="text-[#B5A475] shrink-0" size={20} />
                          <h3 className="font-serif text-xl font-semibold tracking-tight">Otimização Celular & Medicina de Suporte Ativo</h3>
                        </div>
                        
                        <p className="text-stone-500 dark:text-stone-400 text-xs md:text-sm leading-relaxed">
                          Ficou no passado a medicina que limita-se a prescrever fármacos sintomáticos para dismetabolismos estabelecidos. A abordagem integrativa visa a longevidade funcional através do reestabelecimento bioquímico molecular:
                        </p>

                        <div className="space-y-3.5 pt-2">
                          {[
                            { title: "Mapeamento Funcional de Biomarcadores:", text: "Aferição exaustiva de hormônios ativos, estresse oxidativo, inflamação crônica silenciosa e exames bioquímicos especializados que preveem o declínio físico." },
                            { title: "Reprogramação Mitocondrial & Manejo de Fadiga:", text: "Indicação de micronutrientes específicos e mudança direcionada de hábitos circadianos para reestabelecer o vigor celular e a energia mental." },
                            { title: "Prescrição Nutracêutica de Alta Sinergia:", text: "Formulações personalizadas voltadas à modulação epigenética, combatendo ativamente o estresse celular e reforçando a plasticidade neuronal." }
                          ].map((item, index) => (
                            <div key={index} className="flex gap-4 items-start p-4 bg-stone-50 hover:bg-white dark:bg-[#0c0a09]/50 dark:hover:bg-stone-900/30 border border-stone-150 dark:border-stone-850 rounded-xl transition-all">
                              <span className="font-serif text-base font-bold text-[#B5A475] leading-none shrink-0 mt-0.5">0{index+1}</span>
                              <div className="space-y-0.5 text-xs">
                                <span className="font-serif font-bold text-stone-900 dark:text-white block">{item.title}</span>
                                <span className="text-stone-500 dark:text-stone-400 leading-relaxed block">{item.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* Exquisite Quote block (Inspirational) */}
                    <div className="p-8 bg-stone-50 dark:bg-stone-950 border border-stone-150 dark:border-stone-850 rounded-3xl border-l-[6px] border-l-[#B5A475] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5 text-stone-500 pointer-events-none">
                        <Quote size={80} />
                      </div>
                      <p className="font-serif italic text-stone-800 dark:text-stone-200 leading-relaxed md:text-lg relative z-10">
                        \"A medicina pericial é a tradução fiel da verdade biológica para a letra fria da lei; enquanto a medicina integrativa celular é a busca pela verdade interna para prolongar a vida com vigor. Ambos exigem a mesma virtude: rigor técnico absoluto e respeito soberano à vida.\"
                      </p>
                    </div>

                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FAQAccordion />

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-stone-100 border-t border-stone-200/50 py-12 px-6 mt-0 text-xs text-stone-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="font-serif text-sm font-black text-stone-850 block">DRA. JOYCE RADIS</span>
            <p className="text-[10px] text-stone-400">Copyright © 2026. Todos os direitos reservados. Perícias Médicas & Longevidade.</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-[10px] uppercase font-black tracking-widest text-[#B5A475] items-center">
            <span className="hover:text-stone-800 cursor-pointer" onClick={() => handleTabChange('home')}>Início</span>
            <span className="hover:text-stone-800 cursor-pointer" onClick={() => handleTabChange('about')}>A Dra. Joyce</span>
            <span className="hover:text-stone-800 cursor-pointer" onClick={() => handleTabChange('booking')}>Pacientes (Agendar)</span>
            <span className="hover:text-stone-800 cursor-pointer" onClick={() => handleTabChange('lawyers')}>Advogados (Solicitar)</span>
            <span className="hover:text-stone-800 cursor-pointer" onClick={() => handleTabChange('cabinet')}>Área do Cliente</span>
            <a href="https://www.linkedin.com/in/joyceradis" target="_blank" rel="noopener noreferrer" className="hover:text-stone-800 flex items-center gap-1">
              <Linkedin size={11} className="shrink-0" /> LinkedIn
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
