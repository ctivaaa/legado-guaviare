import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeccionHoy } from './seccion-hoy';

describe('SeccionHoy', () => {
  let component: SeccionHoy;
  let fixture: ComponentFixture<SeccionHoy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionHoy],
    }).compileComponents();

    fixture = TestBed.createComponent(SeccionHoy);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
