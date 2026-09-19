import { Directive, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';

/**
 * Aparece con un fundido hacia arriba cuando el elemento entra en pantalla.
 * Equivalente al `IntersectionObserver` + clase `.reveal.in` del diseño original.
 */
@Directive({
  selector: '[appReveal]',
  host: {
    '[class.reveal]': 'true',
    '[class.in]': 'visible()',
  },
})
export class Reveal {
  private readonly host = inject(ElementRef<HTMLElement>);
  readonly visible = signal(false);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (typeof IntersectionObserver === 'undefined') {
        this.visible.set(true);
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              this.visible.set(true);
              observer.disconnect();
            }
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
      );
      observer.observe(this.host.nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
