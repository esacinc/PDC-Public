//@@@PDC-312 restructure resolver code 
const filters = function (args, cache = {name:''}) {
	var uiFileQuery = "";
	if (typeof args.program_name != 'undefined' && args.program_name.length > 0) {
		let program = args.program_name.split(';');
		uiFileQuery += " and  prog.name IN ('" + program.join("','") + "')";
		cache.name += "program_name:("+ program.join(",") + ");";
	}
	if (typeof args.project_name != 'undefined' && args.project_name.length > 0) {
		let project = args.project_name.split(';');
		uiFileQuery += " and  proj.name IN ('" + project.join("','") + "')";
		cache.name += "project_name:("+ project.join(",") + ");";
	}
	if (typeof args.study_name != 'undefined' && args.study_name.length > 0) {
		let study = args.study_name.split(';');
		uiFileQuery += " and  s.submitter_id_name IN ('" + study.join("','") + "')";
		cache.name += "study_name:("+ study.join(",") + ");";
	}
	if (typeof args.disease_type != 'undefined' && args.disease_type.length > 0) {
		let disease = args.disease_type.split(';');
		uiFileQuery += " and  c.disease_type IN ('" + disease.join("','") + "')";
		cache.name += "disease_type:("+ disease.join(",") + ");";
	}
	if (typeof args.primary_site != 'undefined' && args.primary_site.length > 0) {
		let site = args.primary_site.split(';');
		uiFileQuery += " and  c.primary_site IN ('" + site.join("','") + "')";
		cache.name += "primary_site:("+ site.join(",") + ");";
	}
	if (typeof args.analytical_fraction != 'undefined' && args.analytical_fraction.length > 0) {
		let fraction = args.analytical_fraction.split(';');
		uiFileQuery += " and  s.analytical_fraction IN ('" + fraction.join("','") + "')";
		cache.name += "analytical_fraction:("+ fraction.join(",") + ");";
	}
	if (typeof args.experiment_type != 'undefined' && args.experiment_type.length > 0) {
		let experiment = args.experiment_type.split(';');
		uiFileQuery += " and  s.experiment_type IN ('" + experiment.join("','") + "')";
		cache.name += "experiment_type:("+ experiment.join(",") + ");";
	}
	if (typeof args.file_type != 'undefined' && args.file_type.length > 0) {
		let file = args.file_type.split(';');
		uiFileQuery += " and f.file_type IN ('" + file.join("','") + "')";
		cache.name += "file_type:("+ file.join(",") + ");";
	}
	//@@@PDC-774 add downloadable
	if (typeof args.downloadable != 'undefined' && args.downloadable.length > 0) {
		let download = args.downloadable.split(';');
		uiFileQuery += " and f.downloadable IN ('" + download.join("','") + "')";
		cache.name += "downloadable:("+ download.join(",") + ");";
	}
	if (typeof args.study_submitter_id != 'undefined' && args.study_submitter_id.length > 0) {
		let studySub = args.study_submitter_id.split(";");
		uiFileQuery += " and s.study_submitter_id IN ('" + studySub.join("','") + "')";
		cache.name += "study_submitter_id:("+ studySub.join(",") + ");";
	}
	//@@@PDC-533 additional filters
	if (typeof args.ethnicity != 'undefined' && args.ethnicity.length > 0) {
		let ethniSub = args.ethnicity.split(";");
		uiFileQuery += " and dem.ethnicity IN ('" + ethniSub.join("','") + "')";
		cache.name += "ethnicity:("+ ethniSub.join(",") + ");";
	}
	if (typeof args.race != 'undefined' && args.race.length > 0) {
		let raceSub = args.race.split(";");
		uiFileQuery += " and dem.race IN ('" + raceSub.join("','") + "')";
		cache.name += "race:("+ raceSub.join(",") + ");";
	}
	if (typeof args.gender != 'undefined' && args.gender.length > 0) {
		let genderSub = args.gender.split(";");
		uiFileQuery += " and dem.gender IN ('" + genderSub.join("','") + "')";
		cache.name += "gender:("+ genderSub.join(",") + ");";
	}
	if (typeof args.morphology != 'undefined' && args.morphology.length > 0) {
		let morphrSub = args.morphology.split(";");
		uiFileQuery += " and dia.morphology IN ('" + morphrSub.join("','") + "')";
		cache.name += "morphology:("+ morphrSub.join(",") + ");";
	}
	if (typeof args.primary_diagnosis != 'undefined' && args.primary_diagnosis.length > 0) {
		let primSub = args.primary_diagnosis.split(";");
		uiFileQuery += " and dia.primary_diagnosis IN ('" + primSub.join("','") + "')";
		cache.name += "primary_diagnosis:("+ primSub.join(",") + ");";
	}
	if (typeof args.site_of_resection_or_biopsy != 'undefined' && args.site_of_resection_or_biopsy.length > 0) {
		let siteSub = args.site_of_resection_or_biopsy.split(";");
		uiFileQuery += " and dia.site_of_resection_or_biopsy IN ('" + siteSub.join("','") + "')";
		cache.name += "site_of_resection_or_biopsy:("+ siteSub.join(",") + ");";
	}
	if (typeof args.tissue_or_organ_of_origin != 'undefined' && args.tissue_or_organ_of_origin.length > 0) {
		let tissueSub = args.tissue_or_organ_of_origin.split(";");
		uiFileQuery += " and dia.tissue_or_organ_of_origin IN ('" + tissueSub.join("','") + "')";
		cache.name += "tissue_or_organ_of_origin:("+ tissueSub.join(",") + ");";
	}
	if (typeof args.tumor_grade != 'undefined' && args.tumor_grade.length > 0) {
		let gradeSub = args.tumor_grade.split(";");
		uiFileQuery += " and dia.tumor_grade IN ('" + gradeSub.join("','") + "')";
		cache.name += "tumor_grade:("+ gradeSub.join(",") + ");";
	}
	if (typeof args.tumor_stage != 'undefined' && args.tumor_stage.length > 0) {
		let stageSub = args.tumor_stage.split(";");
		uiFileQuery += " and dia.tumor_stage IN ('" + stageSub.join("','") + "')";
		cache.name += "tumor_stage:("+ stageSub.join(",") + ");";
	}
	if (typeof args.data_category != 'undefined' && args.data_category.length > 0) {
		let catSub = args.data_category.split(";");
		uiFileQuery += " and f.data_category IN ('" + catSub.join("','") + "')";
		cache.name += "data_category:("+ catSub.join(",") + ");";
	}
	if (typeof args.file_type != 'undefined' && args.file_type.length > 0) {
		let filSub = args.file_type.split(";");
		uiFileQuery += " and f.file_type IN ('" + filSub.join("','") + "')";
		cache.name += "file_type:("+ filSub.join(",") + ");";
	}
	if (typeof args.access != 'undefined' && args.access.length > 0) {
		let acsSub = args.access.split(";");
		uiFileQuery += " and f.access IN ('" + acsSub.join("','") + "')";
		cache.name += "access:("+ acsSub.join(",") + ");";
	}
	//@@@PDC-372 add case_submitter_id to filter
	if (typeof args.case_submitter_id != 'undefined' && args.case_submitter_id.length > 0) {
		let caseSub = args.case_submitter_id.split(";");
		uiFileQuery += " and c.case_submitter_id IN ('" + caseSub.join("','") + "')";
		cache.name += "case_submitter_id:("+ caseSub.join(",") + ");";
	}
	//@@@PDC-474 programs-projects-studies API
	//@@@PDC-652 new protocol structure
	if (typeof args.instrument_model != 'undefined' && args.instrument_model.length > 0) {
		let caseSub = args.instrument_model.split(";");
		uiFileQuery += " and ptc.instrument_model IN ('" + caseSub.join("','") + "')";
		cache.name += "instrument_model:("+ caseSub.join(",") + ");";
	}
	//@@@PDC-472 casesSamplesAliquots API
	if (typeof args.program_submitter_id != 'undefined' && args.program_submitter_id.length > 0) {
		let programSub = args.program_submitter_id.split(";");
		uiFileQuery += " and prog.program_submitter_id IN ('" + programSub.join("','") + "')";
		cache.name += "program_submitter_id:("+ programSub.join(",") + ");";
	}
	if (typeof args.project_submitter_id != 'undefined' && args.project_submitter_id.length > 0) {
		let projectSub = args.project_submitter_id.split(";");
		uiFileQuery += " and proj.project_submitter_id IN ('" + projectSub.join("','") + "')";
		cache.name += "project_submitter_id:("+ projectSub.join(",") + ");";
	}
	//@@@PDC-475 caseDiagnosesPerStudy API
	if (typeof args.study_id != 'undefined' && args.study_id.length > 0) {
		let studySub = args.study_id.split(";");
		uiFileQuery += " and s.study_id IN (uuid_to_bin('" + studySub.join("'),uuid_to_bin('") + "'))";
		cache.name += "study_id:("+ studySub.join(",") + ");";
	}
	//@@@PDC-566 Add sample_type and acquisition filters
	if (typeof args.sample_type != 'undefined' && args.sample_type.length > 0) {
		let studySub = args.sample_type.split(";");
		uiFileQuery += " and sam.sample_type IN ('" + studySub.join("','") + "')";
		cache.name += "sample_type:("+ studySub.join(",") + ");";
	}
	if (typeof args.acquisition_type != 'undefined' && args.acquisition_type.length > 0) {
		let studySub = args.acquisition_type.split(";");
		uiFileQuery += " and s.acquisition_type IN ('" + studySub.join("','") + "')";
		cache.name += "acquisition_type:("+ studySub.join(",") + ");";
	}
	//@@@PDC-894 add status filters 
	if (typeof args.case_status != 'undefined' && args.case_status.length > 0) {
		let studySub = args.case_status.split(";");
		uiFileQuery += " and c.status IN ('" + studySub.join("','") + "')";
		cache.name += "case_status:("+ studySub.join(",") + ");";
	}
	if (typeof args.biospecimen_status != 'undefined' && args.biospecimen_status.length > 0) {
		let studySub = args.biospecimen_status.split(";");
		uiFileQuery += " and al.status IN ('" + studySub.join("','") + "')";
		cache.name += "biospecimen_status:("+ studySub.join(",") + ");";
	}
	return uiFileQuery;
};

