import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CameraToolComponent } from './camera-tool.component';

describe('CameraToolComponent', () => {
  let component: CameraToolComponent;
  let fixture: ComponentFixture<CameraToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CameraToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CameraToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
