export type EraIcon = 'leaf' | 'plane' | 'flame' | 'scale' | 'water' | 'root';

export interface JourneyEra {
  id: string;
  /** Sin icono: no aparece en el sello de navegación (el prólogo, por ejemplo). */
  icon?: EraIcon;
  label: string;
  range: string;
  tag: string;
  title: string;
  quote: string;
  credit: string;
  image: string;
  /** Si está presente, se reproduce en loop en vez de mostrar `image` (que sigue sirviendo de poster). */
  video?: string;
  accent: string;
  accent2: string;
}

/** Fracción de cada ventana que se usa para fundir con la siguiente/anterior. */
export const JOURNEY_FADE = 0.035;

/**
 * El hero ya no es una escena aparte: es la primera ventana de la misma
 * escena continua, para que no haya costura entre "entrar al sitio" y
 * "empezar la historia".
 */
export const HERO_LAYER: JourneyEra = {
  id: 'hero',
  label: '',
  range: '',
  tag: 'una familia · cuatro décadas · una hoja',
  title: 'La coca fue guerra. La coca fue herencia.',
  quote:
    'La historia de mi familia en el Guaviare, contada hacia atrás: empezamos por lo que somos hoy y bajamos, generación por generación, hasta la raíz de todo.',
  credit: '',
  image: 'assets/mascara-fajos.webp',
  video: 'assets/abuelomejorado.mp4',
  accent: '#C98B52',
  accent2: '#1a120a',
};

/**
 * Orden de borrador pedido para mostrarle a la persona (2026-09-17): monedas
 * -> flota -> hoy -> bonanza -> raices -> cierre. "El éxodo" y "los ojos de un
 * niño" quedaron fuera de este orden — no se borró su contenido, están más
 * abajo en `JOURNEY_ERAS_ARCHIVADAS` por si vuelven a entrar.
 */
export const JOURNEY_ERAS: readonly JourneyEra[] = [
  {
    // Todavía sin título/testimonio/rango — por ahora solo el video de fondo.
    id: 'monedas',
    label: '',
    range: '',
    tag: '',
    title: '',
    quote: '',
    credit: '',
    image: 'assets/mascara-fajos.webp',
    video: 'assets/MascaraMonedas.mp4',
    accent: '#8C6A2E',
    accent2: '#5C4A1E',
  },
  {
    id: 'flota',
    icon: 'flame',
    label: 'La flota en llamas',
    range: '1998 — Puente Nowen',
    tag: '1998 — el puente y la ceniza',
    title: 'La quemaron.',
    quote: 'Vi todo mi esfuerzo convertirse en cenizas.',
    credit: 'Tío Jhon',
    // Poster = primer fotograma del propio video (no la ilustración del bus
    // quemándose, que se alcanzaba a ver en el scroll mientras cargaba el video).
    image: 'assets/poster-flota.webp',
    video: 'assets/videoCarro.mp4',
    // blood-bright — único uso en toda la paleta de "la quemaron" (alimenta
    // el punto de polvo ambiental y el indicador de nav de esta época).
    accent: '#a5242b',
    accent2: '#7A5A1E',
  },
  {
    id: 'hoy',
    icon: 'leaf',
    label: 'Hoy',
    range: 'Cuatro décadas después',
    tag: 'hoy — cuatro décadas después',
    title: 'Las avionetas pasaron. Los muertos pasaron. La hoja se quedó.',
    quote: '¿Sientes que valió la pena quedarte en el Guaviare?',
    credit: 'pregunta sin responder, todavía',
    image: 'assets/ilustracion4.webp',
    video: 'assets/videoIlustracion.mp4',
    accent: '#9C6B3A',
    accent2: '#7A2E2A',
  },
  {
    id: 'bonanza',
    icon: 'scale',
    label: 'La bonanza',
    range: 'Finales 70 — Llegan las FARC',
    tag: 'finales de los 70 — la llegada de las farc',
    title: 'Todos pagaban.',
    quote: 'A veces ni el efectivo alcanzaba — todo se pagaba y se cobraba en gramos.',
    credit: 'Padre y Abuela Oliva',
    image: 'assets/ilustracion7.webp',
    video: 'assets/ilustracion7video.mp4',
    accent: '#8C6A2E',
    accent2: '#5C4A1E',
  },
  {
    id: 'raices',
    icon: 'root',
    label: 'Las raíces',
    range: 'Años 60 — Selva sin ley',
    tag: 'años 60 — la selva sin ley',
    title: 'Antes de la coca ya existía el endeude. Antes de la guerra ya existía la orfandad.',
    quote: 'Tuvo que internarse en el monte y valerse por sí solo en una selva inclemente.',
    credit: 'Abuelo Ángel',
    image: 'assets/ilustracion3.webp',
    video: 'assets/ilustracion3video.mp4',
    accent: '#7FA06A',
    accent2: '#6B6B3A',
  },
  {
    // Cierre: el video de fondo se mantiene y encima va la pantalla de créditos
    // (ver app-closing), con un oscurecido solo en su zona para que se lea.
    id: 'cierre',
    icon: 'water',
    label: 'Cierre',
    range: '',
    tag: '— fin del recorrido —',
    title: 'Gracias por llegar hasta la raíz.',
    quote:
      'El Legado del Guaviare es la historia de una familia contada hacia atrás, generación por generación, hasta el origen de todo.',
    credit: '',
    image: 'assets/mascara-campo.webp',
    video: 'assets/mascaraCaminandoMejor.mp4',
    accent: '#cf9a52',
    accent2: '#2e3a30',
  },
];

/**
 * Épocas que existían antes de este reordenamiento y quedaron fuera del
 * recorrido actual — el contenido (testimonios reales) se conserva acá en vez
 * de borrarlo, por si "el éxodo" o "los ojos de un niño" vuelven a entrar.
 * No se usa en ningún lado todavía.
 */
export const JOURNEY_ERAS_ARCHIVADAS: readonly JourneyEra[] = [
  {
    id: 'exodo',
    icon: 'plane',
    label: 'El éxodo',
    range: '2000–03 — Plan Colombia',
    tag: '2000–2003 — cielo envenenado',
    title: 'El avión no distinguía entre la coca y la comida.',
    quote: 'Crecí con el vacío de su ausencia.',
    credit: 'El narrador',
    image: 'assets/ilustracion6.jpeg',
    accent: '#9BAA55',
    accent2: '#B23B2E',
  },
  {
    id: 'infancia',
    icon: 'water',
    label: 'Los ojos de un niño',
    range: 'La infancia',
    tag: 'la infancia — los ojos de un niño',
    title: 'Todos vestían de verde. Yo no sabía diferenciar un bando de otro.',
    quote: 'Pensé: qué señor tan amable.',
    credit: 'El narrador, cinco años',
    image: 'assets/ilustracion12.jpeg',
    accent: '#4FBDB2',
    accent2: '#E85D9E',
  },
];

/** Prólogo + las seis épocas, en el orden real de la escena continua. */
export const JOURNEY_LAYERS: readonly JourneyEra[] = [HERO_LAYER, ...JOURNEY_ERAS];
