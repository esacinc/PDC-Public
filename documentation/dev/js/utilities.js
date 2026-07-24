var dictionaryURL = 'json/dictionary.json';
var dictionaryItemURL = 'json/dictionary_item.json';
var dictionaryEntities = undefined;
var curEntity;
var curEntityDesc;
var curCategory;
var dictionaryData;
var caDSRURL = "https://cdebrowser.nci.nih.gov/cdebrowserClient/cdeBrowser.html#/search?publicId=IDENTITY&version=2.0";
var NCItURL = "https://ncit.nci.nih.gov/ncitbrowser/pages/concept_details.jsf?dictionary=NCI%20Thesaurus&code=IDENTITY";
var PSIMSURL = "http://purl.obolibrary.org/obo/IDENTITY";
var hasExamples = false;

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

//This is the new function written based on the flat JSON structure shared by Deepak on Aug 9, 2018
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

//This new function reads the dictionary entities from a single JSON and populate the data
function loadDictionaryItem(itemID){
  curEntity = itemID;
  //check if the JSON is already loaded.
  var postData = {
                    id:itemID
                  };

  loadJSON(dictionaryItemURL, postData, paintDictionaryItem);
}


function paintDictionaryItem(data){
  var dStr = "";
  dictionaryEntities = data;

  //turn off Events
  //$(".contentArea").off('click');

  var curEntityData = fetchSingleEntityData(curEntity);

  //set the page pageTitle
  $(".pageTitle").html(curEntity);
  $(".pageDesc").html("");
  $(".pageBackNav").html("&lt;back to dictionary");

  //set the Events
  setEvents();

  /*if(curEntityData.length == 0){
    $(".dictionaryTable").html("");
    return;
  }*/

  dStr += "<div class='tableTitle'>Summary</div>";

  dStr += "<table class='itemCollTable' cellpadding='0' cellspacing='1'>";
  dStr += "<tr>";
  dStr += "<td class='itemCollCol1'>Type</td>";
  dStr += "<td class='itemCollCol2'>" + curEntity + "</td>";
  dStr += "</tr>";
  dStr += "<tr>";
  dStr += "<td class='itemCollCol1'>Category</td>";
  dStr += "<td class='itemCollCol2'>" + curEntityData[0].category + "</td>";
  dStr += "</tr>";
  dStr += "<tr>";
  dStr += "<td class='itemCollCol1'>Description</td>";

  //the Source and ID if provided
  var urlStr = "";

  if(curEntityData[0].e_cde_id != ""){
    var itemURL = NCItURL.replace("IDENTITY", curEntityData[0].e_cde_id);
    urlStr = " (<a href='" + itemURL + "' target='_blank'>" + curEntityData[0].e_cde_source + " - " + curEntityData[0].e_cde_id +"</a>)";
  }

  dStr += "<td class='itemCollCol2'>" + curEntityData[0].e_description + " " + urlStr + "</td>";
  dStr += "</tr>";
  dStr += "<tr>";
  dStr += "<td class='itemCollCol1'>Unique Keys</td>";
  dStr += "<td class='itemCollCol2'>";


  //paint the general details
  for (var i = 0; i < curEntityData.length; i++) {
    if(curEntityData[i].constraint_type == "UNIQUE" || curEntityData[i].constraint_type == "PRIMARY KEY"){
       dStr += "<li>" + curEntityData[i].column + "</li>";
    }
  }
  dStr += "</td>";
  dStr += "</tr>";
  dStr += "</table><br/><br/>";


  //paint the Links details
  dStr += "<div class='tableTitle'>Links</div>";

  dStr += "<table class='itemCollTable' cellpadding='0' cellspacing='1'>";
  dStr += "<tr class='dict_tbl_header'>";
  dStr += "<td class='linksCollCol1'>Name</td>";
  dStr += "<td class='linksCollCol2'>Required</td>";
  dStr += "<td class='linksCollCol3'>Label</td>";
  dStr += "</tr>";

  var colRef = 1;
  for (var j = 0; j < curEntityData.length; j++) {
    if(curEntityData[j].referenced_entity != "NULL" && curEntityData[j].referenced_entity != ""){
      dStr += "<tr";

      if(colRef == 2){
        dStr += " class='dict_alt_row'";
        colRef = 1;
      }else{
        colRef++;
      }

      dStr += ">";
      dStr += "<td class='linksCollCol1'><span dt='" + curEntityData[j].referenced_entity +"' class='dictionaryItem'>" + curEntityData[j].referenced_entity + "</span></td>";
      dStr += "<td class='linksCollCol2'>";
      if(curEntityData[j].constraint_type != "NULL" && curEntityData[j].constraint_type != ""){
        dStr += "True";
      }else{
        dStr += "False";
      }
      dStr += "</td>";
      dStr += "<td class='linksCollCol3'>" + curEntityData[j].reference_type +"</td>";
      dStr += "</tr>";
    }
  }
  dStr += "</table><br/><br/>";

  //paint the project details

  dStr += "<div class='tableTitle'>Properties</div>";

  dStr += "<table class='itemPropertiesTable' cellpadding='0' cellspacing='1'>";
  dStr += "<tr class='dict_tbl_header'>";
  dStr += "<td class='propCollCol1'>Name</td>";
  dStr += "<td class='propCollCol2' ";

  if(hasExamples){
    dStr += "style='width:34%;'";
  } 

  dStr+= ">Description</td>";  
  dStr += "<td class='propCollCol3'>Acceptable Types/Values</td>";
  dStr += "<td class='propCollCol4'>Required</td>";
  dStr += "<td class='propCollCol5'>CDE</td>";
  if(hasExamples){

    dStr += "<td class='propCollCol6'>Example</td>";
  }
  dStr += "</tr>";

  //paint the general details
  var colRef = 1;
  for (var j = 0; j < curEntityData.length; j++) {
    var propsColl = curEntityData[j];
    if(propsColl.key == "Y"){
      continue;
    }
    dStr += "<tr";

    if(colRef == 2){
      dStr += " class='dict_alt_row'";
      colRef = 1;
    }else{
      colRef++;
    }

    dStr += ">";
    dStr += "<td class='propCollCol1'><a name='" + propsColl.column + "' id='" + propsColl.column + "'>" + propsColl.column + "</a></td>";
    dStr += "<td class='propCollCol2' ";
    if(hasExamples){
      dStr += "style='width:34%;'";
    }
    dStr +=">" + propsColl.ea_description + "</td>";

    dStr += "<td class='propCollCol3'";
    if(propsColl.enumeration.length > 0){

      dStr += ">";
      //split the value based on \r\n and then show each item in a list
      var enumVals;
      
      if(propsColl.enumeration.indexOf("\r\n") >= 0){
        enumVals = propsColl.enumeration.split("\r\n");
      }else if(propsColl.enumeration.indexOf("\n") >= 0){
        enumVals = propsColl.enumeration.split("\n");
      }
      

      dStr += "<ul>";
      dStr += "<li>Enumeration</li>";
      dStr += "<ul>";
      var moreDivOn = false;

      for(var x = 0;x<enumVals.length;x++){
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
    }else{
      dStr += " style='text-indent:25px'>";
      dStr += (propsColl.type_general == "Enumeration")?"string":propsColl.type_general;
    }
    dStr += "</td>"



    dStr += "<td class='propCollCol4'>";
    if(propsColl.constraint_type != "NULL" && propsColl.constraint_type != ""){
      dStr += "True";
    }else{          
      dStr += "False";
    }
    dStr += "</td>";
    
    var cde_id_arr = propsColl.ea_cde_id.split(",");//this could be a comma separated list
    dStr += "<td class='propCollCol5'>";

    for(var m=0;m<cde_id_arr.length;m++){
      var cde_id = cde_id_arr[m].trim();

      if(propsColl.ea_cde_source == "caDSR"){
        var itemURL = caDSRURL.replace("IDENTITY", cde_id);
      }else if(propsColl.ea_cde_source == "NCIt"){
        var itemURL = NCItURL.replace("IDENTITY", cde_id);
      }else if(propsColl.ea_cde_source == "PSI MS"){
        var itemURL = PSIMSURL.replace("IDENTITY", cde_id.replace(":","_"));
      }
      dStr += "<div><a href=" + itemURL + " target='_blank'>" + cde_id + "<span style='display:none;'>CDE</span></a>";
      dStr += " - " + propsColl.ea_cde_source + "</div>";
    }


    dStr += "</td>";

    if(hasExamples){
      dStr +="<td class='propCollCol6'>" + propsColl.example_value + "</td>";
    }

    dStr +="</tr>";
  }
  dStr += "</table><br/><br/>";
  /**/

  //write into the div
  $(".dictionaryTable").html(dStr);

  setTimeout(setItemEvHandlers, 500);
}

function setItemEvHandlers(){
  $(".showMoreOrLess").on('click', function(){
    var $dRef = $(this).prev();

    if($dRef.css('display') == "block"){
      $dRef.css('display', 'none');
      $(this).text("Show more items...");
    }else{
      $(this).text("Show less items...");
      $dRef.css('display', 'block');
    }
    
  });
}

//function fetches the data speicific to the category sent as param
function fetchSingleEntityData(entityName){
  var enData = [];
  hasExamples = false;
  for(var i=0;i<dictionaryEntities.length;i++){
    if(dictionaryEntities[i].entity ==  entityName){
      if(checkPresence(enData, 'column', dictionaryEntities[i].column) === -1){
        enData.push(dictionaryEntities[i]);
      }

      //check if this has examples
      if(dictionaryEntities[i].example_value != "" && dictionaryEntities[i].example_value != undefined){
        hasExamples = true;
      }
    }
  }

  return enData;
}

//Function checks if the object has any repeat entries
function checkPresence(arr, label, val){
  var present = -1;
  for(var i=0;i<arr.length;i++){
    var item = arr[i][label];
    if(item == val){
      present = 1;
      break;
    }
  }
  return present;
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
