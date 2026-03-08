import React, { useEffect, useState } from 'react';
import { Smartphone, Laptop, Tablet, Battery, BatteryCharging, AlertTriangle, Wifi, WifiOff, Monitor } from 'lucide-react';

interface Device {
  id: string;
  name: string;
  type: string;
  device_model: string;
  status: 'online' | 'offline';
  battery_level: number;
  last_active: string;
}

export const DevicesView = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/devices')
      .then(res => res.json())
      .then(data => {
        setDevices(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch devices:', err);
        setLoading(false);
      });
  }, []);

  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'smartphone': return <Smartphone className="text-accent" />;
      case 'laptop': return <Laptop className="text-accent" />;
      case 'tablet': return <Tablet className="text-accent" />;
      default: return <Monitor className="text-accent" />;
    }
  };

  if (loading) return <div className="p-8 text-white">加载中...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold text-white">设备管理</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map(device => {
          const isOffline = device.status === 'offline';
          const isLowBattery = device.battery_level < 20;
          const needsAttention = isOffline || isLowBattery;

          return (
            <div key={device.id} className={`p-6 rounded-2xl bg-card border ${needsAttention ? 'border-red-500/50' : 'border-border'} space-y-4`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-bg-secondary">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{device.name}</h3>
                    <p className="text-xs text-slate-400">{device.type} • {device.device_model}</p>
                  </div>
                </div>
                {needsAttention && <AlertTriangle className="text-red-500" size={20} />}
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-slate-400">
                  {device.status === 'online' ? <Wifi size={16} className="text-emerald-500" /> : <WifiOff size={16} className="text-red-500" />}
                  {device.status === 'online' ? '在线' : '离线'}
                </div>
                <div className={`flex items-center gap-1 ${isLowBattery ? 'text-red-500' : 'text-slate-400'}`}>
                  <Battery size={16} />
                  {device.battery_level}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
