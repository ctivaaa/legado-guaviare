import { Component, computed, inject, signal } from '@angular/core';
import { EraTracker } from '../../services/era-tracker';
import { AmbientAudio } from '../../services/ambient-audio';
import { AutoScroll } from '../../services/auto-scroll';

/**
 * Navegación fija: el nombre del documental arriba a la izquierda, la barra de
 * controles abajo a la izquierda y, a la derecha, un panel vertical con todas
 * las épocas ("IR A UNA ÉPOCA · 2 de 7") para saltar directamente a cualquiera.
 * Cerrado muestra solo el contador y un riel de puntos; el encabezado lo abre
 * y se cierra al elegir una época, al hacer clic fuera o con Escape.
 */
@Component({
  selector: 'app-stamp-nav',
  host: {
    '(document:click)': 'closeMenu()',
    '(document:keydown.escape)': 'closeMenu()',
    '(document:fullscreenchange)': 'onFullscreenChange()',
  },
  templateUrl: './stamp-nav.html',
  styleUrl: './stamp-nav.css',
})
export class StampNav {
  protected readonly tracker = inject(EraTracker);
  protected readonly ambientAudio = inject(AmbientAudio);
  protected readonly autoScroll = inject(AutoScroll);

  /** Una entrada por capa, con el titular real de la escena (su primera frase,
   * para que los largos quepan). Los capítulos que aún no tienen título salen
   * como "Capítulo N": nunca texto de relleno, que se publicaría e indexaría. */
  protected readonly entries = computed(() =>
    this.tracker.layers().map((era, i) => {
      const title = era.title.split(/(?<=[.?!])\s/)[0];
      return { id: era.id, label: title || `Capítulo ${i + 1}`, pending: !title, accent: era.accent };
    }),
  );

  /** Aviso para lectores de pantalla cada vez que cambia el capítulo. */
  protected readonly announcement = computed(() => {
    const entries = this.entries();
    const i = this.tracker.activeIndex();
    const current = entries[i];
    if (!current) return '';
    return current.pending ? `Capítulo ${i + 1} de ${entries.length}` : `Capítulo ${i + 1} de ${entries.length}: ${current.label}`;
  });

  private readonly menuOpenSignal = signal(false);
  readonly menuOpen = this.menuOpenSignal.asReadonly();

  private readonly fullscreenSignal = signal(false);
  readonly isFullscreen = this.fullscreenSignal.asReadonly();

  toggleAudio(event: Event): void {
    event.stopPropagation();
    this.ambientAudio.toggleMute();
  }

  toggleAutoScroll(event: Event): void {
    event.stopPropagation();
    this.autoScroll.toggle();
  }

  onFullscreenChange(): void {
    this.fullscreenSignal.set(!!document.fullscreenElement);
  }

  toggleFullscreen(event: Event): void {
    event.stopPropagation();
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpenSignal.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpenSignal.set(false);
  }

  goTo(id: string, event: Event): void {
    event.stopPropagation();
    this.tracker.scrollTo(id);
    this.menuOpenSignal.set(false);
  }
}
