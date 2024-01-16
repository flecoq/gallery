import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaterialSelectorComponent } from './material-selector.component';

describe('MaterialSelectorComponent', () => {
  let component: MaterialSelectorComponent;
  let fixture: ComponentFixture<MaterialSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaterialSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaterialSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
