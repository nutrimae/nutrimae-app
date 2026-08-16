"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setMessage(msg);
    setVisible(true);
    timeoutRef.current = setTimeout(() => setVisible(false), 2000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4 transition-[opacity,transform] duration-200 ease-in-out ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
        }`}
      >
        {message && (
          <div className="flex items-center gap-2 rounded-full bg-brown-800 px-5 py-3 text-sm font-semibold text-white shadow-[var(--shadow-strong)]">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-sage-400" strokeWidth={2.5} />
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
  return ctx;
}
