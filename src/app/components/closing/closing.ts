import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { JourneyEra } from '../../data/journey';

const COPIED_MS = 2200;

/**
 * Pantalla final ("fin del recorrido"): agradecimiento, créditos y los dos
 * botones de salida. Vive dentro de la escena continua de `app-era-journey`,
 * que le pasa la ventana de scroll (`--start`, `--fade`) por custom properties
 * para que aparezca con el resto de las épocas; el texto sale de los datos de
 * la última época.
 */
@Component({
  selector: 'app-closing',
  templateUrl: './closing.html',
  styleUrl: './closing.css',
})
export class Closing {
  readonly era = input.required<JourneyEra>();

  /** Los créditos visibles son de Kawede; la autoría de la página va en package.json, README y metadatos. */
  protected readonly credits = [
    { role: 'Historia y dirección', by: 'Kawede' },
    { role: 'Fotografía y video', by: 'Kawede' },
  ];

  protected readonly copied = signal(false);
  private copiedTimer = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copiedTimer));
  }

  protected restart(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** Comparte con el diálogo nativo si existe; si no, copia el enlace. */
  protected async share(): Promise<void> {
    const url = location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'El Legado del Guaviare', text: this.era().quote, url });
        return;
      }
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return;
    }
    try {
      await navigator.clipboard.writeText(url);
      this.copied.set(true);
      clearTimeout(this.copiedTimer);
      this.copiedTimer = window.setTimeout(() => this.copied.set(false), COPIED_MS);
    } catch {
      // Sin permiso de portapapeles: no hay nada más que hacer.
    }
  }
}
