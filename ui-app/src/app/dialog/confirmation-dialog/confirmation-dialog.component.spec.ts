import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA, MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let component: ConfirmationDialogComponent;
  let fixture: ComponentFixture<ConfirmationDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfirmationDialogComponent ],
      imports: [MatDialogModule],
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
    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
