//@@@PDC-1214 - Replace the sunburst chart with the human body image with drill down
// Defines data fields for constructing human body image.
export interface HumanBody {
  caseCountKey?: string;
  clickHandler?: (e: any) => void;
  mouseOverHandler?: (e: any) => void;
  mouseOutHandler?: (e: any) => void;
  data?: any;
  height?: number;
  labelSize?: string;
  offsetLeft?: number;
  offsetTop?: number;
  primarySiteKey?: string;
  selector?: string;
  width?: number;
  tickInterval?: number;
  title?: string;
  selectedHumanBodyOrgans?: string;
  numberofOrgansFromAPI?: number;
}
