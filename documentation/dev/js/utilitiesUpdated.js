//@@@PDC-1173: Generate PDC Data Dictionary from the newly generated JSON Files
//The PDC Data Dictionary is currently generated from the JSON Files which Deepak had created (utilities.js). 
// Generate PDC Data Dictionary from the newly generated JSON Files which are compliant with the GDC YAML files from this file.
// The newly generated JSON Files are available in the PDC Git in: dictionary/JSON folder.
//@@PDC 1362: Create an automated script to merge GDC Data Dictionary with PDC DD
var dictionaryURL = 'json/dictionary.json';
var dictionaryItemURL = 'json/';
var dictionaryEntities = undefined;
var curEntity;
var curEntityDesc;
var curCategory;
var dictionaryData;
var caDSRURL = "https://cdebrowser.nci.nih.gov/cdebrowserClient/cdeBrowser.html#/search?publicId=IDENTITY&version=2.0";
var NCItURL = "https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI%20Thesaurus&code=IDENTITY";
var PSIMSURL = "http://purl.obolibrary.org/obo/IDENTITY";
var hasExamples = false;
var categoriesForDictItem;

$(document).ready(function () {
        var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
        if (window.location.hash && isChrome) {
            setTimeout(function () {
                var hash = window.location.hash;
                window.location.hash = "";
                window.location.hash = hash;
            }, 300);
        }
});


/*
Loads a JSON file
*/
function loadJSON(url, reqData, callbackFn){
  $.getJSON(url, reqData, function(resData){
  //$.post(url, reqData, function(resData){
    callbackFn(resData);
  }).fail(function(textStatus, error) {
    //alert( "Error submitting form!" + error);
  });
}

//This is the new function written based on the flat JSON structure
function loadDictionary(){
  var postData = {
                    id:'refid'
                  };
  loadJSON(dictionaryURL, postData, paintDictionary);
}

//paints the dictionary
function paintDictionary(data){
    dictionaryData = data;
    var categories = data;//data is in the form of an array
    var dStr = "";
    var uniqueCategories = [];

    //set the page pageTitle
    $(".pageTitle").html("Data Dictionary");
    $(".pageViewSwap").html("<a href='dictionarygraph.html'>Explore Data Model</a>");
    $(".pageBackNav").html("");

    //push the unique categories into an array
    for(var i=0;i<categories.length;i++){
      var cat = categories[i];
      var cName = cat.category;
      if(uniqueCategories.indexOf(cName) === -1){
        uniqueCategories.push(cName);
      }
    }

    //sort the categories in alphabetical order
    uniqueCategories.sort();

    //run through the unique array
    for(var j=0;j<uniqueCategories.length;j++){
      dStr += "<table class='dict_table' cellpadding='0' cellspacing='0'>";
      dStr += "<tr class='dict_tbl_header'><td colspan='2'>" + uniqueCategories[j] + "</td></tr>";

      //run through the main array again and show the sub item
      var l=0;
      for(var k=0;k<categories.length;k++){
        if(categories[k].category == uniqueCategories[j]){//if category matches
          dStr += "<tr";

          if((l+1)%2 == 0){
            dStr += " class='dict_alt_row'";
          }
          l++;

          //the Source and ID if provided
          var urlStr = "";

          if(categories[k].cde_id != ""){
            var itemURL = NCItURL.replace("IDENTITY", categories[k].cde_id);
            urlStr = " (<a href='" + itemURL + "' target='_blank'>" + categories[k].cde_source + " - " + categories[k].cde_id +"</a>)";
          }

          dStr += ">";
          dStr += "<td class='dict_tbl_col1'><span dt='" + categories[k].entity +"' class='dictionaryItem' cat='" + uniqueCategories[j] + "'>" + categories[k].entity + "</span></td>";
          dStr += "<td class='dict_tbl_col2'>" + categories[k].description + " " + urlStr + "</td>";
          dStr += "</tr>";
        }
      }

      dStr += "</table><br/><br/>";
    }

    $(".dictionaryTable").html(dStr);

    //set the Events
    //when user clicks on any link on the dictionary page
    setEvents();
}

