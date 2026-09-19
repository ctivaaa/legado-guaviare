import { isPlatformBrowser } from '@angular/common';
import { Directive, ElementRef, Input, PLATFORM_ID, inject } from '@angular/core';

/**
 * Reproduce el <video> host solo mientras `appLazyPlay` es true, y lo pausa el
 * resto del tiempo. Sin esto, cada época con video de fondo autoplayea desde
 * el montaje del componente — con varias épocas en el DOM a la vez (el fundido
 * entre escenas las superpone), eso es más de un video decodificando en
 * paralelo aunque el usuario solo vea uno, y es justo lo que causaba los lags.
 */
@Directive({
  selector: 'video[appLazyPlay]',
})
export class LazyPlay {
  private readonly host = inject(ElementRef<HTMLVideoElement>);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private active = false;

  @Input('appLazyPlay') set appLazyPlay(value: boolean) {
    if (value === this.active) return;
    this.active = value;
    // En el prerender (servidor) no hay reproductor: solo se marca el estado.
    if (!this.isBrowser) return;
    const video = this.host.nativeElement;
    if (value) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }
}
