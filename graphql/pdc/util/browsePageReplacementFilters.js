import _ from "lodash";

import {
    study_filter_columns,
    prog_proj_filter_columns,
    file_filter_column,
    al_sam_ca_dem_dia_filter_column,
  } from '../util/browsePageFilters';

//generate query for study filter
function applyStudyReplacementFilter(args, cache = { name: "" }, replacements = { }) {
  let studyFilterQuery = " ";
  for (const property in study_filter_columns) {
    if (typeof args[property] != "undefined" && args[property].length > 0) {
      let columnName = study_filter_columns[property];
      let filterValue = args[property].split(";").join("','");
      replacements[property] = args[property].split(";");
      studyFilterQuery += ` and ${columnName} IN ( :${property} ) `;
      cache.name += `${columnName}:('${filterValue}');`;
    }
  }
  //@@@PDC-2969 get latest version by default
  /*if ((typeof args['study_version'] == "undefined" || args['study_version'].length <= 0)&&
  (typeof args['study_name'] == "undefined"|| args['study_name'].length <= 0) &&
  (typeof args['study_submitter_id'] == "undefined"|| args['study_submitter_id'].length <= 0) &&
  (typeof args['study_id'] == "undefined"|| args['study_id'].length <= 0) &&
  (typeof args['pdc_study_id'] == "undefined"|| args['pdc_study_id'].length <= 0)) {*/
  if (typeof args['study_version'] == "undefined" || args['study_version'].length <= 0) {
      studyFilterQuery += ` and s.is_latest_version = 1 `;
      cache.name += `s.is_latest_version:1;`;
  }

  return studyFilterQuery;
}

function applyProgProjReplacementFilter(args, cache = { name: "" }, replacements = { }) {
  let progProjFilterQuery = " ";
  for (const property in prog_proj_filter_columns) {
    if (typeof args[property] != "undefined" && args[property].length > 0) {
      let columnName = prog_proj_filter_columns[property];
      let filterValue = args[property].split(";").join("','");
      replacements[property] = args[property].split(";");
      progProjFilterQuery += ` and ${columnName} IN ( :${property} ) `;
      cache.name += `${columnName}:('${filterValue}');`;
    }
  }
  return progProjFilterQuery;
}

function applyFileReplacementFilter(args, cache = { name: "" }, replacements = { }) {
  let fileFilterQuery = " ";
  for (const property in file_filter_column) {
    if (typeof args[property] != "undefined" && args[property].length > 0) {
      let columnName = file_filter_column[property];
      let filterValue = args[property].split(";").join("','");
      replacements[property] = args[property].split(";");
      fileFilterQuery += ` and ${columnName} IN ( :${property} ) `;
      cache.name += `${columnName}:('${filterValue}');`;
    }
  }
  return fileFilterQuery;
}

function applyAlSamCaDemDiaReplacementFilter(args, cache = { name: "" }, replacements = { }) {
  let alSamCaDemDiaFilterQuery = " ";
  for (const property in al_sam_ca_dem_dia_filter_column) {
    if (typeof args[property] != "undefined" && args[property].length > 0) {
      let columnName = al_sam_ca_dem_dia_filter_column[property];
      let filterValue = args[property].split(";").join("','");
      replacements[property] = args[property].split(";");
      alSamCaDemDiaFilterQuery += ` and ${columnName} IN ( :${property} ) `;
      cache.name += `${columnName}:('${filterValue}');`;
    }
  }
  return alSamCaDemDiaFilterQuery;
}

function addStudyInReplacementQuery(studyResult, replacements = { }){
  let studyArray = [];
  let studyQueryCondition = '';
  studyResult.forEach(element => studyArray.push(element.dataValues.study_submitter_id));
  let columnName = study_filter_columns.study_submitter_id;
  replacements['study_submitter_id'] = studyArray;
  studyQueryCondition = ` and ${columnName} IN ( :study_submitter_id ) `;
  return studyQueryCondition;
}

export {
  applyStudyReplacementFilter,
  applyProgProjReplacementFilter,
  applyFileReplacementFilter,
  applyAlSamCaDemDiaReplacementFilter,
  addStudyInReplacementQuery,
};