function setEvents(){
    //when user clicks on any link on the dictionary page
    $(".contentArea").on('click', '.pageBackNav', function(){
      var itemName = $(this).html();
      if(itemName == "&lt;back to dictionary"){
        window.location = "dictionary.html";
      }
    });
  
    $(".contentArea").on('click', '.dictionaryItem', function(){
      //get the id of the entity
      var id = $(this).attr('dt');
  
      //Launch the dictionary item page
      window.location = "dictionaryitem.html?eName=" + id;
    });
}

/*
Searches the query string portion of the URL and returns the
value of the supplied key
*/
function getQueryItem(key){
    var pageURL = decodeURI(window.location.search.substring(1));
    var URLVars = pageURL.split('&');
    for (var i = 0; i < URLVars.length; i++){
        var paramItem = URLVars[i].split('=');
        if (paramItem[0] == key){
            return paramItem[1];
        }
    }
}

//This is the new function written based on the flat JSON structure shared by Deepak on Aug 9, 2018
function loadDictionaryforDictItem(){
    var postData = {
                      id:'refid'
                    };
    loadJSON(dictionaryURL, postData, paintDictionaryForDictItem);
}

//paints the dictionary
function paintDictionaryForDictItem(data){
    //dictionaryData = data;
    categoriesForDictItem = data;//data is in the form of an array
}

//This new function reads the dictionary entities from a single JSON and populates the data
function loadDictionaryItem(itemID){
    curEntity = itemID;
    //check if the JSON is already loaded.
    var postData = {
                      id:itemID
                    };
    itemID = itemID.replace(/\s/g, '');
    itemID = itemID.replace('-', '');
    var dictItemURL = dictionaryItemURL + itemID.toLowerCase() +'.json';    
    loadJSON(dictItemURL, postData, paintDictionaryItem);
}

//Capitalizes first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

