
import React, { useState, useRef, useEffect } from 'react';
import { analyzeFoodImage } from '../services/geminiService';
import { Food, FoodCategory } from '../types';
import { CATEGORY_LABELS } from '../constants';

interface FoodCameraModalProps {
  onClose: () => void;
  onConfirm: (foods: Food[], imageBase64?: string) => void;
}

const FoodCameraModal: React.FC<FoodCameraModalProps> = ({ onClose, onConfirm }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedItems, setDetectedItems] = useState<Food[]>([]);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      alert("Não foi possível acessar a câmera. Verifique as permissões.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
        handleAnalyze(dataUrl.split(',')[1]);
      }
    }
  };

  const handleAnalyze = async (base64: string) => {
    setIsAnalyzing(true);
    setDetectedItems([]); // Limpa itens anteriores
    try {
      const results = await analyzeFoodImage(base64);
      const formattedItems: Food[] = results.map((item: any) => ({
        ...item,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now()
      }));
      setDetectedItems(formattedItems);
    } catch (err) {
      alert("Erro ao identificar alimentos. Tente novamente.");
      setCapturedImage(null);
      startCamera();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const removeItem = (index: number) => {
    setDetectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    onConfirm(detectedItems, capturedImage || undefined);
  };

  return (
    <div className="fixed inset-0 z-[110] flex flex-col bg-slate-900 animate-in fade-in duration-300 overflow-hidden font-sans touch-none">
      {/* Header */}
      <div className="p-4 sm:p-6 flex justify-between items-center text-white relative z-50 bg-slate-900/60 backdrop-blur-md border-b border-white/5">
        <button onClick={onClose} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all active:scale-90">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <h2 className="font-black text-[10px] uppercase tracking-[0.2em] text-emerald-400">Scanner de Nutrição IA</h2>
        <div className="w-11"></div>
      </div>

      <div className="flex-1 relative flex flex-col overflow-hidden">
        {!capturedImage ? (
          <div className="w-full h-full flex flex-col items-center justify-center relative bg-black">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            {/* Viewfinder overlay */}
            <div className="absolute inset-0 border-[30px] sm:border-[60px] border-slate-900/40 pointer-events-none flex items-center justify-center">
              <div className="w-full h-full border-2 border-white/30 rounded-[2.5rem] sm:rounded-[4rem] relative">
                 <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse"></div>
              </div>
            </div>
            
            <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-6 z-10">
              <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                <p className="text-white text-[9px] font-black uppercase tracking-widest text-center">Centralize o prato na moldura</p>
              </div>
              <button 
                onClick={capturePhoto}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center p-1 border-4 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all active:scale-90"
              >
                <div className="w-full h-full bg-white rounded-full border-2 border-slate-200"></div>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col bg-slate-50">
            {/* Image Preview - Smaller on mobile */}
            <div className="h-[25%] sm:h-[35%] w-full relative shrink-0">
              <img src={capturedImage} className="w-full h-full object-cover" alt="Capturada" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
            </div>

            {/* Results Section */}
            <div className="flex-1 bg-white rounded-t-[2.5rem] sm:rounded-t-[3.5rem] -mt-10 relative z-20 flex flex-col overflow-hidden shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-white/20">
              
              {isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">🧠</div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Identificando Alimentos</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                    Nossa IA está estimando porções e nutrientes com base na imagem...
                  </p>
                </div>
              ) : detectedItems.length > 0 ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="px-6 py-6 sm:px-10 shrink-0 flex justify-between items-end border-b border-slate-50">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-none">Resultados</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Valores estimados por porção</p>
                    </div>
                    <div className="text-right">
                       <span className="block text-2xl font-black text-emerald-500">
                         {Math.round(detectedItems.reduce((s, i) => s + i.calories, 0))}
                       </span>
                       <span className="text-[9px] font-black text-slate-300 uppercase">kcal totais</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 sm:px-10 py-6 overscroll-contain touch-pan-y">
                    <div className="space-y-4 pb-20">
                      {detectedItems.map((item, i) => (
                        <div key={item.id} className="bg-slate-50 rounded-3xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                          <div className="p-4 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                                {CATEGORY_LABELS[item.category as FoodCategory]?.icon || '🍽️'}
                              </div>
                              <div className="max-w-[150px] sm:max-w-none">
                                <h4 className="font-black text-slate-900 text-sm truncate">{item.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.servingSize}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => setEditingItemIndex(i)}
                                className="p-2 text-slate-300 hover:text-emerald-500 bg-white rounded-xl shadow-sm active:scale-90 transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button 
                                onClick={() => removeItem(i)}
                                className="p-2 text-slate-300 hover:text-rose-500 bg-white rounded-xl shadow-sm active:scale-90 transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          </div>
                          
                          <div className="px-4 pb-4 grid grid-cols-4 gap-1.5">
                            {[
                              { label: 'kcal', val: Math.round(item.calories), color: 'text-slate-800' },
                              { label: 'P', val: `${Math.round(item.protein)}g`, color: 'text-emerald-600' },
                              { label: 'C', val: `${Math.round(item.carbs)}g`, color: 'text-blue-600' },
                              { label: 'G', val: `${Math.round(item.fat)}g`, color: 'text-amber-600' }
                            ].map((macro, idx) => (
                              <div key={idx} className="bg-white p-2 rounded-xl text-center shadow-sm">
                                <span className="block text-[8px] font-black text-slate-300 uppercase leading-none mb-1">{macro.label}</span>
                                <span className={`text-[11px] font-black ${macro.color}`}>{macro.val}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar - Fixed at bottom of white section */}
                  <div className="p-6 sm:p-8 bg-white border-t border-slate-50 shrink-0">
                    <button 
                      onClick={handleConfirm}
                      className="w-full py-4 sm:py-5 bg-emerald-500 text-white rounded-[1.5rem] sm:rounded-[2rem] font-black text-xs sm:text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      Adicionar tudo agora
                    </button>
                    <button 
                      onClick={() => { setCapturedImage(null); setDetectedItems([]); startCamera(); }}
                      className="w-full mt-3 py-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:text-slate-600 transition-all"
                    >
                      Tentar outra foto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white">
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl mb-4 grayscale opacity-30">🔍</div>
                  <h4 className="text-lg font-black text-slate-400 italic">Nada encontrado</h4>
                  <p className="text-slate-400 text-sm font-medium mt-2 leading-relaxed mb-8">Não identificamos alimentos. Tente uma foto mais próxima e com luz melhor.</p>
                  <button 
                    onClick={() => { setCapturedImage(null); setDetectedItems([]); startCamera(); }}
                    className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all shadow-lg"
                  >
                    Tirar outra
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Editor Modal - Enhanced for Mobile */}
      {editingItemIndex !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in zoom-in-95 duration-300">
           <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 sm:p-8 overflow-y-auto max-h-[85vh] shadow-2xl overscroll-contain">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-black text-slate-900">Ajustar Detalhes</h3>
                 <button onClick={() => setEditingItemIndex(null)} className="p-2 text-slate-300 hover:text-slate-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                 </button>
              </div>

              <div className="space-y-5">
                 <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Nome do Alimento</label>
                    <input 
                       className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                       value={detectedItems[editingItemIndex].name}
                       onChange={e => {
                          const updated = [...detectedItems];
                          updated[editingItemIndex].name = e.target.value;
                          setDetectedItems(updated);
                       }}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Porção</label>
                       <input 
                          className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                          value={detectedItems[editingItemIndex].servingSize}
                          onChange={e => {
                             const updated = [...detectedItems];
                             updated[editingItemIndex].servingSize = e.target.value;
                             setDetectedItems(updated);
                          }}
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Calorias (kcal)</label>
                       <input 
                          type="number"
                          className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border border-slate-100 font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
                          value={detectedItems[editingItemIndex].calories}
                          onChange={e => {
                             const updated = [...detectedItems];
                             updated[editingItemIndex].calories = parseFloat(e.target.value) || 0;
                             setDetectedItems(updated);
                          }}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-2">
                    {['protein', 'carbs', 'fat'].map(macro => (
                       <div key={macro} className="space-y-1 text-center">
                          <label className="text-[8px] font-black uppercase text-slate-400">{macro === 'protein' ? 'Prot (g)' : macro === 'carbs' ? 'Carb (g)' : 'Gord (g)'}</label>
                          <input 
                             type="number"
                             className="w-full px-2 py-3 bg-slate-50 rounded-xl border border-slate-100 font-black text-center outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-xs"
                             value={(detectedItems[editingItemIndex] as any)[macro]}
                             onChange={e => {
                                const updated = [...detectedItems];
                                (updated[editingItemIndex] as any)[macro] = parseFloat(e.target.value) || 0;
                                setDetectedItems(updated);
                             }}
                          />
                       </div>
                    ))}
                 </div>

                 <div className="pt-4 border-t border-slate-100">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-3">Micronutrientes Estimados</p>
                    <div className="grid grid-cols-3 gap-2">
                       {['fiber', 'sodium', 'potassium', 'calcium', 'iron', 'vitC'].map(micro => (
                          <div key={micro} className="space-y-1">
                             <label className="text-[7px] font-black uppercase text-slate-400 ml-1 text-center block truncate">{micro}</label>
                             <input 
                                type="number"
                                className="w-full px-1 py-2 bg-slate-50 rounded-lg border border-slate-100 font-bold text-[10px] text-center outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                value={(detectedItems[editingItemIndex].micronutrients as any)?.[micro] || 0}
                                onChange={e => {
                                   const updated = [...detectedItems];
                                   if (!updated[editingItemIndex].micronutrients) updated[editingItemIndex].micronutrients = {};
                                   (updated[editingItemIndex].micronutrients as any)[micro] = parseFloat(e.target.value) || 0;
                                   setDetectedItems(updated);
                                }}
                             />
                          </div>
                       ))}
                    </div>
                 </div>

                 <button 
                    onClick={() => setEditingItemIndex(null)}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4 active:scale-95 transition-all shadow-xl shadow-slate-900/10"
                 >
                    Salvar Alterações
                 </button>
              </div>
           </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default FoodCameraModal;
