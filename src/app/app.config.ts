import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // El HTML prerenderizado se "hidrata" en vez de reemplazarse, y los clics
    // hechos antes de que cargue el JavaScript se reproducen después.
    provideClientHydration(withEventReplay()),
  ],
};
