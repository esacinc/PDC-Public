import { Pipe, PipeTransform } from '@angular/core';
/*
 * Added pipe to style search results in dropdown and highlight the search term
*/
//@@@PDC-465
//@@@PDC-519 - styling search option in drop down list
//@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
@Pipe({name: 'searchStyle'})
export class SearchStylePipe implements PipeTransform {
  transform(value: string, enteredValue:string): string {
	let return_value = "";
	//Need to check that enteredValue is actually a string or an object.
	//When it is a typeof string it is a search vallue otherwise the user already chose a search term
	if (typeof enteredValue === 'string') {
		let re = new RegExp(enteredValue, 'gi'); //create new regular expression to highlight the entered search string
		let values = value.split(" (");
		if (enteredValue.length < 30) {
			//do not capitalize long strings like UUID 
			enteredValue = enteredValue.toUpperCase();
		}
		return_value = values[0].replace(re, "<strong>" + enteredValue + "</strong>");
		//If there was a description or proteins list 
		if (values.length > 1 ) {
			let temp = return_value;
			//In order to get the description in a line bellow gene name need nested div tags
			return_value = "<div style='display:flex; flex-direction:row; box-sizing:border-box;position:relatve; outline:none;'>" + temp;
			return_value += "<div><small><i>(" + values[1].replace(re, "<strong>" + enteredValue + "</strong>") + "</i></small></div></div>";
		}
		//@@@PDC-1441: Add ability to search by case, study, aliquot, sample UUIDs on UI search box
		//Add custom styling to Study, Case search
		let studyOrCaseValues = return_value.split("{");
		if (studyOrCaseValues.length > 1) {
			let submitterIDVal = "";
			let pdc_study_id = "";
			let submitterVal = studyOrCaseValues[1];
			let nameSubmitterIDVal = submitterVal.split("}");
			let labelUUIDVal = studyOrCaseValues[0].split(": ");
			let labelForStudyCaseVal = labelUUIDVal[0];
			let uuidVal = labelUUIDVal[1];
			//@@@PDC 1875: Update search to be able to search by new PDC ID
			//For study search, retrieve the PDC Study ID
			if (labelForStudyCaseVal == "ST" && nameSubmitterIDVal.length > 1) {
				let sub_id_pdc_study_id = nameSubmitterIDVal[1].split("~");
				pdc_study_id = sub_id_pdc_study_id[1];
			}

			return_value = "<div><div><span><small>";
			return_value =  return_value + labelForStudyCaseVal + ":&nbsp;</small></span>";
			if (labelForStudyCaseVal == "ST") {
				//@@@PDC 1875: Update search to be able to search by new PDC ID
				//For study search, display the PDC Study ID followed by other data.
				return_value =  return_value + "<small><i>" + pdc_study_id + "</i></small></div>";
			} else {
				if (uuidVal != "") {
					return_value =  return_value + "<small><i>" + uuidVal + "</i></small></div>";
				} 
			}
			if (nameSubmitterIDVal.length > 1) {
				submitterVal = nameSubmitterIDVal[0];
				submitterIDVal = nameSubmitterIDVal[1];
			} 
			if (submitterIDVal != "") {
				//If the string contains submitter ID (eg: Study), append it to the result
				return_value =  return_value + "<div><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><small>" + submitterVal + "</small></div>";
				if (labelForStudyCaseVal == "AL" || labelForStudyCaseVal == "SA") {
					return_value =  return_value + "<div><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><small><i>Case: " + submitterIDVal + "</i></small></div></div>";
				} else if (labelForStudyCaseVal == "ST") {
					//@@@PDC 1875: Update search to be able to search by new PDC ID
					//For study search, display the Study UUID in the end.
					return_value =  return_value + "<div><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><small><i>" + uuidVal + "</i></small></div></div>";
				} else {
					return_value =  return_value + "<div><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><small><i>" + submitterIDVal + "</i></small></div></div>";
				}
			} else {
				if (labelForStudyCaseVal == "SA") {
					return_value =  return_value + "<div><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><small>Case: " + submitterVal + "</small></div></div>";
				} else {
					return_value =  return_value + "<div><span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><small>" + submitterVal + "</small></div></div>";
				}
			}
		}
	}
	return return_value;
  }
}