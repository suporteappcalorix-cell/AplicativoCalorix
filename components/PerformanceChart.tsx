
import React, { useState, useMemo, useRef } from 'react';
import { DailyLog, UserProfile } from '../types';

interface PerformanceChartProps {
  logs: Record<string, DailyLog>;
  profile: UserProfile;
}

type Period = 7 | 15 | 30;

const PerformanceChart: React.FC<PerformanceChartProps> = ({ logs, profile }) => {
  const [period, setPeriod] = useState<Period>(7);
  const chartRef = useRef<HTMLDivElement>(null);

  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = logs[dateStr];
      const calories = log ? log.meals.reduce((sum, m) => sum + m.items.reduce((s, item) => s + item.calories, 0), 0) : 0;
      data.push({
        date: d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        calories: Math.round(calories)
      });
    }
    return data;
  }, [logs, period]);

  const stats = useMemo(() => {
    const values = chartData.map(d => d.calories);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = Math.round(sum / period);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const variation = max - min;
    const vsGoal = Math.round(((avg - profile.goals.calories) / profile.goals.calories) * 100);

    return { avg, variation, vsGoal };
  }, [chartData, period, profile.goals.calories]);

  const exportAsImage = async () => {
    if (!chartRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Aumentar escala para melhor qualidade
    const scale = 2;
    canvas.width = chartRef.current.offsetWidth * scale;
    canvas.height = chartRef.current.offsetHeight * scale;
    ctx.scale(scale, scale);

    // Fundo branco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Renderizar o conteúdo (simplificado: vamos desenhar o gráfico básico no canvas)
    // Para um app real, usaríamos html2canvas, mas aqui faremos um desenho representativo ou aviso
    // Para simplificar e garantir funcionamento, vamos disparar o print ou salvar o SVG
    const svg = chartRef.current.querySelector('svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 20, 80, chartRef.current!.offsetWidth - 40, chartRef.current!.offsetHeight - 160);
        
        // Adicionar texto de resumo
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 16px Inter';
        ctx.fillText(`Relatório Calorix - Últimos ${period} dias`, 20, 40);
        ctx.font = '12px Inter';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`Média: ${stats.avg} kcal | Variação: ${stats.variation} kcal`, 20, 60);

        const link = document.createElement('a');
        link.download = `calorix-report-${period}days.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
  };

  const maxCal = Math.max(...chartData.map(d => d.calories), profile.goals.calories, 1000);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2">
        <div>
          <h3 className="text-xl font-black text-slate-900">Desempenho Calórico</h3>
          <p className="text-sm font-medium text-slate-500">Acompanhe sua consistência</p>
        </div>
        
        <div className="flex gap-2 bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {([7, 15, 30] as Period[]).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${period === p ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {p} Dias
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Média Diária</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{stats.avg}</span>
            <span className="text-xs font-bold text-slate-400">kcal</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variação (Pico/Vale)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">{stats.variation}</span>
            <span className="text-xs font-bold text-slate-400">kcal</span>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status vs Meta</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-2xl font-black ${stats.vsGoal <= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {stats.vsGoal > 0 ? `+${stats.vsGoal}` : stats.vsGoal}%
            </span>
            <span className="text-xs font-bold text-slate-400">da meta</span>
          </div>
        </div>
      </div>

      <div 
        ref={chartRef}
        className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-10">
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Consumo
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
              <div className="w-3 h-3 border-t-2 border-dashed border-rose-400"></div> Meta ({profile.goals.calories})
            </div>
          </div>
          
          <button 
            onClick={exportAsImage}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
            Compartilhar
          </button>
        </div>

        <div className="h-64 w-full">
          <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
            {/* Linhas de Grade Horizontal */}
            {[0, 25, 50, 75, 100].map(p => (
              <line key={p} x1="0" y1={p * 0.4} x2="100" y2={p * 0.4} stroke="#f1f5f9" strokeWidth="0.1" />
            ))}

            {/* Linha da Meta */}
            <line 
              x1="0" 
              y1={40 - (profile.goals.calories / maxCal) * 40} 
              x2="100" 
              y2={40 - (profile.goals.calories / maxCal) * 40} 
              stroke="#fb7185" 
              strokeWidth="0.3" 
              strokeDasharray="1 1" 
            />

            {/* Área de Gradiente */}
            <defs>
              <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* O Gráfico em si */}
            <path
              d={`
                M 0 40
                ${chartData.map((d, i) => `L ${(i / (chartData.length - 1)) * 100} ${40 - (d.calories / maxCal) * 40}`).join(' ')}
                L 100 40
                Z
              `}
              fill="url(#chartGradient)"
            />

            <polyline
              points={chartData.map((d, i) => `${(i / (chartData.length - 1)) * 100},${40 - (d.calories / maxCal) * 40}`).join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />

            {/* Pontos de Dados */}
            {chartData.map((d, i) => (
              <circle
                key={i}
                cx={(i / (chartData.length - 1)) * 100}
                cy={40 - (d.calories / maxCal) * 40}
                r="0.6"
                fill="#10b981"
                className="hover:r-1.5 transition-all cursor-pointer"
              />
            ))}
          </svg>
        </div>

        {/* Labels X */}
        <div className="flex justify-between mt-4 px-1">
          {chartData.filter((_, i) => period === 7 || i % Math.floor(period / 5) === 0).map((d, i) => (
            <span key={i} className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">{d.date}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
