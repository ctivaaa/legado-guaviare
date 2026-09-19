import { Component, ElementRef, afterNextRender, effect, inject, signal, viewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ScrollScrub } from '../../directives/scroll-scrub';
import { LazyPlay } from '../../directives/lazy-play';
import { EraTracker } from '../../services/era-tracker';
import { JOURNEY_ERAS, JOURNEY_FADE, JOURNEY_LAYERS } from '../../data/journey';

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
  imports: [ScrollScrub, NgOptimizedImage, LazyPlay],
  templateUrl: './era-journey.html',
  styleUrl: './era-journey.css',
})
export class EraJourney {
  protected readonly eras = JOURNEY_LAYERS;
  protected readonly fade = FADE;
  /** Posiciones (izquierda %) del polvo ambiental que flota dentro de cada capa. */
  protected readonly dust = [8, 22, 38, 52, 66, 80, 92];

  private readonly scrub = viewChild.required(ScrollScrub);
  private readonly runwayRef = viewChild.required<ElementRef<HTMLElement>>('runway');
  private readonly tracker = inject(EraTracker);

  /** Una vez true, se queda así: dispara la entrada "de golpe" del titular de la flota. */
  protected readonly flotaHit = signal(false);

  constructor() {
    afterNextRender(() => {
      this.tracker.registerJourney(this.runwayRef().nativeElement, this.eras, JOURNEY_ERAS);
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
