import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SparqlEditorToolBarComponent } from './sparql-editor-tool-bar.component';

describe('SparqlEditorToolBarComponent', () => {
  let component: SparqlEditorToolBarComponent;
  let fixture: ComponentFixture<SparqlEditorToolBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SparqlEditorToolBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SparqlEditorToolBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
