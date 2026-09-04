export default function RetroBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-retro-darker">
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg grid-bg-animated opacity-60" />

      {/* Perspective floor */}
      <div className="absolute bottom-0 left-0 right-0 h-[50vh] overflow-hidden">
        <div className="perspective-floor absolute bottom-0 left-[-50%] right-[-50%] h-[60vh]" />
      </div>

      {/* Sun orb */}
      <div className="absolute left-1/2 top-[12%] -translate-x-1/2">
        <div className="relative h-48 w-48 sm:h-64 sm:w-64">
          {/* Glow */}
          <div className="absolute inset-0 rounded-full bg-accent opacity-30 blur-3xl animate-glow-pulse" />
          {/* Sun gradient */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(180deg, #f0c36d 0%, #c04e74 60%, #9e617c 100%)',
            }}
          />
          {/* Retro stripes on bottom half */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden rounded-b-full">
            <div className="sun-stripes absolute inset-0" />
          </div>
        </div>
      </div>

      {/* Floating decorative rings */}
      <div className="absolute right-[8%] top-[20%] hidden sm:block">
        <div className="h-24 w-24 rounded-full border-2 border-accent opacity-20 animate-spin-slow" />
      </div>
      <div className="absolute left-[6%] top-[35%] hidden sm:block">
        <div className="h-16 w-16 rounded-full border border-retro-teal opacity-20 animate-spin-reverse-slow" />
      </div>
      <div className="absolute right-[12%] bottom-[20%] hidden md:block">
        <div className="h-12 w-12 rounded-full border-2 border-retro-gold opacity-30 animate-float-slow" />
      </div>

      {/* Scan line */}
      <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <div className="absolute left-0 right-0 h-[2px] bg-accent opacity-30 animate-scan-line" style={{ boxShadow: '0 0 20px 2px rgba(158,97,124,0.5)' }} />
      </div>

      {/* Noise overlay */}
      <div className="noise-overlay absolute inset-0 z-30" />

      {/* Vignette */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(13,7,13,0.7) 100%)',
        }}
      />
    </div>
  );
}
