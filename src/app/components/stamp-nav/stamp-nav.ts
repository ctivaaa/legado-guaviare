import { Component, computed, effect, inject, signal } from '@angular/core';
import { EraTracker } from '../../services/era-tracker';
import { AmbientAudio } from '../../services/ambient-audio';
import { AutoScroll } from '../../services/auto-scroll';
import { EraIconGlyph } from '../era-icon/era-icon';

/**
 * Navegación fija: el nombre del documental a la izquierda y, a la derecha,
 * un "sello" circular que muestra el icono de la época actual y, al abrirlo,
 * un menú en abanico para saltar directamente a cualquier época.
 */
@Component({
  selector: 'app-stamp-nav',
  imports: [EraIconGlyph],
  host: {
    '(document:click)': 'closeMenu()',
    '(document:fullscreenchange)': 'onFullscreenChange()',
  },
  templateUrl: './stamp-nav.html',
  styleUrl: './stamp-nav.css',
})
export class StampNav {
  protected readonly tracker = inject(EraTracker);
  protected readonly ambientAudio = inject(AmbientAudio);
  protected readonly autoScroll = inject(AutoScroll);

  private readonly menuOpenSignal = signal(false);
  readonly menuOpen = this.menuOpenSignal.asReadonly();

  private readonly activeSection = computed(() =>
    this.tracker.sections().find((s) => s.id === this.tracker.activeId()),
  );
  readonly activeIcon = computed(() => this.activeSection()?.icon ?? null);
  readonly activeAccent = computed(() => this.activeSection()?.accent ?? '#9C6B3A');

  private readonly rotationSignal = signal(-4);
  readonly rotation = this.rotationSignal.asReadonly();

  private readonly fullscreenSignal = signal(false);
  readonly isFullscreen = this.fullscreenSignal.asReadonly();

  constructor() {
    effect(() => {
      this.tracker.activeId();
      this.rotationSignal.set(Math.random() * 4 - 8);
    });
  }

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
