import { HeatmapViewerComponent } from "./heatmap-viewer.component";

import { of } from "rxjs";

describe("HeatmapViewerComponent", () => {
  let component: HeatmapViewerComponent;
  let router: any;
  let activeRouter: any;
  let service: any;
  let loc: any;

  beforeEach(() => {
    activeRouter = jasmine.createSpyObj([""]);
    router = jasmine.createSpyObj(["navigate"]);
    service = jasmine.createSpy("analysisService");
    activeRouter.queryParams = of({ StudyName: "name1" });
    activeRouter.snapshot = {paramMap:{get:(id)=> id}};
    loc = jasmine.createSpyObj([""]);
    loc.replaceState = function(value:string) {};
    component = new HeatmapViewerComponent({}, service, loc, activeRouter, router);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(router.navigate).toHaveBeenCalled();
    expect(component.study_name).toBe("name1");
  });

  it("test onSelect", () => {
    let file_location =
      "s3://pdcdatastore/raw-files/11/21/guot_L130410_001c_SW.wiff.zip";
    let title = "GUOT_L130410_001C_SW";
    let row_name = "GUOT_L130410_001C_SW";
    let col_name = "ST25730263";

    component.onSelect(file_location,row_name,col_name,title);

    expect(component.selectedMapFile).toBe(file_location);
    expect(component.selectedRowName).toBe(row_name);
    expect(component.selectedColName).toBe(col_name);
    expect(component.selectedMapTitle).toBe(title);
  });

});
