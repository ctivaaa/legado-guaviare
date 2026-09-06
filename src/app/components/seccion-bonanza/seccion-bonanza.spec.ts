import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeccionBonanza } from './seccion-bonanza';

describe('SeccionBonanza', () => {
  let component: SeccionBonanza;
  let fixture: ComponentFixture<SeccionBonanza>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionBonanza],
    }).compileComponents();

    fixture = TestBed.createComponent(SeccionBonanza);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
