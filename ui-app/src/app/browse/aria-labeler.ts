//@@@PDC-8279-fix-508-compliance - adds aria label to primeng table elements 
import { Injectable } from '@angular/core';

@Injectable()
export class AriaLabeler{
    //Method to add aria-label attribute and text to all paginator
    //elements of the primeNg table.
    public addsAriaLabel2Paginators(): void {
        //list of common classes in the paginator elements
        const tempList = ["p-paginator-last", "p-paginator-first", "p-paginator-next", "p-paginator-prev"]
        //find all paginator link elements
        const linkElList = Array.from(document.querySelectorAll("button.p-paginator-element"));

        linkElList.forEach(x => {
          //clears classList of extra classes
          x.classList.remove("p-ripple", "p-element", "p-paginator-element", "p-link");

          //adds aria label if it is a page
          if (x.textContent) {
              x.classList.contains("p-highlight") ?
                  x.setAttribute("aria-label", "Page" + x.textContent + ", current page") :
                  x.setAttribute("aria-label", "Page " + x.textContent)

           //adds aria-label for remaining pagination elements
          } else if (tempList.includes(x.classList[0])) {
            x.setAttribute("aria-label", "Navigate to page " + this.getClassTranslation(x.classList[0]))
          }
          //repopulates classList with deleted classes
          x.classList.add("p-ripple", "p-element", "p-paginator-element", "p-link");
        });
        const linkElList_dropdown = Array.from(document.querySelectorAll("input.p-element"));

        //update to fix dropdown combobox
        linkElList_dropdown.forEach(x => {
            x.setAttribute("aria-label", "Page" + x.textContent + ", dropdown_trigger");
        });

      }

    //Method that returns the correct name of the navigation elements in pagination.
    private getClassTranslation(className: string) {
        if (className == "p-paginator-last") return "last";
        else if (className == "p-paginator-first") return "first";
        else if (className == "p-paginator-next") return "next";
        else if (className == "p-paginator-prev") return "previous";
        else return "";
    }
}
