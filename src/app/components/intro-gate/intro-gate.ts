import { Component, ElementRef, afterNextRender, inject, output, signal, viewChild } from '@angular/core';
import { AmbientAudio } from '../../services/ambient-audio';

/**
 * Pantalla de entrada tipo "click to start": bloquea el documental hasta que
 * el usuario decide empezar, para que el primer scroll ya caiga sobre la
 * escena continua (`app-era-journey`) sin interrupciones.
 *
 * El ambiente de selva (ver `AmbientAudio`) suena desde esta pantalla, en el
 * primerísimo toque/clic/tecla —los navegadores bloquean cualquier audio
 * antes—, y se apaga con un fundido corto al pulsar "Empezar": desde ahí cada
 * sección tendrá su propio audio. El botón "Sonido" silencia todo.
 */
@Component({
  selector: 'app-intro-gate',
  host: {
    class: 'intro-gate',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': 'El Legado del Guaviare',
    '[class.leaving]': 'leaving()',
    '(document:keydown)': 'onKeydown($event)',
  },
  templateUrl: './intro-gate.html',
  styleUrl: './intro-gate.css',
})
export class IntroGate {
  readonly start = output<void>();
  protected readonly leaving = signal(false);
  private readonly startButton = viewChild.required<ElementRef<HTMLButtonElement>>('startBtn');

  /** Se deciden en el navegador (celular -> versión ligera). Sin valor en el prerender,
   * para que el HTML estático no arranque la descarga del video de escritorio. */
  protected readonly videoSrc = signal<string | null>(null);
  protected readonly posterSrc = signal<string | null>(null);

  private readonly audio = inject(AmbientAudio);

  constructor() {
    // El foco arranca en "Empezar": con teclado basta Enter/Espacio, sin tener que tabular hasta él.
    afterNextRender(() => this.startButton().nativeElement.focus());

    afterNextRender(() => {
      const light = matchMedia('(max-width: 640px)').matches;
      this.posterSrc.set(light ? 'assets/m/mascara-fajos.webp' : 'assets/mascara-fajos.webp');
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
      const lowData = !!conn?.saveData || ['slow-2g', '2g'].includes(conn?.effectiveType ?? '');
      // Con ahorro de datos o 2G, la pantalla de inicio se queda en el póster (sin video).
      if (!lowData) this.videoSrc.set(light ? 'assets/m/videoDinero.mp4' : 'assets/videoDinero.mp4');
    });

    afterNextRender(() => this.audio.init());
  }

  /** Las teclas con las que se "avanza" en cualquier sitio también empiezan el recorrido. */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    if (!['ArrowDown', 'PageDown', ' ', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    this.onStart();
  }

  onStart(): void {
    if (this.leaving()) return;
    this.leaving.set(true);
    this.audio.playClick();
    this.audio.beginExperience();
    setTimeout(() => this.start.emit(), 550);
  }
}
