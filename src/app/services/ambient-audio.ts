import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, effect, inject, signal, untracked } from '@angular/core';
import { EraTracker } from './era-tracker';

/** Ambiente de la pantalla de inicio (la selva). */
const GATE_AUDIO_SRC = 'assets/audio/ranas-serrania.m4a';
/** Versión mono a 40 kbps (176 KB en vez de 546 KB) para celular: llega antes con conexión lenta. */
const GATE_AUDIO_SRC_MOBILE = 'assets/m/ranas-serrania.m4a';

/**
 * Audio de cada época: id de la época -> archivo (mismos ids que en `journey.ts`:
 * hero, monedas, flota, hoy, bonanza, raices, cierre). Todavía no están
 * grabados, así que está vacío y no suena nada durante el recorrido. Cuando
 * existan, agrégalos aquí (ej. `flota: 'assets/audio/flota.m4a'`): suenan en
 * loop solo mientras esa época está activa, con crossfade al cambiar, y los
 * controla el botón "Sonido" como todo lo demás.
 */
const ERA_SOURCES: Partial<Record<string, string>> = {};

const VOLUME = 0.55;
/** Suavizado (constante de tiempo, en segundos) al silenciar/reactivar el sonido. */
const GAIN_SMOOTHING_S = 0.12;
/** Constante de tiempo del crossfade entre épocas (~1,2 s hasta estar completo). */
const ERA_FADE_TC = 0.4;
/** Constante de tiempo del fundido con que se apaga la selva al pulsar "Empezar". */
const GATE_FADE_TC = 0.15;
/** Cuánto se solapan el final y el arranque de cada vuelta del loop — así el
 * corte del audio (que no viene editado para loopear perfecto) queda
 * disimulado por el crossfade en vez de sonar como un salto. */
const CROSSFADE_S = 1.6;
/** Cuánto antes del corte real programamos (por reloj de JS) la siguiente
 * vuelta — el arranque real lo agenda el propio AudioContext con su reloj de
 * precisión. Es generoso porque una pestaña en segundo plano frena los
 * temporizadores hasta ~1 s. */
const SCHEDULE_LOOKAHEAD_S = 4;
/** El audio espera a que la página termine de cargar y un momento más:
 * con conexión lenta no debe competir con el póster y el video de fondo. */
const LOAD_DELAY_MS = 1200;
const MUTE_KEY = 'legado-guaviare:sonido-silenciado';

function readMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Loop "sin costura" de una pista que NO viene editada para loopear: en vez
 * de dejar que <audio loop> repita con un corte seco, se reproducen dos
 * copias superpuestas del mismo buffer con Web Audio, cada una con su propio
 * fundido de entrada/salida, de forma que el final de una vuelta se cruza con
 * el principio de la siguiente. El oyente nunca oye el corte real.
 */
class SeamlessLoop {
  private nextStartTime = 0;
  private started = false;
  private stopped = false;
  private timerId = 0;

  constructor(
    private readonly ctx: AudioContext,
    private readonly buffer: AudioBuffer,
    private readonly output: AudioNode,
  ) {}

  start(): void {
    if (this.started || this.stopped) return;
    this.started = true;
    this.nextStartTime = this.ctx.currentTime + 0.05;
    this.scheduleNext();
  }

  /** Deja de programar vueltas nuevas (lo ya programado termina solo, en silencio si se apagó la salida). */
  stop(): void {
    this.stopped = true;
    clearTimeout(this.timerId);
  }