const filtersView = function (args,  cache = {name:''}) {
	var uiViewQuery = "";
	if (typeof args.program_name != 'undefined' && args.program_name.length > 0) {
		let program = args.program_name.split(';');
		uiViewQuery += " and  program_name IN ('" + program.join("','") + "')";
		cache.name += "program_name:("+ program.join(",") + ");";
	}
	if (typeof args.project_name != 'undefined' && args.project_name.length > 0) {
		let project = args.project_name.split(';');
		uiViewQuery += " and  project_name IN ('" + project.join("','") + "')";
		cache.name += "project_name:("+ project.join(",") + ");";
	}
	if (typeof args.study_name != 'undefined' && args.study_name.length > 0) {
		let study = args.study_name.split(';');
		uiViewQuery += " and  submitter_id_name IN ('" + study.join("','") + "')";
		cache.name += "submitter_id_name:("+ study.join(",") + ");";
	}
	if (typeof args.disease_type != 'undefined' && args.disease_type.length > 0) {
		let disease = args.disease_type.split(';');
		uiViewQuery += " and  disease_type IN ('" + disease.join("','") + "')";
		cache.name += "disease_type:("+ disease.join(",") + ");";
	}
	if (typeof args.primary_site != 'undefined' && args.primary_site.length > 0) {
		let site = args.primary_site.split(';');
		uiViewQuery += " and  primary_site IN ('" + site.join("','") + "')";
		cache.name += "primary_site:("+ site.join(",") + ");";
	}
	if (typeof args.analytical_fraction != 'undefined' && args.analytical_fraction.length > 0) {
		let fraction = args.analytical_fraction.split(';');
		uiViewQuery += " and  analytical_fraction IN ('" + fraction.join("','") + "')";
		cache.name += "analytical_fraction:("+ fraction.join(",") + ");";
	}
	if (typeof args.experiment_type != 'undefined' && args.experiment_type.length > 0) {
		let experiment = args.experiment_type.split(';');
		uiViewQuery += " and  experiment_type IN ('" + experiment.join("','") + "')";
		cache.name += "experiment_type:("+ experiment.join(",") + ");";
	}
	//@@@PDC-581 Add clinical filters
	if (typeof args.ethnicity != 'undefined' && args.ethnicity.length > 0) {
		let ethniSub = args.ethnicity.split(";");
		uiViewQuery += " and ethnicity IN ('" + ethniSub.join("','") + "')";
		cache.name += "ethnicity:("+ ethniSub.join(",") + ");";
	}
	if (typeof args.race != 'undefined' && args.race.length > 0) {
		let raceSub = args.race.split(";");
		uiViewQuery += " and race IN ('" + raceSub.join("','") + "')";
		cache.name += "race:("+ raceSub.join(",") + ");";
	}
	if (typeof args.gender != 'undefined' && args.gender.length > 0) {
		let genderSub = args.gender.split(";");
		uiViewQuery += " and gender IN ('" + genderSub.join("','") + "')";
		cache.name += "gender:("+ genderSub.join(",") + ");";
	}
	if (typeof args.morphology != 'undefined' && args.morphology.length > 0) {
		let morphrSub = args.morphology.split(";");
		uiViewQuery += " and morphology IN ('" + morphrSub.join("','") + "')";
		cache.name += "morphology:("+ morphrSub.join(",") + ");";
	}
	if (typeof args.primary_diagnosis != 'undefined' && args.primary_diagnosis.length > 0) {
		let primSub = args.primary_diagnosis.split(";");
		uiViewQuery += " and primary_diagnosis IN ('" + primSub.join("','") + "')";
		cache.name += "primary_diagnosis:("+ primSub.join(",") + ");";
	}
	if (typeof args.site_of_resection_or_biopsy != 'undefined' && args.site_of_resection_or_biopsy.length > 0) {
		let siteSub = args.site_of_resection_or_biopsy.split(";");
		uiViewQuery += " and site_of_resection_or_biopsy IN ('" + siteSub.join("','") + "')";
		cache.name += "site_of_resection_or_biopsy:("+ siteSub.join(",") + ");";
	}
	if (typeof args.tissue_or_organ_of_origin != 'undefined' && args.tissue_or_organ_of_origin.length > 0) {
		let tissueSub = args.tissue_or_organ_of_origin.split(";");
		uiViewQuery += " and tissue_or_organ_of_origin IN ('" + tissueSub.join("','") + "')";
		cache.name += "tissue_or_organ_of_origin:("+ tissueSub.join(",") + ");";
	}
	if (typeof args.tumor_grade != 'undefined' && args.tumor_grade.length > 0) {
		let gradeSub = args.tumor_grade.split(";");
		uiViewQuery += " and tumor_grade IN ('" + gradeSub.join("','") + "')";
		cache.name += "tumor_grade:("+ gradeSub.join(",") + ");";
	}
	if (typeof args.tumor_stage != 'undefined' && args.tumor_stage.length > 0) {
		let stageSub = args.tumor_stage.split(";");
		uiViewQuery += " and tumor_stage IN ('" + stageSub.join("','") + "')";
		cache.name += "tumor_stage:("+ stageSub.join(",") + ");";
	}
	if (typeof args.sample_type != 'undefined' && args.sample_type.length > 0) {
		let studySub = args.sample_type.split(";");
		uiViewQuery += " and sample_type IN ('" + studySub.join("','") + "')";
		cache.name += "sample_type:("+ studySub.join(",") + ");";
	}
	//@@@PDC-616 Add acquisition type to the general filters
	if (typeof args.acquisition_type != 'undefined' && args.acquisition_type.length > 0) {
		let acquisition_type = args.acquisition_type.split(";");
		uiViewQuery += " and acquisition_type IN ('" + acquisition_type.join("','") + "')";
		cache.name += "acquisition_type:("+ acquisition_type.join(",") + ");";
	}
	return uiViewQuery;
};
export{filters, filtersView};
