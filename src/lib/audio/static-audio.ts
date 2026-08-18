import { stat } from "node:fs/promises";
import path from "node:path";

// Narrações reais ficam em assets/audio/<id>.mp3. Nem todo audiobook tem
// áudio gravado ainda — checar existência antes de tentar servir.
const STATIC_AUDIO_DIR = path.join(process.cwd(), "assets", "audio");

// Faixas do SOS Desmame Noturno ficam em assets/audio/desmame/<id>.mp3 —
// pasta própria para não colidir com os ids dos audiobooks.
const STATIC_WEANING_AUDIO_DIR = path.join(process.cwd(), "assets", "audio", "desmame");

export function staticAudioPath(id: string): string | null {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  return path.join(STATIC_AUDIO_DIR, `${id}.mp3`);
}

export async function staticAudioExists(id: string): Promise<boolean> {
  const filePath = staticAudioPath(id);
  if (!filePath) return false;
  try {
    const info = await stat(filePath);
    return info.isFile();
  } catch {
    return false;
  }
}

export function staticWeaningAudioPath(id: string): string | null {
  if (!/^[a-z0-9-]+$/.test(id)) return null;
  return path.join(STATIC_WEANING_AUDIO_DIR, `${id}.mp3`);
}
