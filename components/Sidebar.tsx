import React from 'react';
import { ModelConfig, GeminiModel } from '../types';
import { MODEL_OPTIONS } from '../constants';
import { Settings, Zap, Search, BrainCircuit, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  config: ModelConfig;
  setConfig: React.Dispatch<React.SetStateAction<ModelConfig>>;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, config, setConfig }) => {
  const handleChange = <K extends keyof ModelConfig>(key: K, value: ModelConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-gray-950 border-l border-gray-800 transform transition-transform duration-300 ease-in-out z-50 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-white">
            <Settings size={20} className="text-indigo-400" />
            Configuration
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Model Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Gemini Model</label>
            <div className="space-y-2">
              {MODEL_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChange('modelName', option.value)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    config.modelName === option.value
                      ? 'bg-indigo-900/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {option.value.includes('flash') ? 'Optimized for latency & cost' : 'Optimized for reasoning'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities Toggles */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Capabilities</label>
            
            {/* Search Grounding */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${config.useSearch ? 'bg-blue-900/30 text-blue-400' : 'bg-gray-800 text-gray-500'}`}>
                  <Search size={18} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-200">Google Search</div>
                  <div className="text-xs text-gray-500">Grounding with live data</div>
                </div>
              </div>
              <button 
                onClick={() => handleChange('useSearch', !config.useSearch)}
                className={`w-11 h-6 flex items-center rounded-full transition-colors duration-200 ${config.useSearch ? 'bg-indigo-600' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${config.useSearch ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Thinking / Reasoning */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900 border border-gray-800">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md ${config.useThinking ? 'bg-purple-900/30 text-purple-400' : 'bg-gray-800 text-gray-500'}`}>
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-200">Thinking</div>
                  <div className="text-xs text-gray-500">Extended reasoning process</div>
                </div>
              </div>
              <button 
                onClick={() => handleChange('useThinking', !config.useThinking)}
                className={`w-11 h-6 flex items-center rounded-full transition-colors duration-200 ${config.useThinking ? 'bg-indigo-600' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-200 ${config.useThinking ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
            
            {/* Thinking Budget Slider - Only show if thinking enabled */}
            {config.useThinking && (
              <div className="pt-2 px-1">
                 <div className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>Budget</span>
                    <span>{config.thinkingBudget} tokens</span>
                 </div>
                 <input 
                   type="range" 
                   min="128" 
                   max="4096" 
                   step="128"
                   value={config.thinkingBudget}
                   onChange={(e) => handleChange('thinkingBudget', parseInt(e.target.value))}
                   className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                 />
              </div>
            )}
          </div>

          {/* Temperature */}
          <div className="space-y-3">
             <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Creativity (Temp)</label>
                <span className="text-xs text-gray-400 font-mono">{config.temperature}</span>
             </div>
             <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={config.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
             />
          </div>

        </div>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-800 bg-gray-950">
           <div className="flex items-center gap-2 text-xs text-gray-500 justify-center">
             <Zap size={12} className="text-yellow-500" />
             <span>Powered by Google GenAI SDK</span>
           </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
