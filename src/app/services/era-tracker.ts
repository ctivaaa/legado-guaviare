import { Injectable, signal } from '@angular/core';
import { JOURNEY_FADE, JourneyEra } from '../data/journey';

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
 * el usuario — el sello flotante, el fondo de color y el indicador tipo rollo
 * de película leen de aquí.
 */
@Injectable({ providedIn: 'root' })
export class EraTracker {
  /** Todas las capas (prólogo + épocas) — para calcular progreso/color. */
  private layersList: readonly JourneyEra[] = [];
  private runwayEl: HTMLElement | null = null;

  /** Solo las épocas con ícono — para el sello de navegación. */
  private readonly navSignal = signal<readonly JourneyEra[]>([]);
  readonly sections = this.navSignal;
  readonly iconEras = this.navSignal;

  readonly activeId = signal<string | null>(null);
  readonly bgColor = signal('#0B1712');
  readonly pageProgress = signal(0);

  private scrollAttached = false;

  /** Se llama una sola vez, desde `app-era-journey`, con su pista de scroll. */
  registerJourney(
    runwayElement: HTMLElement,
    layers: readonly JourneyEra[],
    navEras: readonly JourneyEra[],
  ): void {
    this.runwayEl = runwayElement;
    this.layersList = layers;
    this.navSignal.set(navEras);
    this.attachScrollListener();
  }

  scrollTo(id: string): void {
    if (!this.runwayEl) return;
    const i = this.layersList.findIndex((e) => e.id === id);
    if (i < 0) return;
    const total = this.runwayEl.offsetHeight - window.innerHeight;
    const targetP = Math.min(i / this.layersList.length + JOURNEY_FADE + 0.02, 1);
    window.scrollTo({ top: this.runwayEl.offsetTop + targetP * total, behavior: 'smooth' });
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
    if (!this.runwayEl) return;
    const layers = this.layersList;
    const n = layers.length;
    if (!n) return;

    const offsetTop = this.runwayEl.offsetTop;
    const total = this.runwayEl.offsetHeight - window.innerHeight;
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
