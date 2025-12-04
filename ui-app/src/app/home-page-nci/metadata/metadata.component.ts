import { OnInit, Component, ViewEncapsulation } from "@angular/core";
import { FrontPageService } from "../front-page.service";
import { TissueSite, QueryTissueSites, QueryDiseases, QueryPrograms, QueryPortalStats, PortalStats, QuerySunburstData, HumanbodyImageData } from '../../types';


@Component({
  selector: "app-metadata",
 
  templateUrl: "./metadata.component.html",
  styleUrl: "./metadata.component.css",
  providers: [FrontPageService],
  standalone: false, 
  //encapsulation: ViewEncapsulation.Emulated

})
export class MetadataComponent implements OnInit {
  programsCounter = 0;
  projectsCounter = 0;
  studiesCounter = 0;
  filesCounter: string | number = 0;
  experimentsCounter = 0;
  spectraCounter: string | number = 0;
  proteinCounter = 0;
  peptideCounter: string | number = 0;
  caseCounter = 0;
  diseaseTypeCounter = 0;
  dataSize = 0;
  items: any[] = [];

  constructor(private metadataService: FrontPageService) {
  
  
  }

  getAllProgramsData() {
    this.metadataService.getPortalStats().subscribe((data: any) => {
    //@@@PDC-1123 call ui wrapper API
      console.log("Fetching portal stats...");
      console.log(data);
      this.programsCounter = data.pdcDataStats[0].program;
      this.projectsCounter = data.pdcDataStats[0].project;
      this.filesCounter = data.pdcDataStats[0].data_file.toLocaleString();
      this.dataSize = data.pdcDataStats[0].data_size.toLocaleString();
      this.spectraCounter = this.round(Number(data.pdcDataStats[0].spectra));
      this.peptideCounter = this.round(Number(data.pdcDataStats[0].peptide));
      this.proteinCounter = data.pdcDataStats[0].protein.toLocaleString();
      this.studiesCounter = data.pdcDataStats[0].study;
      this.caseCounter = data.pdcDataStats[0].case.toLocaleString();
      this.diseaseTypeCounter = data.pdcDataStats[0].disease_type;
    });

    this.items = [
      {
        icon: "studies-icon.png",
        value: this.studiesCounter,
        title: "Studies",
      },
      {
        icon: "data-frame.png",
        value: "43 TB",
        title: "Data Volume",
      },
      {
        icon: "data-files 1.png",
        value: "133,984",
        title: "Data Files",
      },
      {
        icon: "user-alt.png",
        value: "4000",
        title: "Cases",
      },
      {
        icon: "disease-types.png",
        value: "30",
        title: "Disease Types",
      },
      {
        icon: "molecule2 1.png",
        value: "16,601",
        title: "Proteins",
      },
    ];

  }
  ngOnInit() {
    this.getAllProgramsData();
  }
 

  //@@@PDC-1986: Round the Program Statistics numbers to nearest Millions
  round(num: number) {
    return Math.abs(Number(num)) >= 1.0e+9
        ? Math.round(Math.abs(Number(num)) / 1.0e+9 ) + " B"
        : Math.abs(Number(num)) >= 1.0e+6
            ? Math.round(Math.abs(Number(num)) / 1.0e+6 ) + " M"
                : Math.abs(Number(num)); 
  }



  
  

}
