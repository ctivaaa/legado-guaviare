import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeccionInfancia } from './seccion-infancia';

describe('SeccionInfancia', () => {
  let component: SeccionInfancia;
  let fixture: ComponentFixture<SeccionInfancia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionInfancia],
    }).compileComponents();

    fixture = TestBed.createComponent(SeccionInfancia);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
