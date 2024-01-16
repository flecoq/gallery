import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemExplorerComponent } from './system-explorer.component';

describe('SystemExplorerComponent', () => {
  let component: SystemExplorerComponent;
  let fixture: ComponentFixture<SystemExplorerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemExplorerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
