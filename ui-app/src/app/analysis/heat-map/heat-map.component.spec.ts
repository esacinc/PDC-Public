import { HeatMapComponent } from './heat-map.component';

describe("HeatMapComponent", () => {
  let component: HeatMapComponent;

  beforeEach(() => {
    let document = {};
    let route: any = {};
    let http: any = {};
    component = new HeatMapComponent(document, route, http);
  });

  it("should create", () => {
    component.loadFiles("");
    expect(component).toBeTruthy();
  });

  it("test getFileContent", () => {
    let fname = [];
    fname.push("heatmap");
    let rowLabel: string = "rlabel";
    let colLabel: string = "clabel";

    component.getFileContent(fname, rowLabel, colLabel);
    expect(component.url).toBeUndefined();
  });

  it("test openFile", () => {
    let fname: string = "heatmap";
    let rowLabel: string = "rlabel";
    let colLabel: string = "clabel";

    component.openFile(fname, rowLabel, colLabel);
    expect(component.loading).toBeTruthy();
    expect(component.url).toBe('/view_heatmap.html?fname=pdc/undefined');
  });
});
