/**
 * Miniaturas (LQIP) de los fondos, incrustadas como data URI: se ven al instante,
 * sin descargar nada, mientras llegan el póster y el video. Sirven de fondo del
 * <video> (heredan sus filtros), así que con conexión lenta nunca queda vacío.
 *
 * "h" = horizontal (escritorio), "v" = vertical (celular). Generadas de los
 * pósters con ffmpeg (48x27 y 27x48, webp calidad 35); si cambia un póster,
 * regenerar la entrada.
 */
export const PLACEHOLDERS: Record<string, { h: string; v: string }> = {
  'assets/mascara-fajos.webp': {
    h: 'data:image/webp;base64,UklGRmwAAABXRUJQVlA4IGAAAADwBACdASowABsAPvVsqE6qpqOiMBqtUVAeiWMAwZA+NmQlvio2l7nn8Xbv1K3QcHgA/vIfU3HORk+WBmfGZFASNLjx4e5h25nr4UgL8Ce4u3CitqcmJ2zNIHKqIBtOAAA=',
    v: 'data:image/webp;base64,UklGRnIAAABXRUJQVlA4IGYAAADQBACdASobADAAPwF0qE+rJ6iiMBVaqWAgCUAZQAXNrMCK4Q0J5fEWQOHzs4OzQAD+9BiFcK9vzgF1/OpFQnF3kf/rpKl4kvptKVAAxzhYLl8f6de4MSJ0Bo21y0hvCXY/wkgAAAA=',
  },
  'assets/poster-flota.webp': {
    h: 'data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAADQAwCdASowABsAPwF2slOrJySkJWsxYCAJZwDRgBDGZf4zdoX7gAAA/u/g4VsDKa5+dabATouBevrHFRjiKQ73p9W0ofTcZjgs2MUzli9S0VgAAAA=',
    v: 'data:image/webp;base64,UklGRlAAAABXRUJQVlA4IEQAAACwAwCdASobADAAPwF0sFKrJqojpWzJYCAJaQAAHy6G9UDPVWagAAD+8MQUghkf8tbX0Oi2qpsy31RWUqDkNP87GlAAAA==',
  },
  'assets/ilustracion4.webp': {
    h: 'data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAAAQBACdASowABsAPwF4sFQrJyQjJWsxYCAJZWZdLg1ioSnHx7sj1OFuAAD+3iPw0ei2TYYTkmS3fsYEGC/DB648EtGXYS9lI4bx/o5WqDTQu6GsP1x4tctUG8Gb0yFVodCv4QAC8kqcviVLMH0mxigsXdLZo+ExGxK45FS4dm8Z+jG/2KhfmgAAAAA=',
    v: 'data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAABwBACdASobADAAPwF2sFQrJyQjJWsxYCAJZWWt9E6pQSn68/JcfwphKizcAAD+3NBAspdn/4wmktuBiSgrAbb7vM4htbUeBGwIBdpFPF/e81XYWGL5ZVpJOukV2wreit7KioS2eOSCNDGM/09fkG/TVw6rlxz/55Vudv6onXPkvAAA',
  },
  'assets/ilustracion7.webp': {
    h: 'data:image/webp;base64,UklGRnwBAABXRUJQVlA4IHABAABQCACdASowABsAPwFusFKrJaQiqrgKAWAgCWwAnTKEfv2lNuMbsGNXC/pT+c79wAN+TH8Zbo5c1UF82xEmanbo4bO4rWBp94CvDIAA/PZ3RCSSprhwqyxbbrP/W624rAOE04kfpmV+4Flb9nUKmRrEmNvEgA+IfSu9fESTAOMC/6B5r6OPaGB/b8s0N1vbs+8Ao57d1wH0SvTh2bhrR/NJbOIp7H35uJM9/raOgzs0E0WMlIiFyMj9KzBh9k/y4WGfSZOiYePeh9vWnPM6mkyCOTLPy93UlVH/gfDLJIiJM1LqBI+5naaSJhxS7rFK/fgBmm08koiGJ6yEAGkz0qIoCvgcMOltWqXAN1D/rY3f1BnG+e3nuYl2X54d2qbY8AP1rI1p8TmPqJgcOSQizkc6zRb2kbDpAX6q/wMz3gXK9LEBChGEMI/jAbb9jjifbYQzTdMSdeHByJnB9DrjqA06xJsMvleWnDTX0Lfe2eAAAA==',
    v: 'data:image/webp;base64,UklGRu4AAABXRUJQVlA4IOIAAAAwBgCdASobADAAPwFsrVKrJSOiqrgMAWAgCWwAwNx1bM5Gr1k+3FqpRxIE6tZa4nTis01qqclAJogAAP7qbRPrmzukcHhVAXYUMuVP2RRP9avKrfgFbhcSUAIlzwS9skyaikT+Wxg6ju5VhMPBc3SIyK5Hr3V9bTqYg8IgxJb3RBPfuadwoN/DKPoWTBOzcNDjQrTPtjlOtF0D35mhwEhnbeFARTHFED2/T/jTI1wnUxlC3+F7KOJgbelrk+Yr/pgtUYEz9GNJ0mWPiiB8HHTuoaIrqYOLXGyK9QblwEmaq1AA',
  },
  'assets/ilustracion3.webp': {
    h: 'data:image/webp;base64,UklGRt4AAABXRUJQVlA4INIAAABQBgCdASowABsAPwFqrlArJaQisBqoAWAgCWwAnSDrPD22qARhdAiDpU6pj/IerBFTdzzrPySKOwMW1AD91ZdXsK6Gb3Ig9E9ls7dLCEgFuVmPzfR90PqjJWdTZTQjaxu+V6bhZMMV+yQ84fgrDZZr0rIg3HNsOTbNsFOWAvhwbR/OvvZ4m+bCmevjN3609vkS1346duYhVUIGfp1n0tzof4kweLMPZYZH90HwuPqYWopysjoQWwtVk/vCulBsdOGxmO0WzWUtzvQxa4hDooCoAAA=',
    v: 'data:image/webp;base64,UklGRuQAAABXRUJQVlA4INgAAABQBgCdASobADAAPwFws1IrJiSiqrgKAWAgCWwAnTN2xl4UsBX3BTfcb7egbquFLIuYOg5qDDt5lsFwKAD+1o2dlR13WlqdFboFLeMJH+hVWou1SWWU9TZAFXr2+iMDjvmyEXmnypxdykgpudQU08O/kVlDY/cIXv2AO/ze9g/9u+lf8kiqhWTSrqrWnUOw5jEwNw9CIt+Ax7FirvS+l5cMzbHgwxacBn5btuIepWl6vgHE3hLB/qpfl86RxyRE/K41YG4lUVBp1vEWHB2oF42THKhSU9gAAAA=',
  },
  'assets/mascara-campo.webp': {
    h: 'data:image/webp;base64,UklGRtwAAABXRUJQVlA4INAAAADwBQCdASowABsAPwFsrU+rJiQiKqwBYCAJZQDEJHVunFLKrwJGHOctsza78UzavpYYqgxP6LWGgAD+/BdyUXWofxWkk4z+y2JK9/vDjJBUIOigyYxX7e2pqHVJ4zf97vq3YyA7iUN8v4A9z0sKOpGUnCi6v11SBkpqM8v/mVFb0gLlbMusHElhazmBUStfhH6cESiwuKkERZT1focP2EEim9qIBG18E93iM0bafrTOIJRW0AUK9RLs2JCnz/ygCuqR2UJQtHkikoRaJMdMn0AA',
    v: 'data:image/webp;base64,UklGRuQAAABXRUJQVlA4INgAAADwBgCdASobADAAPwFuslKrJaSiqrgKAWAgCWcAzjho4XvBE80z8lTF4ZYNuX2Vju+Toxwb1dBS0smcdLpLGSAAAP71KskktaWRwlOk30d06r8i6ce6drm6T63pd5z+7kh/2Zn3CHKBnuBdQ/I52082A6NQNwjq6OoJw4E5AazTJqlVMSoeN1qbsELrOo1D+/twSV8QLvU4LGcmyw9D3b4ljE2HkkJ9/tebGRuDAfTnEfnE2zyTE4SFIKtNtX4U8SeKQDH6IIqu7bJp5rNM43w3H7aK02lkAAA=',
  },
};
