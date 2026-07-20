"use client";

export function HolographicShowcase() {
  return (
    <section className="relative py-24 px-4 md:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="space-y-12">
        {/* Title with glow */}
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-4">
            <span
              className="holographic-glow"
              style={{
                textShadow:
                  "0 0 20px rgba(0, 217, 255, 0.8), 0 0 40px rgba(0, 153, 255, 0.4), 0 0 60px rgba(196, 0, 255, 0.2)",
              }}
            >
              Holographic Experience
            </span>
          </h2>
          <p className="text-[#8899cc] text-lg">
            Deep obsidian meets neon cyan — premium fintech aesthetic
          </p>
        </div>

        {/* Effects grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Neon card */}
          <div
            className="p-6 rounded-lg backdrop-blur-sm border transition-all hover:scale-105"
            style={{
              background: "rgba(15, 26, 61, 0.6)",
              borderColor: "rgba(0, 217, 255, 0.3)",
              boxShadow:
                "0 0 20px rgba(0, 217, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 30px rgba(0, 217, 255, 0.3), 0 0 60px rgba(0, 153, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.borderColor = "rgba(0, 217, 255, 0.8)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "0 0 20px rgba(0, 217, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "rgba(0, 217, 255, 0.3)";
            }}
          >
            <h3
              className="text-lg font-bold mb-3"
              style={{ color: "#00d9ff", textShadow: "0 0 10px rgba(0, 217, 255, 0.8)" }}
            >
              Neon Glow
            </h3>
            <p className="text-[#8899cc] text-sm">
              Chromatic aberration + text shadow creates premium depth
            </p>
          </div>

          {/* Scanning lines */}
          <div
            className="p-6 rounded-lg backdrop-blur-sm border relative overflow-hidden"
            style={{
              background: "rgba(15, 26, 61, 0.6)",
              borderColor: "rgba(0, 153, 255, 0.3)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  0deg,
                  rgba(0, 217, 255, 0.03) 0px,
                  rgba(0, 217, 255, 0.03) 1px,
                  transparent 1px,
                  transparent 2px
                )`,
                animation: "scan-shift 8s linear infinite",
              }}
            />
            <h3
              className="text-lg font-bold mb-3 relative z-10"
              style={{
                color: "#0099ff",
                textShadow: "0 0 10px rgba(0, 153, 255, 0.8)",
              }}
            >
              Scanning Lines
            </h3>
            <p className="text-[#8899cc] text-sm relative z-10">
              Animated scan effect for authentic CRT aesthetic
            </p>
          </div>

          {/* Data stream */}
          <div
            className="p-6 rounded-lg backdrop-blur-sm border relative overflow-hidden"
            style={{
              background: "rgba(15, 26, 61, 0.6)",
              borderColor: "rgba(196, 0, 255, 0.3)",
            }}
          >
            <div
              className="absolute top-0 left-0 w-full h-0.5 opacity-70"
              style={{
                background: `linear-gradient(90deg, transparent, rgba(196, 0, 255, 0.8), transparent)`,
                animation: "data-flow-down 3s ease-in infinite",
              }}
            />
            <h3
              className="text-lg font-bold mb-3"
              style={{
                color: "#c400ff",
                textShadow: "0 0 10px rgba(196, 0, 255, 0.8)",
              }}
            >
              Violet Streams
            </h3>
            <p className="text-[#8899cc] text-sm">
              Data flow animations suggest active information processing
            </p>
          </div>
        </div>

        {/* Feature blocks */}
        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div
            className="p-8 rounded-lg border"
            style={{
              background: "rgba(10, 14, 39, 0.8)",
              borderColor: "rgba(0, 217, 255, 0.2)",
              backdropFilter: "blur(20px)",
            }}
          >
            <h4
              className="text-xl font-bold mb-3"
              style={{ color: "#00d9ff" }}
            >
              ✦ Deep Obsidian Base
            </h4>
            <p className="text-[#8899cc]">
              #0a0e27 background maximizes contrast for neon accents. Zero
              brightness distraction.
            </p>
          </div>

          <div
            className="p-8 rounded-lg border"
            style={{
              background: "rgba(10, 14, 39, 0.8)",
              borderColor: "rgba(0, 153, 255, 0.2)",
              backdropFilter: "blur(20px)",
            }}
          >
            <h4
              className="text-xl font-bold mb-3"
              style={{ color: "#0099ff" }}
            >
              ✦ Luminous Accents
            </h4>
            <p className="text-[#8899cc]">
              Neon cyan (#00d9ff) + electric blue (#0099ff) + vivid violet
              (#c400ff) create premium perceived value.
            </p>
          </div>

          <div
            className="p-8 rounded-lg border"
            style={{
              background: "rgba(10, 14, 39, 0.8)",
              borderColor: "rgba(196, 0, 255, 0.2)",
              backdropFilter: "blur(20px)",
            }}
          >
            <h4
              className="text-xl font-bold mb-3"
              style={{ color: "#c400ff" }}
            >
              ✦ Textural Depth
            </h4>
            <p className="text-[#8899cc]">
              Chromatic aberration, scan lines, particle grids, and data streams
              create layered visual complexity.
            </p>
          </div>

          <div
            className="p-8 rounded-lg border"
            style={{
              background: "rgba(10, 14, 39, 0.8)",
              borderColor: "rgba(0, 217, 255, 0.2)",
              backdropFilter: "blur(20px)",
            }}
          >
            <h4
              className="text-xl font-bold mb-3"
              style={{ color: "#00ffff" }}
            >
              ✦ Interactive Feedback
            </h4>
            <p className="text-[#8899cc]">
              Hover states amplify glow. Buttons shimmer. Cards pulse. Every
              interaction feels premium.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan-shift {
          0% { transform: translateY(0); }
          100% { transform: translateY(10px); }
        }
        @keyframes data-flow-down {
          0% {
            transform: translateY(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(100%);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
