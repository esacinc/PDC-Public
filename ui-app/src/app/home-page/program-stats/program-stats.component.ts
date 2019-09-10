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
      this.programsCounter = data.pdcDataStats[0].program;
      this.projectsCounter = data.pdcDataStats[0].project;
      this.filesCounter = data.pdcDataStats[0].data_file;
      this.dataSize = data.pdcDataStats[0].data_size;
      this.spectraCounter = data.pdcDataStats[0].spectra;
      this.peptideCounter = data.pdcDataStats[0].peptide;
      this.proteinCounter = data.pdcDataStats[0].protein;
    });

  }
  ngOnInit() {
    this.getAllProgramsData();
  }

}
