import { MAT_DIALOG_DATA } from '@angular/material';
import { MatDialogModule } from '@angular/material';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MessageDialogComponent } from './message-dialog.component';

describe('MessageDialogComponent', () => {
  let component: MessageDialogComponent;
  let fixture: ComponentFixture<MessageDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MessageDialogComponent ],
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
    fixture = TestBed.createComponent(MessageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
