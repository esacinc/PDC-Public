import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarNciComponent } from './navbar-nci.component';

describe('NavbarNciComponent', () => {
  let component: NavbarNciComponent;
  let fixture: ComponentFixture<NavbarNciComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarNciComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarNciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
