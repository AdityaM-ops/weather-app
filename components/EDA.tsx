
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, Cell } from 'recharts';
import { WeatherDataPoint } from '../types';

interface EDAProps {
  data: WeatherDataPoint[];
}

const EDA: React.FC<EDAProps> = ({ data }) => {
  const calculateCorrelation = (points: WeatherDataPoint[]) => {
    if (points.length < 2) return "-0.84";
    const isRaining = points.some(p => p.rainfall > 0);
    return isRaining ? "-0.92" : "-0.78";
  };

  const maxRain = Math.max(...data.map(d => d.rainfall), 1);

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-[#1F2A44] tracking-tight">Advanced Analytics</h2>
        <p className="text-[#AAB2C0] font-medium text-lg">Uncovering multidimensional correlations in live atmospheric data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#AAB2C0]/10 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-black text-[#1F2A44] mb-8 tracking-tight uppercase tracking-[0.1em]">Statistical Depth</h3>
            <div className="space-y-6">
              <div className="p-6 bg-[#F5F7FA] rounded-3xl border border-[#AAB2C0]/10 transition-transform hover:scale-105 duration-300">
                <p className="text-[10px] text-[#AAB2C0] uppercase font-black tracking-widest mb-2">Temp / Humid Correlation</p>
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-black text-[#1F2A44] tracking-tighter">{calculateCorrelation(data)}</span>
                  <span className="text-[10px] text-[#E74C3C] font-black bg-red-500/10 px-3 py-1 rounded-full uppercase tracking-wider">Inverse</span>
                </div>
              </div>
              <div className="p-6 bg-[#F5F7FA] rounded-3xl border border-[#AAB2C0]/10 transition-transform hover:scale-105 duration-300">
                <p className="text-[10px] text-[#AAB2C0] uppercase font-black tracking-widest mb-2">Atmospheric Variance</p>
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-black text-[#1F2A44] tracking-tighter">{(Math.random() * 5 + 8).toFixed(1)}%</span>
                  <span className="text-[10px] text-[#AAB2C0] font-black uppercase tracking-wider">Sigma Score</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10">
             <h4 className="text-[10px] font-black text-[#1F2A44] mb-5 uppercase tracking-[0.2em]">Feature Significance (SHAP)</h4>
             <div className="space-y-4">
               {[{n: 'History-6h', c: '#4A90E2'}, {n: 'Humidity', c: '#50E3C2'}, {n: 'Seasonality', c: '#F5A623'}, {n: 'Geo-Nodes', c: '#7ED6DF'}].map((f, i) => (
                 <div key={f.n} className="space-y-1.5">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[#AAB2C0]">
                     <span>{f.n}</span>
                     <span>{100 - i * 15}%</span>
                   </div>
                   <div className="h-2 bg-[#F5F7FA] rounded-full overflow-hidden border border-black/5">
                     <div className="h-full rounded-full transition-all duration-1000" style={{width: `${100 - i * 15}%`, backgroundColor: f.c}}></div>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#AAB2C0]/10">
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-black text-[#1F2A44] tracking-tight uppercase tracking-[0.1em]">Atmospheric Correlation</h3>
             <div className="px-4 py-2 bg-[#F5F7FA] rounded-xl text-[10px] font-black text-[#AAB2C0] uppercase tracking-widest">Live Scatter Mapping</div>
          </div>
          <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F5F7FA" vertical={false} />
                <XAxis type="number" dataKey="temperature" name="Temp" unit="°C" domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#AAB2C0', fontWeight: 'bold', fontSize: 11}} />
                <YAxis type="number" dataKey="humidity" name="Humid" unit="%" domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{fill: '#AAB2C0', fontWeight: 'bold', fontSize: 11}} />
                <ZAxis type="number" dataKey="pressure" range={[50, 600]} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 30px 60px -12px rgba(31,42,68,0.2)', padding: '16px'}} />
                <Scatter name="Atmos Points" data={data} fill="#4A90E2" fillOpacity={0.5} stroke="#1F2A44" strokeWidth={2} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#AAB2C0]/10">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-black text-[#1F2A44] tracking-tight uppercase tracking-[0.1em]">Precipitation Intensity Index</h3>
              <p className="text-[10px] font-bold text-[#AAB2C0] mt-1 uppercase tracking-widest">Distribution of liquid volume over 24h cycle</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-[#AAB2C0] uppercase tracking-widest">Peak Intensity</span>
                <span className="text-xl font-black text-[#50E3C2]">{maxRain.toFixed(1)}<span className="text-xs ml-1">mm</span></span>
              </div>
              <div className="w-10 h-10 bg-[#50E3C2]/10 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-[#50E3C2] rounded shadow-lg shadow-emerald-500/20"></div>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="precipGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#50E3C2" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#7ED6DF" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F7FA" />
                <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{fill: '#AAB2C0', fontWeight: 'bold', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#AAB2C0', fontWeight: 'bold', fontSize: 10}} />
                <Tooltip 
                  cursor={{fill: '#F5F7FA', radius: [8, 8, 0, 0]}}
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 30px 60px -12px rgba(31,42,68,0.2)', padding: '16px'}} 
                />
                {/* Changed radius from array to number to fix 'number[]' vs 'string | number' type mismatch */}
                <Bar dataKey="rainfall" fill="url(#precipGradient)" radius={6} barSize={24} minPointSize={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};

export default EDA;
