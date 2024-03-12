import { NgModule } from '@angular/core';

import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule, MatToolbarRow } from '@angular/material/toolbar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
    imports: [
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatCardModule,
        MatDialogModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatToolbarModule,
        BrowserAnimationsModule,
        MatAutocompleteModule,
    ],
    exports: [
        MatButtonModule,
        MatMenuModule,
        MatIconModule,
        MatCardModule,
        MatDialogModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule,
        MatToolbarModule,
        MatToolbarRow, BrowserAnimationsModule,
        MatAutocompleteModule
    ]
})
export class MaterialModule { }