import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeccionRaices } from './seccion-raices';

describe('SeccionRaices', () => {
  let component: SeccionRaices;
  let fixture: ComponentFixture<SeccionRaices>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionRaices],
    }).compileComponents();

    fixture = TestBed.createComponent(SeccionRaices);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
