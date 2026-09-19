import { Component, effect, inject, signal } from '@angular/core';
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

  constructor() {
    effect(() => {
      if (typeof document === 'undefined') return;
      document.body.style.overflow = this.started() ? '' : 'hidden';
    });
  }

  onStart(): void {
    this.started.set(true);
  }
}
