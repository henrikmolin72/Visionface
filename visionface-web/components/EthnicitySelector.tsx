'use client';

import { useState } from 'react';
import { ETHNIC_PROFILES, type Ethnicity, type Gender } from '@/lib/facialIdeals';

interface EthnicitySelectorProps {
  onSelect: (ethnicity: Ethnicity, gender: Gender) => void;
}

const ETHNICITY_OPTIONS: { key: Ethnicity; icon: string; region: string }[] = [
  { key: 'caucasian', icon: '🌍', region: 'Europa' },
  { key: 'eastAsian', icon: '🌏', region: 'Östasien' },
  { key: 'southAsian', icon: '🌏', region: 'Sydasien' },
  { key: 'african', icon: '🌍', region: 'Afrika' },
  { key: 'middleEastern', icon: '🌍', region: 'Mellanöstern' },
  { key: 'hispanic', icon: '🌎', region: 'Latinamerika' },
];

export default function EthnicitySelector({ onSelect }: EthnicitySelectorProps) {
  const [selected, setSelected] = useState<Ethnicity | null>(null);
  const [gender, setGender] = useState<Gender>('female');

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 relative overflow-hidden">
      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        <div className="mb-8 animate-slide-up-fade text-center">
          <p className="vf-kicker mb-3">Steg 1 av 2</p>
          <h2 className="text-2xl md:text-3xl font-light vf-heading mb-3 tracking-tight">
            Välj din profil
          </h2>
          <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: 'var(--vf-copy)' }}>
            Ansiktsideal varierar mellan etniciteter. Välj den som bäst matchar dig
            för en mer exakt analys.
          </p>
        </div>

        {/* Gender toggle */}
        <div className="flex gap-2 mb-6 animate-slide-up-fade" style={{ animationDelay: '50ms' }}>
          {(['female', 'male'] as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border ${
                gender === g
                  ? 'bg-[#0d9373]/10 border-[#2dd4a8]/50 text-[#134e4a] shadow-sm'
                  : 'border-[#d6d3cd] text-[#78766f] bg-white/70 hover:border-[#2dd4a8]/30'
              }`}
            >
              {g === 'female' ? 'Kvinna' : 'Man'}
            </button>
          ))}
        </div>

        {/* Ethnicity grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-8">
          {ETHNICITY_OPTIONS.map(({ key, icon, region }, i) => {
            const profile = ETHNIC_PROFILES[key];
            const isSelected = selected === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                className={`animate-reveal-card vf-card-hover rounded-2xl p-4 text-left border transition-all duration-300 ${
                  isSelected
                    ? 'border-[#2dd4a8]/60 bg-[#f0fdf8] shadow-md scale-[1.02]'
                    : 'border-[#d6d3cd]/60 bg-white/80 hover:border-[#2dd4a8]/30 hover:bg-white/90'
                }`}
                style={{ animationDelay: `${80 + i * 60}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl">{icon}</span>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#2dd4a8] flex items-center justify-center animate-scale-in">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-[#1a1a1a]">{profile.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--vf-copy)' }}>{region}</p>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => selected && onSelect(selected, gender)}
          disabled={!selected}
          className={`group relative w-full overflow-hidden rounded-2xl py-4 px-8 font-medium transition-all duration-300 animate-slide-up-fade ${
            selected
              ? 'bg-[#134e4a] text-white shadow-lg hover:shadow-xl hover:bg-[#0d3d38]'
              : 'bg-[#e7e5e2] text-[#a8a29e] cursor-not-allowed'
          }`}
          style={{ animationDelay: '150ms' }}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            Fortsätt till scanning
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </span>
        </button>

        <p className="mt-4 text-[10px] text-center leading-relaxed max-w-xs" style={{ color: '#a8a29e' }}>
          Idealvärden baseras på publicerad cephalometrisk forskning (Farkas et al., Powell & Humphreys).
          Skönhet är subjektivt — detta är statistiska tendenser, inte normer.
        </p>
      </div>
    </div>
  );
}
