import { Component, OnInit } from '@angular/core';
import { NewsService} from '../news.service';

@Component({
    selector: 'app-news',
    templateUrl: './news.component.html',
    styleUrls: ['./news.component.css'],
    standalone: false
})
export class NewsComponent implements OnInit {
  cellular_proteomics_feeds: any;
  human_proteome_atlas_feeds: any;
  uniprot_feeds: any;
  nih_funding_feeds: any;
  constructor(private newsService: NewsService) {
    // const url = 'http%3A%2F%2Fproteomicsnews.blogspot.com%2Ffeeds%2Fposts%2Fdefault';
    const url_cellular_proteomics = 'http%3A%2F%2Ffeeds.feedburner.com%2FMCP_CurrentIssue';
    const url_human_proteome_atlas = 'https%3A%2F%2Fwww.proteinatlas.org%2Fnews%2Frss';
    const url_uni_prot = 'http%3A%2F%2Fwww.uniprot.org%2Fnews%2F?format=rss';
    const url_nih_funding_feed = 'https%3A%2F%2Fgrants.nih.gov%2Fgrants%2Fguide%2Fnewsfeed%2Ffundingopps.xml';
    this.newsService.getFeedContent(url_cellular_proteomics)
        .subscribe(( data: any ) => {
          console.log(data.items);
          this.cellular_proteomics_feeds = data.items;

        });
    this.newsService.getFeedContent(url_human_proteome_atlas)
        .subscribe(( data: any ) => {
          console.log(data.items);
          this.human_proteome_atlas_feeds = data.items;

        });
        this.newsService.getFeedContent(url_uni_prot)
        .subscribe(( data: any ) => {
          this.uniprot_feeds = data.items;

        });
        this.newsService.getFeedContent(url_nih_funding_feed)
        .subscribe(( data: any ) => {
          this.nih_funding_feeds = data.items;

        });
   }
  ngOnAfterViewInit() {
  }
  ngOnInit() {
  }

}
