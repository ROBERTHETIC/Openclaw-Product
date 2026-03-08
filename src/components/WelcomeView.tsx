import React from 'react';
import { Power, Smartphone } from 'lucide-react';

export const WelcomeView = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8">
      <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
        <Power size={48} className="text-accent" />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-white">欢迎使用科研助手</h1>
        <p className="text-slate-400">系统已就绪，请连接您的设备以开始工作。</p>
      </div>
      <button 
        onClick={() => {
          console.log('Button clicked');
          onStart();
        }}
        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-accent text-white font-bold hover:bg-accent-hover transition-all shadow-lg hover:shadow-accent/20"
      >
        <Smartphone size={20} />
        连接设备
      </button>
    </div>
  );
};
