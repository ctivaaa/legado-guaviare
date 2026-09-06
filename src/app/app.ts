import {Component} from '@angular/core';
import {Hero} from './components/hero/hero';
import {SeccionHoy} from './components/seccion-hoy/seccion-hoy';
import {SeccionBonanza} from './components/seccion-bonanza/seccion-bonanza';
import {SeccionExodo} from './components/seccion-exodo/seccion-exodo';
import {SeccionFlota} from './components/seccion-flota/seccion-flota';
import {SeccionInfancia} from './components/seccion-infancia/seccion-infancia';
import {SeccionRaices} from './components/seccion-raices/seccion-raices';
import {SeccionFooter} from './components/seccion-footer/seccion-footer';

@Component({
  selector: 'app-root',
  standalone: true,
  imports:[Hero,
    SeccionHoy,
    SeccionBonanza,
    SeccionExodo,
    SeccionFlota,
    SeccionInfancia,
    SeccionRaices,
    SeccionFooter
  ],
  templateUrl:'./app.html',
  styleUrl:'./app.css'
})
export class App {}
