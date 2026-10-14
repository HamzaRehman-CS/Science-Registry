// Custom 2D illustrated stickers & cartoon mascots for the Roast & Toast portal

export function TeaCatSticker({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Background shadow badge */}
      <circle cx="60" cy="60" r="54" fill="#FEF08A" stroke="#0F172A" strokeWidth="4" />
      {/* Cat head */}
      <path d="M30 42L42 65C42 65 50 60 60 60C70 60 78 65 78 65L90 42C90 42 94 85 60 88C26 85 30 42 30 42Z" fill="#F8FAFC" stroke="#0F172A" strokeWidth="3.5" strokeLinejoin="round" />
      {/* Cat ears pink inside */}
      <path d="M38 48L44 60C44 60 48 58 52 58" fill="#F472B6" />
      <path d="M82 48L76 60C76 60 72 58 68 58" fill="#F472B6" />
      {/* Cool 8-bit / cool sunglasses */}
      <rect x="36" y="58" width="20" height="14" rx="2" fill="#0F172A" />
      <rect x="64" y="58" width="20" height="14" rx="2" fill="#0F172A" />
      <rect x="56" y="62" width="8" height="4" fill="#0F172A" />
      {/* Glasses shine */}
      <path d="M39 61L44 61" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      <path d="M67 61L72 61" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
      {/* Whiskers */}
      <path d="M22 66L34 68M20 74L34 72M100 66L86 68M102 74L86 72" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Tea Cup */}
      <rect x="68" y="76" width="26" height="20" rx="4" fill="#0284C7" stroke="#0F172A" strokeWidth="3" />
      {/* Cup handle */}
      <path d="M94 80C99 80 102 84 102 87C102 90 99 94 94 94" stroke="#0F172A" strokeWidth="3" fill="none" />
      {/* Steam */}
      <path d="M74 72C73 68 76 66 75 62" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 3" />
      <path d="M82 72C81 68 84 66 83 62" stroke="#0EA5E9" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 3" />
      {/* Badge text banner */}
      <rect x="25" y="94" width="70" height="18" rx="6" fill="#F97316" stroke="#0F172A" strokeWidth="2.5" />
      <text x="60" y="106" fill="#FFFFFF" fontSize="9" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">CHAI & TEA ☕</text>
    </svg>
  );
}

export function PopcornDramaSticker({ className = "w-20 h-20" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Popcorn box */}
      <path d="M38 48L44 104H76L82 48H38Z" fill="#EF4444" stroke="#0F172A" strokeWidth="3.5" />
      {/* White stripes */}
      <path d="M48 48L52 104H58L55 48H48Z" fill="#FFFFFF" />
      <path d="M62 48L64 104H70L69 48H62Z" fill="#FFFFFF" />
      {/* Popcorn puffs */}
      <circle cx="44" cy="42" r="10" fill="#FEF08A" stroke="#0F172A" strokeWidth="3" />
      <circle cx="60" cy="36" r="12" fill="#FDE047" stroke="#0F172A" strokeWidth="3" />
      <circle cx="76" cy="42" r="10" fill="#FEF08A" stroke="#0F172A" strokeWidth="3" />
      <circle cx="52" cy="45" r="9" fill="#FFFBEB" stroke="#0F172A" strokeWidth="2.5" />
      <circle cx="68" cy="45" r="9" fill="#FFFBEB" stroke="#0F172A" strokeWidth="2.5" />
      {/* Eyes on popcorn box */}
      <circle cx="52" cy="72" r="5" fill="#0F172A" />
      <circle cx="68" cy="72" r="5" fill="#0F172A" />
      <circle cx="54" cy="70" r="1.5" fill="#FFFFFF" />
      <circle cx="70" cy="70" r="1.5" fill="#FFFFFF" />
      {/* Smug mouth */}
      <path d="M56 82C58 85 62 85 64 82" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" />
      {/* Floating Sparkles */}
      <path d="M25 35L28 28L35 25L28 22L25 15L22 22L15 25L22 28L25 35Z" fill="#F59E0B" />
      <path d="M96 30L98 25L103 23L98 21L96 16L94 21L89 23L94 25L96 30Z" fill="#F59E0B" />
      {/* Little tag */}
      <rect x="32" y="10" width="56" height="16" rx="4" fill="#3B82F6" stroke="#0F172A" strokeWidth="2.5" />
      <text x="60" y="21" fill="#FFFFFF" fontSize="8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">SPICY DRAMA 🍿</text>
    </svg>
  );
}

export function SpicyChiliSticker({ className = "w-18 h-18" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M65 18C65 18 55 12 45 16C40 18 38 24 42 28" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
      {/* Chili Body */}
      <path d="M42 26C52 26 65 35 68 52C72 72 50 88 42 92C40 92 38 88 40 82C44 70 34 60 30 48C26 36 32 26 42 26Z" fill="#DC2626" stroke="#0F172A" strokeWidth="3.5" />
      {/* Chili highlight */}
      <path d="M38 36C36 44 40 55 46 62" stroke="#F87171" strokeWidth="3" strokeLinecap="round" />
      {/* Cool sunglasses on chili */}
      <rect x="36" y="42" width="12" height="8" rx="2" fill="#0F172A" />
      <rect x="52" y="44" width="12" height="8" rx="2" fill="#0F172A" />
      <rect x="47" y="45" width="6" height="3" fill="#0F172A" />
      {/* Tongue sticking out */}
      <path d="M48 58C52 64 56 62 58 58" stroke="#0F172A" strokeWidth="2" fill="#F43F5E" />
    </svg>
  );
}

export function AnonymousGhostSticker({ className = "w-16 h-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Ghost body */}
      <path d="M25 50C25 35 36 24 50 24C64 24 75 35 75 50V78L67 72L58 78L50 72L42 78L33 72L25 78V50Z" fill="#F1F5F9" stroke="#0F172A" strokeWidth="3.5" strokeLinejoin="round" />
      {/* Detective hat */}
      <path d="M30 25H70" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
      <path d="M38 25C38 16 42 12 50 12C58 12 62 16 62 25H38Z" fill="#334155" stroke="#0F172A" strokeWidth="3" />
      <rect x="38" y="21" width="24" height="4" fill="#F59E0B" />
      {/* Secret glasses / mask */}
      <rect x="34" y="40" width="14" height="10" rx="3" fill="#0F172A" />
      <rect x="52" y="40" width="14" height="10" rx="3" fill="#0F172A" />
      <rect x="46" y="43" width="8" height="3" fill="#0F172A" />
      {/* Mouth */}
      <circle cx="50" cy="58" r="3" fill="#0F172A" />
    </svg>
  );
}
