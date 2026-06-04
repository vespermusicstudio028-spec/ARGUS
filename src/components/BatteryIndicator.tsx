import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, BatteryWarning, BatteryFull, BatteryLow, BatteryMedium } from 'lucide-react';

export function BatteryIndicator() {
  const [level, setLevel] = useState<number>(1);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [isSupported, setIsSupported] = useState<boolean>(true);

  useEffect(() => {
    // @ts-ignore
    if (!navigator.getBattery) {
      setIsSupported(false);
      return;
    }

    let battery: any = null;

    const updateBattery = () => {
      if (battery) {
        setLevel(battery.level);
        setIsCharging(battery.charging);
      }
    };

    // @ts-ignore
    navigator.getBattery().then((batt: any) => {
      battery = batt;
      updateBattery();

      battery.addEventListener('levelchange', updateBattery);
      battery.addEventListener('chargingchange', updateBattery);
    });

    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', updateBattery);
        battery.removeEventListener('chargingchange', updateBattery);
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-950/20 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 group">
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold tracking-widest text-cyan-500/50 uppercase leading-none mb-0.5">Power</span>
          <span className="text-[11px] font-mono font-bold leading-none text-cyan-400">
            N/A
          </span>
        </div>
        <div className="relative">
          <Battery className="w-4 h-4 text-cyan-400/50" />
        </div>
      </div>
    );
  }

  const getIcon = () => {
    if (isCharging) return <BatteryCharging className="w-4 h-4 text-green-400 group-hover:animate-pulse" />;
    if (level <= 0.1) return <BatteryWarning className="w-4 h-4 text-red-500 animate-pulse" />;
    if (level <= 0.2) return <BatteryLow className="w-4 h-4 text-red-400" />;
    if (level <= 0.6) return <BatteryMedium className="w-4 h-4 text-yellow-400" />;
    if (level < 0.9) return <Battery className="w-4 h-4 text-cyan-400" />;
    return <BatteryFull className="w-4 h-4 text-cyan-400" />;
  };

  const percentage = Math.round(level * 100);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-950/20 rounded-lg border border-cyan-500/10 hover:border-cyan-500/30 transition-all duration-300 group">
      <div className="flex flex-col items-end">
        <span className="text-[9px] font-bold tracking-widest text-cyan-500/50 uppercase leading-none mb-0.5">Power</span>
        <span className={`text-[11px] font-mono font-bold leading-none ${level <= 0.2 ? 'text-red-400' : 'text-cyan-400'}`}>
          {percentage}%
        </span>
      </div>
      <div className="relative">
        {getIcon()}
        {/* Glow behind icon */}
        <div className={`absolute inset-0 blur-md opacity-20 ${isCharging ? 'bg-green-400' : 'bg-cyan-400'}`} />
      </div>
    </div>
  );
}
