import { OverlayWindowService } from "./overlay-window/overlay-window.service";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TestBed, waitForAsync } from "@angular/core/testing";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatMenuModule } from "@angular/material/menu";
import { RouterTestingModule } from "@angular/router/testing";

import { AppComponent } from "./app.component";
import { SearchStylePipe } from "./navbar/search-style.pipe";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";

class MockOverlayWindowService {
  open(): void {}
}

describe("AppComponent", () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [AppComponent, SearchStylePipe],
    schemas: [NO_ERRORS_SCHEMA],
    imports: [RouterTestingModule,
        MatAutocompleteModule,
        MatMenuModule],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
});

    TestBed.overrideComponent(AppComponent, {
      set: {
        providers: [
          {
            provide: OverlayWindowService,
            useClass: MockOverlayWindowService
          }
        ]
      }
    });

    TestBed.compileComponents();
  }));

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'app'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual("app");
  });
});
