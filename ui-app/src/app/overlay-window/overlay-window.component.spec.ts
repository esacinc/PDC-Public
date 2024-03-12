import { OverlayRemoteRef } from './overlay-remote-ref';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OverlayWindowComponent } from './overlay-window.component';

describe('OverlayWindowComponent', () => {
  let component: OverlayWindowComponent;
  let fixture: ComponentFixture<OverlayWindowComponent>;

  beforeEach(waitForAsync(() => {
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
