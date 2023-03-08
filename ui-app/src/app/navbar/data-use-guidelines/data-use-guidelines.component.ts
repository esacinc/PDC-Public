import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-data-use-guidelines',
  templateUrl: './data-use-guidelines.component.html',
  styleUrls: ['./data-use-guidelines.component.scss']
})
//@@@PDC-3251: Develop Data Policy page
export class DataUseGuidelinesComponent implements OnInit {

  constructor(private route:ActivatedRoute, private loc: Location) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      //Fetch the query params in order to scroll to that section.
      //Eg: URL Type: pdc-dev.esacinc.com/faq/Multiple_Files
      let scrollSection = params.get("id");
      if (scrollSection !=null ||scrollSection != undefined) {
        var x = document.getElementById(scrollSection);
        x.scrollIntoView();
      }
    });
  }


  //@@@PDC-1628: Update the FAQ page on the data portal
  //Scroll to a particular section of the page.
  scrollToElement($element, eleID = ''): void {
    //@@@PDC-4692: Create bookmarks for FAQ
    this.loc.go("/data-use-guidelines/" + eleID);
    $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }

}
