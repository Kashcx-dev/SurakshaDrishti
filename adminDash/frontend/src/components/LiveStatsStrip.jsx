import React from 'react';
import {
  AlertTriangle,
  MapPin,
  Users,
  Home,
  Bell,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { useCountUp } from '../utils/useCountUp';
import { useScrollReveal } from '../utils/useScrollReveal';
import Interactive3DCard from './Interactive3DCard';

function StatCard({ icon: Icon, label, value, color, iconBg, iconBorder, borderColor, glowColor }) {
  const [ref, count] = useCountUp(value, 1500);

  return (
    <Interactive3DCard intensity={6} className="h-full">
      <div
        ref={ref}
        className={`stat-card bg-white/70 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border ${borderColor} group cursor-default relative overflow-hidden transition-all duration-300 shadow-sm hover:shadow-lg h-full flex flex-col justify-between`}
        style={{ '--glow': glowColor }}
      >
        <div className="flex items-center gap-3 relative z-10">
          <div className={`w-11 h-11 rounded-xl ${iconBg || 'bg-[#F6F4F0]'} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 border ${iconBorder || 'border-[#E8E1D5]'} shadow-xs`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          
          <div>
            <div className={`font-sans text-2xl sm:text-3xl font-black tabular-nums tracking-tight ${color}`}>
              {count.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#5C544D] font-semibold mt-0.5 leading-tight">{label}</div>
          </div>
        </div>
      </div>
    </Interactive3DCard>
  );
}

export default function LiveStatsStrip() {
  const [ref, revealed] = useScrollReveal({ threshold: 0.2 });

  const stats = [
    {
      icon: AlertTriangle,
      label: 'Active Red Zones',
      value: 14,
      color: 'text-[#DC2626]',
      iconBg: 'bg-[#FEF2F2]',
      iconBorder: 'border-[#FCA5A5]',
      borderColor: 'border-[#FECACA] hover:border-[#DC2626]/50',
      glowColor: 'rgba(220, 38, 38, 0.15)',
    },
    {
      icon: MapPin,
      label: 'Vulnerable Habitations',
      value: 1420,
      color: 'text-[#D97706]',
      iconBg: 'bg-[#FFFBEB]',
      iconBorder: 'border-[#FCD34D]',
      borderColor: 'border-[#FDE68A] hover:border-[#D97706]/50',
      glowColor: 'rgba(217, 119, 6, 0.15)',
    },
    {
      icon: Users,
      label: 'Shelter Capacity',
      value: 8500,
      color: 'text-[#059669]',
      iconBg: 'bg-[#ECFDF5]',
      iconBorder: 'border-[#6EE7B7]',
      borderColor: 'border-[#A7F3D0] hover:border-[#059669]/50',
      glowColor: 'rgba(5, 150, 105, 0.15)',
    },
    {
      icon: Home,
      label: 'Verified Relocations',
      value: 320,
      color: 'text-[#0284C7]',
      iconBg: 'bg-[#F0F9FF]',
      iconBorder: 'border-[#7DD3FC]',
      borderColor: 'border-[#BAE6FD] hover:border-[#0284C7]/50',
      glowColor: 'rgba(2, 132, 199, 0.15)',
    },
    {
      icon: Bell,
      label: 'Broadcast Alerts',
      value: 28,
      color: 'text-[#7C3AED]',
      iconBg: 'bg-[#F5F3FF]',
      iconBorder: 'border-[#C4B5FD]',
      borderColor: 'border-[#DDD6FE] hover:border-[#7C3AED]/50',
      glowColor: 'rgba(124, 58, 237, 0.15)',
    },
  ];

  return (
    <section
      className="relative py-8 sm:py-12 bg-transparent"
      aria-label="Live intelligence statistics"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Minimal Pill */}
        <div
          ref={ref}
          className={`flex items-center justify-center mb-7 reveal ${revealed ? 'revealed' : ''}`}
        >
          <div className="group relative inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/80 border border-[#E8E1D5] hover:border-[#8B7355]/40 transition-all duration-300 cursor-default shadow-xs backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B85C38] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B85C38]"></span>
            </span>

            <span className="text-xs text-[#2C2A29] font-bold tracking-wide">
              Live Geospatial Telemetry Feed
            </span>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F6F4F0] text-[#4A4238] border border-[#E8E1D5] font-bold">
              ISRO / IMD SYNC
            </span>
          </div>
        </div>

        {/* 5 KPI Stat Cards Grid with 3D Tilt & Staggered Scroll Parallax Reveal */}
        <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 reveal ${revealed ? 'revealed' : ''}`}>
          {stats.map((stat, idx) => (
            <div key={idx} style={{ transitionDelay: `${idx * 80}ms` }} className="h-full">
              <StatCard {...stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
