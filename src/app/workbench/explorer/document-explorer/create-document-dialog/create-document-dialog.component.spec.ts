import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDocumentDialogComponent } from './create-document-dialog.component';

describe('CreateDocumentDialogComponent', () => {
  let component: CreateDocumentDialogComponent;
  let fixture: ComponentFixture<CreateDocumentDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateDocumentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateDocumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
