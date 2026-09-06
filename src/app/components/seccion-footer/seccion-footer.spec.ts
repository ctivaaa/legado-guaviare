import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeccionFooter } from './seccion-footer';

describe('SeccionFooter', () => {
  let component: SeccionFooter;
  let fixture: ComponentFixture<SeccionFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeccionFooter],
    }).compileComponents();

    fixture = TestBed.createComponent(SeccionFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
