export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4 bg-[#FAF7F2]">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-gold-primary/30 border-t-gold-deep animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-gold-primary/40 animate-pulse" />
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="font-serif text-lg tracking-wider text-stone-800 uppercase">
          Salon EyeLines
        </p>
        <p className="text-[11px] uppercase tracking-[0.25em] text-gold-deep font-semibold animate-pulse">
          Loading Experience...
        </p>
      </div>
    </div>
  );
}
