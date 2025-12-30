// src/lib/analytics.ts
// Cliente puro — não usa process/import.meta diretamente
// (Next injeta envs NEXT_PUBLIC_* no bundle, mas pra manter "cliente puro",
// você pode passar o pixelId por parâmetro usando setPixelIdRuntime.)

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
    __manePixels?: {
      loadedIds: Set<string>;
      activeId?: string;      // aqui agora é o pixel global ativo
      scriptLoaded?: boolean;
      debug?: boolean;
      pixelId?: string;       // pixel global runtime
    };
  }
}

const dlog = (...a: any[]) =>
  typeof window !== 'undefined' &&
  window.__manePixels?.debug &&
  console.log('[analytics]', ...a);

// ✅ Pixel global (sem unidade)
// 1) preferência: pixelId setado em runtime via setPixelIdRuntime
// 2) fallback: NEXT_PUBLIC_META_PIXEL_ID (se o bundler tiver injetado)
// 3) senão: vazio
function getPixelId(): string {
  if (typeof window !== 'undefined' && window.__manePixels?.pixelId) {
    return window.__manePixels.pixelId;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const envPixel = (globalThis as any)?.process?.env?.NEXT_PUBLIC_META_PIXEL_ID;
  return (envPixel || '').toString().trim();
}

// Permite setar/alterar o pixel sem “regras de unidade”
export function setPixelIdRuntime(pixelId?: string | null) {
  if (typeof window === 'undefined') return;
  window.__manePixels = window.__manePixels || { loadedIds: new Set() };
  window.__manePixels.pixelId = (pixelId || '').trim() || undefined;
  dlog('runtime pixelId set to', window.__manePixels.pixelId);
}

function ensureMetaScript() {
  if (typeof window === 'undefined') return;
  window.__manePixels = window.__manePixels || { loadedIds: new Set() };
  if (window.__manePixels.scriptLoaded) return;

  if (!window.fbq) {
    (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    dlog('fbq stubbed by analytics.ts (fallback)');
  }

  window.__manePixels.scriptLoaded = true;
}

// Garante bootstrap mínimo (fbq stub + dataLayer) sem reinjetar nada duplicado
export function ensureAnalyticsReady(opts?: { pixelId?: string; debug?: boolean }) {
  try {
    ensureMetaScript();

    window.__manePixels = window.__manePixels || { loadedIds: new Set() };
    if (typeof opts?.debug === 'boolean') window.__manePixels.debug = opts.debug;

    // se você quiser setar por parâmetro (sem depender de env)
    if (opts?.pixelId) setPixelIdRuntime(opts.pixelId);

    (window as any).dataLayer = (window as any).dataLayer || [];

    // ✅ inicializa o pixel global (se tiver id)
    const pixelId = getPixelId();
    if (pixelId) {
      ensurePixel(pixelId);
      window.__manePixels.activeId = pixelId;
    } else {
      dlog('no global pixelId found (set NEXT_PUBLIC_META_PIXEL_ID or setPixelIdRuntime)');
    }

    dlog('ensureAnalyticsReady: ok');
  } catch (e) {
    console.warn('ensureAnalyticsReady error', e);
  }
}

function ensurePixel(pixelId: string) {
  ensureMetaScript();
  if (!pixelId) return;

  window.__manePixels = window.__manePixels || { loadedIds: new Set() };

  if (!window.__manePixels.loadedIds.has(pixelId)) {
    dlog('fbq init', pixelId);
    window.fbq?.('init', pixelId);
    window.__manePixels.loadedIds.add(pixelId);

    // 🔵 importante para aparecer no Pixel Helper:
    try {
      window.fbq?.('trackSingle', pixelId, 'PageView');
      dlog('trackSingle PageView sent for', pixelId);
    } catch (e) {
      console.warn('trackSingle PageView error', e);
    }
  } else {
    dlog('pixel already initialized', pixelId);
  }
}

function fbqTrackCustomGlobal(eventName: string, payload: any) {
  if (!window.fbq) { dlog('fbq missing on track', eventName, payload); return; }

  const pixelId = getPixelId() || window.__manePixels?.activeId;
  if (pixelId) {
    dlog('trackSingle', eventName, '→', pixelId, payload);
    window.fbq('trackSingle', pixelId, eventName, payload);
  } else {
    dlog('trackCustom (no pixelId)', eventName, payload);
    window.fbq('trackCustom', eventName, payload);
  }
}

// ===== Eventos =====
export type ReservationEvent = {
  reservationCode?: string | null;
  fullName?: string | null;
  email?: string | null;
  phone?: string | null;
  unit?: string | null;
  area?: string | null;
  status?: string | null;
  source?: string | null;
};

function norm(v?: string | null) {
  return (v || '').trim();
}

export async function trackReservationMade(ev: ReservationEvent) {
  const payload = {
    reservation_code: norm(ev.reservationCode),
    full_name: norm(ev.fullName),
    email: norm(ev.email),
    phone: norm(ev.phone),
    unit: norm(ev.unit),
    area: norm(ev.area),
    status: norm(ev.status),
    source: norm(ev.source),
  };
  fbqTrackCustomGlobal('Reservation Made', payload);
  (window as any).dataLayer?.push({ event: 'reservation_made', ...payload });
}

export async function trackReservationCheckin(ev: ReservationEvent) {
  const payload = {
    reservation_code: norm(ev.reservationCode),
    full_name: norm(ev.fullName),
    email: norm(ev.email),
    phone: norm(ev.phone),
    unit: norm(ev.unit),
    area: norm(ev.area),
    status: norm(ev.status),
    source: norm(ev.source),
  };
  fbqTrackCustomGlobal('Reservation Checkin', payload);
  (window as any).dataLayer?.push({ event: 'reservation_checkin', ...payload });
}
