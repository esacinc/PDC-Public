import { Component, OnInit, Inject, HostListener, Renderer2, ElementRef } from "@angular/core";

@Component({
  selector: 'app-submit-data',
  templateUrl: './submit-data.component.html',
  styleUrls: ['./submit-data.component.scss']
})

//@@@PDC-1284: Add the 'how to submit data' under HELP
//@@@PDC-1489: Alignment issues in Submit Data page
export class SubmitDataFAQComponent implements OnInit {
  constructor(private elRef:ElementRef, private _renderer: Renderer2) {}
  ngOnInit() {}

  @HostListener("window:scroll", [])
  //On scroll, if the user reaches bottom of the page, change CSS classes to position the PDC architecture diagram as required.
  onWindowScroll() {
      if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        // you're at the bottom of the page
        let matExpansionIndicator = this.elRef.nativeElement.querySelectorAll('.sticky-nav');
        for (var i = 0; i < matExpansionIndicator.length; i++) {
          this._renderer.removeClass(matExpansionIndicator[i], 'fixed-class');
          this._renderer.addClass(matExpansionIndicator[i], 'absolute-class');
        }
      }  else {
        let matExpansionIndicator = this.elRef.nativeElement.querySelectorAll('.sticky-nav');
        for (var i = 0; i < matExpansionIndicator.length; i++) {
          this._renderer.removeClass(matExpansionIndicator[i], 'absolute-class');
          this._renderer.addClass(matExpansionIndicator[i], 'fixed-class');
          //@@@PDC-1748: Make the Workflow image on the Submit Data page static
          var topHeight = document.documentElement.scrollTop;
          this._renderer.setStyle(matExpansionIndicator[i], 'top', topHeight + "px");
        } 
      }  
  }

  //@@@PDC-1489: Alignment issues in Submit Data page
  //Scroll to a particular section of the page.
  scrollToElement($element): void {
    $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }
}
