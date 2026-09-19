import { Component, ElementRef, afterNextRender, output, signal, viewChild } from '@angular/core';

const AUDIO_SRC = 'assets/audio/ranas-serrania.m4a';
const VOLUME = 0.55;
const FADE_OUT_S = 0.5;
/** Cuánto se solapan el final y el arranque de cada vuelta del loop — así el
 * corte del audio (que no viene editado para loopear perfecto) queda
 * disimulado por el crossfade en vez de sonar como un salto. */
const CROSSFADE_S = 1.6;
/** Cuánto antes del corte real programamos (por reloj de JS) la siguiente
 * vuelta — el arranque real lo agenda el propio AudioContext con su reloj de
 * precisión, esto solo evita perder el margen por un timer impreciso. */
const SCHEDULE_LOOKAHEAD_S = 0.25;

/**
 * Loop "sin costura" de una pista que NO viene editada para loopear: en vez
 * de dejar que <audio loop> repita con un corte seco, se reproducen dos
 * copias superpuestas del mismo buffer con Web Audio, cada una con su propio
 * fundido de entrada/salida, de forma que el final de una vuelta se cruza con
 * el principio de la siguiente. El listener nunca oye el corte real.
 */
class SeamlessLoop {
  private nextStartTime = 0;
  private timerId = 0;
  private stopped = true;

  constructor(
    private readonly ctx: AudioContext,
    private readonly buffer: AudioBuffer,
    private readonly master: GainNode,
  ) {}

  start(): void {
    if (!this.stopped) return;
    this.stopped = false;
    this.nextStartTime = this.ctx.currentTime + 0.05;
    this.scheduleNext();
  }

  stop(fadeSeconds: number): void {
    this.stopped = true;
    clearTimeout(this.timerId);
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + fadeSeconds);
  }

  private scheduleNext(): void {
    if (this.stopped) return;
    const startAt = this.nextStartTime;
    const duration = this.buffer.duration;
    const fade = Math.min(CROSSFADE_S, duration / 3);

    const source = this.ctx.createBufferSource();
    source.buffer = this.buffer;
    const gain = this.ctx.createGain();
    source.connect(gain).connect(this.master);

    gain.gain.setValueAtTime(0, startAt);
    gain.gain.linearRampToValueAtTime(1, startAt + fade);
    gain.gain.setValueAtTime(1, startAt + duration - fade);
    gain.gain.linearRampToValueAtTime(0, startAt + duration);

    source.start(startAt);
    source.stop(startAt + duration + 0.1);

    this.nextStartTime = startAt + duration - fade;
    const msUntilNextSchedule = (this.nextStartTime - this.ctx.currentTime - SCHEDULE_LOOKAHEAD_S) * 1000;
    this.timerId = window.setTimeout(() => this.scheduleNext(), Math.max(0, msUntilNextSchedule));
  }
}

/**
 * Pantalla de entrada tipo "click to start": bloquea el documental hasta que
 * el usuario decide empezar, para que el primer scroll ya caiga sobre la
 * escena continua (`app-era-journey`) sin interrupciones.
 *
 * Suena el ambiente de selva (ranas de la Serranía) desde el instante en que
 * carga la página — no hace falta darle a "Empezar" — y se apaga con un
 * fundido corto en cuanto se le da clic. Los navegadores bloquean cualquier
 * audio (Web Audio incluido) hasta el primer gesto del usuario, así que si el
 * intento inmediato falla queda armado para arrancar en el primerísimo
 * toque/clic/tecla que ocurra en la página, sea o no el botón.
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

  private ctx: AudioContext | null = null;
  private loop: SeamlessLoop | null = null;
  private stopped = false;
  private removeGestureListeners: (() => void) | null = null;

  constructor() {
    // El foco arranca en "Empezar": con teclado basta Enter/Espacio, sin tener que tabular hasta él.
    afterNextRender(() => this.startButton().nativeElement.focus());

    afterNextRender(() => {
      const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      this.ctx = ctx;
      const master = ctx.createGain();
      master.gain.value = VOLUME;
      master.connect(ctx.destination);

      fetch(AUDIO_SRC)
        .then((r) => r.arrayBuffer())
        .then((data) => ctx.decodeAudioData(data))
        .then((buffer) => {
          if (this.stopped) return;
          this.loop = new SeamlessLoop(ctx, buffer, master);
          this.tryStart();
        })
        .catch(() => {});

      const resume = () => this.tryStart();
      document.addEventListener('pointerdown', resume);
      document.addEventListener('keydown', resume);
      this.removeGestureListeners = () => {
        document.removeEventListener('pointerdown', resume);
        document.removeEventListener('keydown', resume);
      };
    });
  }

  /** Intenta arrancar (o reanudar el AudioContext y arrancar) — seguro de llamar varias veces. */
  private tryStart(): void {
    if (this.stopped || !this.ctx || !this.loop) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => this.loop?.start());
    } else {
      this.loop.start();
    }
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
    this.playClick();
    this.stopped = true;
    this.removeGestureListeners?.();
    this.loop?.stop(FADE_OUT_S);
    setTimeout(() => this.start.emit(), 550);
  }

  /**
   * Clic sintetizado por código (ruido blanco cortísimo, filtrado y con
   * caída rápida) — nada de archivo externo, así que no hay lío de licencias
   * ni que esperar a que alguien grabe o consiga uno.
   */
  private playClick(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const duration = 0.05;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2200;
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
  }
}
