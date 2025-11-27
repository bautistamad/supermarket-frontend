import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProveedoresCardsComponent } from './proveedores-cards.component';

describe('ProveedoresCardsComponent', () => {
  let component: ProveedoresCardsComponent;
  let fixture: ComponentFixture<ProveedoresCardsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProveedoresCardsComponent]
    });
    fixture = TestBed.createComponent(ProveedoresCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
