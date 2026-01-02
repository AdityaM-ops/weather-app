
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import L from 'leaflet';
import Sidebar from './components/Sidebar';
import EDA from './components/EDA';
import ModelComparison from './components/ModelComparison';
import PredictionForm from './components/PredictionForm';
import ReportView from './components/ReportView';
import MapModal from './components/MapModal';
import { AppTab, RealTimeWeather, WeatherDataPoint } from './types';
import { Search, Cloud, Loader2, MapPin, Timer, Zap, RefreshCw, Radio, Maximize2, Thermometer, Droplets, Wind, CloudLightning, Bell, BellOff, Settings as SettingsIcon, CheckCircle2, Satellite, Globe, Target, MapPinned, Play, Pause, Power } from 'lucide-react';
import { geocodeLocation, fetchLiveWeather, fetchLocationName } from './services/weatherService';
import { MOCK_TIMESERIES, CONDITION_ICONS } from './constants';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lon: number, label?: string } | null>(null);

  const [liveData, setLiveData] = useState<RealTimeWeather | null>(null);
  const [prevData, setPrevData] = useState<RealTimeWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [nextRefresh, setNextRefresh] = useState(5);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Computed data to avoid flickering to mock data
  const display = useMemo(() => {
    if (liveData) return liveData;
    if (prevData) return prevData;
    return {
      temperature: MOCK_TIMESERIES[MOCK_TIMESERIES.length - 1].temperature,
      humidity: MOCK_TIMESERIES[MOCK_TIMESERIES.length - 1].humidity,
      windSpeed: MOCK_TIMESERIES[MOCK_TIMESERIES.length - 1].windSpeed,
      pressure: MOCK_TIMESERIES[MOCK_TIMESERIES.length - 1].pressure,
      condition: MOCK_TIMESERIES[MOCK_TIMESERIES.length - 1].condition,
      locationLabel: 'Initializing Global Grid...',
      timestamp: '--:--',
      hourlyForecast: MOCK_TIMESERIES
    };
  }, [liveData, prevData]);

  const getLatestData = useCallback(async (lat?: number, lon?: number, label?: string) => {
    setLoading(true);
    setError(null);
    setNextRefresh(5);

    // Capture current data as "previous" to keep UI stable during load
    if (liveData) setPrevData(liveData);

    const handleSuccess = (data: RealTimeWeather, actualLat: number, actualLon: number) => {
      setLiveData(data);
      // Sync the currentLocation state so lat/lon labels update if they were null
      if (!currentLocation || currentLocation.lat !== actualLat || currentLocation.lon !== actualLon) {
        setCurrentLocation({ lat: actualLat, lon: actualLon, label: data.locationLabel });
      }
      setLoading(false);
    };

    const handleFailure = (msg: string) => {
      setError(msg);
      setLoading(false);
    };

    if (lat !== undefined && lon !== undefined) {
      try {
        const data = await fetchLiveWeather(lat, lon, label);
        handleSuccess(data, lat, lon);
      } catch (err) {
        handleFailure("Failed to fetch weather data for the coordinates");
      }
      return;
    }

    if (!navigator.geolocation) {
      handleFailure("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const data = await fetchLiveWeather(position.coords.latitude, position.coords.longitude);
          handleSuccess(data, position.coords.latitude, position.coords.longitude);
        } catch (err) {
          handleFailure("Failed to fetch weather data from API");
        }
      },
      (err) => {
        handleFailure("Location permission denied. Showing default data.");
      },
      { timeout: 10000 }
    );
  }, [liveData, currentLocation]);

  useEffect(() => {
    if (!autoSync) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const intervalId = setInterval(() => {
      setNextRefresh((prev) => {
        if (prev <= 1) {
          if (currentLocation) {
            getLatestData(currentLocation.lat, currentLocation.lon, currentLocation.label);
          } else {
            getLatestData();
          }
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
    timerRef.current = intervalId;
    return () => clearInterval(intervalId);
  }, [autoSync, getLatestData, currentLocation]);

  useEffect(() => {
    // Only fetch on initial mount or when currentLocation is explicitly changed by user
    if (currentLocation && !liveData) {
      getLatestData(currentLocation.lat, currentLocation.lon, currentLocation.label);
    } else if (!currentLocation && !liveData) {
      getLatestData();
    }
  }, [currentLocation, getLatestData, liveData]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const result = await geocodeLocation(searchQuery);
    if (result) {
      setCurrentLocation({ lat: result.lat, lon: result.lon, label: result.label });
      getLatestData(result.lat, result.lon, result.label);
      setActiveTab(AppTab.HOME);
    }
    setIsSearching(false);
    setSearchQuery('');
  };

  const handleLocationSelect = async (lat: number, lon: number) => {
    // Show loading immediately in the UI components
    setLoading(true);
    
    // Attempt to get a label for the selected coordinates
    const label = await fetchLocationName(lat, lon);
    
    // Update state
    setCurrentLocation({ lat, lon, label });
    
    // Trigger the data fetch
    getLatestData(lat, lon, label);
    
    // UI Experience: Switch back to Home to see the "Deployment Node" update
    setIsMapOpen(false);
    setActiveTab(AppTab.HOME);
  };

  const WeatherBgEffect = ({ condition }: { condition: string }) => {
    const effectClass = `bg-effect-${condition.toLowerCase()}`;
    return (
      <div className="weather-bg-container transition-opacity duration-1000">
        <div className={`w-full h-full ${effectClass}`} />
      </div>
    );
  };

  const Gauge = ({ label, value, colorCode }: any) => {
    const configs: Record<string, { min: number; max: number; type: 'circle' | 'thermometer' }> = {
      'Temperature': { min: -20, max: 50, type: 'thermometer' },
      'Humidity': { min: 0, max: 100, type: 'circle' },
      'Wind Speed': { min: 0, max: 60, type: 'circle' },
      'Pressure': { min: 950, max: 1050, type: 'circle' }
    };

    const config = configs[label] || { min: 0, max: 100, type: 'circle' };
    const clamped = Math.min(Math.max(value, config.min), config.max);
    const percent = (clamped - config.min) / (config.max - config.min);

    if (config.type === 'thermometer') {
      return (
        <svg width="24" height="60" viewBox="0 0 24 60" className="shrink-0 overflow-visible ml-auto z-10">
          <rect x="9" y="5" width="6" height="40" rx="3" fill="#F5F7FA" />
          <rect x="9" y={Math.max(5, 45 - (percent * 35))} width="6" height={percent * 35 + 5} rx="3" fill={colorCode} className="transition-all duration-1000 ease-out" />
          <circle cx="12" cy="50" r="8" fill={colorCode} className="transition-all duration-1000 ease-out" />
          <circle cx="10" cy="48" r="3" fill="white" opacity="0.3" />
        </svg>
      );
    }

    const radius = 18;
    const circumference = Math.PI * radius;
    const offset = circumference * (1 - percent);

    return (
      <svg width="60" height="40" viewBox="0 0 50 35" className="shrink-0 overflow-visible ml-auto z-10">
        <path d="M 7 30 A 18 18 0 0 1 43 30" fill="none" stroke="#F5F7FA" strokeWidth="5" strokeLinecap="round" />
        <path 
          d="M 7 30 A 18 18 0 0 1 43 30" 
          fill="none" 
          stroke={colorCode} 
          strokeWidth="5" 
          strokeLinecap="round" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          className="transition-all duration-1000 ease-out" 
        />
        <circle 
          cx={25 + 18 * Math.cos(Math.PI + percent * Math.PI)} 
          cy={30 + 18 * Math.sin(Math.PI + percent * Math.PI)} 
          r="4" 
          fill="white" 
          stroke={colorCode} 
          strokeWidth="2" 
          className="transition-all duration-1000 ease-out" 
        />
      </svg>
    );
  };

  const StatCard = ({ icon, label, value, unit, colorCode }: any) => (
    <div className="relative bg-white p-7 rounded-[2rem] shadow-sm border border-[#AAB2C0]/10 flex items-center justify-between transition-all hover:shadow-xl hover:-translate-y-1 group overflow-hidden">
      <WeatherBgEffect condition={display.condition} />
      {loading && (
        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] z-20 flex items-center justify-center animate-pulse">
           <div className="w-1 h-1 bg-blue-500 rounded-full animate-ping"></div>
        </div>
      )}
      <div className="flex items-start gap-5 z-10">
        <div className={`p-4 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`} style={{ backgroundColor: `${colorCode}15` }}>
          {React.cloneElement(icon, { className: `w-6 h-6`, style: { color: colorCode } })}
        </div>
        <div>
          <p className="text-[11px] text-[#AAB2C0] font-black uppercase tracking-widest mb-1">{label}</p>
          <h3 className="text-3xl font-black text-[#1F2A44] tracking-tighter tab-tabular">
            {typeof value === 'number' ? value.toFixed(1) : value}
            <span className="text-sm ml-1 font-bold text-[#AAB2C0] tracking-normal">{unit}</span>
          </h3>
        </div>
      </div>
      <Gauge label={label} value={value} colorCode={colorCode} />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.HOME:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-black text-[#1F2A44] tracking-tight">Deployment Overview</h2>
              <p className="text-[#AAB2C0] font-medium text-lg">System summary and node classification.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="relative bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#AAB2C0]/10 flex flex-col items-center text-center group overflow-hidden min-h-[400px]">
                <WeatherBgEffect condition={display.condition} />
                <h3 className="relative z-10 text-[11px] font-black text-[#AAB2C0] mb-8 tracking-[0.2em] uppercase">Visual Classification</h3>
                <div className="relative z-10 mb-8 transform transition-all group-hover:scale-110 duration-500">
                  <div className="absolute inset-0 bg-[#4A90E2]/20 blur-[50px] opacity-40"></div>
                  <div className="relative drop-shadow-2xl">
                    {React.cloneElement(CONDITION_ICONS[display.condition as keyof typeof CONDITION_ICONS] || CONDITION_ICONS.Sunny, { className: "w-24 h-24" })}
                  </div>
                </div>
                <p className="relative z-10 text-6xl font-black text-[#1F2A44] tracking-tighter">{display.condition}</p>
                <div className="relative z-10 flex items-center gap-2 mt-3">
                  <Satellite className="w-3 h-3 text-[#4A90E2]" />
                  <p className="text-[10px] text-[#4A90E2] font-black uppercase tracking-[0.4em]">Live Satellite Verfied</p>
                </div>
              </div>
              
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#AAB2C0]/10 space-y-6 relative overflow-hidden">
                {loading && (
                   <div className="absolute top-0 right-0 p-4 z-20">
                     <div className="flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" /> Synchronizing Geo-Node
                     </div>
                   </div>
                )}
                <h3 className="text-xl font-black text-[#1F2A44] tracking-tight uppercase tracking-[0.1em] flex items-center gap-2">
                   <Target className="w-5 h-5 text-blue-500" /> Deployment Node
                </h3>
                
                <div className="p-8 bg-[#F5F7FA] rounded-3xl border border-[#AAB2C0]/10 relative transition-all duration-500 hover:border-blue-500/20">
                  <div className="absolute top-4 right-4 text-blue-500/10">
                    <MapPinned className="w-12 h-12" />
                  </div>
                  <p className="text-[10px] text-[#AAB2C0] uppercase font-black tracking-widest mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    Location Index
                  </p>
                  <p className={`text-2xl font-black text-[#1F2A44] transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
                    {display.locationLabel}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="px-2 py-0.5 bg-white rounded-md text-[9px] font-black text-[#AAB2C0] border border-black/5 uppercase">Lat: {currentLocation?.lat?.toFixed(3) || '0.000'}</div>
                    <div className="px-2 py-0.5 bg-white rounded-md text-[9px] font-black text-[#AAB2C0] border border-black/5 uppercase">Lon: {currentLocation?.lon?.toFixed(3) || '0.000'}</div>
                  </div>
                </div>

                <div className="p-8 bg-[#F5F7FA] rounded-3xl border border-[#AAB2C0]/10">
                  <p className="text-[10px] text-[#AAB2C0] uppercase font-black tracking-widest mb-2">Last Sync Timestamp</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-[#4A90E2]">{display.timestamp}</p>
                    <div className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-lg border border-emerald-100">Packet Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case AppTab.CURRENT:
        return (
          <div className="space-y-10 animate-fadeIn">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-black text-[#1F2A44] tracking-tight">Real-Time Telemetry</h2>
              <p className="text-[#AAB2C0] font-medium text-lg">Multi-parameter atmospheric sensing across the current grid.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard icon={<Thermometer />} label="Temperature" value={display.temperature} unit="°C" colorCode="#F5A623" />
              <StatCard icon={<Droplets />} label="Humidity" value={display.humidity} unit="%" colorCode="#50E3C2" />
              <StatCard icon={<Wind />} label="Wind Speed" value={display.windSpeed} unit="km/h" colorCode="#7ED6DF" />
              <StatCard icon={<CloudLightning />} label="Pressure" value={display.pressure} unit="hPa" colorCode="#4A90E2" />
            </div>
          </div>
        );
      case AppTab.FORECAST:
        return (
          <div className="space-y-10 animate-fadeIn">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-black text-[#1F2A44] tracking-tight">Temporal Propagation</h2>
              <p className="text-[#AAB2C0] font-medium text-lg">Live hourly predictive modeling from satellite feed.</p>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#AAB2C0]/10 relative overflow-hidden">
               {loading && (
                <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                   <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Updating Trend Grid</p>
                   </div>
                </div>
              )}
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-xl font-black text-[#1F2A44] tracking-tight uppercase tracking-[0.1em]">Atmospheric Trend (Next 24h)</h3>
                </div>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 bg-[#F5A623] rounded-full shadow-lg shadow-yellow-500/30"></div>
                    <span className="text-[10px] font-black text-[#1F2A44] uppercase tracking-widest">Temp</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 bg-[#50E3C2] rounded-full shadow-lg shadow-blue-500/30"></div>
                    <span className="text-[10px] font-black text-[#1F2A44] uppercase tracking-widest">Humid</span>
                  </div>
                </div>
              </div>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={display.hourlyForecast}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F5A623" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#F5A623" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#50E3C2" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#50E3C2" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F7FA" />
                    <XAxis dataKey="timestamp" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#AAB2C0', fontWeight: 700}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#AAB2C0', fontWeight: 700}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 30px 60px -12px rgba(31,42,68,0.2)', padding: '16px'}}
                      itemStyle={{fontWeight: '900', fontSize: '13px'}}
                    />
                    <Area type="monotone" dataKey="temperature" stroke="#F5A623" strokeWidth={4} fillOpacity={1} fill="url(#colorTemp)" />
                    <Area type="monotone" dataKey="humidity" stroke="#50E3C2" strokeWidth={3} fillOpacity={1} fill="url(#colorHum)" strokeDasharray="6 6" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      case AppTab.ANALYTICS:
        return (
          <div className="space-y-12 animate-fadeIn">
            <EDA data={display.hourlyForecast} />
            <div className="h-px bg-[#AAB2C0]/20 w-full my-8"></div>
            <ModelComparison />
          </div>
        );
      case AppTab.MAP:
        return (
          <div className="space-y-10 animate-fadeIn h-[700px] flex flex-col">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-black text-[#1F2A44] tracking-tight">Geographic Hub</h2>
              <p className="text-[#AAB2C0] font-medium text-lg">Spatial deployment and satellite coordinate mapping.</p>
            </div>
            <div className="flex-1 bg-white p-5 rounded-[2.5rem] shadow-sm border border-[#AAB2C0]/10 relative overflow-hidden group">
              <div className="absolute inset-0 z-0">
                <div id="dedicated-map-page" className="w-full h-full rounded-[2rem] overflow-hidden" style={{ minHeight: '500px' }}>
                  <LeafletMapContainer lat={currentLocation?.lat || 20} lon={currentLocation?.lon || 0} />
                </div>
              </div>
              <div className="absolute top-10 left-10 z-10">
                <button 
                  onClick={() => setIsMapOpen(true)}
                  className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/50 flex items-center gap-3 shadow-xl hover:bg-[#1F2A44] hover:text-white transition-all group/btn"
                >
                  <Maximize2 className="w-5 h-5 text-[#4A90E2]" />
                  <span className="text-xs font-black uppercase tracking-widest">Expand Command Center</span>
                </button>
              </div>
            </div>
          </div>
        );
      case AppTab.ALERTS:
        return (
          <div className="space-y-10 animate-fadeIn">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-black text-[#1F2A44] tracking-tight">System Alerts</h2>
              <p className="text-[#AAB2C0] font-medium text-lg">Real-time threat detection and atmospheric warnings.</p>
            </div>
            {error ? (
              <div className="bg-[#E74C3C]/5 border border-[#E74C3C]/20 text-[#E74C3C] p-10 rounded-[2.5rem] text-sm font-bold flex flex-col gap-6 shadow-xl shadow-red-500/5 animate-slideDown">
                <div className="flex items-center gap-5">
                  <div className="bg-[#E74C3C] text-white p-4 rounded-2xl shadow-lg shadow-red-500/20">
                    <Radio className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black uppercase tracking-tight">Active Warning</h4>
                    <p className="text-[#AAB2C0] font-bold mt-1 uppercase tracking-widest">Protocol: Sensor Loss</p>
                  </div>
                </div>
                <p className="bg-white/50 p-6 rounded-2xl text-lg font-medium border border-red-500/10 italic">
                  "{error}"
                </p>
                <button onClick={getLatestData} className="w-max bg-[#E74C3C] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-600 transition-all">
                  Attempt Re-Sync
                </button>
              </div>
            ) : (
              <div className="bg-[#50E3C2]/5 border border-[#50E3C2]/20 p-12 rounded-[3rem] text-center flex flex-col items-center">
                 <div className="p-8 bg-[#50E3C2]/10 rounded-full mb-8">
                   <CheckCircle2 className="w-20 h-20 text-[#50E3C2]" />
                 </div>
                 <h4 className="text-3xl font-black text-[#1F2A44] tracking-tight uppercase">Atmosphere Stable</h4>
                 <p className="max-w-md mt-4 text-[#AAB2C0] font-medium leading-relaxed">The inference engine reports no significant meteorological anomalies or system errors across the current observation grid.</p>
              </div>
            )}
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#AAB2C0]/10">
              <h3 className="text-xl font-black text-[#1F2A44] mb-8 tracking-tight uppercase tracking-[0.1em]">Alert History</h3>
              <div className="space-y-4">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="flex items-center justify-between p-6 bg-[#F5F7FA] rounded-3xl opacity-50">
                      <div className="flex items-center gap-4">
                        <BellOff className="w-5 h-5 text-[#AAB2C0]" />
                        <span className="text-sm font-bold text-[#1F2A44]">Periodic Sensor Calibration Sequence #{i*120}</span>
                      </div>
                      <span className="text-[10px] font-black text-[#AAB2C0]">T - {i * 24}h</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        );
      case AppTab.SETTINGS:
        return (
          <div className="space-y-10 animate-fadeIn">
            <div className="flex flex-col gap-2">
              <h2 className="text-4xl font-black text-[#1F2A44] tracking-tight">System Configuration</h2>
              <p className="text-[#AAB2C0] font-medium text-lg">Adjustment of multi-stage inference parameters and sync protocols.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#AAB2C0]/10 space-y-8">
                <h3 className="text-xl font-black text-[#1F2A44] tracking-tight flex items-center gap-3">
                   <SettingsIcon className="w-6 h-6 text-[#4A90E2]" />
                   Sync Protocols
                </h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-6 bg-[#F5F7FA] rounded-3xl transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100">
                      <div>
                        <p className="text-sm font-black text-[#1F2A44]">Automatic Live Matrix</p>
                        <p className="text-xs text-[#AAB2C0] font-medium">Real-time propagation every 5s</p>
                      </div>
                      <button 
                        onClick={() => setAutoSync(!autoSync)}
                        className={`w-14 h-8 rounded-full relative transition-all ${autoSync ? 'bg-[#50E3C2]' : 'bg-[#AAB2C0]'}`}
                      >
                         <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${autoSync ? 'left-7' : 'left-1 shadow-sm'}`} />
                      </button>
                   </div>
                   <div className="p-6 bg-[#F5F7FA] rounded-3xl space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-black text-[#1F2A44]">Refresh Latency</p>
                        <span className="text-xs font-black text-[#4A90E2]">{nextRefresh}s</span>
                      </div>
                      <div className="h-1.5 bg-[#AAB2C0]/20 rounded-full overflow-hidden">
                        <div className="h-full bg-[#4A90E2] transition-all duration-1000" style={{ width: `${(nextRefresh/5)*100}%` }} />
                      </div>
                   </div>
                   <button 
                    onClick={() => {
                      if (currentLocation) getLatestData(currentLocation.lat, currentLocation.lon, currentLocation.label);
                      else getLatestData();
                    }}
                    className="w-full py-4 bg-[#1F2A44] text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#2A3A5A] transition-all shadow-xl active:scale-95"
                   >
                     <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                     Manual Force Sync
                   </button>
                </div>
              </div>
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-[#AAB2C0]/10">
                <PredictionForm />
              </div>
            </div>
          </div>
        );
      case AppTab.ABOUT:
        return <ReportView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F5F7FA]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {autoSync && !loading && (
          <div className="fixed top-20 left-64 right-0 h-1.5 bg-[#F5F7FA] z-30 pointer-events-none overflow-hidden">
            <div 
              className="h-full bg-[#4A90E2] transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(74,144,226,0.5)]"
              style={{ width: `${(nextRefresh / 5) * 100}%` }}
            />
          </div>
        )}

        <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-[#AAB2C0]/20 px-10 flex items-center justify-between sticky top-0 z-40">
          <form onSubmit={handleSearch} className="flex items-center bg-[#F5F7FA] px-5 py-2.5 rounded-2xl w-[400px] group focus-within:ring-2 focus-within:ring-[#4A90E2]/20 transition-all border border-transparent focus-within:border-[#4A90E2]/30">
            {isSearching ? <Loader2 className="w-4 h-4 text-[#4A90E2] animate-spin" /> : <Search className="w-4 h-4 text-[#AAB2C0] group-focus-within:text-[#4A90E2]" />}
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search global observation targets..." 
              className="bg-transparent border-none outline-none ml-3 text-sm w-full font-medium text-[#1F2A44] placeholder-[#AAB2C0]" 
            />
          </form>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMapOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#AAB2C0]/10 rounded-xl hover:bg-[#F5F7FA] transition-all shadow-sm"
            >
               <MapPin className="w-4 h-4 text-[#4A90E2]" />
               <span className="text-[10px] font-black uppercase tracking-widest text-[#1F2A44]">Map Hub</span>
            </button>

            <button 
              onClick={() => setAutoSync(!autoSync)}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border transition-all duration-500 font-black text-[10px] uppercase tracking-widest ${
                autoSync 
                ? 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm hover:bg-emerald-100' 
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
              }`}
            >
              {autoSync ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  Live Sync Active
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Live Sync Paused
                </>
              )}
            </button>

            <div className="flex items-center gap-3 bg-white px-5 py-2 rounded-2xl border border-[#AAB2C0]/10 shadow-sm group cursor-default">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-500 relative overflow-hidden ${autoSync ? 'bg-[#4A90E2] shadow-blue-500/20' : 'bg-slate-400 shadow-slate-500/10'}`}>
                <Cloud className="w-5 h-5 relative z-10" />
                {loading && <div className="absolute inset-0 bg-white/20 animate-pulse"></div>}
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-black text-[#1F2A44] leading-none tracking-tighter uppercase">SkySync</p>
                <div className="flex items-center gap-1 mt-0.5">
                   <div className={`w-1 h-1 rounded-full transition-all duration-500 ${!autoSync ? 'bg-slate-300' : loading ? 'bg-blue-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></div>
                   <p className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${autoSync ? 'text-[#4A90E2]' : 'text-slate-400'}`}>
                     {loading ? 'SYNCING...' : autoSync ? 'LIVE FEED' : 'OFFLINE'}
                   </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1400px] mx-auto w-full flex-1">
          {renderContent()}
        </div>

        <MapModal 
          isOpen={isMapOpen} 
          onClose={() => setIsMapOpen(false)}
          onSelect={handleLocationSelect}
          initialPos={currentLocation ? { lat: currentLocation.lat, lon: currentLocation.lon } : { lat: 20, lon: 0 }}
        />

        {activeTab === AppTab.ABOUT && (
          <footer className="px-10 py-12 border-t border-[#AAB2C0]/10 bg-white/50 flex flex-col md:flex-row justify-between items-center text-[#AAB2C0] text-[11px] font-bold uppercase tracking-wider">
            <div className="flex flex-col gap-1">
              <p>© 2025 SkySync AI Research. Multi-Parameter Inference Platform.</p>
              <p className="text-[9px] text-[#AAB2C0]/60">Live Atmospheric Data provided by Open-Meteo (Free Tier).</p>
            </div>
            <div className="flex gap-8 mt-4 md:mt-0">
              <a href="#" className="hover:text-[#4A90E2] transition-colors">Documentation</a>
              <a href="#" className="hover:text-[#4A90E2] transition-colors">Inference Engine</a>
              <a href="#" className="hover:text-[#4A90E2] transition-colors">Terms of Service</a>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
};

const LeafletMapContainer: React.FC<{ lat: number, lon: number }> = ({ lat, lon }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([lat, lon], 8);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapRef.current);
      markerRef.current = L.marker([lat, lon], {
        icon: L.divIcon({
          html: `<div class="w-4 h-4 bg-[#4A90E2] rounded-full border-2 border-white shadow-lg animate-pulse"></div>`,
          className: 'custom-div-icon',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        })
      }).addTo(mapRef.current);
    }
    if (mapRef.current) {
      mapRef.current.setView([lat, lon], 8);
      markerRef.current?.setLatLng([lat, lon]);
    }
    return () => {};
  }, [lat, lon]);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default App;
