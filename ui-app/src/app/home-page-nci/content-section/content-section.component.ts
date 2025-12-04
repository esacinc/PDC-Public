import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";




@Component({
  selector: "app-content-section",

  templateUrl: "./content-section.component.html",
  styleUrl: "./content-section.component.css",
  standalone: false
})
export class ContentSectionComponent {
   //@@@PDC-9906 -updates redesign of the home page - updated images
   //newsData = '/assets/data-folder/news.json';
    newsData: any = [];

   cardData = [
    {
      imgSrc: "pancancerCircle.png",
      link: "/pdc/cptac-pancancer",
      linkText: "CPTAC Pan-Cancer Data",
      description: "Explore data, publications, and supplementary materials from CPTAC’s pan-cancer analysis.",
    },
    {
      imgSrc: "cloud-data.jpg",
      link: "/pdc/cloud-data-analysis",
      linkText: "Cloud Data Analysis",
      description: "Analyze PDC datasets in the cloud using scalable workflows and integrated tools.",
    },
    {
      imgSrc: "submit-data.jpg",
      link: "/pdc/submit-data",
      linkText: "How to Submit Data",
      description: "Submit your proteomics data to support cancer research and FAIR sharing.",
    },
  ];

  infoCards = [
    {
      imgSrc: "cite-pdc.jpg",
      link: "/pdc/data-use-guidelines#Cite_PDC",
      linkText: "Cite PDC",
      description: "Citing PDC resource, datasets and associated publication.",
    },
    {
      imgSrc: "release-notes.jpg",
      link: "/pdc-docs",
      linkText: "Documentation",
      description: "Find user guides, tutorials and information on PDC processes.",
    },
    {
      imgSrc: "tech-advancement-studies.jpg",
      link: "/pdc/TechnologyAdvancementStudies",
      linkText: "Technology Advancement Studies",
      description: "Explore CPTAC studies that benchmark and improve proteomic technologies.",
    },
  ];
   constructor(private http: HttpClient) {}

   ngOnInit() {
    this.http.get('/assets/data-folder/news.json').subscribe(data => {
      this.newsData = data['news'].slice(0,4);
      console.log(data);
    });
  }

}
