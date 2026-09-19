import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Component, PLATFORM_ID, effect, inject, signal } from '@angular/core';
import { StampNav } from './components/stamp-nav/stamp-nav';
import { EraJourney } from './components/era-journey/era-journey';
import { IntroGate } from './components/intro-gate/intro-gate';
import { EraTracker } from './services/era-tracker';

@Component({
  selector: 'app-root',
  imports: [StampNav, EraJourney, IntroGate],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly tracker = inject(EraTracker);

  protected readonly started = signal(false);
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  constructor() {
    // Sin scroll mientras la pantalla de inicio está encima. Solo en el
    // navegador: si se escribiera durante el prerender, el HTML estático
    // saldría con el scroll bloqueado para siempre (sin JS no hay "Empezar").
    effect(() => {
      if (!this.isBrowser) return;
      this.document.body.style.overflow = this.started() ? '' : 'hidden';
    });
  }

  onStart(): void {
    this.started.set(true);
  }
}
