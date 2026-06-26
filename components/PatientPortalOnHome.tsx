import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { FileText, Calendar as CalendarIcon, ExternalLink, RefreshCw, File, ArrowRight, Clock, Search, Sparkles } from 'lucide-react';
import { Appointment } from '../types';

interface PatientPortalProps {
  user: any;
  accessToken: string | null;
  onNavigate: (tab: 'home' | 'booking' | 'cabinet' | 'simulator' | 'about' | 'connect') => void;
}

export const PatientPortalOnHome: React.FC<PatientPortalProps> = ({ user, accessToken, onNavigate }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [now, setNow] = useState(new Date());
  
  // Gemini Search Form states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearchHealth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearchLoading(true);
    setSearchResult('');
    try {
      const res = await fetch('/api/search-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data.error) {
        setSearchResult('Por favor, configure sua KEY no Settings Menu.');
      } else {
        setSearchResult(data.text);
      }
    } catch (err) {
      console.error(err);
      setSearchResult('Ocorreu um erro ao pesquisar.');
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUpcomingAppointments();
      if (accessToken) {
        fetchRecentDriveFiles();
      }
    }
  }, [user, accessToken]);

  const fetchUpcomingAppointments = async () => {
    setLoadingAppts(true);
    try {
      // Get today at midnight ISO
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString().split('T')[0];

      const q = query(
        collection(db, 'appointments'),
        where('patientEmail', '==', user.email)
      );
      const querySnapshot = await getDocs(q);
      const bookingsList: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as Appointment;
        // Basic filtering for future appointments based on date string comparison
        if (data.dateTime >= todayStr) {
          bookingsList.push({ id: doc.id, ...data });
        }
      });
      // Sort oldest first (closest upcoming)
      setAppointments(bookingsList.sort((a,b) => a.dateTime.localeCompare(b.dateTime)).slice(0, 3));
    } catch (err) {
      console.error('Erro ao buscar consultas:', err);
    } finally {
      setLoadingAppts(false);
    }
  };

  const fetchRecentDriveFiles = async () => {
    if (!accessToken) return;
    setLoadingFiles(true);
    try {
      const res = await fetch(
        'https://www.googleapis.com/drive/v3/files?q=trashed=false and ("application/pdf" in mimeType or "application/vnd.google-apps.document" in mimeType or "image/" in mimeType)&orderBy=modifiedTime desc&pageSize=3&fields=files(id,name,mimeType,webViewLink,modifiedTime)',
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
      if (res.ok) {
        const data = await res.json();
        setRecentFiles(data.files || []);
      }
    } catch (err) {
      console.error('Erro ao buscar arquivos:', err);
    } finally {
      setLoadingFiles(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/80 rounded-3xl p-6 md:p-8 shadow-sm mt-12 w-full"
    >
      <div className="flex flex-col md:flex-row gap-8 w-full">
        {/* Appointments Column */}
        <div className="flex-1 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-105 font-serif text-xl font-medium">
            <CalendarIcon size={20} className="text-[#B5A475]" />
            Próximos Agendamentos
          </div>
          {loadingAppts && <RefreshCw size={14} className="animate-spin text-stone-400" />}
        </div>
        
        <div className="space-y-3">
          {appointments.length === 0 && !loadingAppts ? (
            <div className="text-center p-6 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50/50 dark:bg-stone-950/30">
              <p className="text-stone-500 dark:text-stone-400 text-xs">Nenhum agendamento futuro encontrado.</p>
              <button 
                onClick={() => onNavigate('booking')}
                className="mt-3 text-[10px] uppercase font-semibold tracking-widest text-[#B5A475] hover:text-stone-900 dark:hover:text-stone-105 transition-colors"
              >
                Agendar Consulta
              </button>
            </div>
          ) : (
            appointments.map((appt, index) => {
              const dt = new Date(appt.dateTime);
              
              // Countdown logic for the very next appointment
              const isFirst = index === 0;
              const timeDiff = dt.getTime() - now.getTime();
              const isFuture = timeDiff > 0;
              
              const daysDiff = isFuture ? Math.floor(timeDiff / (1000 * 60 * 60 * 24)) : 0;
              const hoursDiff = isFuture ? Math.floor((timeDiff / (1000 * 60 * 60)) % 24) : 0;
              const minsDiff = isFuture ? Math.floor((timeDiff / 1000 / 60) % 65) : 0;
              const secsDiff = isFuture ? Math.floor((timeDiff / 1000) % 65) : 0;

              return (
                <div key={appt.id} className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isFirst ? 'bg-stone-50/50 dark:bg-stone-850/60 border-[#B5A475]/40 shadow-sm' : 'bg-transparent dark:bg-transparent border-stone-150 dark:border-stone-800/80'}`}>
                  <div>
                    <div className="text-[#B5A475] text-[10px] font-semibold uppercase tracking-widest mb-1">
                      {appt.type === 'Clinical' ? 'Clínico' : appt.type === 'ForensicRegular' ? 'Pericial Trabalhista' : appt.type === 'AttorneyAssist' ? 'Assistência Técnica' : appt.type} {isFirst && '- Próxima'}
                    </div>
                    <div className="text-stone-900 dark:text-stone-105 font-medium text-sm">
                      {dt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-stone-550 dark:text-stone-400 text-xs mt-0.5 flex items-center gap-1.5 font-mono">
                      <Clock size={12} /> {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {isFirst && isFuture && (
                       <div className="mt-3 flex items-center gap-2 text-[10px] uppercase font-mono font-semibold tracking-widest">
                         <span className="text-stone-400">Em:</span>
                         <span className="bg-stone-100 text-[#B5A475] dark:bg-stone-950 dark:text-stone-105 px-2 py-1 rounded-md border border-stone-200 dark:border-stone-800/40">
                           {daysDiff}d {hoursDiff.toString().padStart(2, '0')}h {minsDiff.toString().padStart(2, '0')}m {secsDiff.toString().padStart(2, '0')}s
                         </span>
                       </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-stone-100 dark:bg-stone-950 text-[#B5A475] dark:text-stone-105 border border-stone-200 dark:border-stone-800 text-[9px] uppercase tracking-wider font-semibold rounded-md">
                      {appt.status}
                    </span>
                    {appt.googleEventId && (
                      <a href="https://calendar.google.com" target="_blank" rel="noreferrer" title="Ver no Google Calendar" className="p-1 text-stone-400 hover:text-[#B5A475] transition-colors">
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden md:block w-px bg-stone-200 dark:bg-stone-800" />
      <div className="md:hidden h-px bg-stone-200 dark:bg-stone-800 w-full" />

      {/* Docs Column */}
      <div className="flex-1 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 dark:text-stone-105 font-serif text-xl font-medium">
            <FileText size={20} className="text-[#B5A475]" />
            Arquivos Recentes
          </div>
          {loadingFiles && <RefreshCw size={14} className="animate-spin text-stone-400" />}
        </div>

        <div className="space-y-3">
          {!accessToken ? (
            <div className="text-center p-6 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50/50 dark:bg-stone-950/30">
              <p className="text-stone-500 dark:text-stone-400 text-xs">Conecte sua conta do Google para visualizar seus laudos e exames recentes arquivados.</p>
              <button 
                onClick={() => onNavigate('connect')}
                className="mt-3 text-[10px] uppercase font-semibold tracking-widest text-[#B5A475] hover:text-stone-900 dark:hover:text-stone-105 transition-colors"
              >
                Conectar Workspace
              </button>
            </div>
          ) : recentFiles.length === 0 && !loadingFiles ? (
            <div className="text-center p-6 border border-dashed border-stone-200 dark:border-stone-800 rounded-2xl bg-stone-50/50 dark:bg-stone-950/30">
              <p className="text-stone-500 dark:text-stone-400 text-xs">Nenhum documento recente encontrado.</p>
              <button 
                onClick={() => onNavigate('cabinet')}
                className="mt-3 text-[10px] uppercase font-semibold tracking-widest text-[#B5A475] hover:text-stone-900 dark:hover:text-stone-105 transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                Acessar Armário <ArrowRight size={10} />
              </button>
            </div>
          ) : (
            recentFiles.map(file => (
              <a 
                key={file.id} 
                href={file.webViewLink}
                target="_blank"
                rel="noreferrer"
                className="group p-3 rounded-2xl bg-stone-50/50 dark:bg-stone-950/20 border border-stone-200 dark:border-stone-800 flex items-center gap-3 hover:border-[#B5A475] transition-colors"
              >
                <div className="p-2 bg-white dark:bg-stone-800 rounded-xl text-stone-450 dark:text-stone-400 group-hover:text-[#B5A475] shadow-sm transition-colors">
                  <File size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-medium text-stone-800 dark:text-stone-205 truncate group-hover:text-[#B5A475] transition-colors">
                    {file.name}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5 font-mono">
                    Modificado em {new Date(file.modifiedTime).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <ExternalLink size={14} className="text-stone-300 dark:text-stone-700 group-hover:text-[#B5A475] shrink-0" />
              </a>
            ))
          )}
          {recentFiles.length > 0 && (
             <button 
                onClick={() => onNavigate('cabinet')}
                className="w-full mt-2 text-[10px] uppercase font-semibold tracking-widest text-[#B5A475] hover:text-stone-900 dark:hover:text-stone-105 transition-colors flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 dark:bg-stone-850 dark:border-stone-800"
              >
                Ver Armário Completo <ArrowRight size={12} />
              </button>
          )}
        </div>
      </div>
      </div>

      {/* AI Health Search (Full Width below columns) */}
      <div className="w-full mt-6 bg-white dark:bg-stone-950/30 rounded-2xl p-6 border border-stone-200 dark:border-stone-800/80 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-[#B5A475]" />
          <h4 className="font-serif font-medium text-stone-900 dark:text-stone-105">Pesquisa em Saúde Inteligente</h4>
        </div>
        <form onSubmit={handleSearchHealth} className="flex gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex: Quais são os sintomas da síndrome do túnel do carpo?"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/20 dark:bg-stone-900/40 text-sm focus:outline-none focus:ring-1 focus:ring-[#B5A475]/50 dark:text-stone-105 transition-shadow placeholder-stone-405/60"
            />
          </div>
          <button 
            type="submit" 
            disabled={searchLoading}
            className="bg-stone-900 dark:bg-[#B5A475] text-white dark:text-stone-900 px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#B5A475] dark:hover:bg-stone-800 dark:hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
          >
            {searchLoading ? 'Buscando...' : 'Pesquisar'}
          </button>
        </form>
        {searchResult && (
          <div className="mt-4 p-4 bg-stone-50/50 dark:bg-stone-950/40 border border-stone-200 dark:border-stone-800 rounded-xl text-sm text-stone-800 dark:text-stone-205 leading-relaxed max-h-60 overflow-y-auto">
            {searchResult}
          </div>
        )}
      </div>
    </motion.div>
  );
};
