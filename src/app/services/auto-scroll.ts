import { DestroyRef, Injectable, afterNextRender, inject, signal } from '@angular/core';

const SPEED_PX_PER_FRAME = 1.6;
const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);

/**
 * Avance automático tipo "deja que avance solo": desplaza la página a paso
 * lento y constante. Cualquier gesto real del usuario (rueda, touch, teclado,
 * clic) lo pausa de inmediato — nunca compite con el control del usuario.
 */
@Injectable({ providedIn: 'root' })
export class AutoScroll {
  readonly active = signal(false);
  private raf = 0;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const pause = () => {
        this.active.set(false);
        this.restoreScrollBehavior?.();
      };
      const onKey = (e: KeyboardEvent) => {
        if (SCROLL_KEYS.has(e.key)) pause();
      };
      window.addEventListener('wheel', pause, { passive: true });
      window.addEventListener('touchstart', pause, { passive: true });
      window.addEventListener('keydown', onKey);
      destroyRef.onDestroy(() => {
        window.removeEventListener('wheel', pause);
        window.removeEventListener('touchstart', pause);
        window.removeEventListener('keydown', onKey);
        cancelAnimationFrame(this.raf);
      });
    });
  }

  /** Restaura el scroll-behavior global de <html> al cortar el avance (por toggle, fin de página o destroy). */
  private restoreScrollBehavior: (() => void) | null = null;

  toggle(): void {
    this.active.update((v) => !v);
    if (this.active()) this.loop();
    else this.restoreScrollBehavior?.();
  }

  private loop(): void {
    // window.scrollBy() con el <html> global en scroll-behavior:smooth hace que
    // cada frame reinicie una animación suave apuntando un poco más lejos que la
    // anterior — el navegador termina peleando consigo mismo y no avanza. Lo
    // forzamos a "auto" mientras dura el avance automático.
    const root = document.documentElement;
    const prevBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    this.restoreScrollBehavior = () => {
      root.style.scrollBehavior = prevBehavior;
      this.restoreScrollBehavior = null;
    };

    const step = () => {
      if (!this.active()) {
        this.restoreScrollBehavior?.();
        return;
      }
      const max = root.scrollHeight - window.innerHeight;
      if (window.scrollY >= max - 2) {
        this.active.set(false);
        this.restoreScrollBehavior?.();
        return;
      }
      window.scrollBy(0, SPEED_PX_PER_FRAME);
      this.raf = requestAnimationFrame(step);
    };
    this.raf = requestAnimationFrame(step);
  }
}
