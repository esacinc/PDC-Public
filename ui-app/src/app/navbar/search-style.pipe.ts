import { Pipe, PipeTransform } from '@angular/core';
/*
 * Added pipe to style search results in dropdown and highlight the search term
*/
//@@@PDC-465
//@@@PDC-519 - styling search option in drop down list
@Pipe({name: 'searchStyle'})
export class SearchStylePipe implements PipeTransform {
  transform(value: string, enteredValue:string): string {
	let return_value = "";
	//Need to check that enteredValue is actually a string or an object.
	//When it is a typeof string it is a search vallue otherwise the user already chose a search term
	if (typeof enteredValue === 'string') {
		let re = new RegExp(enteredValue, 'gi'); //create new regular expression to highlight the entered search string
		let values = value.split(" (");
		return_value = values[0].replace(re, "<strong>" + enteredValue.toUpperCase() + "</strong>");
		//If there was a description or proteins list 
		if (values.length > 1 ) {
			let temp = return_value;
			//In order to get the description in a line bellow gene name need nested div tags
			return_value = "<div style='display:flex; flex-direction:row; box-sizing:border-box;position:relatve; outline:none;'>" + temp;
			return_value += "<div><small><i>(" + values[1].replace(re, "<strong>" + enteredValue + "</strong>") + "</i></small></div></div>";
		}
	}
	return return_value;
  }
}