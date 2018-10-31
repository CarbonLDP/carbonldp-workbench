import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SparqlErrorMessageAreaComponent } from './sparql-error-message-area.component';

describe('SparqlErrorMessageAreaComponent', () => {
  let component: SparqlErrorMessageAreaComponent;
  let fixture: ComponentFixture<SparqlErrorMessageAreaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SparqlErrorMessageAreaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SparqlErrorMessageAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
