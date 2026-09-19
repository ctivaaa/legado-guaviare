import { Injectable, effect, inject, signal } from '@angular/core';
import { EraTracker } from './era-tracker';

/**
 * Sonido ambiente por época, con crossfade automático al cambiar de sección.
 *
 * Todavía no tenemos los audios grabados, así que `SOURCES` está vacío: el
 * servicio queda completamente cableado (mute, crossfade, cambio por época)
 * pero no reproduce nada — es un no-op seguro. Cuando existan los archivos,
 * colócalos en `public/audio/<id>.mp3` y agrega la entrada aquí, ej.:
 *   raices: 'audio/raices.mp3',
 * usando los mismos ids que las épocas en `era-tracker.ts` (raices, bonanza,
 * exodo, flota, infancia, hoy, closing).
 */
const SOURCES: Partial<Record<string, string>> = {};

const FADE_MS = 1200;
const BASE_VOLUME = 0.5;

@Injectable({ providedIn: 'root' })
export class AmbientAudio {
  private readonly tracker = inject(EraTracker);

  readonly muted = signal(true);
  readonly available = Object.keys(SOURCES).length > 0;

  private current: HTMLAudioElement | null = null;
  private currentEra: string | null = null;
  private fadeHandle = 0;

  constructor() {
    if (!this.available || typeof Audio === 'undefined') return;

    effect(() => {
      const id = this.tracker.activeId();
      if (id) this.playEra(id);
    });
  }

  toggleMute(): void {
    if (!this.available) return;
    this.muted.update((m) => !m);
    if (this.muted()) {
      this.current?.pause();
    } else {
      this.current?.play().catch(() => {});
    }
  }

  private playEra(id: string): void {
    const src = SOURCES[id];
    if (!src || id === this.currentEra) return;
    this.currentEra = id;

    const next = new Audio(src);
    next.loop = true;
    next.volume = 0;
    if (!this.muted()) next.play().catch(() => {});

    this.crossfade(this.current, next);
    this.current = next;
  }

  private crossfade(from: HTMLAudioElement | null, to: HTMLAudioElement): void {
    cancelAnimationFrame(this.fadeHandle);
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min((now - start) / FADE_MS, 1);
      if (from) from.volume = BASE_VOLUME * (1 - t);
      to.volume = this.muted() ? 0 : BASE_VOLUME * t;
      if (t < 1) {
        this.fadeHandle = requestAnimationFrame(step);
      } else {
        from?.pause();
      }
    };
    this.fadeHandle = requestAnimationFrame(step);
  }
}
