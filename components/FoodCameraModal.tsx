
import React, { useState, useRef, useEffect } from 'react';
import { analyzeFoodImage } from '../services/geminiService';
import { optimizeImageForAI } from '../utils/imageUtils';
import { Food, FoodCategory } from '../types';
import { CATEGORY_LABELS } from '../constants';

interface FoodCameraModalProps {
  onClose: () => void;
  onConfirm: (foods: Food[], imageBase64?: string) => void;
  onManualEntry?: () => void;
}

const FoodCameraModal: React.FC<FoodCameraModalProps> = ({ onClose, onConfirm, onManualEntry }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedItems, setDetectedItems] = useState<Food[]>([]);
  const [errorState, setErrorState] = useState<'NONE' | 'NO_FOOD' | 'TECHNICAL' | 'CONFIG'>('NONE');
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
      console.error("Camera access error:", err);
      setErrorState('TECHNICAL');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const rawBase64 = canvasRef.current.toDataURL('image/jpeg', 1.0);
        setCapturedImage(rawBase64);
        stopCamera();
        
        setIsAnalyzing(true);
        setErrorState('NONE');
        
        try {
          // Otimiza a imagem antes de enviar para a IA
          const optimizedBase64 = await optimizeImageForAI(rawBase64);
          const result = await analyzeFoodImage(optimizedBase64);

          if (result.status === 'NO_FOOD_FOUND') {
            setErrorState('NO_FOOD');
          } else {
            const formattedItems: Food[] = result.foods.map((item: any) => ({
              ...item,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: Date.now()
            }));
            setDetectedItems(formattedItems);
          }
        } catch (err: any) {
          if (err.message === "CONFIG_ERROR") setErrorState('CONFIG');
          else setErrorState('TECHNICAL');
        } finally {
          setIsAnalyzing(false);
        }
      }
    }
  };

  const resetCamera = () => {
    setCapturedImage(null);
    setDetectedItems([]);
    setErrorState('NONE');
    startCamera();
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
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            
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
            <div className="h-[25%] sm:h-[35%] w-full relative shrink-0">
              <img src={capturedImage} className="w-full h-full object-cover" alt="Capturada" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
            </div>

            <div className="flex-1 bg-white rounded-t-[2.5rem] -mt-10 relative z-20 flex flex-col overflow-hidden shadow-2xl border-t border-white/20">
              
              {isAnalyzing ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">🧠</div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Identificando Alimentos</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                    Nossa IA está estimando porções e nutrientes com base na imagem...
                  </p>
                </div>
              ) : errorState !== 'NONE' ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-3xl mb-6">
                    {errorState === 'NO_FOOD' ? '🍽️' : '⚠️'}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-4">
                    {errorState === 'NO_FOOD' 
                      ? 'Não identifiquei alimentos 😕' 
                      : errorState === 'CONFIG'
                        ? 'Chave da API ausente'
                        : 'Tivemos um problema técnico'}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto mb-10">
                    {errorState === 'NO_FOOD'
                      ? 'Tente tirar outra foto com melhor iluminação ou adicione o item manualmente.'
                      : 'Não conseguimos processar sua imagem agora. Tente novamente ou use a busca manual.'}
                  </p>
                  
                  <div className="w-full space-y-3 px-4">
                    <button 
                      onClick={resetCamera}
                      className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      📸 Tentar Novamente
                    </button>
                    <button 
                      onClick={() => { onClose(); if (onManualEntry) onManualEntry(); }}
                      className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all"
                    >
                      ✍️ Registrar Manualmente
                    </button>
                  </div>
                </div>
              ) : detectedItems.length > 0 ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <div className="px-6 py-6 flex justify-between items-end border-b border-slate-50">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-none">Resultados</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Valores estimados por porção</p>
                    </div>
                    <div className="text-right">
                       <span className="block text-2xl font-black text-emerald-500">
                         {Math.round(detectedItems.reduce((s, i) => s + i.calories, 0))}
                       </span>
                       <span className="text-[9px] font-black text-slate-300 uppercase">kcal totais</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="space-y-4 pb-20">
                      {detectedItems.map((item, i) => (
                        <div key={item.id} className="bg-slate-50 rounded-3xl border border-slate-100 p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm">
                                {CATEGORY_LABELS[item.category as FoodCategory]?.icon || '🍽️'}
                              </div>
                              <div className="max-w-[150px]">
                                <h4 className="font-black text-slate-900 text-sm truncate">{item.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.servingSize}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeItem(i)}
                              className="p-2 text-slate-300 hover:text-rose-500 transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { label: 'kcal', val: Math.round(item.calories) },
                              { label: 'P', val: Math.round(item.protein) + 'g' },
                              { label: 'C', val: Math.round(item.carbs) + 'g' },
                              { label: 'G', val: Math.round(item.fat) + 'g' }
                            ].map((m, idx) => (
                              <div key={idx} className="bg-white p-2 rounded-xl text-center text-[11px] font-black text-slate-700 shadow-sm">
                                <span className="block text-[8px] text-slate-300 uppercase mb-1">{m.label}</span>
                                {m.val}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 bg-white border-t border-slate-50">
                    <button 
                      onClick={handleConfirm}
                      className="w-full py-5 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                    >
                      Adicionar tudo ao diário
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default FoodCameraModal;
