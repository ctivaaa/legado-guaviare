import { Component, input } from '@angular/core';
import type { EraIcon } from '../../data/journey';

/** Glifo de línea para una época; el color se hereda de `color` y el tamaño, del contenedor. */
@Component({
  selector: 'app-era-icon',
  host: { class: 'era-icon' },
  template: `
    <svg viewBox="0 0 24 24">
      @switch (icon()) {
        @case ('leaf') {
          <path d="M4 20c8-1 15-6 16-16-10 1-15 8-16 16z" />
          <path d="M6 18c3-4 6-7 12-12" />
        }
        @case ('plane') {
          <path d="M12 2c2 3-1 4-1 6.5A3.5 3.5 0 0 0 14.5 12c0 3-2.5 5-2.5 8" />
          <path d="M9 21c-3-2-4-5-2-9 1 2 2 2 3 1-1 3 1 6 3 8" />
        }
        @case ('flame') {
          <path d="M12 2c3 4 5 6.5 5 10a5 5 0 0 1-10 0c0-1.7 1-3 2-4-.2 1.4.6 2 1.4 2C11 8 9.5 6 12 2z" />
        }
        @case ('scale') {
          <path
            d="M12 3v4M5 7h14M5 7l-3 7a3 3 0 0 0 6 0l-3-7M19 7l-3 7a3 3 0 0 0 6 0l-3-7M12 21h-4M12 21h4M12 11v10"
          />
        }
        @case ('water') {
          <path d="M3 14h9l2-3h6l2 2-2 5H9l-2 3H3z" />
          <circle cx="7" cy="18" r="1" />
        }
        @case ('root') {
          <path d="M12 2v9M12 11c-4 0-6 3-6 7M12 11c4 0 6 3 6 7M12 11c-2-2-2-5 0-7M12 11c2-2 2-5 0-7" />
        }
      }
    </svg>
  `,
  styles: `
    :host { display: block; }
    svg {
      width: 100%; height: 100%; display: block;
      stroke: currentColor; fill: none; stroke-width: var(--icon-stroke-width, 1.8);
    }
  `,
})
export class EraIconGlyph {
  readonly icon = input.required<EraIcon>();
}
