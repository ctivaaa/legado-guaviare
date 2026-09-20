import { Injectable, computed, signal } from '@angular/core';
import { JourneyEra, chapterProgress } from '../data/journey';

/** Cuánto se recuerda el destino de una pulsación mientras dura el scroll suave. */
const PENDING_MS = 900;

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const n = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(c1: string, c2: string, t: number): string {
  const a = hexToRgb(c1);
  const b = hexToRgb(c2);
  const l = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${l(a[0], b[0])}, ${l(a[1], b[1])}, ${l(a[2], b[2])})`;
}

/**
 * Ya no hay una sección por época: todas viven como ventanas dentro de la
 * escena continua (`app-era-journey`), que arranca desde el propio hero. Este
 * servicio lee el progreso de esa única escena para saber en qué época está
 * el usuario — el panel de épocas y el fondo de color leen de aquí.
 */
@Injectable({ providedIn: 'root' })
export class EraTracker {
  /** Todas las capas (prólogo + épocas) — para calcular progreso/color. */
  private layersList: readonly JourneyEra[] = [];
  private runwayEl: HTMLElement | null = null;

  /** Las mismas capas, expuestas como señal — para el panel de navegación. */
  readonly layers = signal<readonly JourneyEra[]>([]);

  readonly activeId = signal<string | null>(null);
  readonly activeIndex = computed(() =>
    Math.max(0, this.layers().findIndex((e) => e.id === this.activeId())),
  );
  readonly bgColor = signal('#0B1712');
  readonly pageProgress = signal(0);

  private scrollAttached = false;
  private pendingIndex: number | null = null;
  private pendingTimer = 0;

  /**
   * La pista registrada, o —si el DOM se recreó (recarga en caliente en
   * desarrollo) y el elemento guardado ya no está en la página— la que haya
   * ahora. Sin esto el contador de épocas se queda congelado en la primera.
   */
  private runway(): HTMLElement | null {
    if (this.runwayEl && !this.runwayEl.isConnected) {
      this.runwayEl = document.querySelector<HTMLElement>('.journey-runway');
    }
    return this.runwayEl;
  }

  /** Se llama una sola vez, desde `app-era-journey`, con su pista de scroll. */
  registerJourney(runwayElement: HTMLElement, layers: readonly JourneyEra[]): void {
    this.runwayEl = runwayElement;
    this.layersList = layers;
    this.layers.set(layers);
    this.attachScrollListener();
  }

  scrollTo(id: string): void {
    this.scrollToIndex(this.layersList.findIndex((e) => e.id === id));
  }

  /**
   * Avanza (+1) o retrocede (-1) un capítulo — lo usa el teclado. Si se pulsa
   * varias veces mientras el scroll suave aún corre, `activeIndex` todavía no
   * se movió; por eso se parte del destino pendiente y no de la época actual,
   * o la segunda pulsación no haría nada. Devuelve false si no hay a dónde ir
   * (para dejar que el navegador haga su scroll normal).
   */
  step(delta: 1 | -1): boolean {
    const base = this.pendingIndex ?? Math.max(0, this.layersList.findIndex((e) => e.id === this.activeId()));
    const next = base + delta;
    if (next < 0 || next >= this.layersList.length) return false;

    this.pendingIndex = next;
    clearTimeout(this.pendingTimer);
    this.pendingTimer = window.setTimeout(() => (this.pendingIndex = null), PENDING_MS);
    this.scrollToIndex(next);
    return true;
  }

  private scrollToIndex(i: number): void {
    const runway = this.runway();
    if (!runway || i < 0 || i >= this.layersList.length) return;
    const total = runway.offsetHeight - window.innerHeight;
    const targetP = chapterProgress(i, this.layersList.length);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: runway.offsetTop + targetP * total,
      behavior: reduced ? 'auto' : 'smooth',
    });
  }

  private attachScrollListener(): void {
    if (this.scrollAttached || typeof window === 'undefined') return;
    this.scrollAttached = true;
    const update = () => this.update();
    window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  private update(): void {
    const runway = this.runway();
    if (!runway) return;
    const layers = this.layersList;
    const n = layers.length;
    if (!n) return;

    const offsetTop = runway.offsetTop;
    const total = runway.offsetHeight - window.innerHeight;
    const p = total > 0 ? Math.min(Math.max((window.scrollY - offsetTop) / total, 0), 1) : 0;

    const idxF = p * n;
    const idx = Math.min(Math.max(Math.floor(idxF), 0), n - 1);
    const localT = Math.min(Math.max(idxF - idx, 0), 1);

    const cur = layers[idx];
    const next = layers[idx + 1];
    this.bgColor.set(lerpColor(cur.accent2, next ? next.accent2 : cur.accent2, localT));

    this.activeId.set(cur.id);

    if (typeof document !== 'undefined') {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      this.pageProgress.set(max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0);
    }
  }
}
