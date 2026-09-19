import { RenderMode, ServerRoute } from '@angular/ssr';

/** Sitio de una sola página: se prerenderiza en la compilación a HTML estático. */
export const serverRoutes: ServerRoute[] = [{ path: '**', renderMode: RenderMode.Prerender }];
