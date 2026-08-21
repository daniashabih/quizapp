import KineticGrid from "@/components/ui/kinetic-grid";
import { Sparkles, Touchpad, MousePointer2 } from "lucide-react";

export default function KineticGridDemo() {
  return (
    <KineticGrid globalColor="default" ambientMovement={true}>
      <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 py-12 sm:px-6 md:px-8 text-center">
        {/* Responsive Pill Badge */}
        <div className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] sm:text-xs font-medium tracking-wide text-white/80 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>Interactive Canvas Experience</span>
        </div>

        {/* Responsive Heading */}
        <h1 className="max-w-xs sm:max-w-xl md:max-w-2xl text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white leading-[1.15]">
          Move your cursor. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
            Tap or drag anywhere.
          </span>
        </h1>

        {/* Responsive Subtitle */}
        <p className="mt-3 sm:mt-4 max-w-xs sm:max-w-md text-sm sm:text-base text-white/60 leading-relaxed">
          A dynamic kinetic grid that warps toward touch & pointer inputs, propagating fluid shockwaves on every tap or click.
        </p>

        {/* Mobile / Desktop Interaction Hints */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-white/50">
          <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.07] px-2.5 py-1.5 border border-white/10">
            <MousePointer2 className="w-3.5 h-3.5 text-sky-300" />
            <span className="hidden sm:inline">Desktop: Hover & Click</span>
            <span className="sm:hidden">Pointer & Hover</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.07] px-2.5 py-1.5 border border-white/10">
            <Touchpad className="w-3.5 h-3.5 text-sky-300" />
            <span>Mobile: Touch & Drag</span>
          </span>
        </div>
      </div>
    </KineticGrid>
  );
}
