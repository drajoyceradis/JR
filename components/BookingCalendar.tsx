import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Sparkles, Check, ChevronRight, RefreshCw, CalendarDays, Stethoscope, Scale, Briefcase } from 'lucide-react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, getAccessToken, auth, googleSignIn } from '../firebase';
import { Appointment } from '../types';
import { showToast } from './Toast';

interface BookingCalendarProps {
  user: any;
  accessToken: string | null;
  onLoginNeeded: () => void;
}

const SERVICE_TYPES = [
  { id: 'LongevityCell', label: 'Avaliação de Longevidade Celular', duration: '75 min', price: 'R$ 650', desc: 'Mapeamento detalhado e planejamento funcional de biomarcadores focado em maximizar o tempo de vida saudável (Healthspan).' },
  { id: 'MitoxOptimize', label: 'Consultoria de Estilo de Vida Ativo', duration: '60 min', price: 'R$ 500', desc: 'Otimização com foco em biohacking preventivo, saúde mitocondrial, manejo de fadiga e reprogramação de hábitos.' },
  { id: 'ForensicRegular', label: 'Laudo Pericial de Alto Valor (INSS)', duration: '90 min', price: 'Sob Consulta', desc: 'Análise detalhada, formulação científica de quesitos para incapacidade para buscar a concessão de benefícios previdenciaristas.' },
  { id: 'IrpfVerify', label: 'Análise Documental para Isenção IRPF', duration: '60 min', price: 'R$ 750', desc: 'Investigação clínica histórica e confecção de parecer irrefutável para subsidiar pedidos de isenção fiscal por moléstias graves.' }
];

const renderServiceIcon = (id: string) => {
  switch (id) {
    case 'LongevityCell':
      return <Sparkles className="text-[#B5A475]" size={22} />;
    case 'MitoxOptimize':
      return <Stethoscope className="text-[#B5A475]" size={22} />;
    case 'ForensicRegular':
      return <Scale className="text-[#B5A475]" size={22} />;
    case 'IrpfVerify':
      return <Briefcase className="text-[#B5A475]" size={22} />;
    default:
      return <Sparkles className="text-[#B5A475]" size={22} />;
  }
};

const AVAILABLE_HOURS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

