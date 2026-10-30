import React, { useState, useEffect, useRef } from 'react';
import { Check, Sparkles, ChevronDown } from 'lucide-react';

export type LogoStyle = 'monogram' | 'infinity' | 'scales' | 'prism';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSelector?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSelector = true,
  className = '',
}) => {
  const [logoStyle, setLogoStyle] = useState<LogoStyle>(() => {
    try {
      const saved = localStorage.getItem('ledgerflow_logo_style') as LogoStyle;
      if (saved && ['monogram', 'infinity', 'scales', 'prism'].includes(saved)) {
        return saved;
      }
    } catch {
      // Fallback
    }
    return 'monogram';
  });

  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectStyle = (style: LogoStyle) => {
    setLogoStyle(style);
    localStorage.setItem('ledgerflow_logo_style', style);
    setIsOpenMenu(false);
  };

  const sizeClasses = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-11 h-11 rounded-2xl',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const renderIconSvg = (style: LogoStyle, isInsideMenu = false) => {
    switch (style) {
      case 'monogram':
        return (
          <svg
            viewBox="0 0 24 24"
            className={isInsideMenu ? 'w-4 h-4' : iconSizes[size]}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* The 'L' foundation ribbon: descending and curving into the baseline */}
            <path
              d="M5.5 5.5V15C5.5 16.933 7.067 18.5 9 18.5H19"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Upper 'F' flow bar */}
            <path
              d="M11.5 6H19"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Middle 'F' velocity bar */}
            <path
              d="M11.5 11H16.5"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            {/* Precision Equilibrium Accent Node */}
            <circle cx="19" cy="11" r="1.5" fill="#6EE7B7" />
          </svg>
        );

      case 'infinity':
        return (
          <svg
            viewBox="0 0 24 24"
            className={isInsideMenu ? 'w-4 h-4' : iconSizes[size]}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Intertwining Infinite Equilibrium Ribbon */}
            <path
              d="M6.5 16C4.567 16 3 14.433 3 12.5C3 10.567 4.567 9 6.5 9C9 9 10.5 15 13 15C15 15 16.5 13.5 16.5 12C16.5 10.5 15 9 13 9"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M17.5 8C19.433 8 21 9.567 21 11.5C21 13.433 19.433 15 17.5 15C15 15 13.5 9 11 9C9 9 7.5 10.5 7.5 12"
              stroke="white"
              strokeOpacity="0.4"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="1.5" fill="#6EE7B7" />
          </svg>
        );

      case 'scales':
        return (
          <svg
            viewBox="0 0 24 24"
            className={isInsideMenu ? 'w-4 h-4' : iconSizes[size]}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Modernist Fulcrum & Axis */}
            <path d="M12 4.5V19.5M7.5 19.5H16.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            {/* Precision Balance Crossbeam */}
            <path d="M4.5 9.5H19.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
            {/* Debit Node (Left) */}
            <path d="M5.5 9.5V13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="5.5" cy="14.5" r="2" fill="#6EE7B7" />
            {/* Credit Node (Right) */}
            <path d="M18.5 9.5V13" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="18.5" cy="14.5" r="2" fill="#6EE7B7" />
          </svg>
        );

      case 'prism':
        return (
          <svg
            viewBox="0 0 24 24"
            className={isInsideMenu ? 'w-4 h-4' : iconSizes[size]}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Isometric Apex Prism */}
            <path
              d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M12 12L20 7.5M12 12V21M12 12L4 7.5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polygon
              points="12,12 20,7.5 12,3"
              fill="white"
              fillOpacity="0.25"
            />
            <polygon
              points="12,12 12,21 4,16.5"
              fill="#6EE7B7"
              fillOpacity="0.3"
            />
          </svg>
        );
    }
  };

  const stylesList: { id: LogoStyle; label: string; desc: string }[] = [
    {
      id: 'monogram',
      label: 'Kinetic LF Monogram',
      desc: 'Flowing geometric lettermark with equilibrium node',
    },
    {
      id: 'infinity',
      label: 'Infinite Duality',
      desc: 'Continuous ribbon representing double-entry balance',
    },
    {
      id: 'scales',
      label: 'Precision Scales',
      desc: 'Architectural balance beam for audited books',
    },
    {
      id: 'prism',
      label: 'Apex Diamond Prism',
      desc: 'Isometric crystalline structure of financial strength',
    },
  ];

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => showSelector && setIsOpenMenu(!isOpenMenu)}
        title={showSelector ? 'Click to change logo style' : 'LedgerFlow'}
        className={`group relative flex items-center justify-center bg-gradient-to-tr from-[#024030] via-[#059669] to-[#10B981] text-white shadow-sm shadow-emerald-700/20 ring-1 ring-emerald-400/30 transition-all duration-200 ${
          showSelector ? 'cursor-pointer hover:shadow-md hover:ring-emerald-400/60 active:scale-95' : 'cursor-default'
        } ${sizeClasses[size]}`}
      >
        {renderIconSvg(logoStyle)}

        {showSelector && (
          <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-[8px] text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronDown className="w-2.5 h-2.5" />
          </span>
        )}
      </button>

      {/* Dropdown Selector Popover */}
      {showSelector && isOpenMenu && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-stone-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-stone-400 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Brand Mark Style
            </span>
            <span className="text-[10px] text-stone-400">Click to switch</span>
          </div>

          <div className="p-1 space-y-1">
            {stylesList.map((item) => {
              const isSelected = logoStyle === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectStyle(item.id)}
                  className={`w-full text-left flex items-start gap-3 p-2 rounded-lg transition-colors ${
                    isSelected ? 'bg-emerald-50/80 border border-emerald-200/60' : 'hover:bg-stone-50 border border-transparent'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#024030] via-[#059669] to-[#10B981] flex items-center justify-center text-white shrink-0 shadow-xs">
                    {renderIconSvg(item.id, true)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-emerald-950 font-bold' : 'text-stone-800'}`}>
                        {item.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug mt-0.5 truncate">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
