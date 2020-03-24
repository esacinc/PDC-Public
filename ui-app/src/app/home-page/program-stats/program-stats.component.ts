import { Component, OnInit } from '@angular/core';
import { FrontPageService } from '../front-page.service';
import { Apollo } from 'apollo-angular';
import { MatButton } from '@angular/material';
import {ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'app-program-stats',
  templateUrl: './program-stats.component.html',
  styleUrls: ['./program-stats.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProgramStatsComponent implements OnInit {
  programsCounter = 0;
  projectsCounter = 0;
  studiesCounter = 0;
  filesCounter = 0;
  experimentsCounter = 0;
  spectraCounter = 0;
  proteinCounter = 0;
  peptideCounter = 0;
  dataSize = 0;

  constructor(private apollo: Apollo,
              private frontPageService: FrontPageService) { }

  // Get data for portal stats statistics table
  // @@@PDC-210
  getAllProgramsData() {
    this.frontPageService.getPortalStats().subscribe((data: any) => {
    //@@@PDC-1123 call ui wrapper API
      this.programsCounter = data.uiPdcDataStats[0].program;
      this.projectsCounter = data.uiPdcDataStats[0].project;
      this.filesCounter = data.uiPdcDataStats[0].data_file;
      this.dataSize = data.uiPdcDataStats[0].data_size;
      this.spectraCounter = data.uiPdcDataStats[0].spectra;
      this.peptideCounter = data.uiPdcDataStats[0].peptide;
      this.proteinCounter = data.uiPdcDataStats[0].protein;
      this.studiesCounter = data.uiPdcDataStats[0].study;
    });

  }
  ngOnInit() {
    this.getAllProgramsData();
  }

}
