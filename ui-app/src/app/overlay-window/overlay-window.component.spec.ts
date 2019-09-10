import { OverlayRemoteRef } from './overlay-remote-ref';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayWindowComponent } from './overlay-window.component';

describe('OverlayWindowComponent', () => {
  let component: OverlayWindowComponent;
  let fixture: ComponentFixture<OverlayWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OverlayWindowComponent ],
      providers: [{provide: OverlayRemoteRef, useValue:{}}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverlayWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
