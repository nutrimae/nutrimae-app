import Link from "next/link";
import { Headphones, Clock } from "lucide-react";
import { BackButton } from "@/components/back-button";
import { MedicalDisclaimerFooter } from "@/components/medical-disclaimer-footer";
import { AUDIOBOOKS } from "@/lib/audiobooks";

export default function AudiobooksPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-5 px-4 py-6">
      <BackButton />

      <div>
        <h1 className="font-heading text-2xl font-bold text-brown-800">Audiobooks</h1>
        <p className="mt-1 text-brown-700">
          Conteúdos rápidos para ouvir (ou ler) enquanto amamenta, dirige ou tem as mãos
          ocupadas.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {AUDIOBOOKS.map((book) => (
          <Link
            key={book.id}
            href={`/app/audiobooks/${book.id}`}
            className="flex items-center gap-3 rounded-2xl bg-white/80 p-4 shadow-sm shadow-brown-900/5 active:bg-sage-50"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100">
              <Headphones className="h-6 w-6 text-primary-600" strokeWidth={1.75} />
            </div>
            <div>
              <p className="font-heading font-bold text-brown-800">{book.title}</p>
              <p className="mt-0.5 text-sm text-brown-700">{book.subtitle}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-brown-700/86">
                <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                {book.estimatedMinutes} min
                {!book.hasAudio && " · só leitura por enquanto"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <MedicalDisclaimerFooter />
    </main>
  );
}
