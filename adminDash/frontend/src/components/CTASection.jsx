import React from 'react';
import { ArrowRight, Zap, Shield, UserPlus, Map, Sparkles } from 'lucide-react';
import { useScrollReveal } from '../utils/useScrollReveal';
import Interactive3DCard from './Interactive3DCard';

export default function CTASection({ userSession, onExplore, onEmergencyAccess, onSignUp, onOpenDemo, onQuickSign, onNavigateDashboard }) {
  const [ref, revealed] = useScrollReveal();
  const currentUser = userSession?.user || userSession;

  return (
    <section id="cta" className="relative py-20 sm:py-28 scroll-mt-20" aria-label="Call to action">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 3D Apple-Style Floating Call to Action Container */}
        <Interactive3DCard intensity={6}>
          <div
            ref={ref}
            className={`relative rounded-3xl p-8 sm:p-14 text-center bg-white/70 border border-[#E8E1D5] backdrop-blur-2xl shadow-2xl shadow-[#D9D0C1]/30 overflow-hidden reveal ${revealed ? 'revealed' : ''}`}
          >
            {/* Ambient warm glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#E8E1D5]/40 rounded-full blur-3xl pointer-events-none"></div>

            {/* Tactical Vector Shield Badge */}
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 flex items-center justify-center rounded-3xl bg-gradient-to-tr from-[#F4EFEB] via-white to-[#F9F7F3] border border-[#E8E1D5] shadow-lg shadow-[#8B7355]/15 select-none"
              style={{
                animation: 'float 5s ease-in-out infinite'
              }}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-[#8B7355] to-[#B85C38] flex items-center justify-center text-white shadow-md shadow-[#8B7355]/30">
                <Shield className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
            </div>

            {/* Minimal Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F6F4F0] border border-[#E8E1D5] mb-5 shadow-xs relative z-10">
              <Shield className="w-3.5 h-3.5 text-[#8B7355]" />
              <span className="text-xs text-[#4A4238] font-bold tracking-wide">
                NDRF & SDMA Rapid Command Protocol
              </span>
            </div>

            {/* High-Impact Headline */}
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-3 relative z-10 leading-[1.1]">
              <span className="gradient-text-stone">Deploy Rapid </span>
              <span className="gradient-text-gold">Safety Intelligence.</span>
            </h2>

            {/* Reduced Description */}
            <p className="text-sm text-[#5C544D] max-w-md mx-auto mb-9 leading-relaxed relative z-10 font-light">
              Real-time hazard telemetry, automated carrying capacity, and prioritized civilian relocation corridors.
            </p>

            {/* Primary Action Buttons */}
            <div className="relative z-20 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
              {currentUser ? (
                <button
                  type="button"
                  onClick={onNavigateDashboard || onExplore}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#2C2A29] hover:bg-[#1A1A1A] text-[#FDFBF7] font-semibold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.99] group"
                >
                  <Map className="w-4 h-4 text-[#8B7355]" />
                  <span>Open Command Console</span>
                  <ArrowRight className="w-4 h-4 text-[#8B7355] group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={onSignUp}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#2C2A29] hover:bg-[#1A1A1A] text-[#FDFBF7] font-semibold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.99]"
                  >
                    <Shield className="w-4 h-4 text-[#8B7355]" />
                    <span>Officer Command Sign In</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenDemo}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2ECE2] border border-[#E2DAD0] hover:border-[#8B7355] text-[#1A1A1A] font-semibold text-sm shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 active:scale-[0.99]"
                  >
                    <Sparkles className="w-4 h-4 text-[#8B7355]" />
                    <span>Demo Officer (1-Click)</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onEmergencyAccess}
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white/80 border border-[#E8E1D5] hover:border-[#B85C38] text-[#B85C38] hover:bg-[#FFF5F2] font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:scale-[0.99] shadow-xs"
              >
                <Zap className="w-4 h-4" />
                <span>Emergency SOS</span>
              </button>
            </div>

            {/* Secondary QuickSign Link */}
            <div className="relative z-20 mt-7 flex items-center justify-center text-xs font-semibold text-[#5C544D]">
              <button
                type="button"
                onClick={onQuickSign}
                className="inline-flex items-center gap-2 hover:text-[#B85C38] transition-colors group cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-[#B85C38]" />
                <span>QuickSign — Generate 30-Sec Emergency Pass</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#B85C38]" />
              </button>
            </div>

          </div>
        </Interactive3DCard>

      </div>
    </section>
  );
}
