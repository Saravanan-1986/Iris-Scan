import React from 'react';

export default function GlassHero() {
  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96">
      {/* Background neon gradient */}
      <div className="absolute inset-0 rounded-card overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#7c3aed,_#06b6d4_40%,_transparent_70%)] opacity-80 mix-blend-screen" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_#ec4899,_#7c3aed_30%,_transparent_60%)] opacity-70 mix-blend-screen" />

        {/* floating blurred blobs */}
        <div className="neon-blob left-0 -top-6 w-40 h-40 bg-gradient-to-br from-[#8b5cf6] to-[#06b6d4] opacity-60" />
        <div className="neon-blob right-0 -bottom-6 w-44 h-44 bg-gradient-to-br from-[#ec4899] to-[#7c3aed] opacity-60" />
        <div className="neon-blob -right-8 top-16 w-28 h-28 bg-gradient-to-br from-[#06b6d4] to-[#34d399] opacity-50" />

        {/* Glass panel */}
        <div className="glass-card relative z-10 w-64 h-64 sm:w-80 sm:h-80 rounded-card p-4 flex items-center justify-center">
          <div className="w-full h-full rounded-card border border-white/10 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-primary" />
              </div>
              <h3 className="text-white text-lg font-medium">IrisScan</h3>
              <p className="text-sm text-white/80 mt-1">AI-powered iris screening</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
