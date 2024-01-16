import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportDetailComponent } from './support-detail.component';

describe('SupportDetailComponent', () => {
  let component: SupportDetailComponent;
  let fixture: ComponentFixture<SupportDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupportDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
