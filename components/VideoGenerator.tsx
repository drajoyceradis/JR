import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Video, ImagePlus, Loader2, Sparkles, Check, AlertTriangle } from 'lucide-react';
import { showToast } from './Toast';

export const VideoGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('Cinematic, natural, and captivating view of a high-end medical clinic interior in Enseada do Suá, Vitória/ES. Large panoramic windows revealing a stunning real-life view of the Terceira Ponte bridge and Vila Velha in the background. Soft natural sunlight, elegant white marble, and a calm, professional atmosphere. Slow, smooth panning shot.');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoStatus, setVideoStatus] = useState<'idle' | 'generating' | 'polling' | 'ready' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Strip the data:image/png;base64, part
        const base64String = result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const pollVideoStatus = async (operationName: string) => {
    try {
      setVideoStatus('polling');
      let isDone = false;
      
      while (!isDone) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
        
        const response = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName })
        });
        
        if (!response.ok) throw new Error('Failed to check status');
        
        const data = await response.json();
        if (data.error) throw new Error(data.error.message || data.error);
        
        if (data.done) {
          isDone = true;
          setVideoStatus('ready');
          
          // Now download the video
          const downloadResponse = await fetch('/api/video-download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName })
          });
          
          if (!downloadResponse.ok) throw new Error('Failed to download video');
          
          const blob = await downloadResponse.blob();
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          showToast('Vídeo gerado com sucesso!', 'success');
        }
      }
    } catch (error: any) {
      console.error(error);
      setVideoStatus('error');
      showToast(error.message || 'Erro ao gerar vídeo', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt) {
      showToast('O prompt é obrigatório.', 'error');
      return;
    }
    
    try {
      setIsGenerating(true);
      setVideoStatus('generating');
      setVideoUrl(null);
      
      let base64Image = null;
      let mimeType = null;
      
      if (imageFile) {
        base64Image = await fileToBase64(imageFile);
        mimeType = imageFile.type;
      }
      
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          imageBytes: base64Image,
          mimeType
        })
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Erro ao iniciar geração');
      }
      
      const data = await response.json();
      showToast('Geração iniciada. Isso pode levar alguns minutos.', 'success');
      
      // Start polling
      pollVideoStatus(data.operationName);
      
    } catch (error: any) {
      console.error(error);
      setIsGenerating(false);
      setVideoStatus('error');
      showToast(error.message || 'Erro ao comunicar com o servidor', 'error');
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6 md:p-8 shadow-sm space-y-8 mt-12">
      <div>
        <span className="text-[10px] uppercase font-black tracking-widest text-[#C5B485] block font-mono">Gerador Audiovisual</span>
        <h3 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 mt-1">Imagens para Vídeo (Veo 3.1)</h3>
        <p className="text-stone-500 text-sm mt-2 leading-relaxed max-w-2xl">
          Transforme fotografias e prompts em vídeos realistas de alta definição. Ideal para apresentações de infraestrutura clínica, reconstituições forenses, ou marketing digital do consultório.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Col: Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-widest block">Imagem de Referência (Opcional)</label>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#C5B485] hover:bg-stone-50 transition-all text-center min-h-[160px] relative overflow-hidden group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
              
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="relative z-10 bg-white/90 px-4 py-2 rounded-lg text-xs font-bold text-stone-800 shadow-sm flex items-center gap-2">
                    <Check size={14} className="text-green-600" /> Imagem Carregada
                  </div>
                  <span className="relative z-10 text-[10px] uppercase font-mono text-stone-500 font-bold bg-white/90 px-2 py-0.5 rounded">Clique para alterar</span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform group-hover:text-[#C5B485] group-hover:bg-[#C5B485]/10">
                    <ImagePlus size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-stone-700">Fazer upload de imagem</p>
                    <p className="text-xs text-stone-400 mt-1">PNG, JPG até 10MB</p>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-widest block">Prompt de Direção</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="Descreva a cena em detalhes..."
              className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 text-sm text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#C5B485] shadow-inner resize-none font-medium"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
              isGenerating 
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : 'bg-stone-950 text-white hover:bg-[#C5B485] hover:shadow-lg cursor-pointer'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Processando...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Gerar Vídeo 16:9
              </>
            )}
          </button>
        </div>

        {/* Right Col: Preview */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl overflow-hidden flex flex-col items-center justify-center min-h-[300px] relative p-2">
          
          {videoUrl ? (
            <video 
              src={videoUrl} 
              controls 
              autoPlay 
              loop
              className="w-full h-full object-cover rounded-xl bg-black"
            />
          ) : (
            <div className="flex flex-col items-center text-center p-6 space-y-4">
              
              {videoStatus === 'generating' || videoStatus === 'polling' ? (
                <>
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-stone-200 border-t-[#C5B485] rounded-full animate-spin"></div>
                    <Video size={20} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#C5B485]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm">Gerando seu vídeo...</h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs">A inteligência artificial está processando os quadros. Isso leva cerca de 1 a 3 minutos.</p>
                  </div>
                </>
              ) : videoStatus === 'error' ? (
                <>
                  <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm">Falha na Geração</h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs">Ocorreu um erro ao processar seu vídeo. Tente novamente.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-stone-200/50 text-stone-400 rounded-full flex items-center justify-center">
                    <Video size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm">Pré-visualização</h4>
                    <p className="text-xs text-stone-500 mt-1 max-w-xs">Seu vídeo gerado aparecerá aqui. Ele terá formato 16:9 de alta qualidade.</p>
                  </div>
                </>
              )}
            </div>
          )}
          
        </div>
        
      </div>
    </div>
  );
};
