import { Directive, DestroyRef, ElementRef, afterNextRender, inject, signal } from '@angular/core';

/**
 * Entrada agresiva: el elemento cae desde arriba con rotación y un pequeño
 * rebote al aterrizar, en vez del fade-up suave de `[appReveal]`. Pensado
 * para objetos sueltos (stickers, fotos, frases de impacto) — no lo combines
 * con algo que ya anime su propio `transform` (p. ej. `.note-sway` o
 * `[appTilt]`), porque solo uno de los dos gana.
 */
@Directive({
  selector: '[appFall]',
  host: {
    class: 'fall',
    '[class.fall-in]': 'visible()',
  },
})
export class Fall {
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
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
      );
      observer.observe(this.host.nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
