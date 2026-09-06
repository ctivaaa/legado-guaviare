import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeccionExodo } from './seccion-exodo';

describe('SeccionExodo', () => {
  let component: SeccionExodo;
  let fixture: ComponentFixture<SeccionExodo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionExodo],
    }).compileComponents();

    fixture = TestBed.createComponent(SeccionExodo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
