import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SparqlDefaultPrefixesComponent } from './sparql-default-prefixes.component';

describe('SparqlDefaultPrefixesComponent', () => {
  let component: SparqlDefaultPrefixesComponent;
  let fixture: ComponentFixture<SparqlDefaultPrefixesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SparqlDefaultPrefixesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SparqlDefaultPrefixesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
