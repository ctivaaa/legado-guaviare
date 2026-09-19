import { Component, ElementRef, afterNextRender, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ScrollScrub } from '../../directives/scroll-scrub';
import { LazyPlay } from '../../directives/lazy-play';
import { EraTracker } from '../../services/era-tracker';
import { Closing } from '../closing/closing';
import { JOURNEY_FADE, JOURNEY_LAYERS, JourneyEra } from '../../data/journey';

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

  /** True desde que empieza a fundirse el cierre — antes de eso está inerte. */
  protected readonly closingActive = computed(
    () => this.scrub().progress() >= this.windowStart(this.closingIndex) - this.fade,
  );

  /** Una vez true, se queda así: dispara la entrada "de golpe" del titular de la flota. */
  protected readonly flotaHit = signal(false);

  constructor() {
    afterNextRender(() => {
      this.tracker.registerJourney(this.runwayRef().nativeElement, this.eras);
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

  /** Solo esta época (o la que se está cruzando con ella en el fundido) debe
   * tener su video reproduciéndose — así nunca hay más de 1-2 decodificando
   * a la vez, sin importar cuántas épocas con video existan. */
  protected isNear(i: number): boolean {
    const p = this.scrub().progress();
    return p >= this.windowStart(i) - this.fade && p <= this.windowEnd(i) + this.fade;
  }
}
