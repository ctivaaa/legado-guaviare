import { Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ScrollScrub } from '../../directives/scroll-scrub';
import { LazyPlay } from '../../directives/lazy-play';
import { EraTracker } from '../../services/era-tracker';
import { Closing } from '../closing/closing';
import { JOURNEY_FADE, JOURNEY_LAYERS, JourneyEra, chapterProgress } from '../../data/journey';
import { PLACEHOLDERS } from '../../data/placeholders';

const FADE = JOURNEY_FADE;

/**
 * Una sola escena anclada que arranca en el propio hero y atraviesa las seis
 * épocas como una transformación continua (fondo, velo de color, titular,
 * testimonio) — sin costura entre "entrar al sitio" y "empezar la historia".
 * El scroll controla en qué punto de la mezcla estás; cada capa ocupa una
 * fracción igual del recorrido con una zona de disolución (`FADE`) hacia la
 * siguiente.
 */
@Component({
  selector: 'app-era-journey',
  host: { '(document:keydown)': 'onKeydown($event)' },
  imports: [ScrollScrub, NgOptimizedImage, LazyPlay, Closing],
  templateUrl: './era-journey.html',
  styleUrl: './era-journey.css',
})
export class EraJourney {
  /** False mientras la pantalla de inicio está encima: el teclado no debe mover la escena. */
  readonly active = input(true);

  protected readonly eras = JOURNEY_LAYERS;
  protected readonly fade = FADE;
  /** Posiciones (izquierda %) del polvo ambiental que flota dentro de cada capa. */
  protected readonly dust = [8, 22, 38, 52, 66, 80, 92];

  /** El cierre no es una época con texto propio: es la pantalla de créditos. */
  protected readonly closingIndex = this.eras.findIndex((e) => e.id === 'cierre');
  protected readonly closingEra = this.eras[this.closingIndex] as JourneyEra | undefined;

  private readonly scrub = viewChild.required(ScrollScrub);
  private readonly runwayRef = viewChild.required<ElementRef<HTMLElement>>('runway');
  private readonly tracker = inject(EraTracker);

  /** Pantalla de celular: se usan los videos y pósters ligeros, recortados en vertical (assets/m/). */
  protected readonly mobile = signal(false);
  /** Ahorro de datos o conexión 2G: no se descargan ni reproducen videos, solo el póster. */
  protected readonly lowData = signal(false);

  /** True desde que empieza a fundirse el cierre — antes de eso está inerte. */
  protected readonly closingActive = computed(
    () => this.scrub().progress() >= this.windowStart(this.closingIndex) - this.fade,
  );

  /** Una vez true, se queda así: dispara la entrada "de golpe" del titular de la flota. */
  protected readonly flotaHit = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.tracker.registerJourney(this.runwayRef().nativeElement, this.eras);

      const mql = matchMedia('(max-width: 640px)');
      this.mobile.set(mql.matches);
      const onChange = (e: MediaQueryListEvent) => this.mobile.set(e.matches);
      mql.addEventListener('change', onChange);
      destroyRef.onDestroy(() => mql.removeEventListener('change', onChange));

      const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
      this.lowData.set(!!conn?.saveData || ['slow-2g', '2g'].includes(conn?.effectiveType ?? ''));
    });

    effect(() => {
      const p = this.scrub().progress();
      const flotaIndex = this.eras.findIndex((e) => e.id === 'flota');
      if (flotaIndex < 0) return;
      if (p > this.windowStart(flotaIndex)) {
        this.flotaHit.set(true);
      }
    });
  }

  /**
   * Navegación por teclado, como en un sitio normal pero por capítulos: cada
   * capítulo mide más de una pantalla de scroll, así que la flecha nativa (~40px)
   * casi no se nota. Home/End se dejan al navegador, que ya hace lo correcto.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.active() || event.defaultPrevented || event.repeat || event.ctrlKey || event.altKey || event.metaKey) return;

    let delta: 1 | -1;
    switch (event.key) {
      case 'ArrowDown':
      case 'PageDown':
        delta = 1;
        break;
      case 'ArrowUp':
      case 'PageUp':
        delta = -1;
        break;
      case ' ':
        delta = event.shiftKey ? -1 : 1;
        break;
      default:
        return;
    }

    const target = event.target instanceof HTMLElement ? event.target : null;
    // Campos de texto y listas usan estas teclas para lo suyo.
    if (target?.closest('input, textarea, select, [contenteditable="true"], [role="listbox"]')) return;
    // Espacio sobre un botón/enlace es "activarlo", no "avanzar".
    if (event.key === ' ' && target?.closest('button, a, summary, [role="button"]')) return;

    if (this.tracker.step(delta)) event.preventDefault();
  }

  protected windowStart(i: number): number {
    return i / this.eras.length;
  }

  protected windowEnd(i: number): number {
    return (i + 1) / this.eras.length;
  }

  /** Ruta del archivo según el dispositivo: en celular, la versión ligera de assets/m/. */
  private mediaPath(path: string): string {
    return this.mobile() ? path.replace('assets/', 'assets/m/') : path;
  }

  protected videoSrc(era: JourneyEra): string | null {
    return era.video ? this.mediaPath(era.video) : null;
  }

  protected posterSrc(era: JourneyEra): string {
    return this.mediaPath(era.image);
  }

  /** Miniatura incrustada (se ve al instante) que rellena el fondo hasta que llegue el póster. */
  protected placeholder(era: JourneyEra): string | null {
    const ph = PLACEHOLDERS[era.image];
    return ph ? `url(${this.mobile() ? ph.v : ph.h})` : null;
  }

  /** Dónde (0→1) queda en reposo el capítulo `i`: ancla del scroll táctil. */
  protected snapAt(i: number): number {
    return chapterProgress(i, this.eras.length);
  }

  /** Empieza a descargar el video del capítulo siguiente antes de que se vea, para
   * que al llegar a él ya esté listo y no se quede el póster esperando en celular. */
  protected isPreload(i: number): boolean {
    const p = this.scrub().progress();
    return p >= this.windowStart(i) - 1 / this.eras.length - this.fade && p <= this.windowEnd(i) + this.fade;
  }

  /** Solo esta época (o la que se está cruzando con ella en el fundido) debe
   * tener su video reproduciéndose — así nunca hay más de 1-2 decodificando
   * a la vez, sin importar cuántas épocas con video existan. */
  protected isNear(i: number): boolean {
    const p = this.scrub().progress();
    return p >= this.windowStart(i) - this.fade && p <= this.windowEnd(i) + this.fade;
  }
}
