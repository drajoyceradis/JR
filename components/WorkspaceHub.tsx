import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, Send, ExternalLink, RefreshCw, AlertCircle, FilePlus, Table, PlusSquare } from 'lucide-react';
import { getAccessToken, initAuth, googleSignIn } from '../firebase';
import { PerformanceCharts } from './PerformanceCharts';

export const WorkspaceHub: React.FC = () => {
  const [needsAuth, setNeedsAuth] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = initAuth(
      (user, t) => {
        setNeedsAuth(false);
        setToken(t);
        fetchWorkspaceData(t);
      },
      () => {
        setNeedsAuth(true);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const res = await googleSignIn();
      if (res) {
        setToken(res.accessToken);
        setNeedsAuth(false);
        fetchWorkspaceData(res.accessToken);
      }
    } catch (e) {
      console.error(e);
      setError('Falha ao autenticar.');
      setLoading(false);
    }
  };

  const fetchWorkspaceData = async (t: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Forms from Drive
      const driveRes = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.form" and trashed=false', {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (driveRes.ok) {
        const driveData = await driveRes.json();
        setForms(driveData.files || []);
      }

      // Fetch Sheets from Drive
      const sheetsRes = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.spreadsheet" and trashed=false', {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (sheetsRes.ok) {
        const sheetsData = await sheetsRes.json();
        setSheets(sheetsData.files || []);
      }

      // Fetch Chat Spaces
      const chatRes = await fetch('https://chat.googleapis.com/v1/spaces', {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        setSpaces(chatData.spaces || []);
      }
    } catch (e) {
      console.error(e);
      setError('Erro ao carregar os dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChat = async () => {
    if (!token) return;
    const name = prompt('Nome do novo espaço clínico:');
    if (!name) return;
    try {
      const res = await fetch('https://chat.googleapis.com/v1/spaces', {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ spaceType: 'SPACE', displayName: name })
      });
      if (res.ok) {
        fetchWorkspaceData(token);
      } else {
        alert('Falha ao criar o espaço de Chat.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (needsAuth) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-6 text-center max-w-lg mx-auto">
        <h3 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">Portal Conectado</h3>
        <p className="text-stone-500 dark:text-stone-400 text-sm font-sans">
          Para acessar seus Formulários Clínicos (Google Forms) e Salas Virtuais (Google Chat), faça login com a conta profissional.
        </p>
        <button
          onClick={handleLogin}
          className="px-6 py-3.5 bg-stone-950 dark:bg-[#B5A475] text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md hover:bg-[#B5A475]"
        >
          Autenticar com Google
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-6">
        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono tracking-widest bg-[#B5A475]/10 text-[#B5A475] px-3.5 py-1 rounded-full font-black">
          Ecossistema Integrado
        </span>
        <h3 className="font-serif text-3xl md:text-4xl text-stone-900 dark:text-stone-100 font-bold">Workspace Clínico</h3>
        <p className="text-stone-500 dark:text-stone-400 text-xs">
          Acesso unificado aos protocolos de triagem e salas de resolução judiciária e médica.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <RefreshCw className="animate-spin text-[#B5A475]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* FORMS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200 dark:border-stone-800 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="font-serif text-xl font-bold dark:text-stone-100">Protocolos (Forms)</h4>
                <p className="text-[10px] uppercase font-mono text-stone-400 font-bold tracking-wider">Questionários de Saúde</p>
              </div>
            </div>

            {error && <p className="text-xs text-red-500"><AlertCircle size={12} className="inline mr-1"/> {error}</p>}

            <div className="space-y-3">
              {forms.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6 bg-stone-50 dark:bg-stone-950 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">Nenhum formulário localizado.</p>
              ) : (
                forms.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-150 dark:border-stone-850 hover:border-[#B5A475] transition-colors">
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate max-w-[200px]">{f.name}</span>
                    <a 
                      href={`https://docs.google.com/forms/d/${f.id}/edit`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-[#B5A475] hover:underline flex items-center gap-1 font-bold"
                    >
                      Acessar <ExternalLink size={12} />
                    </a>
                  </div>
                ))
              )}
            </div>
            
            <a 
              href="https://forms.new" 
              target="_blank" 
              rel="noreferrer"
              className="mt-6 w-full py-3 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-stone-200 dark:hover:bg-stone-700"
            >
              <FilePlus size={14} /> Novo Formulário
            </a>
          </motion.div>

          {/* SHEETS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200 dark:border-stone-800 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                <Table size={24} />
              </div>
              <div>
                <h4 className="font-serif text-xl font-bold dark:text-stone-100">Planilhas (Sheets)</h4>
                <p className="text-[10px] uppercase font-mono text-stone-400 font-bold tracking-wider">Controle Operacional</p>
              </div>
            </div>

            <div className="space-y-3">
              {sheets.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6 bg-stone-50 dark:bg-stone-950 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">Nenhuma planilha localizada.</p>
              ) : (
                sheets.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-150 dark:border-stone-850 hover:border-[#B5A475] transition-colors">
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate max-w-[200px]">{s.name}</span>
                    <a 
                      href={`https://docs.google.com/spreadsheets/d/${s.id}/edit`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-[#B5A475] hover:underline flex items-center gap-1 font-bold"
                    >
                      Abrir <ExternalLink size={12} />
                    </a>
                  </div>
                ))
              )}
            </div>

            <a 
              href="https://sheets.new" 
              target="_blank" 
              rel="noreferrer"
              className="mt-6 w-full py-3 bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-stone-200 dark:hover:bg-stone-700"
            >
              <PlusSquare size={14} /> Nova Planilha
            </a>
          </motion.div>

          {/* CHAT */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-stone-900 rounded-3xl p-8 border border-stone-200 dark:border-stone-800 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl">
                <MessageSquare size={24} />
              </div>
              <div>
                <h4 className="font-serif text-xl font-bold dark:text-stone-100">Salas de Chat</h4>
                <p className="text-[10px] uppercase font-mono text-stone-400 font-bold tracking-wider">Comunicação Judicial e Clínica</p>
              </div>
            </div>

            <div className="space-y-3">
              {spaces.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-6 bg-stone-50 dark:bg-stone-950 rounded-xl border border-dashed border-stone-200 dark:border-stone-800">Nenhum espaço localizado.</p>
              ) : (
                spaces.map(s => (
                  <div key={s.name} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-950 rounded-xl border border-stone-150 dark:border-stone-850 hover:border-[#B5A475] transition-colors">
                    <span className="text-sm font-medium text-stone-700 dark:text-stone-300 truncate max-w-[200px]">{s.displayName || 'Sala sem nome'}</span>
                    <a 
                      href="https://chat.google.com" 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs text-[#B5A475] hover:underline flex items-center gap-1 font-bold"
                    >
                      Abrir <ExternalLink size={12} />
                    </a>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={handleCreateChat}
              className="mt-6 w-full py-3 bg-stone-950 dark:bg-stone-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-stone-800 dark:hover:bg-stone-700 cursor-pointer"
            >
              <Send size={14} /> Novo Espaço de Chat
            </button>
          </motion.div>

        </div>
      )}

      {/* SEÇÃO DE MÉTRICAS E INDICADORES (RECHARTS) */}
      <PerformanceCharts />
    </div>
  );
};
