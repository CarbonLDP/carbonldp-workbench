import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalResizableGrid } from './horizontal-resizable-grid.component';

describe('VerticalResizerComponent', () => {
  let component: HorizontalResizableGrid;
  let fixture: ComponentFixture<HorizontalResizableGrid>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorizontalResizableGrid ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizontalResizableGrid);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
