export function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === step ? "w-6 bg-sage-500" : "w-2 bg-sage-200"
          }`}
        />
      ))}
    </div>
  );
}
