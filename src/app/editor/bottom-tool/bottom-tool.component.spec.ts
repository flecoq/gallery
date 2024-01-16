import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomToolComponent } from './bottom-tool.component';

describe('BottomToolComponent', () => {
  let component: BottomToolComponent;
  let fixture: ComponentFixture<BottomToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BottomToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BottomToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
