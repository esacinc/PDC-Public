import { Component, OnInit,  ViewEncapsulation} from '@angular/core';
import { DataDictionaryService } from './data-dictionary.service';



@Component({
  encapsulation: ViewEncapsulation.None,
  selector: 'app-data-dictionary',
  templateUrl: './data-dictionary.component.html',
  styleUrls: ['./data-dictionary.component.css']
})
export class DataDictionaryComponent implements OnInit {
  dataDictionaryTable: any;
  categories: any;
  uniqueCategories = [];


  constructor(private dataDictionaryService: DataDictionaryService) {

    this.dataDictionaryService.getDataDictionary().subscribe((data: any) => {
    let categories = data;
    let dStr = "";
    let uniqueCategories = [];
    let NCItURL = "https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI%20Thesaurus&code=IDENTITY";

    //push the unique categories into an array
    for(let i=0;i<categories.length;i++){
      let cat = categories[i];
      let cName = cat.category;
      if(uniqueCategories.indexOf(cName) === -1){
        uniqueCategories.push(cName);
      }
     }

     uniqueCategories.sort();

     for(let j=0;j<uniqueCategories.length;j++){
        dStr += "<table class='dict_table' cellpadding='0' cellspacing='0'>";
        dStr += "<tr class='dict_tbl_header'><td colspan='2'>" + uniqueCategories[j] + "</td></tr>";

      //run through the main array again and show the sub item
        let l=0;
        for(let k=0;k<categories.length;k++){
            if(categories[k].category == uniqueCategories[j]){//if category matches
               dStr += "<tr";
               if((l+1)%2 == 0){
                  dStr += " class='dict_alt_row'";
               }
               l++;
               let urlStr = "";

               if(categories[k].cde_id != ""){
                  let itemURL = NCItURL.replace("IDENTITY", categories[k].cde_id);
                  urlStr = " (<a href='" + itemURL + "' target='_blank'>" + categories[k].cde_source + " - " + categories[k].cde_id +"</a>)";
               }
               dStr += ">";
               dStr += "<td class='dict_tbl_col1'><span dt='" + categories[k].entity +"' class='dictionaryItem' cat='" + uniqueCategories[j] + "'><a href='/pdc/data-dictionary/"+categories[k].entity+"'>" + categories[k].entity + "</a></span></td>";
               dStr += "<td class='dict_tbl_col2'>" + categories[k].description + " " + urlStr + "</td>";
               dStr += "</tr>";
             }
          }

      dStr += "</table><br/><br/>";

      this.dataDictionaryTable = dStr;

    }



  });


  }

  ngOnInit() {
  }

}