  private scheduleNext(): void {
    if (this.stopped) return;
    const startAt = this.nextStartTime;
    const duration = this.buffer.duration;
    const fade = Math.min(CROSSFADE_S, duration / 3);

    const source = this.ctx.createBufferSource();
    source.buffer = this.buffer;
    const gain = this.ctx.createGain();
    source.connect(gain).connect(this.output);

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

interface EraTrack {
  gain: GainNode;
  loop: SeamlessLoop | null;
}

/**
 * Todo el sonido del sitio, con un solo interruptor ("Sonido" en la barra de
 * controles: `muted`/`toggleMute`, que se recuerda entre visitas).
 *
 * - Pantalla de inicio: suena la selva (ranas de la Serranía) desde el primerísimo
 *   gesto del usuario —los navegadores bloquean cualquier audio antes—. Al pulsar
 *   "Empezar" se apaga con un fundido corto.
 * - Recorrido: cada época tendrá su audio (`ERA_SOURCES`, todavía vacío), con
 *   crossfade automático al cambiar de sección.
 * - Se atenúa solo mientras la pestaña está en segundo plano.
 */
@Injectable({ providedIn: 'root' })
export class AmbientAudio {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly tracker = inject(EraTracker);

  /** False si el navegador no soporta Web Audio: el botón de sonido se oculta. */
  readonly available = signal(true);
  readonly muted = signal(this.isBrowser && readMuted());
  /** True desde que se pulsa "Empezar": a partir de ahí mandan los audios de época. */
  private readonly began = signal(false);

  /** Audios por época (ver `ERA_SOURCES`). */
  readonly eraSources: Partial<Record<string, string>> = ERA_SOURCES;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private gateGain: GainNode | null = null;
  private gateLoop: SeamlessLoop | null = null;
  private readonly eras = new Map<string, EraTrack>();
  private currentEra: string | null = null;
  private initialized = false;

  constructor() {
    effect(() => {
      const id = this.tracker.activeId();
      if (!this.began() || !id) return;
      untracked(() => this.playEra(id));
    });
  }

  /** Prepara el audio (seguro de llamar varias veces). Solo en el navegador. */
  init(): void {
    if (!this.isBrowser || this.initialized) return;
    this.initialized = true;

    const AudioCtx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      this.available.set(false);
      return;
    }

    const ctx = new AudioCtx();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = this.targetVolume();
    master.connect(ctx.destination);
    this.master = master;
    const gateGain = ctx.createGain();
    gateGain.connect(master);
    this.gateGain = gateGain;

    const load = () =>
      window.setTimeout(() => {
        fetch(matchMedia('(max-width: 640px)').matches ? GATE_AUDIO_SRC_MOBILE : GATE_AUDIO_SRC)
          .then((r) => r.arrayBuffer())
          .then((data) => ctx.decodeAudioData(data))
          .then((buffer) => {
            if (this.began()) return; // ya pasó la pantalla de inicio: la selva no hace falta
            this.gateLoop = new SeamlessLoop(ctx, buffer, gateGain);
            this.tryStart();
          })
          .catch(() => {});
      }, LOAD_DELAY_MS);
    if (document.readyState === 'complete') load();
    else window.addEventListener('load', load, { once: true });

    // Los navegadores no dejan sonar hasta un gesto del usuario, y en pantallas táctiles el que
    // cuenta es el toque al SOLTAR (touchend/pointerup/click), no el pointerdown. Estos oyentes se
    // quedan siempre: no hacen nada mientras suena, pero reanudan el audio si el sistema lo
    // suspende (llamada, cambio de app) y hay un nuevo toque.
    const unlock = () => this.unlock();
    (['pointerup', 'touchend', 'click', 'keydown'] as const).forEach((e) =>
      document.addEventListener(e, unlock, { passive: true }),
    );

    document.addEventListener('visibilitychange', () => {
      this.applyVolume();
      if (!document.hidden) this.unlock();
    });
  }

  /**
   * Al pulsar "Empezar": ese clic ya es un gesto válido, así que desbloquea el
   * audio; la selva se apaga con un fundido y pasan a mandar los audios de época.
   */
  beginExperience(): void {
    this.unlock();
    this.began.set(true);

    const { ctx, gateGain, gateLoop } = this;
    if (!ctx || !gateGain) return;
    gateGain.gain.setTargetAtTime(0, ctx.currentTime, GATE_FADE_TC);
    window.setTimeout(() => {
      gateLoop?.stop();
      gateGain.disconnect();
    }, 1000);
  }

  toggleMute(): void {
    this.muted.update((m) => !m);
    try {
      localStorage.setItem(MUTE_KEY, this.muted() ? '1' : '0');
    } catch {
      // Sin almacenamiento: la preferencia solo dura esta visita.
    }
    this.applyVolume();
    if (!this.muted()) this.unlock(); // viene de un clic: puede reanudar un contexto suspendido
  }

  /**
   * Clic sintetizado por código (ruido filtrado con caída rápida) — nada de
   * archivo externo, así que no hay lío de licencias. Dura ~90 ms y va a volumen
   * pleno: con 50 ms y a medias casi no se oía por la bocina de un celular.
   * No suena si está silenciado.
   */
  playClick(): void {
    const ctx = this.ctx;
    if (!ctx || this.muted()) return;

    const play = () => {
      const duration = 0.09;
      const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      filter.Q.value = 0.7;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      noise.connect(filter).connect(gain).connect(ctx.destination);
      noise.start();
    };

    // resume() debe llamarse aquí mismo (dentro del gesto); el sonido se programa cuando ya corre.
    if (ctx.state === 'running') play();
    else ctx.resume().then(play).catch(() => {});
  }

  /** Sube el audio de la época `id` y baja el de las demás (crossfade). Carga el archivo la primera vez. */
  private playEra(id: string): void {
    this.currentEra = id;
    const { ctx, master } = this;
    if (!ctx || !master) return;

    this.eras.forEach((track, eraId) => {
      track.gain.gain.setTargetAtTime(eraId === id ? 1 : 0, ctx.currentTime, ERA_FADE_TC);
    });

    const src = this.eraSources[id];
    if (!src || this.eras.has(id)) return;

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(master);
    const track: EraTrack = { gain, loop: null };
    this.eras.set(id, track);

    fetch(src)
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => {
        track.loop = new SeamlessLoop(ctx, buffer, gain);
        this.tryStart();
        // Si mientras cargaba el visitante ya cambió de sección, esta se queda en silencio.
        if (this.currentEra === id) gain.gain.setTargetAtTime(1, ctx.currentTime, ERA_FADE_TC);
      })
      .catch(() => {});
  }

  private targetVolume(): number {
    return this.muted() || document.hidden ? 0 : VOLUME;
  }

  private applyVolume(): void {
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(this.targetVolume(), this.ctx.currentTime, GAIN_SMOOTHING_S);
  }

  /**
   * Desbloquea el audio: reanuda el AudioContext (solo se puede dentro de un
   * gesto) aunque los archivos todavía no hayan terminado de bajar, para que apenas
   * lleguen puedan sonar sin pedir otro toque. Seguro de llamar varias veces.
   */
  private unlock(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    if (ctx.state === 'running') this.tryStart();
    else ctx.resume().then(() => this.tryStart()).catch(() => {});
  }

  /** Arranca los loops que ya tengan archivo, si el audio está desbloqueado. */
  private tryStart(): void {
    if (this.ctx?.state !== 'running') return;
    if (!this.began()) this.gateLoop?.start();
    this.eras.forEach((track) => track.loop?.start());
  }
}
