import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAddCameraComponent } from './modal-add-camera.component';

describe('ModalAddCameraComponent', () => {
  let component: ModalAddCameraComponent;
  let fixture: ComponentFixture<ModalAddCameraComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAddCameraComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalAddCameraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
