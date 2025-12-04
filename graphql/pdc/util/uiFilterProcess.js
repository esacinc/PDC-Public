//@@@PDC-774 add downloadable
//@@@PDC-894 add status filters
/*const filterCategory = [
  "project_name",
  "primary_site",
  "program_name",
  "disease_type",
  "analytical_fraction",
  "experiment_type",
  "acquisition_type",
  "case_status",
  "biospecimen_status",
  "submitter_id_name",
  "sample_type",
  "ethnicity",
  "race",
  "gender",
  "tumor_grade",
  "data_category",
  "file_type",
  "downloadable",
  "access"
];*/
//@@@PDC-9921 filter re-organize
const filterCategory = [
  "project_name",
  "primary_site",
  "program_name",
  "disease_type",
  "analytical_fraction",
  "experiment_type",
  "acquisition_type",
  "case_status",
  "submitter_id_name",
  "sample_type",
  "ethnicity",
  "race",
  "gender",
  "tumor_grade",
  "data_category",
  "vital_status",
  "age_at_diagnosis",
  "ajcc_clinical_stage",
  "ajcc_pathologic_stage",
  "morphology",
  "site_of_resection_or_biopsy",
  "progression_or_recurrence",
  "therapeutic_agents",
  "treatment_intent_type",
  "treatment_outcome",
  "treatment_type",
  "alcohol_history",
  "alcohol_intensity",
  "tobacco_smoking_status",
  "cigarettes_per_day"
];

function uiFilterProcess(uiFilters) {
  let filterData = {
    project_name: new Map(),
    primary_site: new Map(),
    program_name: new Map(),
    disease_type: new Map(),
    analytical_fraction: new Map(),
    experiment_type: new Map(),
    acquisition_type: new Map(),
    case_status: new Map(),
    //biospecimen_status: new Map(),
    submitter_id_name: new Map(),
    sample_type: new Map(),
    ethnicity: new Map(),
    race: new Map(),
    gender: new Map(),
    tumor_grade: new Map(),
    data_category: new Map(),
    //file_type: new Map(),
	//downloadable: new Map(),
    //access: new Map()
	vital_status: new Map(),
	age_at_diagnosis: new Map(),
	ajcc_clinical_stage: new Map(),
	ajcc_pathologic_stage: new Map(),
	morphology: new Map(),
	site_of_resection_or_biopsy: new Map(),
	progression_or_recurrence: new Map(),
	therapeutic_agents: new Map(),
	treatment_intent_type: new Map(),
	treatment_outcome: new Map(),
	treatment_type: new Map(),
	alcohol_history: new Map(),
	alcohol_intensity: new Map(),
	tobacco_smoking_status: new Map(),
	cigarettes_per_day: new Map()
  };

  for (let i = 0; i < uiFilters.length; i++) {
    let filter = uiFilters[i].dataValues;
    let studyId = filter.study_submitter_id;
    filterCategory.forEach(filterName => {
      let filterValue = filter[filterName];
	  //@@@PDC-910 null is not a valid filter value
	  if (filterValue != null) {
		  if (filterData[filterName].get(filterValue) == null) {
			let valueSet = new Set();
			valueSet.add(studyId);
			filterData[filterName].set(filterValue, valueSet);
		  } else {
			filterData[filterName].get(filterValue).add(studyId);
		  }
	  }
    });
  }

  let finalFilterData = {};
  filterCategory.forEach( filterName => {
    let mapValue = filterData[filterName];
    finalFilterData[filterName] = [];
    mapValue.forEach((value, key) =>{
		//@@@PDC-1189 add number of studies per filter value
        let obj = {
            filterName: key,
			filterStudyCount: value.size,
            filterValue: [...value]
        };
        finalFilterData[filterName].push(obj);
    });
  });
  return finalFilterData;
}

export { uiFilterProcess };
