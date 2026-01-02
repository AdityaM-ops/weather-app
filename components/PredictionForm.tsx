
import React, { useState } from 'react';
import { getAIPrediction } from '../services/geminiService';
import { PredictionResult } from '../types';
import { BrainCircuit, Loader2, Sparkles, CheckCircle2, Sliders } from 'lucide-react';
import { CONDITION_ICONS } from '../constants';

const PredictionForm: React.FC = () => {
  const [formData, setFormData] = useState({
    temp: 24.5,
    humidity: 65,
    pressure: 1013,
    wind: 12,
    season: 'Summer'
  });
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await getAIPrediction(formData);
    setPrediction(result);
    setLoading(false);
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-[#1F2A44] tracking-tight">Inference Laboratory</h2>
        <p className="text-[#AAB2C0] font-medium text-lg">Synthetic parameter simulation on pre-trained LSTM-XGB architectures.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-1 bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#AAB2C0]/10 space-y-8">
          <div className="flex items-center gap-3 pb-4 border-b border-[#F5F7FA]">
            <div className="p-2 bg-[#4A90E2]/10 rounded-xl text-[#4A90E2]">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-[#1F2A44] tracking-tight">Synthetic Input</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[#AAB2C0] uppercase tracking-[0.2em]">Reference Temp (°C)</label>
              <input 
                type="number" step="0.1" 
                value={formData.temp}
                onChange={(e) => setFormData({...formData, temp: parseFloat(e.target.value)})}
                className="w-full bg-[#F5F7FA] border-2 border-transparent focus:border-[#4A90E2]/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-black text-[#1F2A44] outline-none transition-all tab-tabular" 
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-[#AAB2C0] uppercase tracking-[0.2em]">Target Humidity</label>
                <span className="text-xs font-black text-[#4A90E2] bg-[#4A90E2]/5 px-2.5 py-1 rounded-lg">{formData.humidity}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={formData.humidity}
                onChange={(e) => setFormData({...formData, humidity: parseInt(e.target.value)})}
                className="w-full h-1.5 bg-[#F5F7FA] rounded-full appearance-none cursor-pointer accent-[#4A90E2]" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[#AAB2C0] uppercase tracking-[0.2em]">Isobaric Pressure (hPa)</label>
              <input 
                type="number" 
                value={formData.pressure}
                onChange={(e) => setFormData({...formData, pressure: parseInt(e.target.value)})}
                className="w-full bg-[#F5F7FA] border-2 border-transparent focus:border-[#4A90E2]/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-black text-[#1F2A44] outline-none transition-all tab-tabular" 
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-[#AAB2C0] uppercase tracking-[0.2em]">Seasonal Context</label>
              <select 
                value={formData.season}
                onChange={(e) => setFormData({...formData, season: e.target.value})}
                className="w-full bg-[#F5F7FA] border-2 border-transparent focus:border-[#4A90E2]/20 focus:bg-white rounded-2xl px-5 py-3.5 text-sm font-black text-[#1F2A44] outline-none transition-all appearance-none cursor-pointer"
              >
                <option>Summer</option>
                <option>Winter</option>
                <option>Monsoon</option>
                <option>Spring/Autumn</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-[#1F2A44] text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-[#2A3A5A] transition-all shadow-xl shadow-[#1F2A44]/10 active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5 text-[#4A90E2]" /> Execute Inference</>}
          </button>
        </form>

        <div className="lg:col-span-2 h-full">
          {prediction ? (
            <div className="bg-white rounded-[3rem] shadow-sm border border-[#AAB2C0]/10 overflow-hidden animate-slideUp flex flex-col h-full">
              <div className="bg-[#1F2A44] p-12 text-white relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-center">
                  <div>
                    <span className="bg-[#4A90E2] text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20">AI Logic Result</span>
                    <h4 className="text-6xl font-black mt-8 tracking-tighter tab-tabular">{prediction.temperature.toFixed(1)}°C</h4>
                    <p className="text-[#AAB2C0] font-bold uppercase tracking-widest mt-2 text-xs">Propagated Forecast: T+6h</p>
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <div className="bg-white/5 p-6 rounded-[2rem] backdrop-blur-xl border border-white/10 shadow-2xl">
                      {React.cloneElement(CONDITION_ICONS[prediction.condition as keyof typeof CONDITION_ICONS] || CONDITION_ICONS.Sunny, { className: "w-16 h-16" })}
                    </div>
                    <p className="font-black text-sm uppercase tracking-[0.3em]">{prediction.condition}</p>
                  </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-[#4A90E2] rounded-full opacity-5 blur-[100px]"></div>
              </div>

              <div className="p-12 space-y-10 flex-1">
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-8 bg-[#F5F7FA] rounded-[2rem] text-center border border-black/5">
                    <p className="text-[10px] font-black text-[#AAB2C0] uppercase tracking-widest mb-2">Humidity</p>
                    <p className="text-3xl font-black text-[#1F2A44] tracking-tighter tab-tabular">{prediction.humidity.toFixed(0)}%</p>
                  </div>
                  <div className="p-8 bg-[#F5F7FA] rounded-[2rem] text-center border border-black/5">
                    <p className="text-[10px] font-black text-[#AAB2C0] uppercase tracking-widest mb-2">Wind Rate</p>
                    <p className="text-3xl font-black text-[#1F2A44] tracking-tighter tab-tabular">{prediction.windSpeed.toFixed(1)} <span className="text-xs">km/h</span></p>
                  </div>
                  <div className="p-8 bg-[#F5F7FA] rounded-[2rem] text-center border border-[#4A90E2]/10">
                    <p className="text-[10px] font-black text-[#AAB2C0] uppercase tracking-widest mb-2">Confidence</p>
                    <p className="text-3xl font-black text-[#4A90E2] tracking-tighter tab-tabular">{(prediction.confidence * 100).toFixed(0)}%</p>
                  </div>
                </div>

                <div className="pt-10 border-t border-[#F5F7FA]">
                   <h5 className="text-[10px] font-black text-[#1F2A44] flex items-center gap-2.5 mb-5 uppercase tracking-[0.2em]">
                     <div className="w-1.5 h-6 bg-[#50E3C2] rounded-full"></div>
                     Algorithmic Justification
                   </h5>
                   <div className="bg-[#F5F7FA] p-8 rounded-[2rem] border-l-8 border-[#4A90E2] shadow-inner">
                     <p className="text-[#1F2A44] leading-relaxed font-medium italic text-lg">
                       "{prediction.reasoning}"
                     </p>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white border-4 border-dashed border-[#F5F7FA] rounded-[3rem] flex flex-col items-center justify-center p-20 text-center min-h-[600px] transition-all hover:bg-[#F5F7FA]/50 group">
              <div className="p-10 bg-white rounded-full shadow-2xl border border-[#F5F7FA] mb-8 group-hover:scale-110 transition-transform duration-500">
                <BrainCircuit className="w-16 h-16 text-[#AAB2C0] opacity-30" />
              </div>
              <h4 className="text-2xl font-black text-[#1F2A44] tracking-tight uppercase tracking-wider">Awaiting Simulation</h4>
              <p className="max-w-sm mt-4 text-[#AAB2C0] font-medium leading-relaxed">Adjust the synthetic atmospheric parameters and trigger the inference engine to generate a neural forecast.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionForm;
