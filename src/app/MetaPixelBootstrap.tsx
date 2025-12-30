// src/app/MetaPixelBootstrap.tsx
'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export default function MetaPixelBootstrap() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const W = window as any;

    // Estado global do pixel
    W.__manePixels = W.__manePixels || {
      loadedIds: new Set<string>(),
      activeId: undefined as string | undefined,
      scriptLoaded: false,
      debug: false,
      pixelId: undefined as string | undefined, // opcional (runtime)
    };

    // ✅ Debug só fora de produção (ou habilite via env)
    // Se você criou NEXT_PUBLIC_PIXEL_DEBUG=1, use isso:
    const envDebug =
      (typeof process !== 'undefined' &&
        (process as any)?.env?.NEXT_PUBLIC_PIXEL_DEBUG === '1') ||
      false;

    W.__manePixels.debug = envDebug || process.env.NODE_ENV !== 'production';

    const dlog = (...a: any[]) =>
      W.__manePixels?.debug && console.log('[MetaPixelBootstrap]', ...a);

    // Se já existe fbq, não reinjeta nada
    if (!W.fbq) {
      (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(W, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      W.__manePixels.scriptLoaded = true;
      dlog('fbq stubbed & fbevents.js injected');
    } else {
      dlog('fbq already present');
      W.__manePixels.scriptLoaded = true;
    }

    // ❌ NÃO dispara PageView aqui.
    // Quem dispara:
    // - ensureAnalyticsReady() (init + trackSingle PageView)
    // - e/ou componente de PageView por rota (usePathname)
  }, []);

  // Script vazio apenas para garantir strategy afterInteractive
  return <Script id="meta-fbq-bootstrap" strategy="afterInteractive">{''}</Script>;
}
