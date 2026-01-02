
import React from 'react';
import { MODEL_STATS } from '../constants';
import { ShieldCheck, Zap, Activity, Cpu, Layers } from 'lucide-react';

const ModelComparison: React.FC = () => {
  return (
    <div className="space-y-12 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-[#1F2A44] tracking-tight">AI Model Benchmarks</h2>
        <p className="text-[#AAB2C0] font-medium text-lg">Hierarchical architectural assessment across 100k+ validation samples.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {MODEL_STATS.map((model, idx) => (
          <div key={model.name} className="bg-white rounded-[2.5rem] shadow-sm border border-[#AAB2C0]/10 overflow-hidden flex flex-col md:flex-row group transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className={`p-12 md:w-1/3 flex flex-col justify-center transition-colors duration-500 ${idx === 2 ? 'bg-[#1F2A44] text-white' : 'bg-[#F5F7FA]'}`}>
              <div className="mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl ${idx === 2 ? 'bg-[#4A90E2] text-white' : 'bg-white text-[#4A90E2]'}`}>
                  {idx === 2 ? <Layers className="w-8 h-8" /> : idx === 1 ? <Cpu className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                </div>
                <h3 className={`text-2xl font-black tracking-tight ${idx === 2 ? 'text-white' : 'text-[#1F2A44]'}`}>{model.name}</h3>
              </div>
              <p className={`text-sm leading-relaxed font-medium ${idx === 2 ? 'text-[#AAB2C0]' : 'text-[#AAB2C0]'}`}>{model.description}</p>
            </div>
            
            <div className="p-12 flex-1 grid grid-cols-2 md:grid-cols-4 gap-12 items-center">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#AAB2C0] uppercase tracking-[0.2em]">MAE Metric</p>
                <p className="text-4xl font-black text-[#1F2A44] tracking-tighter tab-tabular">{model.mae}</p>
                <p className="text-[9px] font-bold text-[#AAB2C0] uppercase">Mean Abs Error</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#AAB2C0] uppercase tracking-[0.2em]">RMSE Metric</p>
                <p className="text-4xl font-black text-[#1F2A44] tracking-tighter tab-tabular">{model.rmse}</p>
                <p className="text-[9px] font-bold text-[#AAB2C0] uppercase">Root Mean Sq</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#AAB2C0] uppercase tracking-[0.2em]">Accuracy</p>
                <p className="text-4xl font-black text-[#4A90E2] tracking-tighter tab-tabular">{model.accuracy}%</p>
                <p className="text-[9px] font-bold text-[#AAB2C0] uppercase">Classification</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-[#AAB2C0] uppercase tracking-[0.2em]">Latency</p>
                <p className="text-4xl font-black text-[#1F2A44] tracking-tighter tab-tabular">{model.inferenceTime}</p>
                <p className="text-[9px] font-bold text-[#AAB2C0] uppercase">Inference Speed</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#1F2A44] p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#4A90E2] rounded-full opacity-5 -mr-40 -mt-40 blur-[100px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="bg-[#4A90E2] p-8 rounded-[2rem] shadow-xl shadow-blue-500/20 shrink-0">
             <Zap className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h4 className="text-3xl font-black tracking-tight">Architectural Leadership: Why LSTM?</h4>
            <p className="text-[#AAB2C0] text-lg font-medium max-w-2xl leading-relaxed">Unlike static models, LSTM networks leverage Temporal Gating mechanisms to maintain a persistent state of atmospheric momentum—essential for chaotic climate prediction.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-12 relative z-10 pt-12 border-t border-white/5">
          <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all">
            <h5 className="font-black text-[#4A90E2] text-[11px] uppercase tracking-[0.2em] mb-3">Temporal Persistence</h5>
            <p className="text-sm text-[#AAB2C0] leading-relaxed font-medium">Forget and Input gates selectively retain historical sequences (T-24h), crucial for cyclic meteorological cycles.</p>
          </div>
          <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all">
            <h5 className="font-black text-[#50E3C2] text-[11px] uppercase tracking-[0.2em] mb-3">Multi-Modality</h5>
            <p className="text-sm text-[#AAB2C0] leading-relaxed font-medium">Efficiently maps heterogeneous tensors (Pressure, Latitude, Season) into a unified high-dimensional prediction space.</p>
          </div>
          <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 hover:bg-white/10 transition-all">
            <h5 className="font-black text-[#F5A623] text-[11px] uppercase tracking-[0.2em] mb-3">Non-Linearity</h5>
            <p className="text-sm text-[#AAB2C0] leading-relaxed font-medium">Deep stacks of ReLU and Tanh activations model the chaotic, non-linear perturbations in global weather patterns.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelComparison;
