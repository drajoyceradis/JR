import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User as UserIcon, Save, Settings, ShieldAlert, Check, RefreshCw, Smartphone, Mail, Sparkles, Bell } from 'lucide-react';

interface UserProfileSettingsProps {
  user: any;
  onProfileSaved?: () => void;
}

export const UserProfileSettings: React.FC<UserProfileSettingsProps> = ({ user, onProfileSaved }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Profile settings state
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [primaryArea, setPrimaryArea] = useState<'Clinica' | 'Juridico' | 'Ambos'>('Ambos');
  const [preferredContact, setPreferredContact] = useState<'email' | 'whatsapp' | 'phone'>('email');
  const [notifications, setNotifications] = useState<boolean>(true);
  const [medicalConditions, setMedicalConditions] = useState<string>('');

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFullName(data.fullName || user.displayName || '');
        setPhone(data.phone || '');
        setPrimaryArea(data.primaryArea || 'Ambos');
        setPreferredContact(data.preferredContactMethod || 'email');
        setNotifications(data.notificationsEnabled !== false);
        setMedicalConditions(data.medicalHistoryNotes || '');
      } else {
        // Fallback default from auth object
        setFullName(user.displayName || '');
        setPhone('');
        setPrimaryArea('Ambos');
        setPreferredContact('email');
        setNotifications(true);
        setMedicalConditions('');
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setSuccess(false);
    try {
      const docRef = doc(db, 'profiles', user.uid);
      await setDoc(docRef, {
        userId: user.uid,
        email: user.email,
        fullName: fullName || user.displayName || '',
        phone,
        primaryArea,
        preferredContactMethod: preferredContact,
        notificationsEnabled: notifications,
        medicalHistoryNotes: medicalConditions,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSuccess(true);
      if (onProfileSaved) {
        onProfileSaved();
      }
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('Erro ao salvar perfil:', err);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-250 dark:border-stone-850 p-6 md:p-8 space-y-6 shadow-md shadow-stone-100/30 dark:shadow-none max-w-4xl mx-auto">
      
      {/* Settings Title Header */}
      <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#B5A475]/10 text-[#B5A475] rounded-xl shrink-0">
            <Settings size={20} />
          </div>
          <div>
            <h4 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">Preferências do Meu Perfil</h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Sua ficha de acompanhamento médico e regras de privacidade sincronizadas.</p>
          </div>
        </div>
        {loading && <RefreshCw size={14} className="animate-spin text-[#B5A475]" />}
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="animate-spin text-[#B5A475] h-8 w-8" />
          <p className="text-stone-400 dark:text-stone-500 text-xs font-mono uppercase tracking-wider">Carregando dados blindados jurídicos...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">Nome Completo</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex Nome do Paciente ou Titular"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/60 text-sm focus:outline-none focus:ring-1 focus:ring-[#B5A475]/50 dark:text-stone-100 transition-shadow"
              />
            </div>

            {/* Email Address (Disabled) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-[#B5A475] font-mono">E-mail Credenciado (Google)</label>
              <div className="w-full px-4 py-2.5 rounded-xl border border-stone-200/50 dark:border-stone-850 bg-stone-100/50 dark:bg-stone-900/30 text-stone-400 dark:text-stone-500 text-sm flex items-center gap-2 cursor-not-allowed">
                <Mail size={14} />
                <span>{user.email}</span>
              </div>
            </div>

            {/* Personal Phone / Whatsapp */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">Telefone / WhatsApp</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/60 text-sm focus:outline-none focus:ring-1 focus:ring-[#B5A475]/50 dark:text-stone-100 transition-shadow"
              />
            </div>

            {/* Preferred Contact Method */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">Canal Preferencial para Avisos</label>
              <select
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/60 text-sm focus:outline-none focus:ring-1 focus:ring-[#B5A475]/50 dark:text-stone-100 transition-shadow"
              >
                <option value="email">Receber por E-mail</option>
                <option value="whatsapp">Receber por WhatsApp</option>
                <option value="phone">Ligação Direta</option>
              </select>
            </div>

            {/* Primary Area Preference */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">Área de Principal Interesse</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Clinica', 'Juridico', 'Ambos'] as const).map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setPrimaryArea(area)}
                    className={`py-2 px-3 border rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      primaryArea === area
                        ? 'bg-stone-905 dark:bg-[#B5A475] border-transparent text-white dark:text-white'
                        : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-850'
                    }`}
                  >
                    {area === 'Clinica' ? 'Clínica' : area === 'Juridico' ? 'Perícias' : 'Ambos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications enabled toggle */}
            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex items-center justify-between p-3.5 bg-stone-50 drak:bg-stone-950/20 border border-stone-200/80 dark:border-stone-850 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <Bell size={16} className="text-[#B5A475]" />
                  <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Notificações Inteligentes Ativadas</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#B5A475] border-stone-300 dark:border-stone-750 focus:ring-[#B5A475]/50 text-[#B5A475] cursor-pointer"
                />
              </div>
            </div>

            {/* Medical / Legal Notes Summary */}
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">Observações Clínicas ou Requisitos Judiciais</label>
                <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">Histórico sigiloso sob LGPD</span>
              </div>
              <textarea
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="Exemplo de queixas atuais, alergias de base imunorreguladora, ou processos com necessidade pericial de assistência técnica de dano corporal..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/60 text-sm focus:outline-none focus:ring-1 focus:ring-[#B5A475]/50 dark:text-stone-100 transition-shadow resize-none"
              />
            </div>
          </div>

          {/* Secure Medical Warning Box */}
          <div className="p-3.5 bg-stone-100/50 dark:bg-stone-950/50 border border-stone-200/50 dark:border-stone-850/50 rounded-2xl flex items-start gap-3">
            <ShieldAlert size={16} className="text-[#B5A475] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider font-bold text-stone-500 dark:text-stone-400 uppercase">Privacidade e Proteção Forense</span>
              <p className="text-[11px] text-stone-450 dark:text-stone-550 leading-relaxed font-sans mt-0.5">
                Suas informações de preferências estão totalmente blindadas em conformidade com as diretrizes da LGPD, o sigilo profissional estabelecido pelo Conselho Federal de Medicina (CFM), e as disposições do Código de Processo Civil. Nenhuma informação é compartilhada publicamente.
              </p>
            </div>
          </div>

          {/* Bottom controls and submission success status banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-stone-900 border border-[#B5A475]/30 text-white dark:text-[#B5A475] px-4 py-2 rounded-xl text-xs flex items-center gap-2"
                >
                  <Check size={14} className="text-[#B5A475]" />
                  <span>Preferências consolidadas no Banco de Dados Médico seguro!</span>
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={saving}
              className="bg-stone-900 dark:bg-[#B5A475] hover:bg-stone-800 dark:hover:bg-[#C5B485] text-white font-semibold text-xs uppercase tracking-widest px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-stone-200/10 dark:shadow-none hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Salvando no Servidor...</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Gravar Preferências</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