//Paints the dictionary item
function paintDictionaryItem(data){
    var dStr = "";
    dictionaryEntities = data;
    //turn off Events
    //$(".contentArea").off('click');
    var curEntityData = data;
    //set the page pageTitle
    $(".pageTitle").html(curEntity);
    $(".pageDesc").html("");
    $(".pageBackNav").html("&lt;back to dictionary");
    //set the Events
    setEvents();
    if (curEntityData.length == 0) {
        $(".dictionaryTable").html("");
        return;
    }
    dStr += "<div class='tableTitle'>Summary</div>";

    dStr += "<table class='itemCollTable' cellpadding='0' cellspacing='1'>";
    dStr += "<tr>";
    dStr += "<td class='itemCollCol1'>Type</td>";
    dStr += "<td class='itemCollCol2'>" + curEntity + "</td>";
    dStr += "</tr>";
    dStr += "<tr>";
    dStr += "<td class='itemCollCol1'>Category</td>";
    var currentCategory = '';
    if (curEntityData.category) {
        currentCategory = capitalizeFirstLetter(curEntityData.category);
    }
    dStr += "<td class='itemCollCol2'>" + currentCategory + "</td>";
    dStr += "</tr>";
    dStr += "<tr>";
    dStr += "<td class='itemCollCol1'>Description</td>";
    //the Source and ID if provided
    var urlStr = catCDEID = carCDESource = "";
    for(var i=0; i < categoriesForDictItem.length; i++){
        var cat = categoriesForDictItem[i];
        if (cat.entity == curEntity) {
            carCDESource = cat.cde_source;
            catCDEID = cat.cde_id;
        }
    }
    if (catCDEID != "" && carCDESource != "") {
        var itemURL = NCItURL.replace("IDENTITY", catCDEID);
        urlStr = " (<a href='" + itemURL + "' target='_blank'>" + carCDESource + " - " + catCDEID +"</a>)";
    }
    dStr += "<td class='itemCollCol2'>" + curEntityData.description + " " + urlStr + "</td>";
    dStr += "</tr>";
    //Unique Keys
    dStr += "<td class='itemCollCol1'>Unique Keys</td>";
    dStr += "<td class='itemCollCol2'>";

    //paint the general details
    var uniqueKeyDetails = curEntityData.uniqueKeys;
    if (uniqueKeyDetails && uniqueKeyDetails.length > 0) {
        dStr += "<ul>";
        var keyDetails = uniqueKeyDetails[0];
        if (keyDetails instanceof Array) {
            for (var i = 0; i < keyDetails.length; i++) {
                dStr += "<li>" + keyDetails[i] + "</li>";
            }
        } else {
            //@@PDC 1362: Create an automated script to merge GDC Data Dictionary with PDC DD
            // The "Links" item structure is different for the newly added 
            // Clinical entities like 'Family History', 'Exposure' ,etc.
            for (var i = 0; i < uniqueKeyDetails.length; i++) {
                dStr += "<li>" + uniqueKeyDetails[i] + "</li>";
            } 
        }
        dStr += "</ul>"
    }
  dStr += "</td>";
  dStr += "</tr>";
  dStr += "</table><br/><br/>";
  //paint the Links 
  var dictItemLinks = curEntityData.links;
  if (dictItemLinks && dictItemLinks.length > 0) {
    dStr += "<div class='tableTitle'>Links</div>";

    dStr += "<table class='itemCollTable' cellpadding='0' cellspacing='1'>";
    dStr += "<tr class='dict_tbl_header'>";
    dStr += "<td class='linksCollCol1'>Name</td>";
    dStr += "<td class='linksCollCol2'>Required</td>";
    dStr += "<td class='linksCollCol3'>Label</td>";
    dStr += "</tr>";
  
    var colRef = 1;
    for (var j = 0; j < dictItemLinks.length; j++) {
        dStr += "<tr";
        if(colRef == 2){
        dStr += " class='dict_alt_row'";
        colRef = 1;
        }else{
        colRef++;
        }
        dStr += ">";
        dStr += "<td class='linksCollCol1'><span dt='" + dictItemLinks[j].name +"' class='dictionaryItem'>" + dictItemLinks[j].name + "</span></td>";
        dStr += "<td class='linksCollCol2'>";
        dStr += dictItemLinks[j].required;
        dStr += "</td>";
        dStr += "<td class='linksCollCol3'>" + dictItemLinks[j].label +"</td>";
        dStr += "</tr>";
    }
    dStr += "</table><br/><br/>";
    }
    //paint the project details
    dStr += "<div class='tableTitle'>Properties</div>";
    dStr += "<table class='itemPropertiesTable' cellpadding='0' cellspacing='1'>";
    dStr += "<tr class='dict_tbl_header'>";
    dStr += "<td class='propCollCol1'>Name</td>";
    dStr += "<td class='propCollCol2' ";
/*     if(hasExamples){
        dStr += "style='width:34%;'";
    }  */
    dStr+= ">Description</td>";  
    dStr += "<td class='propCollCol3'>Acceptable Types/Values</td>";
    dStr += "<td class='propCollCol4'>Required</td>";
    dStr += "<td class='propCollCol5'>CDE</td>";
/*     if(hasExamples){
        dStr += "<td class='propCollCol6'>Example</td>";
    } */
    dStr += "</tr>";
  //paint the general details
  var colRef = 1;
  var dictItemProperties = curEntityData.properties;
  //var output = [], item;
  //@@@PDC-4336: Update the PDC Data dictionary & Workspace YAML files to sync with GDC
  var deprecatedProperties = [];
  if (curEntityData.deprecated) {
  	var dictItemDeprecatedProperties = curEntityData.deprecated;
  	deprecatedProperties = Object.values(dictItemDeprecatedProperties);
  }

  for (var dictItem in dictItemProperties) {
    //@@@PDC-4336: Update the PDC Data dictionary & Workspace YAML files to sync with GDC
    if((!dictItemProperties[dictItem].key && deprecatedProperties.length == 0) || (!dictItemProperties[dictItem].key && deprecatedProperties.length > 0 && !deprecatedProperties.includes(dictItem))) {
        dStr += "<tr";

        if (colRef == 2){
            dStr += " class='dict_alt_row'";
            colRef = 1;
        } else {
            colRef++;
        }
    
        dStr += ">";
        //Column 1
        dStr += "<td class='propCollCol1'><a name='" + dictItem + "' id='" + dictItem + "'>" + dictItem + "</a></td>";
        //Column 2
        var dictItemDesc = "";
        if (dictItemProperties[dictItem].description) {
            dictItemDesc = dictItemProperties[dictItem].description;
        }
        dStr += "<td class='propCollCol2' ";
/*         if(hasExamples){
        dStr += "style='width:34%;'";
        } */
        dStr +=">" + dictItemDesc + "</td>";
        //Column 3
        dStr += "<td class='propCollCol3'";
        if (dictItemProperties[dictItem].oneOf) {
            dStr += ">";
          //console.log(dictItemProperties[dictItem].enum);
          dStr += "<ul>";
          dStr += "<li>One of:</li>";
          dStr += "<ul>";
          var oneOfVals = dictItemProperties[dictItem].oneOf;
          for (var x = 0; x < oneOfVals.length;x++){
            dStr += "<li>" + oneOfVals[x].type  + "</li>";
          }  
          dStr += "</ul>";
          dStr += "</ul>";        
        } else {
            if (dictItemProperties[dictItem].enum){   
                dStr += ">";
                //console.log(dictItemProperties[dictItem].enum);
                dStr += "<ul>";
                dStr += "<li>Enumeration</li>";
                dStr += "<ul>";
                var moreDivOn = false;
                var enumVals = dictItemProperties[dictItem].enum;
                for(var x = 0; x < enumVals.length;x++){
                    if(x == 6){
                    dStr += "<div style='display:none'>";
                    moreDivOn = true;
                    }
                    dStr += "<li>" + enumVals[x]  + "</li>";
                }
                if(moreDivOn){
                    dStr += "</div>";
                    dStr += "<div class='showMoreOrLess'>Show more items...</div>";
                }      
                dStr += "</ul>";
                dStr += "</ul>";
                } else {
                dStr += " style='text-indent:25px'>";
                //@@PDC 1362: Create an automated script to merge GDC Data Dictionary with PDC DD
                if (dictItemProperties[dictItem].type) {
                    dStr += dictItemProperties[dictItem].type;
                } else {
                    //If the dict item does not have a type property, display blank
                    dStr += '';
                }
            }
        }
        dStr += "</td>"
        //Column 4 
        dStr += "<td class='propCollCol4'>";
        if (dictItemProperties[dictItem].required) {
            var requiredStr = capitalizeFirstLetter(dictItemProperties[dictItem].required);
            dStr += requiredStr;
        } else {
            //@@PDC 1362: Create an automated script to merge GDC Data Dictionary with PDC DD
            //If there's no property called "Required", set the field value to False
            dStr += "False";
        }
        dStr += "</td>";
        //Column 5 
        dStr += "<td class='propCollCol5'>";
        var cdeId = dictItemProperties[dictItem].cde_id;
        if (cdeId) {
            var cde_id_arr = cdeId.toString().split(",");//this could be a comma separated list
            for (var m=0; m < cde_id_arr.length; m++) {
                var cde_id = cde_id_arr[m].trim();
                var itemURL = dictItemProperties[dictItem].term_url;
                if (dictItemProperties[dictItem].source && dictItemProperties[dictItem].source == "PSI MS"){
                    itemURL = PSIMSURL.replace("IDENTITY", cde_id.replace(":","_"));
                }
                if (dictItemProperties[dictItem].cde_id) {
                    dStr += "<div><a href=" + itemURL + " target='_blank'>" + cde_id + "<span style='display:none;'>CDE</span></a>";
                }
                if (dictItemProperties[dictItem].source) {
                    dStr += " - " + dictItemProperties[dictItem].source;
                }
                if (dictItemProperties[dictItem].cde_id) {
                    dStr += "</div>";
                }
            }
        } else {
            dStr += " - ";
        }
        dStr +="</td>";
        dStr +="</tr>";
    }
  }
  dStr += "</table><br/><br/>";
  //write into the div
  $(".dictionaryTable").html(dStr);
  setTimeout(setItemEvHandlers, 500);
}

function setItemEvHandlers() {
    $(".showMoreOrLess").on('click', function() {
      var $dRef = $(this).prev();
  
      if ($dRef.css('display') == "block") {
        $dRef.css('display', 'none');
        $(this).text("Show more items...");
      } else {
        $(this).text("Show less items...");
        $dRef.css('display', 'block');
      }      
    });
}
