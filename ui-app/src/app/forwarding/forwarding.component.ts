import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ForwardingSearchService } from './forwarding.service';

@Component({
  selector: 'app-forwarding',
  templateUrl: './forwarding.component.html',
  styleUrls: ['./forwarding.component.scss'],
  providers: [ ForwardingSearchService ]
})
//@@@PDC-3901: Develop backend study forwarding
export class ForwardingComponent implements OnInit {
	
  studySearchResults = [];
  studyFound =  false;

  constructor(private forwardingService : ForwardingSearchService, private route:ActivatedRoute, private router: Router) { }

  ngOnInit() {
    //@@@PDC-3901: Develop backend study forwarding
    this.route.paramMap.subscribe(params => {
      //Fetch the query params in order to scroll to that section.
      //Eg: URL Type: pdc-dev.esacinc.com/forwarding/S056
      let param = params.get("id");
      //console.log(param);
      if (param.startsWith("S") || param.startsWith("s")) {
        this.searchStudiesForExternalReferences(param);
      } else {
        this.studyFound =  false;
      }
    });
  }

  //@@@PDC-3901: Develop backend study forwarding
  searchStudiesForExternalReferences(search_term) {
    this.forwardingService.getStudySearchByExternalRef(search_term).subscribe((data: any) =>{
       if (data && data.studySearchByExternalId && data.studySearchByExternalId.studies && data.studySearchByExternalId.studies.length > 0) {
          this.studyFound =  true;
          this.studySearchResults = Object.assign(this.studySearchResults, data.studySearchByExternalId.studies);
          const selectedIds = this.studySearchResults.map(({ pdc_study_id }) => pdc_study_id);
          var pdcStudyIds = selectedIds.join("|"); 
          //Other options to navigate current page to Browse page
          //window.location.replace("/pdc/browse/filters/pdc_study_id:"+pdcStudyIds);
          //window.location.href = "/pdc/browse/filters/pdc_study_id:" + pdcStudyIds;
          this.router.navigate(['browse/filters/pdc_study_id:'+ pdcStudyIds]);
        } else {
          this.studyFound =  false;
        }
      });
    }

}
