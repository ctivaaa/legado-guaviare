import { Directive, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';

/**
 * Convierte el alto extra de su elemento anfitrión en una barra de progreso 0→1
 * expuesta como `--progress`. Úsalo sobre un contenedor "pista" (p. ej. 220vh)
 * que envuelve una escena `position: sticky`, para animar esa escena en vivo
 * mientras el usuario scrollea, en vez de solo revelarla una vez.
 */
@Directive({
  selector: '[appScrub]',
  host: {
    '[style.--progress]': 'progress()',
  },
})
export class ScrollScrub {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly progress = signal(0);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof window === 'undefined') return;
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

      let ticking = false;
      const update = () => {
        ticking = false;
        const rect = this.host.nativeElement.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0;
        this.progress.set(reduced ? Math.round(p) : p);
      };
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll);
      update();

      destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      });
    });
  }
}
