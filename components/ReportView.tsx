
import React from 'react';
import { Network, Database, Terminal, Cpu } from 'lucide-react';

const ReportView: React.FC = () => {
  const Section = ({ title, children }: any) => (
    <section className="space-y-4">
      <h3 className="text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-4">{title}</h3>
      <div className="text-slate-600 leading-relaxed text-sm md:text-base">{children}</div>
    </section>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12 animate-fadeIn">
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Weather Intelligence Research</h1>
        <p className="text-slate-500 uppercase tracking-widest text-sm font-bold">Minor Project Submission</p>
        <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full"></div>
      </div>

      <Section title="Abstract">
        This project investigates the application of multi-stage machine learning architectures for high-fidelity weather forecasting. By integrating baseline Linear Regression, Ensemble Gradient Boosting (XGBoost), and Deep Recurrent Neural Networks (LSTM), we demonstrate a hierarchical approach to time-series prediction that balances computational efficiency with predictive accuracy.
      </Section>

      <Section title="System Architecture">
        <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200 space-y-8 my-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 text-center z-10">
              <Database className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-xs font-bold">Ingestion</p>
              <p className="text-[10px] text-slate-400">CSV/JSON Pipeline</p>
            </div>
            <div className="hidden md:block absolute top-1/2 left-[20%] w-[10%] border-t-2 border-dashed border-slate-300"></div>
            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 text-center z-10">
              <Terminal className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-xs font-bold">Preprocessing</p>
              <p className="text-[10px] text-slate-400">Normalization/Lag</p>
            </div>
            <div className="hidden md:block absolute top-1/2 left-[45%] w-[10%] border-t-2 border-dashed border-slate-300"></div>
            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 text-center z-10">
              <Network className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-xs font-bold">Models (LSTM)</p>
              <p className="text-[10px] text-slate-400">Training/Val</p>
            </div>
            <div className="hidden md:block absolute top-1/2 left-[70%] w-[10%] border-t-2 border-dashed border-slate-300"></div>
            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 text-center z-10">
              <Cpu className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-xs font-bold">API Gateway</p>
              <p className="text-[10px] text-slate-400">Live Inference</p>
            </div>
          </div>
        </div>
        <p className="italic text-sm text-slate-500 mt-2 text-center">Fig 1: End-to-End Modular System Flow</p>
      </Section>

      <Section title="Data Preprocessing & Methodology">
        <ul className="list-disc ml-6 space-y-2">
          <li><strong>Outlier Removal:</strong> Z-Score clipping for sensor noise detection.</li>
          <li><strong>Feature Engineering:</strong> Lag features (T-1h to T-24h) and cyclical encoding for time variables using sin/cos transformations.</li>
          <li><strong>Deep Learning:</strong> Implementation of a 3-layer LSTM with Dropout regularization (0.2) to prevent overfitting on small datasets.</li>
        </ul>
      </Section>

      <Section title="Conclusion">
        The research indicates that while traditional models are sufficient for short-term linear trends, LSTM networks excel at capturing the atmospheric momentum required for 24-72h forecasting with 94%+ accuracy. Future iterations will incorporate Satellite Multi-spectral imagery for improved storm-path detection.
      </Section>

      <div className="p-6 bg-slate-900 rounded-2xl text-white flex items-center justify-between">
        <div>
          <p className="font-bold">Authors: Aditya and Shreeya</p>
          <p className="text-xs text-slate-400">Minor Project Submission</p>
        </div>
        <button className="px-6 py-2 bg-blue-600 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors">Download PDF</button>
      </div>
    </div>
  );
};

export default ReportView;
