import { SafeHtmlPipe } from "./safe-html-pipe";

describe("SafeHtmlPipe", () => {
  let pipe: SafeHtmlPipe;
  let mock;

  beforeEach(() => {
    mock = {
      bypassSecurityTrustResourceUrl: value => value
    };
    pipe = new SafeHtmlPipe(mock);
  });

  it("create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  it("test transform", () => {
    spyOn(mock, "bypassSecurityTrustResourceUrl").and.returnValue("pdc.browse");
    expect(pipe.transform("pdc.homepage")).toBe("pdc.browse");
  });
});
