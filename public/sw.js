// NutriMãe Service Worker — cache de áudio do Manual S.O.S.
// Só cacheia áudios do S.O.S. para funcionar offline.

const SOS_AUDIO_CACHE = "nutrimae-sos-audio-v1";

// Cache-first para URLs do SOS audio
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Só interceptar requisições de áudio do SOS
  if (url.pathname.startsWith("/api/tts/sos/")) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;

        return fetch(event.request).then((response) => {
          // Cachear a resposta para uso offline
          if (response.ok) {
            const cloned = response.clone();
            caches.open(SOS_AUDIO_CACHE).then((cache) => {
              cache.put(event.request, cloned);
            });
          }
          return response;
        }).catch(() => {
          // Offline e sem cache — retornar resposta vazia
          return new Response(null, { status: 503, statusText: "Offline" });
        });
      })
    );
  }
});

// Limpar caches antigos ao ativar nova versão
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== SOS_AUDIO_CACHE)
          .map((name) => caches.delete(name))
      )
    )
  );
});
