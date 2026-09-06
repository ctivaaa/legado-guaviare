import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeccionFlota } from './seccion-flota';

describe('SeccionFlota', () => {
  let component: SeccionFlota;
  let fixture: ComponentFixture<SeccionFlota>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionFlota],
    }).compileComponents();

    fixture = TestBed.createComponent(SeccionFlota);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
