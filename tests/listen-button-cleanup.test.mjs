// Regressão: o botão "Ouvir" (ListenButton, usado no /sos e em vários
// lugares do app) criava um <audio> via `new Audio()` e nunca o parava
// quando o componente desmontava (ex.: usuária clica em "voltar"). O áudio
// ficava tocando "fantasma" em segundo plano — clicar em "Ouvir" de novo
// criava um SEGUNDO áudio, tocando por cima do primeiro (duas vozes ao
// mesmo tempo), e o botão voltava a mostrar "Ouvir" em vez de "Pausar"
// porque a instância nova do componente não sabia do áudio órfão.
//
// Teste estático (lê o código-fonte como texto) — mesmo padrão de
// tests/sos-public.test.mjs — porque o projeto não tem framework de teste
// de componente instalado.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = readFileSync(path.join(__dirname, "..", "src", "components", "listen-button.tsx"), "utf8");

test("listen-button: para o áudio ao desmontar (useEffect de cleanup)", () => {
  assert.match(src, /useEffect\(\(\) => \{\s*return \(\) => \{\s*audioRef\.current\?\.pause\(\)/);
});

test("listen-button: existe um singleton compartilhado entre instâncias (currentlyPlaying)", () => {
  assert.match(src, /let currentlyPlaying: HTMLAudioElement \| null = null/);
});

test("listen-button: pausa qualquer áudio tocando antes de iniciar um novo", () => {
  // Tanto no caminho "retomar" (paused -> playing) quanto no "primeiro play"
  // (idle -> playing), tem que checar e pausar o currentlyPlaying anterior
  // antes de dar play no novo — senão dois áudios tocam juntos.
  const occurrences = src.match(/if \(currentlyPlaying && currentlyPlaying !== audioRef\.current\) currentlyPlaying\.pause\(\);/g) ?? [];
  assert.ok(occurrences.length >= 2, `esperava a checagem de currentlyPlaying em pelo menos 2 lugares (retomar + primeiro play), achei ${occurrences.length}`);
});

test("listen-button: cleanup de unmount também limpa a referência do singleton", () => {
  assert.match(src, /return \(\) => \{\s*audioRef\.current\?\.pause\(\);\s*if \(currentlyPlaying === audioRef\.current\) \{\s*currentlyPlaying = null;/);
});

test("listen-button: import do useEffect presente (React precisa dele pro cleanup)", () => {
  assert.match(src, /import \{ useCallback, useEffect, useRef, useState \} from "react";/);
});
