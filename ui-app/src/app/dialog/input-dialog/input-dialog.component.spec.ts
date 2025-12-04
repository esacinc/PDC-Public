import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InputDialogComponent } from './input-dialog.component';
import { FormsModule } from '@angular/forms';

describe('InputDialogComponent', () => {
  let component: InputDialogComponent;
  let fixture: ComponentFixture<InputDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InputDialogComponent ],
      imports: [MatDialogModule, FormsModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            summaryData: {
              case_submitter_id: "14CO003",
              case_id: ""
            }
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
