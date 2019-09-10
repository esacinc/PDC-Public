import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-analysis',
  templateUrl: './analysis.component.html',
  styleUrls: ['./analysis.component.css']
})
export class AnalysisComponent implements OnInit {

  @Input() analysis_id: string;
  
  constructor() { }

  ngOnInit() {
    window.scrollTo(0, 0);
  }

}
