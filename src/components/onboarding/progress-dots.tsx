export function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === step ? "w-7 bg-primary-500" : i < step ? "w-2 bg-primary-300" : "w-2 bg-primary-100"
          }`}
        />
      ))}
    </div>
  );
}