export const BookingCalendar: React.FC<BookingCalendarProps> = ({ user, accessToken, onLoginNeeded }) => {
  const [selectedType, setSelectedType] = useState<any>(SERVICE_TYPES[0]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [patientName, setPatientName] = useState<string>('');
  const [patientEmail, setPatientEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [userBookings, setUserBookings] = useState<Appointment[]>([]);
  const [fetchingBookings, setFetchingBookings] = useState<boolean>(false);

  // Initialize patient details if user is logged in
  useEffect(() => {
    if (user) {
      setPatientName(user.displayName || '');
      setPatientEmail(user.email || '');
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    if (!user) return;
    setFetchingBookings(true);
    try {
      const q = query(
        collection(db, 'appointments'),
        where('patientEmail', '==', user.email)
      );
      const querySnapshot = await getDocs(q);
      const bookingsList: Appointment[] = [];
      querySnapshot.forEach((doc) => {
        bookingsList.push({ id: doc.id, ...doc.data() } as Appointment);
      });
      setUserBookings(bookingsList.sort((a,b) => b.dateTime.localeCompare(a.dateTime)));
    } catch (err) {
      console.error('Erro ao buscar reservas no banco:', err);
    } finally {
      setFetchingBookings(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !patientName || !patientEmail) {
      showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
      return;
    }

    if (!user) {
      onLoginNeeded();
      return;
    }

    setLoading(true);
    setSuccess(false);
    setFeedbackMsg('');

    try {
      const appointmentDateTime = `${selectedDate}T${selectedTime}:00`;
      
      let googleEventId = '';
      const token = await getAccessToken();

      if (token) {
        // Enforce ISO format with timezone (America/Sao_Paulo is GMT-3)
        const startISO = `${appointmentDateTime}-03:00`;
        // Calculate end date based on duration
        const durationMin = selectedType.id === 'ForensicRegular' ? 90 : selectedType.id === 'LongevityCell' ? 75 : 60;
        const [hour, min] = selectedTime.split(':');
        let endHour = parseInt(hour, 10);
        let endMin = parseInt(min, 10) + durationMin;
        if (endMin >= 60) {
          endHour += Math.floor(endMin / 60);
          endMin = endMin % 60;
        }
        const formattedEndHour = endHour.toString().padStart(2, '0');
        const formattedEndMin = endMin.toString().padStart(2, '0');
        const endISO = `${selectedDate}T${formattedEndHour}:${formattedEndMin}:00-03:00`;

        const calendarEventBody = {
          summary: `Dra. Joyce Radis: Consulta (${selectedType.label})`,
          location: 'Consultório Dra. Joyce Radis / Online',
          description: `Paciente: ${patientName}\nServiço: ${selectedType.label}\nNotas: ${notes || 'Sem observações'}\nConfirmado via Plataforma Premium de Perícia & Medicina.`,
          start: {
            dateTime: startISO,
            timeZone: 'America/Sao_Paulo'
          },
          end: {
            dateTime: endISO,
            timeZone: 'America/Sao_Paulo'
          },
          reminders: {
            useDefault: true
          }
        };

        // Real Google Calendar API call
        const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(calendarEventBody)
        });

        if (response.ok) {
          const createdEvent = await response.json();
          googleEventId = createdEvent.id;
          setFeedbackMsg('Agendado com sucesso e integrado à sua Agenda do Google!');
        } else {
          console.warn('Falha ao gravar no Google Calendar. Gravando apenas no Firestore local.');
          setFeedbackMsg('Agendado com sucesso! (Não foi possível sincronizar no Google Calendar secundário)');
        }
      } else {
        setFeedbackMsg('Agendamento realizado internamente. Faça o login com o Google para desfrutar do sincronismo completo no Calendar.');
      }

      // Write reservation into Firestore
      const appointmentDoc: Appointment = {
        title: `Consulta: ${selectedType.label}`,
        dateTime: appointmentDateTime,
        patientName,
        patientEmail,
        type: selectedType.id,
        status: 'confirmed',
        notes,
        googleEventId
      };

      await addDoc(collection(db, 'appointments'), appointmentDoc);

      showToast('Agendamento Realizado com Sucesso!', 'success');
      setSuccess(true);
      fetchUserBookings();
      // Clear inputs
      setSelectedDate('');
      setSelectedTime('');
      setNotes('');
    } catch (error: any) {
      console.error('Erro ao agendar consulta:', error);
      showToast('Houve um erro técnico ao realizar o agendamento: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Get current date string for min date (disable past dates)
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      {/* Services and Booking Form */}
      <div className="lg:col-span-8 bg-white border border-stone-150 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-[#B5A475]">Agendamento Presencial ou Telemedicina</span>
          <h3 className="font-serif text-2xl md:text-3xl text-stone-900 font-bold mt-1">Conecte-se Clinicamente</h3>
          <p className="text-stone-500 text-xs mt-1">
            Escolha o modelo de serviço adequado. Seus agendamentos serão sincronizados diretamente na conta do Google.
          </p>
        </div>

        {/* Services Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICE_TYPES.map((service) => {
            const isSelected = selectedType.id === service.id;
            return (
              <button
                key={service.id}
                type="button"
                onClick={() => setSelectedType(service)}
                className={`text-left p-4 rounded-2xl border transition-all relative ${
                  isSelected 
                    ? 'border-[#B5A475] bg-[#FDFBF7] shadow-sm' 
                    : 'border-stone-100 hover:border-stone-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  {renderServiceIcon(service.id)}
                  <span className="text-[10px] font-mono uppercase bg-stone-100 px-2 py-0.5 rounded-full text-stone-600 font-bold">
                    {service.duration}
                  </span>
                </div>
                <h4 className="font-serif text-sm font-bold text-stone-800 mt-3">{service.label}</h4>
                <p className="text-xs text-stone-400 font-sans mt-1 leading-relaxed mb-4">{service.desc}</p>
                <div className="text-xs font-bold text-[#B5A475] absolute bottom-4">
                  {service.price}
                </div>
                
                {isSelected && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[#B5A475] text-white flex items-center justify-center">
                    <Check size={11} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Selection Details */}
        <form onSubmit={handleBooking} className="mt-8 space-y-4">
          <div className="p-4 bg-stone-50/50 rounded-2xl border border-stone-100 flex flex-wrap gap-4 items-center justify-between">
            <span className="text-xs font-semibold text-stone-600">Serviço Escolhido:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-serif font-black text-stone-800">{selectedType.label}</span>
              <span className="text-xs font-extrabold text-[#B5A475] bg-[#FDFBF7] border border-[#B5A475]/25 px-2 py-0.5 rounded">
                {selectedType.price}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-600 block">Selecione o Dia *</label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B5A475] shadow-inner"
                />
              </div>
            </div>

            {/* Time Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-600 block">Horário Disponível *</label>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_HOURS.map((hr) => {
                  const isSelected = selectedTime === hr;
                  return (
                    <button
                      type="button"
                      key={hr}
                      onClick={() => setSelectedTime(hr)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        isSelected 
                          ? 'bg-[#B5A475] border-[#B5A475] text-white' 
                          : 'bg-white border-stone-200 hover:border-stone-400 text-stone-600'
                      }`}
                    >
                      {hr}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Patient Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-600 block">Seu Nome Completo *</label>
              <input
                type="text"
                placeholder="Como gostaria de ser chamado"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B5A475] shadow-inner"
              />
            </div>

            {/* Patient Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-600 block">E-mail de Notificação *</label>
              <input
                type="email"
                placeholder="seu.email@exemplo.com"
                required
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B5A475] shadow-inner"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-600 block">Observação (Opcional)</label>
            <textarea
              rows={2}
              placeholder="Queixas principais, número do processo judicial ou qualquer particularidade clínica..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-xl p-4 text-xs font-medium text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#B5A475] shadow-inner"
            />
          </div>

          {!user ? (
            <button
              type="button"
              onClick={onLoginNeeded}
              className="mt-4 w-full py-3.5 bg-stone-900 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
            >
              Autenticar com o Google para Agendar
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || !selectedDate || !selectedTime}
              className={`mt-4 w-full py-3.5 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest rounded-xl transition-all ${
                loading 
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                  : 'bg-stone-950 text-white hover:bg-[#B5A475] hover:shadow-lg'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Sincronizando com a Agenda...
                </>
              ) : (
                'Finalizar Solicitação e Sincronizar'
              )}
            </button>
          )}
        </form>

        {/* Feedback Area */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-800 text-xs font-medium flex items-center gap-3"
            >
              <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check size={12} strokeWidth={3} />
              </div>
              <div className="space-y-0.5">
                <p className="font-extrabold text-emerald-950">Sucesso!</p>
                <p className="text-emerald-700">{feedbackMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bookings Drawer Lists */}
      <div className="lg:col-span-4 bg-stone-950 text-white rounded-3xl p-6 shadow-xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-[#B5A475] text-[10px] font-black uppercase tracking-wider">
            <Sparkles size={11} />
            <span>Consultório Online</span>
          </div>
          <h4 className="font-serif text-lg font-bold text-white mt-1">Minhas Consultas</h4>
          <p className="text-xs text-stone-400 leading-relaxed font-medium mt-1">
            Veja as consultas clínicas e perícias agendadas vinculadas ao seu e-mail.
          </p>
        </div>

        {fetchingBookings ? (
          <div className="py-12 text-center text-xs text-stone-400 font-bold flex flex-col items-center justify-center gap-2">
            <RefreshCw size={18} className="animate-spin text-[#B5A475]" />
            <span>Consultando banco de agendamentos...</span>
          </div>
        ) : !user ? (
          <div className="p-5 border border-dashed border-stone-800 rounded-2xl text-center space-y-3 bg-stone-900/40">
            <CalendarDays size={24} className="mx-auto text-stone-600" />
            <p className="text-xs text-stone-400">Faça login com o Google para visualizar seu histórico de agendamentos.</p>
            <button
              onClick={onLoginNeeded}
              className="py-2.5 px-4 bg-white hover:bg-stone-100 text-stone-950 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors inline-flex"
            >
              Sign In
            </button>
          </div>
        ) : userBookings.length === 0 ? (
          <div className="py-12 border border-dashed border-stone-800 rounded-2xl text-center text-xs text-stone-500 font-bold space-y-2">
            <CalendarDays size={20} className="mx-auto text-stone-600" />
            <p>Nenhuma consulta encontrada.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {userBookings.map((bk) => (
              <div 
                key={bk.id}
                className="bg-stone-900 border border-stone-800 p-4 rounded-xl space-y-2 hover:border-stone-700 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#B5A475] bg-[#B5A475]/5 border border-[#B5A475]/15 px-2 py-0.5 rounded">
                    {bk.type === 'Clinical' ? 'Consulta Clínica' : bk.type === 'Wellness' ? 'Bem-estar' : bk.type === 'ForensicRegular' ? 'Perícia' : 'Advogados'}
                  </span>
                  <span className="text-[9px] uppercase font-mono tracking-widest text-[#0D8B5F] flex items-center gap-1 bg-[#0D8B5F]/10 px-2 py-0.5 rounded font-black">
                    <span className="h-1 text-[#0D8B5F] w-1 bg-green-500 rounded-full animate-ping"></span>
                    Confirmado
                  </span>
                </div>
                
                <h5 className="text-xs font-serif font-bold text-white text-ellipsis overflow-hidden">{bk.title}</h5>

                <div className="flex gap-4 text-[10px] text-stone-400 font-bold pt-1">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon size={12} className="text-[#B5A475]" />
                    <span>{new Date(bk.dateTime).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={12} className="text-[#B5A475]" />
                    <span>{bk.dateTime.split('T')[1]?.substring(0,5) || '09:00'}</span>
                  </div>
                </div>
                
                {bk.googleEventId && (
                  <div className="text-[9px] text-[#B5A475] font-semibold italic flex items-center gap-1 bg-[#B5A475]/5 p-1 rounded border border-dashed border-[#B5A475]/20">
                    <Check size={10} />
                    <span>Sincronizado via Google Calendar</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
