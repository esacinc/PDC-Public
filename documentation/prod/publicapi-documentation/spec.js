// Store swagger.json file in a variable. Use this variable while defining SwaggerUI in index.html
var spec = {
   "swagger": "2.0",
   "info": {
     "description": "This is a PDC data server.",
     "version": "1.0.0",
     "title": "PDC API"
     },
    "basePath": "/graphql",
    "schemes": [
     "https"
     ],
     "tags": [
         {
             "name": "Case",
             "description": "Queries related to Cases"  
         },
         {
             "name": "Disease",
             "description": "Queries related to Diseases"  
         },
         {
             "name": "Files",
             "description": "Queries related to Files"  
         },
         {
             "name": "Gene",
             "description": "Queries related to Gene"  
         },
         {
             "name": "Gene",
             "description": "Common queries"  
         },
         {
             "name": "Paginated Records",
             "description": "Queries related to paginated records"  
         },
         {
             "name": "Program",
             "description": "Queries related to Programs"  
         },
         {
             "name": "Project",
             "description": "Queries related to Projects"  
         },
         {
             "name": "Protein",
             "description": "Queries related to Protein"  
         },
         {
            "name": "Study",
            "description": "Queries related to Study"  
        },
     ],
   "paths": {
         "?query={allCases (acceptDUA: {acceptDUA}) {case_id case_submitter_id project_submitter_id disease_type primary_site externalReferences { external_reference_id reference_resource_shortname reference_resource_name reference_entity_location }}}": {
             "get": {
                       "tags": ["Case"],
               "summary": "Gets all cases",
               "description": "<b>Returns case details.<br><br>Fields:</b><ul><li>case_id</li><li>case_submitter_id</li><li>project_submitter_id</li><li>disease_type</li><li>primary_site</li><li>externalReferences { external_reference_id reference_resource_shortname reference_resource_name reference_entity_location }</li></ul>",
               "operationId": "allCases",
               "produces": [
                           "application/json"
               ],
               "parameters": [{
                  "name": "acceptDUA",
                  "in": "path",
                  "description": "Accept DUA variable, example: true/false",
                  "required": true,
                  "type": "boolean"
               }],
               "responses": {
                 "200": {
                   "description": "successful operation",
                   "schema": {
                       "$ref": "#/definitions/allCases"
                    }
                 },
                 "401": {
                   "description": "Unauthorized"
                 }
               }
             }
         },
         "?query={allExperimentTypes (acceptDUA: {acceptDUA}) {experiment_type tissue_or_organ_of_origin disease_type}}": {
             "get": {
                       "tags": ["Case"],
               "summary": "Get info of experiment types",
                       "description": "<b>Returns a list of experiment types, example: Label Free, iTRAQ4, TMT10.<br><br>Fields:<ul><li>experiment_type:</b> Name of experiment type </li><li><b>tissue_or_organ_of_origin:</b> Text term that describes the anatomic site of the tumor or disease. caDSR: 3427536, example: Breast</li><li><b>disease_type</b></li></ul>",
               "operationId": "allExperimentTypes",
               "produces": [
                 "application/json"
               ],
               parameters: [{
                  "name": "acceptDUA",
                  "in": "path",
                  "description": "Accept DUA variable, example: true/false",
                  "required": true,
                  "type": "boolean"
               }],
               "responses": {
                 "200": {
                   "description": "successful operation",
                   "schema": {
                     "$ref": "#/definitions/allExperiments"
                   }
                 },
                 "401": {
                   "description": "Unauthorized"
                 }
               }
             }
               },
               "?query={allPrograms (acceptDUA: {acceptDUA})  {program_id  program_submitter_id  name projects  {project_id  project_submitter_id  name  studies  {pdc_study_id study_id study_submitter_id submitter_id_name analytical_fraction experiment_type acquisition_type} }}}": {
             "get": {
                       "tags": ["Program"],
               "summary": "Gets all programs",
               "description": "<b>Returns all available programs.<br><br>Fields:<ul><li>program_id:</b> Program ID, example : 10251935-5540-11e8-b664-00a098d917f8</li><li><b>program_submitter_id:</b> Program Submitter ID, example : Clinical Proteomic Tumor Analysis Consortium</li><li><b>name:</b> Name of the program, example: Clinical Proteomic Tumor Analysis Consortium</li><li><b>projects</b></li></ul>",
               "operationId": "allPrograms",
               "produces": [
                 "application/json"
                       ],
               parameters: [{
                  "name": "acceptDUA",
                  "in": "path",
                  "description": "Accept DUA variable, example: true/false",
                  "required": true,
                  "type": "boolean"
                }],
               "responses": {
                 "200": {
                   "description": "successful operation",
                   "schema": {
                     "$ref": "#/definitions/allPrograms"
                   }
                 },
                 "401": {
                   "description": "Unauthorized"
                 }
               }
             }
               },
               '?query={aliquotSpectralCount(gene_name: "{gene_name}" dataset_alias: "{dataset_alias}" acceptDUA: {acceptDUA}){gene_id gene_name NCBI_gene_id authority description organism chromosome locus proteins assays spectral_counts { project_submitter_id plex spectral_count distinct_peptide unshared_peptide study_submitter_id pdc_study_id}}}': {
                 "get": {
                           "tags": ["Gene"],
                   "summary": "Returns the aliquot spectral counts",
                   "description": "<b>Returns the aliquot spectral counts<br><br>Fields:</b><ul><li>gene_id</li><li>gene_name</li><li>NCBI_gene_id</li><li>authority</li><li>description</li><li>organism</li><li>chromosome</li><li>locus</li><li>proteins</li><li>assays</li><li>spectral_counts</li></ul>",
                   "operationId": "aliquotSpectralCount",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "gene_name",
                       "in": "path",
                       "description": "Gene Name, example: A1BG",
                       "required": true,
                       "type": "string"
                     },
                     {
                       "name": "dataset_alias",
                       "in": "path",
                       "description": "Dataset alias, example: A2-A0D0-01A",
                       "required": true,
                       "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/aliquotSpectralCount"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               '?query={case (case_submitter_id: "{case_submitter_id}" acceptDUA: {acceptDUA}) { case_id case_submitter_id project_submitter_id days_to_lost_to_followup disease_type index_date lost_to_followup primary_site externalReferences { external_reference_id reference_resource_shortname reference_resource_name reference_entity_location } demographics{ demographic_id ethnicity gender demographic_submitter_id race cause_of_death days_to_birth days_to_death vital_status year_of_birth year_of_death } samples { sample_id sample_submitter_id sample_type sample_type_id gdc_sample_id gdc_project_id biospecimen_anatomic_site composition current_weight days_to_collection days_to_sample_procurement diagnosis_pathologically_confirmed freezing_method initial_weight intermediate_dimension is_ffpe longest_dimension method_of_sample_procurement oct_embedded pathology_report_uuid preservation_method sample_type_id shortest_dimension time_between_clamping_and_freezing time_between_excision_and_freezing tissue_type tumor_code tumor_code_id tumor_descriptor aliquots { aliquot_id aliquot_submitter_id analyte_type aliquot_run_metadata {aliquot_run_metadata_id} } } diagnoses{ diagnosis_id tissue_or_organ_of_origin age_at_diagnosis primary_diagnosis tumor_grade tumor_stage diagnosis_submitter_id classification_of_tumor days_to_last_follow_up days_to_last_known_disease_status days_to_recurrence last_known_disease_status morphology progression_or_recurrence site_of_resection_or_biopsy prior_malignancy ajcc_clinical_m ajcc_clinical_n ajcc_clinical_stage ajcc_clinical_t ajcc_pathologic_m ajcc_pathologic_n ajcc_pathologic_stage ajcc_pathologic_t ann_arbor_b_symptoms ann_arbor_clinical_stage ann_arbor_extranodal_involvement ann_arbor_pathologic_stage best_overall_response burkitt_lymphoma_clinical_variant circumferential_resection_margin colon_polyps_history days_to_best_overall_response days_to_diagnosis days_to_hiv_diagnosis days_to_new_event figo_stage hiv_positive hpv_positive_type hpv_status iss_stage laterality ldh_level_at_diagnosis ldh_normal_range_upper lymph_nodes_positive lymphatic_invasion_present method_of_diagnosis new_event_anatomic_site new_event_type overall_survival perineural_invasion_present prior_treatment progression_free_survival progression_free_survival_event residual_disease vascular_invasion_present year_of_diagnosis icd_10_code synchronous_malignancy} }}': {
                 "get": {
                           "tags": ["Case"],
                   "summary": "Find case by Case Submitter ID",
                   "description": "<b>Returns a single case<br>",
                   "operationId": "case",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "case_submitter_id",
                       "in": "path",
                       "description": "Case Submitter ID, example: C3N-00386",
                       "required": true,
                       "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/findCase"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   },
               '?query={case (case_id: "{case_id}" acceptDUA: {acceptDUA}) { case_id case_submitter_id project_submitter_id days_to_lost_to_followup disease_type index_date lost_to_followup primary_site externalReferences { external_reference_id reference_resource_shortname reference_resource_name reference_entity_location } demographics{ demographic_id ethnicity gender demographic_submitter_id race cause_of_death days_to_birth days_to_death vital_status year_of_birth year_of_death } samples { sample_id sample_submitter_id sample_type sample_type_id gdc_sample_id gdc_project_id biospecimen_anatomic_site composition current_weight days_to_collection days_to_sample_procurement diagnosis_pathologically_confirmed freezing_method initial_weight intermediate_dimension is_ffpe longest_dimension method_of_sample_procurement oct_embedded pathology_report_uuid preservation_method sample_type_id shortest_dimension time_between_clamping_and_freezing time_between_excision_and_freezing tissue_type tumor_code tumor_code_id tumor_descriptor aliquots { aliquot_id aliquot_submitter_id analyte_type aliquot_run_metadata {aliquot_run_metadata_id} } } diagnoses{ diagnosis_id tissue_or_organ_of_origin age_at_diagnosis primary_diagnosis tumor_grade tumor_stage diagnosis_submitter_id classification_of_tumor days_to_last_follow_up days_to_last_known_disease_status days_to_recurrence last_known_disease_status morphology progression_or_recurrence site_of_resection_or_biopsy prior_malignancy ajcc_clinical_m ajcc_clinical_n ajcc_clinical_stage ajcc_clinical_t ajcc_pathologic_m ajcc_pathologic_n ajcc_pathologic_stage ajcc_pathologic_t ann_arbor_b_symptoms ann_arbor_clinical_stage ann_arbor_extranodal_involvement ann_arbor_pathologic_stage best_overall_response burkitt_lymphoma_clinical_variant circumferential_resection_margin colon_polyps_history days_to_best_overall_response days_to_diagnosis days_to_hiv_diagnosis days_to_new_event figo_stage hiv_positive hpv_positive_type hpv_status iss_stage laterality ldh_level_at_diagnosis ldh_normal_range_upper lymph_nodes_positive lymphatic_invasion_present method_of_diagnosis new_event_anatomic_site new_event_type overall_survival perineural_invasion_present prior_treatment progression_free_survival progression_free_survival_event residual_disease vascular_invasion_present year_of_diagnosis icd_10_code synchronous_malignancy} }}': {
                 "get": {
                           "tags": ["Case"],
                   "summary": "Find case by Case ID",
                   "description": "<b>Returns a single case<br>",
                   "operationId": "case",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "case_id",
                       "in": "path",
                       "description": "Case ID, example: a023e964-118a-11e9-afb9-0a9c39d33490",
                       "required": true,
                       "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/findCase"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   },

/*                    '?query={caseSearch(name: "{name}"){searchCases {record_type name submitter_id_name case_id description proteins}}}': {
                 "get": {
                   "tags": ["Case"],
                   "summary": "Find cases by partial case_submitter_id",
                   "description": "<b>Returns a list of search records<br><br>Fields:</b><ul><li>record_type</li><li>name</li><li>submitter_id_name</li><li>case_id</li><li>description</li><li>proteins</li></ul>",
                   "operationId": "caseSearch",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "name",
                       "in": "path",
                       "description": "Partial case_submitter_id to search cases with, example: TCGA-61",
                       "required": true,
                       "type": "string"
                     }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/caseSearch"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               }, */
               "?query={diseasesAvailable (acceptDUA: {acceptDUA}) {disease_type project_submitter_id cases_count tissue_or_organ_of_origin}}": {
                 "get": {
                           "tags": ["Disease"],
                   "summary": "Get available info of diseases",
                   "description": "<b>Returns a list of diseases.",
                   "operationId": "diseasesAvailable",
                   "produces": [
                     "application/json"
                   ],
                   parameters: [{
                     "name": "acceptDUA",
                     "in": "path",
                     "description": "Accept DUA variable, example: true/false",
                     "required": true,
                     "type": "boolean"
                   }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/diseasesAvailable"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   },
                   "?query={diseaseTypesPerProject (acceptDUA: {acceptDUA}) {project_submitter_id experiment_type analytical_fraction cases {disease_type count}}}": {
                 "get": {
                           "tags": ["Disease"],
                   "summary": "Get disease types per project",
                   "description": "<b>Returns a list of disease types.<br><br>Fields:</b><ul><li>project_submitter_id</li><li>experiment_type</li><li>analytical_fraction</li><li>cases {disease_type count}</li></ul>",
                   "operationId": "diseaseTypesPerProject",
                   "produces": [
                     "application/json"
                   ],
                   parameters: [{
                     "name": "acceptDUA",
                     "in": "path",
                     "description": "Accept DUA variable, example: true/false",
                     "required": true,
                     "type": "boolean"
                   }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/diseaseTypesPerProject"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               "?query={filesCountPerStudy (acceptDUA: {acceptDUA}) {pdc_study_id study_submitter_id file_type files_count data_category}}": {
                 "get": {
                           "tags": ["Files"],
                   "summary": "Get file count per study",
                   "description": "<strong>Returns all records with counts of files per study per file type.<br/><br/>Fields:<ul><li>pdc_study_id</li><li>study_submitter_id:</strong> ID of a study</li><li><b>file_type</li><li>files_count</li><li>data_category</li></b></ul>",
                   "operationId": "filesCountPerStudy",
                   "produces": [
                     "application/json"
                   ],
                   parameters: [{
                     "name": "acceptDUA",
                     "in": "path",
                     "description": "Accept DUA variable, example: true/false",
                     "required": true,
                     "type": "boolean"
                   }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/filesCountPerStudy"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   },
/*                    "?query={filesPerStudy {study_id pdc_study_id study_submitter_id study_name file_id file_name file_submitter_id file_type md5sum file_location file_size data_category file_format signedUrl {url} }}": {
                 "get": {
                           "tags": ["Files"],
                   "summary": "Get files per study",
                   "description": "<b>Returns a list of files per study. This API can also be used with multiple input parameters.</b><br>Takes a long time to execute because of the huge volume of data.<b><br><br>Fields:</b><ul><li>study_id</li><li>pdc_study_id</li><li>study_submitter_id</li><li>study_name</li><li>file_id</li><li>file_name</li><li>file_submitter_id</li><li>file_type</li><li>md5sum</li><li>file_location</li><li>file_size</li><li>file_format</li><li>signedUrl {url}</li></ul>",
                   "operationId": "filesPerStudy",
                   "produces": [
                     "application/json"
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/filesPerStudy"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               }, */
               /* '?query={geneSearch (name: "{name}") {genes {record_type name submitter_id_name description proteins}}}': {
                 "get": {
                           "tags": ["Gene"],
                   "summary": "Find genes by partial gene_name",
                   "description": "<b>Returns a list of search records<br><br>Fields:</b><ul><li>genes</li></ul>",
                   "operationId": "geneSearch",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "name",
                       "in": "path",
                       "description": "Partial gene_name to search genes with, example: A1BG",
                       "required": true,
                       "type": "string"
                     }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/geneSearch"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   }, */
                   '?query={geneSpectralCount (gene_name: "{gene_name}" acceptDUA: {acceptDUA}){gene_id gene_name NCBI_gene_id authority description organism chromosome locus proteins assays spectral_counts { project_submitter_id plex spectral_count distinct_peptide unshared_peptide study_submitter_id} }}': {
                 "get": {
                           "tags": ["Gene"],
                   "summary": "Returns the gene spectral counts",
                   "description": "<b>Returns the gene spectral counts<br><br>Fields:</b><ul><li>gene_id</li><li>gene_name</li><li>NCBI_gene_id</li><li>authority</li><li>description</li><li>organism</li><li>chromosome</li><li>locus</li><li>proteins</li><li>assays</li><li>spectral_counts</li></ul>",
                   "operationId": "geneSpectralCount",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "gene_name",
                       "in": "path",
                       "description": "Gene Name, example: A1BG",
                       "required": true,
                       "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                     }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/geneSpectralCount"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               '?query={ filesMetadata(file_id: "{file_id}" acceptDUA: {acceptDUA}) {file_id file_name file_size md5sum file_location file_submitter_id fraction_number experiment_type data_category file_type file_format plex_or_dataset_name analyte instrument study_run_metadata_submitter_id study_run_metadata_id aliquots { aliquot_id aliquot_submitter_id sample_id sample_submitter_id case_id case_submitter_id} } }': {
                 "get": {
                           "tags": ["Files"],
                   "summary": "Get file metadata",
                   "description": "<b>Returns a list of file metadata<br><br>Fields:</b><ul><li>file_id</li><li>file_name</li><li>file_size</li><li>md5sum</li><li>file_location</li><li>file_submitter_id</li><li>fraction_number</li><li>experiment_type</li><li>data_category</li><li>file_type</li><li>file_format</li><li>plex_or_dataset_name</li><li>analyte</li><li>instrument</li><li>study_run_metadata_submitter_id</li><li>study_run_metadata_id</li><li>aliquots</li></ul>",
                   "operationId": "filesMetadata",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "file_id",
                       "in": "path",
                       "description": "File ID, example: 00046804-1b57-11e9-9ac1-005056921935",
                       "required": true,
                       "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                     }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/fileMetadata"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   },
                   '?query={getPaginatedCases(offset: {offset} limit: {limit} acceptDUA: {acceptDUA}) {total cases {case_submitter_id project_submitter_id disease_type} pagination {count sort from page total pages size}}}': {
                 "get": {
                           "tags": ["Case"],
                   "summary": "Get paginated case records",
                   "description": "<b>Returns a list of cases and a pagination record<br/><br/>Fields:</b><ul><li>total</li><li>cases</li><li>pagination</li></ul>",
                   "operationId": "getPaginatedCases",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "offset",
                       "in": "path",
                       "description": "Offset of records, example : 0",
                       "required": true,
                       "type": "integer"
                     }, {
                       "name": "limit",
                       "in": "path",
                       "description": "Limit of records, example: 10",
                       "required": true,
                       "type": "integer"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/getPaginatedCases"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   },
                   '?query={getPaginatedFiles(offset: {offset} limit: {limit} acceptDUA: {acceptDUA}) {total files {pdc_study_id study_submitter_id file_name file_type md5sum} pagination {count sort from page total pages size}}}': {
                 "get": {
                           "tags": ["Files"],
                   "summary": "Get paginated file records",
                   "description": "<b>Returns a list of files and a pagination record<br/><br/>Fields:</b><ul><li>total</li><li>files</li><li>pagination</li></ul>",
                   "operationId": "getPaginatedFiles",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "offset",
                       "in": "path",
                       "description": "Offset of records, example: 0",
                       "required": true,
                       "type": "integer"
                     }, {
                       "name": "limit",
                       "in": "path",
                       "description": "Limit of records, example: 10",
                       "required": true,
                       "type": "integer"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/getPaginatedFiles"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               '?query={paginatedCaseDemographicsPerStudy (study_submitter_id: "{study_submitter_id}" offset: {offset} limit: {limit} acceptDUA: {acceptDUA}) { total caseDemographicsPerStudy { case_id case_submitter_id disease_type primary_site demographics { demographic_id ethnicity gender demographic_submitter_id race cause_of_death days_to_birth days_to_death vital_status year_of_birth year_of_death } } pagination { count sort from page total pages size } }}': {
                 "get": {
                           "tags": ["Case"],
                   "summary": "Get Cases/Demographics",
                   "description": "<b>Returns cases/demographics per study. This API can also be used with multiple input parameters.</b><br>Takes a long time to execute because of the huge volume of data.<br><br><b>Fields:</b><ul><li>total</li><li>caseDemographicsPerStudy</li><li>pagination</li></ul>",
                   "operationId": "paginatedCaseDemographicsPerStudy",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "study_submitter_id",
                       "in": "path",
                       "description": "Study Submitter ID, example: CPTAC UCEC Discovery Study - Acetylome",
                       "required": true,
                       "type": "string"
                     }, {
                       "name": "offset",
                       "in": "path",
                       "description": "Offset of records, example: 0",
                       "required": true,
                       "type": "integer"
                     }, {
                       "name": "limit",
                       "in": "path",
                       "description": "Limit of records, example: 10",
                       "required": true,
                       "type": "integer"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }        
                     ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/paginatedCaseDemographicsPerStudy"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               '?query={paginatedCaseDemographicsPerStudy (pdc_study_id: "{pdc_study_id}" offset: {offset} limit: {limit} acceptDUA: {acceptDUA}) { total caseDemographicsPerStudy { case_id case_submitter_id disease_type primary_site demographics { demographic_id ethnicity gender demographic_submitter_id race cause_of_death days_to_birth days_to_death vital_status year_of_birth year_of_death } } pagination { count sort from page total pages size } }}': {
                  "get": {
                            "tags": ["Case"],
                    "summary": "Get Cases/Demographics for PDC Study ID",
                    "description": "<b>Returns cases/demographics per study. This API can also be used with multiple input parameters.</b><br>Takes a long time to execute because of the huge volume of data.<br><br><b>Fields:</b><ul><li>total</li><li>caseDemographicsPerStudy</li><li>pagination</li></ul>",
                    "operationId": "paginatedCaseDemographicsPerStudy",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                        "name": "pdc_study_id",
                        "in": "path",
                        "description": "PDC Study ID, example: PDC000226",
                        "required": true,
                        "type": "string"
                      }, {
                        "name": "offset",
                        "in": "path",
                        "description": "Offset of records, example: 0",
                        "required": true,
                        "type": "integer"
                      }, {
                        "name": "limit",
                        "in": "path",
                        "description": "Limit of records, example: 10",
                        "required": true,
                        "type": "integer"
                      }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }       
                      ],
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/paginatedCaseDemographicsPerStudy"
                        }
                      },
                      "401": {
                        "description": "Unauthorized"
                      }
                    }
                  }
                },
               '?query={paginatedSpectralCountPerStudyAliquot(study_submitter_id: "{study_submitter_id}" plex_name: "{plex_name}" gene_name: "{gene_name}" offset: {offset} limit: {limit} acceptDUA: {acceptDUA}) { total spectralCounts { study_submitter_id pdc_study_id plex spectral_count distinct_peptide unshared_peptide } pagination { count sort from page total pages size } }}': {
                 "get": {
                           "tags": ["Quantitative"],
                   "summary": "Get spectral counts per study/aliquot/gene",
                   "description": "<b>Returns spectral counts per study/aliquot/gene. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>total</li><li>spectralCounts</li><li>pagination</li></ul>",
                   "operationId": "paginatedSpectralCountPerStudyAliquot",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "study_submitter_id",
                       "in": "path",
                       "description": "Submitter id of study, example: TCGA BRCA Phosphoproteome S015-2",
                       "required": true,
                       "type": "string"
                     },{
                       "name": "plex_name",
                       "in": "path",
                       "description": "aliquot id, example: A2-A0D0-01A:BH-A0HK-01A:C8-A12T-01A:POOL",
                       "required": true,
                       "type": "string"
                     },{
                                   "name": "gene_name",
                       "in": "path",
                       "description": "Name of gene, example: A2M",
                       "required": true,
                       "type": "string"
                     },{
                       "name": "offset",
                       "in": "path",
                       "description": "Offset of records, example: 0",
                       "required": true,
                       "type": "integer"
                     }, {
                       "name": "limit",
                       "in": "path",
                       "description": "Limit of records, example: 10",
                       "required": true,
                       "type": "integer"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }       
                     ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/paginatedSpectralCountPerStudyAliquot"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   },
                   '?query={paginatedSpectralCountPerStudyAliquot(pdc_study_id: "{pdc_study_id}" gene_name: "{gene_name}" offset: {offset} limit: {limit} acceptDUA: {acceptDUA}) { total spectralCounts { study_submitter_id pdc_study_id plex spectral_count distinct_peptide unshared_peptide } pagination { count sort from page total pages size } }}': {
                     "get": {
                               "tags": ["Quantitative"],
                       "summary": "Get spectral counts per study/aliquot/gene for a PDC Study ID",
                       "description": "<b>Returns spectral counts per study/aliquot/gene. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>total</li><li>spectralCounts</li><li>pagination</li></ul>",
                       "operationId": "paginatedSpectralCountPerStudyAliquot",
                       "produces": [
                         "application/json"
                       ],
                       "parameters": [{
                           "name": "pdc_study_id",
                           "in": "path",
                           "description": "Submitter id of study, example: PDC000174",
                           "required": true,
                           "type": "string"
                         },{
                           "name": "gene_name",
                           "in": "path",
                           "description": "Name of gene, example: A2M",
                           "required": true,
                           "type": "string"
                         },{
                           "name": "offset",
                           "in": "path",
                           "description": "Offset of records, example: 0",
                           "required": true,
                           "type": "integer"
                         }, {
                           "name": "limit",
                           "in": "path",
                           "description": "Limit of records, example: 10",
                           "required": true,
                           "type": "integer"
                         }, {
                           "name": "acceptDUA",
                           "in": "path",
                           "description": "Accept DUA variable, example: true/false",
                           "required": true,
                           "type": "boolean"
                         }       
                         ],
                       "responses": {
                         "200": {
                           "description": "successful operation",
                           "schema": {
                             "$ref": "#/definitions/paginatedSpectralCountPerStudyAliquot"
                           }
                         },
                         "401": {
                           "description": "Unauthorized"
                         }
                       }
                     }
                  },
                   "?query={pdcDataStats (acceptDUA: {acceptDUA}) {program study spectra protein project program peptide data_size data_label data_file}}": {
                 "get": {
                           "tags": ["General"],
                   "summary": "Gets all PDC statistics",
                   "description": "<b>Gets all PDC statistics.<br><br>Fields:</b><ul><li>program</li><li>study</li><li>spectra</li><li>protein</li><li>project</li><li>program</li><li>peptide</li><li>data_size</li><li>data_label</li><li>data_file</li></ul>",
                   "operationId": "pdcDataStats",
                   "produces": [
                     "application/json"
                   ],
                   parameters: [{
                     "name": "acceptDUA",
                     "in": "path",
                     "description": "Accept DUA variable, example: true/false",
                     "required": true,
                     "type": "boolean"
                   }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/pdcDataStats"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
                  '?query={ studyExperimentalDesign (study_id: "{study_id}" acceptDUA: {acceptDUA}){ pdc_study_id, study_run_metadata_id, study_run_metadata_submitter_id, study_id, study_submitter_id, analyte, acquisition_type, experiment_type, plex_dataset_name, experiment_number, number_of_fractions, label_free, itraq_113, itraq_114, itraq_115, itraq_116, itraq_117, itraq_118, itraq_119, itraq_121, tmt_126, tmt_127n, tmt_127c, tmt_128n, tmt_128c, tmt_129n, tmt_129c, tmt_130n, tmt_130c, tmt_131, tmt_131c } }': {
                 "get": {
                    "tags": ["Experimental"],
                   "summary": "Gets experimental design for a Study",
                   "description": "<b>Gets experimental design for a Study. This API can also be used with multiple input parameters.<br/><br/>Fields:</b><ul><li>pdc_study_id</li><li>study_run_metadata_id</li><li>study_run_metadata_submitter_id</li><li>study_id</li><li>study_submitter_id</li><li>analyte</li><li>acquisition_type</li><li>experiment_type</li><li>plex_dataset_name</li><li>experiment_number</li><li>number_of_fractions</li><li>label_free</li><li>itraq_113</li><li>itraq_114</li><li>itraq_115</li><li>itraq_116</li><li>itraq_117</li><li>itraq_118</li><li>itraq_119</li><li>itraq_121</li><li>tmt_126</li><li>tmt_127n</li><li>tmt_127c</li><li>tmt_128n</li><li>tmt_128c</li><li>tmt_129n</li><li>tmt_129c</li><li>tmt_130n</li><li>tmt_130c</li><li>tmt_131</li><li>tmt_131c</li></ul>",
                   "operationId": "studyExperimentalDesign",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "study_id",
                       "in": "path",
                       "description": "Submitter id of study, example: dbe94609-1fb3-11e9-b7f8-0a80fada099c",
                       "required": true,
                       "type": "string"
                    }, {
                     "name": "acceptDUA",
                     "in": "path",
                     "description": "Accept DUA variable, example: true/false",
                     "required": true,
                     "type": "boolean"
                   }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/studyExperimentalDesign"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               '?query={ studyExperimentalDesign (pdc_study_id: "{pdc_study_id}" acceptDUA: {acceptDUA}){ pdc_study_id, study_run_metadata_id, study_run_metadata_submitter_id, study_id, study_submitter_id, analyte, acquisition_type, experiment_type, plex_dataset_name, experiment_number, number_of_fractions, label_free, itraq_113, itraq_114, itraq_115, itraq_116, itraq_117, itraq_118, itraq_119, itraq_121, tmt_126, tmt_127n, tmt_127c, tmt_128n, tmt_128c, tmt_129n, tmt_129c, tmt_130n, tmt_130c, tmt_131, tmt_131c } }': {
                  "get": {
                     "tags": ["Experimental"],
                    "summary": "Gets experimental design for a PDC Study ID",
                    "description": "<b>Gets experimental design for a Study. This API can also be used with multiple input parameters.<br/><br/>Fields:</b><ul><li>pdc_study_id</li><li>study_run_metadata_id</li><li>study_run_metadata_submitter_id</li><li>study_id</li><li>study_submitter_id</li><li>analyte</li><li>acquisition_type</li><li>experiment_type</li><li>plex_dataset_name</li><li>experiment_number</li><li>number_of_fractions</li><li>label_free</li><li>itraq_113</li><li>itraq_114</li><li>itraq_115</li><li>itraq_116</li><li>itraq_117</li><li>itraq_118</li><li>itraq_119</li><li>itraq_121</li><li>tmt_126</li><li>tmt_127n</li><li>tmt_127c</li><li>tmt_128n</li><li>tmt_128c</li><li>tmt_129n</li><li>tmt_129c</li><li>tmt_130n</li><li>tmt_130c</li><li>tmt_131</li><li>tmt_131c</li></ul>",
                    "operationId": "studyExperimentalDesign",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                        "name": "pdc_study_id",
                        "in": "path",
                        "description": "PDC Study ID of study, example: PDC000127",
                        "required": true,
                        "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }],
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/studyExperimentalDesign"
                        }
                      },
                      "401": {
                        "description": "Unauthorized"
                      }
                    }
                  }
                },
               '?query={ biospecimenPerStudy (study_id: "{study_id}" acceptDUA: {acceptDUA}){ aliquot_id sample_id case_id aliquot_submitter_id sample_submitter_id case_submitter_id aliquot_status case_status sample_status project_name sample_type disease_type primary_site pool taxon externalReferences { external_reference_id reference_resource_shortname reference_resource_name reference_entity_location }} }': {
                 "get": {
                           "tags": ["General"],
                   "summary": "Returns biospecimen details per study",
                   "description": "<b>Returns biospecimen details per study. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>aliquot_id</li><li>sample_id</li><li>case_id</li><li>aliquot_submitter_id</li><li>sample_submitter_id</li><li>case_submitter_id</li><li>aliquot_status</li><li>case_status</li><li>sample_status</li><li>project_name</li><li>sample_type</li><li>disease_type</li><li>primary_site</li><li>pool</li><li>taxon</li><li>externalReferences { external_reference_id reference_resource_shortname reference_resource_name reference_entity_location }</li></ul>",
                   "operationId": "biospecimenPerStudy",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "study_id",
                       "in": "path",
                       "description": "Study ID, example: dbe94609-1fb3-11e9-b7f8-0a80fada099c",
                       "required": true,
                       "type": "string"
                    }, {
                     "name": "acceptDUA",
                     "in": "path",
                     "description": "Accept DUA variable, example: true/false",
                     "required": true,
                     "type": "boolean"
                   }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/biospecimenPerStudy"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               '?query={ biospecimenPerStudy (pdc_study_id: "{pdc_study_id}" acceptDUA: {acceptDUA}){ aliquot_id sample_id case_id aliquot_submitter_id sample_submitter_id case_submitter_id aliquot_status case_status sample_status project_name sample_type disease_type primary_site pool taxon externalReferences { external_reference_id reference_resource_shortname reference_resource_name reference_entity_location }} }': {
                  "get": {
                     "tags": ["General"],
                    "summary": "Returns biospecimen details for a PDC Study ID",
                    "description": "<b>Returns biospecimen details per study. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>aliquot_id</li><li>sample_id</li><li>case_id</li><li>aliquot_submitter_id</li><li>sample_submitter_id</li><li>case_submitter_id</li><li>aliquot_status</li><li>case_status</li><li>sample_status</li><li>project_name</li><li>sample_type</li><li>disease_type</li><li>primary_site</li><li>pool</li><li>taxon</li><li>externalReferences { external_reference_id reference_resource_shortname reference_resource_name reference_entity_location }</li></ul>",
                    "operationId": "biospecimenPerStudy",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                        "name": "pdc_study_id",
                        "in": "path",
                        "description": "PDC Study ID, example: PDC000127",
                        "required": true,
                        "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }],
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/biospecimenPerStudy"
                        }
                      },
                      "401": {
                        "description": "Unauthorized"
                      }
                    }
                  }
                },
               '?query={ clinicalPerStudy(study_submitter_id: "{study_submitter_id}" acceptDUA: {acceptDUA}){ case_id case_submitter_id status ethnicity gender race morphology primary_diagnosis site_of_resection_or_biopsy tissue_or_organ_of_origin tumor_grade tumor_stage icd_10_code synchronous_malignancy externalReferences { external_reference_id reference_resource_shortname reference_resource_name reference_entity_location}} }': {
                 "get": {
                           "tags": ["Clinical"],
                   "summary": "Returns clinical details per study",
                   "description": "<b>Returns clinical details per study. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>case_id</li><li>case_submitter_id</li><li>status</li><li>ethnicity</li><li>gender</li><li>race</li><li>morphology</li><li>primary_diagnosis</li><li>site_of_resection_or_biopsy</li><li>tissue_or_organ_of_origin</li><li>tumor_grade</li><li>tumor_stage</li><li>icd_10_code</li><li>synchronous_malignancy</li><li>externalReferences { external_reference_id reference_resource_shortname reference_resource_name reference_entity_location }</li></ul>",
                   "operationId": "clinicalPerStudy",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "study_submitter_id",
                       "in": "path",
                       "description": "Submitter ID of study, example: TCGA BRCA Phosphoproteome S015-2",
                       "required": true,
                       "type": "string"
                    }, {
                     "name": "acceptDUA",
                     "in": "path",
                     "description": "Accept DUA variable, example: true/false",
                     "required": true,
                     "type": "boolean"
                   }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/clinicalPerStudy"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               '?query={ clinicalPerStudy(pdc_study_id: "{pdc_study_id}" acceptDUA: {acceptDUA}){ case_id case_submitter_id status ethnicity gender race morphology primary_diagnosis site_of_resection_or_biopsy tissue_or_organ_of_origin tumor_grade tumor_stage icd_10_code synchronous_malignancy externalReferences { external_reference_id reference_resource_shortname reference_resource_name reference_entity_location}} }': {
                  "get": {
                            "tags": ["Clinical"],
                    "summary": "Returns clinical details for PDC Study ID",
                    "description": "<b>Returns clinical details per study. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>case_id</li><li>case_submitter_id</li><li>status</li><li>ethnicity</li><li>gender</li><li>race</li><li>morphology</li><li>primary_diagnosis</li><li>site_of_resection_or_biopsy</li><li>tissue_or_organ_of_origin</li><li>tumor_grade</li><li>tumor_stage</li><li>icd_10_code</li><li>synchronous_malignancy</li><li>externalReferences { external_reference_id reference_resource_shortname reference_resource_name reference_entity_location }</li></ul>",
                    "operationId": "clinicalPerStudy",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                        "name": "pdc_study_id",
                        "in": "path",
                        "description": "PDC Study ID of study, example: PDC000174",
                        "required": true,
                        "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                     }],
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/clinicalPerStudy"
                        }
                      },
                      "401": {
                        "description": "Unauthorized"
                      }
                    }
                  }
                },
                '?query={ protocolPerStudy(pdc_study_id: "{pdc_study_id}" acceptDUA: {acceptDUA}){protocol_id protocol_submitter_id study_id pdc_study_id study_submitter_id program_id program_submitter_id protocol_name protocol_date document_name quantitation_strategy experiment_type label_free_quantitation labeled_quantitation isobaric_labeling_reagent reporter_ion_ms_level starting_amount starting_amount_uom digestion_reagent alkylation_reagent enrichment_strategy enrichment chromatography_dimensions_count one_d_chromatography_type two_d_chromatography_type fractions_analyzed_count column_type amount_on_column amount_on_column_uom column_length column_length_uom column_inner_diameter column_inner_diameter_uom particle_size particle_size_uom particle_type gradient_length gradient_length_uom instrument_make instrument_model dissociation_type ms1_resolution ms2_resolution dda_topn normalized_collision_energy acquistion_type dia_multiplexing dia_ims } }': {
                  "get": {
                            "tags": ["General"],
                    "summary": "Gets all protocols for PDC Study ID",
                    "description": "<b>Gets all protocols per study. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>protocol_id</li><li>protocol_submitter_id</li><li>study_id</li><li>pdc_study_id</li><li>study_submitter_id</li><li>program_id</li><li>program_submitter_id</li><li>protocol_name</li><li>protocol_date</li><li>document_name</li><li>quantitation_strategy</li><li>experiment_type</li><li>label_free_quantitation</li><li>labeled_quantitation</li><li>isobaric_labeling_reagent</li><li>reporter_ion_ms_level</li><li>starting_amount</li><li>starting_amount_uom</li><li>digestion_reagent</li><li>alkylation_reagent</li><li>enrichment_strategy</li><li>enrichment</li><li>chromatography_dimensions_count</li><li>one_d_chromatography_type</li><li>two_d_chromatography_type</li><li>fractions_analyzed_count</li><li>column_type</li><li>amount_on_column</li><li>amount_on_column_uom</li><li>column_length</li><li>column_length_uom</li><li>column_inner_diameter</li><li>column_inner_diameter_uom</li><li>particle_size</li><li>particle_size_uom</li><li>particle_type</li><li>gradient_length</li><li>gradient_length_uom</li><li>instrument_make</li><li>instrument_model</li><li>dissociation_type</li><li>ms1_resolution</li><li>ms2_resolution</li><li>dda_topn</li><li>normalized_collision_energy</li><li>acquistion_type</li><li>dia_multiplexing</li><li>dia_ims</li></ul>",
                    "operationId": "protocolPerStudy",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                        "name": "pdc_study_id",
                        "in": "path",
                        "description": "PDC Study id of study, example: PDC000174",
                        "required": true,
                        "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }],
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/protocolPerStudy"
                        }
                      },
                      "401": {
                        "description": "Unauthorized"
                      }
                    }
                  }
                },
               '?query={ protocolPerStudy(study_submitter_id: "{study_submitter_id}" acceptDUA: {acceptDUA}){ protocol_id protocol_submitter_id study_id pdc_study_id study_submitter_id program_id program_submitter_id protocol_name protocol_date document_name quantitation_strategy experiment_type label_free_quantitation labeled_quantitation isobaric_labeling_reagent reporter_ion_ms_level starting_amount starting_amount_uom digestion_reagent alkylation_reagent enrichment_strategy enrichment chromatography_dimensions_count one_d_chromatography_type two_d_chromatography_type fractions_analyzed_count column_type amount_on_column amount_on_column_uom column_length column_length_uom column_inner_diameter column_inner_diameter_uom particle_size particle_size_uom particle_type gradient_length gradient_length_uom instrument_make instrument_model dissociation_type ms1_resolution ms2_resolution dda_topn normalized_collision_energy acquistion_type dia_multiplexing dia_ims } }': {
                 "get": {
                           "tags": ["General"],
                   "summary": "Gets all protocols per Study",
                   "description": "<b>Gets all protocols per study. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>protocol_id</li><li>protocol_submitter_id</li><li>study_id</li><li>pdc_study_id</li><li>study_submitter_id</li><li>program_id</li><li>program_submitter_id</li><li>protocol_name</li><li>protocol_date</li><li>document_name</li><li>quantitation_strategy</li><li>experiment_type</li><li>label_free_quantitation</li><li>labeled_quantitation</li><li>isobaric_labeling_reagent</li><li>reporter_ion_ms_level</li><li>starting_amount</li><li>starting_amount_uom</li><li>digestion_reagent</li><li>alkylation_reagent</li><li>enrichment_strategy</li><li>enrichment</li><li>chromatography_dimensions_count</li><li>one_d_chromatography_type</li><li>two_d_chromatography_type</li><li>fractions_analyzed_count</li><li>column_type</li><li>amount_on_column</li><li>amount_on_column_uom</li><li>column_length</li><li>column_length_uom</li><li>column_inner_diameter</li><li>column_inner_diameter_uom</li><li>particle_size</li><li>particle_size_uom</li><li>particle_type</li><li>gradient_length</li><li>gradient_length_uom</li><li>instrument_make</li><li>instrument_model</li><li>dissociation_type</li><li>ms1_resolution</li><li>ms2_resolution</li><li>dda_topn</li><li>normalized_collision_energy</li><li>acquistion_type</li><li>dia_multiplexing</li><li>dia_ims</li></ul>",
                   "operationId": "protocolPerStudy",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "study_submitter_id",
                       "in": "path",
                       "description": "Submitter id of study, example: TCGA BRCA Phosphoproteome S015-2",
                       "required": true,
                       "type": "string"
                    }, {
                     "name": "acceptDUA",
                     "in": "path",
                     "description": "Accept DUA variable, example: true/false",
                     "required": true,
                     "type": "boolean"
                   }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/protocolPerStudy"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
              '?query={ study (study_id: "{study_id}" acceptDUA: {acceptDUA}) { study_id pdc_study_id study_submitter_id program_id project_id study_name program_name project_name disease_type primary_site analytical_fraction experiment_type embargo_date cases_count aliquots_count filesCount { data_category file_type files_count } } }': {
                 "get": {
                   "tags": ["Study"],
                   "summary": "Gets Study details",
                   "description": "<b>Gets Study details. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>study_id</li><li>pdc_study_id</li><li>study_submitter_id</li><li>program_id</li><li>project_id</li><li>study_name</li><li>program_name</li><li>project_name</li><li>disease_type</li><li>primary_site</li><li>analytical_fraction</li><li>experiment_type</li><li>embargo_date</li><li>cases_count</li><li>aliquots_count</li><li>filesCount</li></ul>",
                   "operationId": "study",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "study_id",
                       "in": "path",
                       "description": "Study ID, example: dbe94609-1fb3-11e9-b7f8-0a80fada099c",
                       "required": true,
                       "type": "string"
                    },{
                     "name": "acceptDUA",
                     "in": "path",
                     "description": "Accept DUA variable, example: true/false",
                     "required": true,
                     "type": "boolean"
                  }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/studyDetailsPerStudyID"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               '?query={ study (pdc_study_id: "{pdc_study_id}" acceptDUA: {acceptDUA}) { study_id pdc_study_id study_submitter_id program_id project_id study_name program_name project_name disease_type primary_site analytical_fraction experiment_type embargo_date cases_count aliquots_count filesCount { data_category file_type files_count } } }': {
                  "get": {
                    "tags": ["Study"],
                    "summary": "Gets Study details for PDC Study ID",
                    "description": "<b>Gets Study details. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>study_id</li><li>pdc_study_id</li><li>study_submitter_id</li><li>program_id</li><li>project_id</li><li>study_name</li><li>program_name</li><li>project_name</li><li>disease_type</li><li>primary_site</li><li>analytical_fraction</li><li>experiment_type</li><li>embargo_date</li><li>cases_count</li><li>aliquots_count</li><li>filesCount</li></ul>",
                    "operationId": "study",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                        "name": "pdc_study_id",
                        "in": "path",
                        "description": "PDC Study ID, example: PDC000127",
                        "required": true,
                        "type": "string"
                     },{
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                     }],
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/studyDetailsPerStudyID"
                        }
                      },
                      "401": {
                        "description": "Unauthorized"
                      }
                    }
                  }
                },
              '?query={ filesPerStudy (study_id: "{study_id}" acceptDUA: {acceptDUA}) {study_id pdc_study_id study_submitter_id study_name file_id file_name file_submitter_id file_type md5sum file_location file_size data_category file_format signedUrl {url}} }': {
                 "get": {
                           "tags": ["Files"],
                   "summary": "Get files per Study ID",
                   "description": "<b>Returns a list of files per study. This API can also be used with multiple input parameters.</b><br>Takes a long time to execute because of the huge volume of data.<b><br><br>Fields:</b><ul><li>study_id</li><li>pdc_study_id</li><li>study_submitter_id</li><li>study_name</li><li>file_id</li><li>file_name</li><li>file_submitter_id</li><li>file_type</li><li>md5sum</li><li>file_location</li><li>file_size</li><li>data_category</li><li>file_format</li><li>signedUrl {url}</li></ul>",
                   "operationId": "filesPerStudy",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "study_id",
                       "in": "path",
                       "description": "Study ID, example: dbe94609-1fb3-11e9-b7f8-0a80fada099c",
                       "required": true,
                       "type": "string"
                    },{
                     "name": "acceptDUA",
                     "in": "path",
                     "description": "Accept DUA variable, example: true/false",
                     "required": true,
                     "type": "boolean"
                   }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/filesPerStudy"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               '?query={ filesPerStudy (pdc_study_id: "{pdc_study_id}" acceptDUA: {acceptDUA}) {study_id pdc_study_id study_submitter_id study_name file_id file_name file_submitter_id file_type md5sum file_location file_size data_category file_format signedUrl {url}} }': {
                  "get": {
                            "tags": ["Files"],
                    "summary": "Get files per PDC Study ID",
                    "description": "<b>Returns a list of files per study. This API can also be used with multiple input parameters.</b><br>Takes a long time to execute because of the huge volume of data.<b><br><br>Fields:</b><ul><li>study_id</li><li>pdc_study_id</li><li>study_submitter_id</li><li>study_name</li><li>file_id</li><li>file_name</li><li>file_submitter_id</li><li>file_type</li><li>md5sum</li><li>file_location</li><li>file_size</li><li>data_category</li><li>file_format</li><li>signedUrl {url}</li></ul>",
                    "operationId": "filesPerStudy",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                        "name": "pdc_study_id",
                        "in": "path",
                        "description": "PDC Study ID, example: PDC000174",
                        "required": true,
                        "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                     }],
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/filesPerStudy"
                        }
                      },
                      "401": {
                        "description": "Unauthorized"
                      }
                    }
                  }
                },
               '?query={program(program_submitter_id:  "{program_submitter_id}" acceptDUA: {acceptDUA})  {program_id  program_submitter_id  name  projects  {project_id  project_submitter_id  name  studies  {pdc_study_id study_id study_submitter_id submitter_id_name analytical_fraction experiment_type acquisition_type} }  }  }': {
                 "get": {
                           "tags": ["Program"],
                   "summary": "Find program by ID",
                   "description": "<b>Returns a single program and its projects.<br><br>Fields:<ul><li>program_id:</b> Program ID, example : 10251935-5540-11e8-b664-00a098d917f8</li><li><b>program_submitter_id:</b> Program Submitter ID, example : Clinical Proteomic Tumor Analysis Consortium</li><li><b>name:</b> Name of the program, example: Clinical Proteomic Tumor Analysis Consortium</li><li><b>projects</b></li></ul>",
                   "operationId": "program",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "program_submitter_id",
                       "in": "path",
                       "description": "Program Submitter ID, example: Clinical Proteomic Tumor Analysis Consortium",
                       "required": true,
                       "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/findProgram"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               "?query={programsProjectsStudies (acceptDUA: {acceptDUA}) {program_id program_submitter_id name projects {project_id project_submitter_id name studies { pdc_study_id study_id study_submitter_id submitter_id_name analytical_fraction experiment_type acquisition_type} }}}": {
                 "get": {
                           "tags": ["Program"],
                   "summary": "Get all programs/projects/studies",
                   "description": "<b>Returns a hierarchy of programs/projects/studies.<br><br>Fields:</b><ul><li>program_id</li><li>program_submitter_id</li><li>name</li><li>projects {project_id project_submitter_id name}</li><li> studies {pdc_study_id study_id study_submitter_id submitter_id_name analytical_fraction experiment_type acquisition_type}</li></ul>",
                   "operationId": "programsProjectsStudies",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                     "name": "acceptDUA",
                     "in": "path",
                     "description": "Accept DUA variable, example: true/false",
                     "required": true,
                     "type": "boolean"
                   }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/programsProjectsStudies"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   },
/*                    "?query={projectsPerExperimentType{experiment_type project_submitter_id name}}": {
                 "get": {
                           "tags": ["Project"],
                   "summary": "Get projects per experiment types",
                   "description": "<b>Returns a list of projects per experiment types - Label Free, iTRAQ4, TMT10.<br><br>Fields:</b><ul><li>experiment_type</li><li>project_submitter_id</li><li>name</li></ul>",
                   "operationId": "projectsPerExperimentType",
                   "produces": [
                     "application/json"
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/projectsPerExperimentType"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               '?query={projectsPerInstrument  {project_submitter_id instrument_model }}': {
                 "get": {
                           "tags": ["Project"],
                   "summary": "Get projects per instrument",
                   "description": "<b>Returns a list of projects and mass spectrometry instruments. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>project_submitter_id</li><li>instrument_model</li></ul>",
                   "operationId": "projectsPerInstrument",
                   "produces": [
                     "application/json"
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/projectsPerInstrument"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               '?query={projectsPerInstrument(instrument: "{instrument}")  {project_submitter_id instrument_model }}': {
                  "get": {
                            "tags": ["Project"],
                    "summary": "Get projects per instrument",
                    "description": "<b>Returns project and mass spectrometry instruments. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>project_submitter_id</li><li>instrument_model</li></ul>",
                    "operationId": "projectsPerInstrument",
                    "produces": [
                      "application/json"
                    ],
                  "parameters": [{
                      "name": "instrument",
                      "in": "path",
                      "description": "Instrument, example: Q Exactive HF",
                      "required": true,
                      "type": "string"
                    }
                   ], 
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/projectsPerInstrument"
                        }
                      },
                      "401": {
                        "description": "Unauthorized"
                      }
                    }
                  }
                }, */
               '?query={protein(protein: "{protein}" acceptDUA: {acceptDUA}){gene_name NCBI_gene_id authority description organism chromosome locus proteins assays spectral_counts {project_submitter_id plex spectral_count distinct_peptide unshared_peptide study_submitter_id pdc_study_id}}}': {
                 "get": {
                           "tags": ["Quantitative"],
                   "summary": "Get spectral counts and plex in available projects for a protein",
                   "description": "<b>Returns spectral counts of available projects for gene to which the protein ID (Uniprot or Refseq) is mapped.<br><br>Fields:</b><ul><li>gene_name</li><li>NCBI_gene_id</li><li>authority</li><li>description</li><li>organism</li><li>chromosome</li><li>locus</li><li>proteins</li><li>assays</li><li>spectralCounts</li></ul>",
                   "operationId": "protein",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "protein",
                       "in": "path",
                       "description": "Name of protein to return, example: M0R009",
                       "required": true,
                       "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/Protein"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   },
               /*'?query={studySearch(name: "{name}"){ studies { record_type name submitter_id_name pdc_study_id} }}': {
                 "get": {
                   "tags": ["Study"],
                   "summary": "Find studies by partial study_shortname",
                   "description": "<b>Returns a list of search records<br><br>Fields:</b><ul><li>studies</li></ul>",
                   "operationId": "studySearch",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "name",
                       "in": "path",
                       "description": "Partial study_shortname to search studies with, example: TCGA",
                       "required": true,
                       "type": "string"
                     }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/studySearch"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               '?query={studySearchByPDCStudyId(pdc_study_id:"{pdc_study_id}"){studies{record_type name submitter_id_name study_id study_submitter_id pdc_study_id}}}': {
                  "get": {
                    "tags": ["Study"],
                    "summary": "Find studies by PDC Study ID",
                    "description": "<b>Returns details of a study<br><br>Fields:</b><ul><li>studies</li></ul>",
                    "operationId": "studySearchByPDCStudyId",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                        "name": "pdc_study_id",
                        "in": "path",
                        "description": "PDC Study ID to search studies with, example: PDC000173",
                        "required": true,
                        "type": "string"
                      }
                    ],
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/studySearchByPDCStudyId"
                        }
                      },
                      "401": {
                        "description": "Unauthorized"
                      }
                    }
                  }
                },*/
                '?query={ pdcEntityReference(entity_type:"{entity_type}", entity_id: "{entity_id}", reference_type: "{reference_type}", acceptDUA: {acceptDUA}) { reference_id entity_type entity_id reference_type reference_entity_type reference_entity_alias reference_resource_name reference_resource_shortname reference_entity_location } }': {
                  "get": {
                    "tags": ["General"],
                    "summary": "Find Entity References for a Study/Case",
                    "description": "<b>Returns details of a study<br><br>Fields:</b><ul><li>pdcEntityReference</li></ul>",
                    "operationId": "pdcEntityReference",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                        "name": "entity_type",
                        "in": "path",
                        "description": "Entity type, example: study/case",
                        "required": true,
                        "type": "string"
                      }, {
                        "name": "entity_id",
                        "in": "path",
                        "description": "Entity ID: Study/Case ID, example: dbe94609-1fb3-11e9-b7f8-0a80fada099c",
                        "required": true,
                        "type": "string"
                      }, {
                        "name": "reference_type",
                        "in": "path",
                        "description": "Reference type, example: external/internal",
                        "required": true,
                        "type": "string"
                      } , {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }                        
                    ],
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/pdcEntityReference"
                        }
                      },
                      "401": {
                        "description": "Unauthorized"
                      }
                    }
                  }
                },
                '?query={ getPaginatedGenes(offset: {offset} limit: {limit} acceptDUA: {acceptDUA}) { total genesProper { gene_id gene_name NCBI_gene_id authority description organism chromosome locus proteins assays } pagination { count sort from page total pages size } } }': {
                  "get": {
                    "tags": ["Gene"],
                    "summary": "Get paginated gene records",
                    "description": "<b>Returns a list of genes and a pagination record. This API can also be used with multiple input parameters.<br/><br/>Fields:</b><ul><li>total</li><li>genesProper</li><li>pagination</li></ul>",
                    "operationId": "getPaginatedGenes",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                        "name": "offset",
                        "in": "path",
                        "description": "Offset of records, example : 0",
                        "required": true,
                        "type": "string"
                      }, {
                        "name": "limit",
                        "in": "path",
                        "description": "Limit of records, example: 10",
                        "required": true,
                        "type": "string"
                      }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }                        
                    ],
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/getPaginatedGenes"
                        }
                      },
                      "401": {
                        "description": "Unauthorized"
                      }
                    }
                  }
                },
                '?query={ getPaginatedGenes(offset: {offset}, limit: {limit}, gene_name: "{gene_name}" acceptDUA: {acceptDUA}) { total genesProper { gene_id gene_name NCBI_gene_id authority description organism chromosome locus proteins assays } pagination { count sort from page total pages size } } }': {
                  "get": {
                    "tags": ["Gene"],
                    "summary": "Get paginated gene records",
                    "description": "<b>Returns a list of genes and a pagination record<br/><br/>Fields:</b><ul><li>total</li><li>genesProper</li><li>pagination</li></ul>",
                    "operationId": "getPaginatedGenes",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                        "name": "offset",
                        "in": "path",
                        "description": "Offset of records, example : 0",
                        "required": true,
                        "type": "string"
                      }, {
                        "name": "limit",
                        "in": "path",
                        "description": "Limit of records, example: 10",
                        "required": true,
                        "type": "string"
                      }, {
                        "name": "gene_name",
                        "in": "path",
                        "description": "Gene Name, example: A2M",
                        "required": true,
                        "type": "string"
                      }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }                       
                    ],
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/getPaginatedGenes"
                        }
                      },
                      "401": {
                        "description": "Unauthorized"
                      }
                    }
                  }
                },
                /*'?query={studySearchByExternalId(reference_entity_alias:"{reference_entity_alias}"){studies{record_type name submitter_id_name study_id study_submitter_id pdc_study_id}}}': {
                  "get": {
                    "tags": ["Study"],
                    "summary": "Find studies by External ID",
                    "description": "<b>Returns details of a study<br><br>Fields:</b><ul><li>studies</li></ul>",
                    "operationId": "studySearchByExternalId",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                        "name": "reference_entity_alias",
                        "in": "path",
                        "description": "External ID to search studies with, example: CPTAC-CCRCC",
                        "required": true,
                        "type": "string"
                      }
                    ],
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/studySearchByExternalId"
                        }
                      },
                      "401": {
                        "description": "Unauthorized"
                      }
                    }
                  }
                },*/
               '?query={paginatedCaseDiagnosesPerStudy (study_name: "{study_name}" offset: {offset} limit: {limit} acceptDUA: {acceptDUA}) { total caseDiagnosesPerStudy { case_id case_submitter_id disease_type primary_site diagnoses{ diagnosis_id tissue_or_organ_of_origin age_at_diagnosis primary_diagnosis tumor_grade tumor_stage diagnosis_submitter_id classification_of_tumor days_to_last_follow_up days_to_last_known_disease_status days_to_recurrence last_known_disease_status morphology progression_or_recurrence site_of_resection_or_biopsy prior_malignancy ajcc_clinical_m ajcc_clinical_n ajcc_clinical_stage ajcc_clinical_t ajcc_pathologic_m ajcc_pathologic_n ajcc_pathologic_stage ajcc_pathologic_t ann_arbor_b_symptoms ann_arbor_clinical_stage ann_arbor_extranodal_involvement ann_arbor_pathologic_stage best_overall_response burkitt_lymphoma_clinical_variant circumferential_resection_margin colon_polyps_history days_to_best_overall_response days_to_diagnosis days_to_hiv_diagnosis days_to_new_event figo_stage hiv_positive hpv_positive_type hpv_status iss_stage laterality ldh_level_at_diagnosis ldh_normal_range_upper lymph_nodes_positive lymphatic_invasion_present method_of_diagnosis new_event_anatomic_site new_event_type overall_survival perineural_invasion_present prior_treatment progression_free_survival progression_free_survival_event residual_disease vascular_invasion_present year_of_diagnosis icd_10_code synchronous_malignancy} } pagination { count sort from page total pages size } }} ': {
                 "get": {
                     "tags": ["Case"],
                     "summary": "Get Cases/Diagnoses",
                     "description": "<b>Returns cases/diagnoses per study. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>total</li><li>caseDiagnosesPerStudy</li><li>pagination</li></ul>",
                     "operationId": "paginatedCaseDiagnosesPerStudy",
                     "produces": [
                         "application/json"
                     ],
                     "parameters": [{
                             "name": "study_name",
                             "in": "path",
                             "description": "Name of study, example: CPTAC UCEC Discovery Study - Acetylome",
                             "required": true,
                             "type": "string"
                         }, {
                             "name": "offset",
                             "in": "path",
                             "description": "Offset of records, example: 0",
                             "required": true,
                             "type": "integer"
                         }, {
                             "name": "limit",
                             "in": "path",
                             "description": "Limit of records, example: 10",
                             "required": true,
                             "type": "integer"
                         }, {
                           "name": "acceptDUA",
                           "in": "path",
                           "description": "Accept DUA variable, example: true/false",
                           "required": true,
                           "type": "boolean"
                         }       
                         ],
                     "responses": {
                         "200": {
                             "description": "successful operation",
                             "schema": {
                                 "$ref": "#/definitions/paginatedCaseDiagnosesPerStudy"
                             }
                         },
                         "401": {
                             "description": "Unauthorized"
                         }
                     }
                 }
             },
             '?query={paginatedCaseDiagnosesPerStudy (pdc_study_id: "{pdc_study_id}" offset: {offset} limit: {limit} acceptDUA: {acceptDUA}) { total caseDiagnosesPerStudy { case_id case_submitter_id disease_type primary_site diagnoses{ diagnosis_id tissue_or_organ_of_origin age_at_diagnosis primary_diagnosis tumor_grade tumor_stage diagnosis_submitter_id classification_of_tumor days_to_last_follow_up days_to_last_known_disease_status days_to_recurrence last_known_disease_status morphology progression_or_recurrence site_of_resection_or_biopsy prior_malignancy ajcc_clinical_m ajcc_clinical_n ajcc_clinical_stage ajcc_clinical_t ajcc_pathologic_m ajcc_pathologic_n ajcc_pathologic_stage ajcc_pathologic_t ann_arbor_b_symptoms ann_arbor_clinical_stage ann_arbor_extranodal_involvement ann_arbor_pathologic_stage best_overall_response burkitt_lymphoma_clinical_variant circumferential_resection_margin colon_polyps_history days_to_best_overall_response days_to_diagnosis days_to_hiv_diagnosis days_to_new_event figo_stage hiv_positive hpv_positive_type hpv_status iss_stage laterality ldh_level_at_diagnosis ldh_normal_range_upper lymph_nodes_positive lymphatic_invasion_present method_of_diagnosis new_event_anatomic_site new_event_type overall_survival perineural_invasion_present prior_treatment progression_free_survival progression_free_survival_event residual_disease vascular_invasion_present year_of_diagnosis icd_10_code synchronous_malignancy} } pagination { count sort from page total pages size } }} ': {
               "get": {
                   "tags": ["Case"],
                   "summary": "Get Cases/Diagnoses for PDC Study ID",
                   "description": "<b>Returns cases/diagnoses for PDC Study ID. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>total</li><li>caseDiagnosesPerStudy</li><li>pagination</li></ul>",
                   "operationId": "paginatedCaseDiagnosesPerStudy",
                   "produces": [
                       "application/json"
                   ],
                   "parameters": [{
                           "name": "pdc_study_id",
                           "in": "path",
                           "description": "PDC Study ID, example: PDC000226",
                           "required": true,
                           "type": "string"
                       }, {
                           "name": "offset",
                           "in": "path",
                           "description": "Offset of records, example: 0",
                           "required": true,
                           "type": "integer"
                       }, {
                           "name": "limit",
                           "in": "path",
                           "description": "Limit of records, example: 10",
                           "required": true,
                           "type": "integer"
                       }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                       }        
                       ],
                   "responses": {
                       "200": {
                           "description": "successful operation",
                           "schema": {
                               "$ref": "#/definitions/paginatedCaseDiagnosesPerStudy"
                           }
                       },
                       "401": {
                           "description": "Unauthorized"
                       }
                   }
               }
           },
               "?query={tissueSitesAvailable (acceptDUA: {acceptDUA}) { tissue_or_organ_of_origin project_submitter_id cases_count }}": {
                 "get": {
                           "tags": ["General"],
                   "summary": "Get available Tissue Sites",
                   "description": "<b>Returns a list of Tissue Sites.<br><br>Fields:<ul><li>tissue_or_organ_of_origin:</b>Text term that describes the anatomic site of the tumor or disease. caDSR: 3427536, example: Breast</li><li><b>project_submitter_id</li><li>cases_count</b></li></ul>",
                   "operationId": "tissueSitesAvailable",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [ {
                     "name": "acceptDUA",
                     "in": "path",
                     "description": "Accept DUA variable, example: true/false",
                     "required": true,
                     "type": "boolean"
                   }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/tissueSitesAvailable"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               },
               "?query={workflowMetadata (acceptDUA: {acceptDUA}) { workflow_metadata_submitter_id pdc_study_id study_submitter_id protocol_submitter_id cptac_study_id submitter_id_name study_submitter_name analytical_fraction experiment_type instrument refseq_database_version uniport_database_version hgnc_version raw_data_processing raw_data_conversion sequence_database_search search_database_parameters phosphosite_localization ms1_data_analysis psm_report_generation cptac_dcc_mzidentml mzidentml_refseq mzidentml_uniprot gene_to_prot cptac_galaxy_workflows cptac_galaxy_tools cdap_reports cptac_dcc_tools }}": {
                 "get": {
                           "tags": ["Workflow"],
                   "summary": "Get workflow metadata",
                   "description": "<b>Returns a list of workflow metadata. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>workflow_metadata_submitter_id</li><li>pdc_study_id</li><li>study_submitter_id</li><li>protocol_submitter_id</li><li>cptac_study_id</li><li>submitter_id_name</li><li>study_submitter_name</li><li>analytical_fraction</li><li>experiment_type</li><li>instrument</li><li>refseq_database_version</li><li>uniport_database_version</li><li>hgnc_version</li><li>raw_data_processing</li><li>raw_data_conversion</li><li>sequence_database_search</li><li>search_database_parameters</li><li>phosphosite_localization</li><li>ms1_data_analysis</li><li>psm_report_generation</li><li>cptac_dcc_mzidentml</li><li>mzidentml_refseq</li><li>mzidentml_uniprot</li><li>gene_to_prot</li><li>cptac_galaxy_workflows</li><li>cptac_galaxy_tools</li><li>cdap_reports</li><li>cptac_dcc_tools</li></ul>",
                   "operationId": "workflowMetadata",
                   "produces": [
                     "application/json"
                   ],
                   parameters: [{
                     "name": "acceptDUA",
                     "in": "path",
                     "description": "Accept DUA variable, example: true/false",
                     "required": true,
                     "type": "boolean"
                   }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/workflowMetadata"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   },
                   '?query={workflowMetadata(pdc_study_id: "{pdc_study_id}" acceptDUA: {acceptDUA}) { workflow_metadata_submitter_id pdc_study_id study_submitter_id protocol_submitter_id cptac_study_id submitter_id_name study_submitter_name analytical_fraction experiment_type instrument refseq_database_version uniport_database_version hgnc_version raw_data_processing raw_data_conversion sequence_database_search search_database_parameters phosphosite_localization ms1_data_analysis psm_report_generation cptac_dcc_mzidentml mzidentml_refseq mzidentml_uniprot gene_to_prot cptac_galaxy_workflows cptac_galaxy_tools cdap_reports cptac_dcc_tools }}': {
                     "get": {
                               "tags": ["Workflow"],
                       "summary": "Get workflow metadata for a PDC Study ID",
                       "description": "<b>Returns a list of workflow metadata. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>workflow_metadata_submitter_id</li><li>pdc_study_id</li><li>study_submitter_id</li><li>protocol_submitter_id</li><li>cptac_study_id</li><li>submitter_id_name</li><li>study_submitter_name</li><li>analytical_fraction</li><li>experiment_type</li><li>instrument</li><li>refseq_database_version</li><li>uniport_database_version</li><li>hgnc_version</li><li>raw_data_processing</li><li>raw_data_conversion</li><li>sequence_database_search</li><li>search_database_parameters</li><li>phosphosite_localization</li><li>ms1_data_analysis</li><li>psm_report_generation</li><li>cptac_dcc_mzidentml</li><li>mzidentml_refseq</li><li>mzidentml_uniprot</li><li>gene_to_prot</li><li>cptac_galaxy_workflows</li><li>cptac_galaxy_tools</li><li>cdap_reports</li><li>cptac_dcc_tools</li></ul>",
                       "operationId": "workflowMetadata",
                       "produces": [
                         "application/json"
                       ],
                       "parameters": [{
                        "name": "pdc_study_id",
                        "in": "path",
                        "description": "PDC Study ID, example: PDC000174",
                        "required": true,
                        "type": "string"
                      }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }
                    ],
                       "responses": {
                         "200": {
                           "description": "successful operation",
                           "schema": {
                             "$ref": "#/definitions/workflowMetadata"
                           }
                         },
                         "401": {
                           "description": "Unauthorized"
                         }
                       }
                     }
                       },
                   '?query={ clinicalMetadata(study_submitter_id: "{study_submitter_id}" acceptDUA: {acceptDUA}) { aliquot_submitter_id morphology primary_diagnosis tumor_grade tumor_stage } }': {
                 "get": {
                           "tags": ["Clinical"],
                   "summary": "Find clinical metadata for a study",
                   "description": "<b>Returns clinical metadata for a study. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>aliquot_submitter_id</li><li>morphology</li><li>primary_diagnosis</li><li>tumor_grade</li><li>tumor_stage</li></ul>",
                   "operationId": "clinicalMetadata",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "study_submitter_id",
                       "in": "path",
                       "description": "Study submitter iD, example: TCGA BRCA Proteome S015-1",
                       "required": true,
                       "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                      }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/clinicalMetadata"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   },
                   '?query={ clinicalMetadata(pdc_study_id: "{pdc_study_id}" acceptDUA: {acceptDUA}) { aliquot_submitter_id morphology primary_diagnosis tumor_grade tumor_stage } }': {
                     "get": {
                               "tags": ["Clinical"],
                       "summary": "Find clinical metadata for PDC Study ID",
                       "description": "<b>Returns clinical metadata for a study. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>aliquot_submitter_id</li><li>morphology</li><li>primary_diagnosis</li><li>tumor_grade</li><li>tumor_stage</li></ul>",
                       "operationId": "clinicalMetadata",
                       "produces": [
                         "application/json"
                       ],
                       "parameters": [{
                           "name": "pdc_study_id",
                           "in": "path",
                           "description": "Study submitter iD, example: PDC000173",
                           "required": true,
                           "type": "string"
                         }, {
                           "name": "acceptDUA",
                           "in": "path",
                           "description": "Accept DUA variable, example: true/false",
                           "required": true,
                           "type": "boolean"
                         }
                       ],
                       "responses": {
                         "200": {
                           "description": "successful operation",
                           "schema": {
                             "$ref": "#/definitions/clinicalMetadata"
                           }
                         },
                         "401": {
                           "description": "Unauthorized"
                         }
                       }
                     }
                       },
                   '?query={ experimentalMetadata(study_submitter_id: "{study_submitter_id}" acceptDUA: {acceptDUA}){ experiment_type analytical_fraction instrument study_run_metadata { study_run_metadata_submitter_id fraction aliquot_run_metadata { aliquot_submitter_id aliquot_run_metadata_id } files { file_type data_category file_location } } } }': {
                 "get": {
                           "tags": ["Experimental"],
                   "summary": "Find experimental metadata for a study",
                   "description": "<b>Returns experimental metadata for a study. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>experiment_type</li><li>analytical_fraction</li><li>instrument</li><li>study_run_metadata</li><li>files</li></ul>",
                   "operationId": "experimentalMetadata",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                       "name": "study_submitter_id",
                       "in": "path",
                       "description": "Study submitter ID, example: Pediatric Brain Cancer Pilot Study - Proteome",
                       "required": "true",
                       "type": "string"
                     }, {
                        "name": "acceptDUA",
                        "in": "path",
                        "description": "Accept DUA variable, example: true/false",
                        "required": true,
                        "type": "boolean"
                     }
                   ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/experimentalMetadata"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   },
                   '?query={ experimentalMetadata(pdc_study_id: "{pdc_study_id}" acceptDUA: {acceptDUA}){ experiment_type analytical_fraction instrument study_run_metadata { study_run_metadata_submitter_id fraction aliquot_run_metadata { aliquot_submitter_id aliquot_run_metadata_id } files { file_type data_category file_location } } } }': {
                     "get": {
                               "tags": ["Experimental"],
                       "summary": "Find experimental metadata for PDC Study ID",
                       "description": "<b>Returns experimental metadata for a study. This API can also be used with multiple input parameters.<br><br>Fields:</b><ul><li>experiment_type</li><li>analytical_fraction</li><li>instrument</li><li>study_run_metadata</li><li>files</li></ul>",
                       "operationId": "experimentalMetadata",
                       "produces": [
                         "application/json"
                       ],
                       "parameters": [{
                           "name": "pdc_study_id",
                           "in": "path",
                           "description": "PDC Study ID, example: PDC000180",
                           "required": "true",
                           "type": "string"
                         }, {
                           "name": "acceptDUA",
                           "in": "path",
                           "description": "Accept DUA variable, example: true/false",
                           "required": true,
                           "type": "boolean"
                        }
                       ],
                       "responses": {
                         "200": {
                           "description": "successful operation",
                           "schema": {
                             "$ref": "#/definitions/experimentalMetadata"
                           }
                         },
                         "401": {
                           "description": "Unauthorized"
                         }
                       }
                     }
                       },
                   '?query={ paginatedCasesSamplesAliquots(offset:{offset} limit: {limit} acceptDUA: {acceptDUA}) { total casesSamplesAliquots { case_id case_submitter_id days_to_lost_to_followup disease_type index_date lost_to_followup primary_site samples { sample_id sample_submitter_id sample_type sample_type_id gdc_sample_id gdc_project_id biospecimen_anatomic_site composition current_weight days_to_collection days_to_sample_procurement diagnosis_pathologically_confirmed freezing_method initial_weight intermediate_dimension is_ffpe longest_dimension method_of_sample_procurement oct_embedded pathology_report_uuid preservation_method sample_type_id shortest_dimension time_between_clamping_and_freezing time_between_excision_and_freezing tissue_type tumor_code tumor_code_id tumor_descriptor aliquots { aliquot_id aliquot_submitter_id analyte_type aliquot_run_metadata { aliquot_run_metadata_id } } } } pagination { count sort from page total pages size } } }': {
                 "get": {
                           "tags": ["Case"],
                   "summary": "Get paginated case records",
                   "description": "<b>Returns a list of cases, samples amd aliquot records. This API can also be used with multiple input parameters.<br/><br/>Fields:</b><ul><li>total</li><li>casesSamplesAliquots</li><li>pagination</li></ul>",
                   "operationId": "paginatedCasesSamplesAliquots",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                               "name": "offset",
                               "in": "path",
                               "description": "Offset of records, example : 0",
                               "required": true,
                               "type": "integer"
                           }, {
                               "name": "limit",
                               "in": "path",
                               "description": "Limit of records, example: 10",
                               "required": true,
                               "type": "integer"
                           }, {
                              "name": "acceptDUA",
                              "in": "path",
                              "description": "Accept DUA variable, example: true/false",
                              "required": true,
                              "type": "boolean"
                            }
                       ],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/paginatedCasesSamplesAliquots"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
                   },
                   '?query={ paginatedCasesSamplesAliquots(pdc_study_id:"{pdc_study_id}" offset:{offset} limit: {limit} acceptDUA: {acceptDUA}) { total casesSamplesAliquots { case_id case_submitter_id days_to_lost_to_followup disease_type index_date lost_to_followup primary_site samples { sample_id sample_submitter_id sample_type sample_type_id gdc_sample_id gdc_project_id biospecimen_anatomic_site composition current_weight days_to_collection days_to_sample_procurement diagnosis_pathologically_confirmed freezing_method initial_weight intermediate_dimension is_ffpe longest_dimension method_of_sample_procurement oct_embedded pathology_report_uuid preservation_method sample_type_id shortest_dimension time_between_clamping_and_freezing time_between_excision_and_freezing tissue_type tumor_code tumor_code_id tumor_descriptor aliquots { aliquot_id aliquot_submitter_id analyte_type aliquot_run_metadata { aliquot_run_metadata_id } } } } pagination { count sort from page total pages size } } }': {
                     "get": {
                               "tags": ["Case"],
                       "summary": "Get paginated case records for PDC Study ID",
                       "description": "<b>Returns a list of cases, samples amd aliquot records. This API can also be used with multiple input parameters.<br/><br/>Fields:</b><ul><li>total</li><li>casesSamplesAliquots</li><li>pagination</li></ul>",
                       "operationId": "paginatedCasesSamplesAliquots",
                       "produces": [
                         "application/json"
                       ],
                       "parameters": [{
                                   "name": "pdc_study_id",
                                   "in": "path",
                                   "description": "PDC Study ID, example : PDC000226",
                                   "required": true,
                                   "type": "integer"
                               }, {
                                 "name": "offset",
                                 "in": "path",
                                 "description": "Offset of records, example : 0",
                                 "required": true,
                                 "type": "integer"
                              },
                               {
                                   "name": "limit",
                                   "in": "path",
                                   "description": "Limit of records, example: 10",
                                   "required": true,
                                   "type": "integer"
                               }, {
                                 "name": "acceptDUA",
                                 "in": "path",
                                 "description": "Accept DUA variable, example: true/false",
                                 "required": true,
                                 "type": "boolean"
                              }
                           ],
                       "responses": {
                         "200": {
                           "description": "successful operation",
                           "schema": {
                             "$ref": "#/definitions/paginatedCasesSamplesAliquots"
                           }
                         },
                         "401": {
                           "description": "Unauthorized"
                         }
                       }
                     }
                       },
/*                    '?query={casePerFile(file_id:"{file_id}") { file_id case_id case_submitter_id }}': {
                 "get": {
                           "tags": ["Files"],
                   "summary": "Get cases for a file",
                   "description": "<strong>Returns all cases for a file.<br/><br/>Fields:<ul><li>file_id:</strong> ID of a File</li><li><b>case_id</li><li>case_submitter_id</b></li></ul>",
                   "operationId": "casePerFile",
                   "produces": [
                     "application/json"
                   ],
                   "parameters": [{
                               "name": "file_id",
                               "in": "path",
                               "description": "File ID, example: 10ffa258-14c2-4c74-861e-91ed02fb4cf6",
                               "required": "true",
                               "type": "string"
                           }],
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/casePerFile"
                       }
                     },
                     "401": {
                       "description": "Unauthorized"
                     }
                   }
                 }
               }, */
               '?query={ quantDataMatrix(pdc_study_id: "{pdc_study_id}" data_type: "{data_type}" acceptDUA: {acceptDUA}) }': {
                 "get": {
                           "tags": ["Quantitative"],
                   "summary": "Returns quant data matrix for a PDC Study ID",
                   "description": "Returns quant data matrix for a PDC Study ID.<br/><b>Fields:<ul><li>pdc_study_id:</b> PDC Study ID, example: PDC000127</li><li><b>date_type: </b>Data type, example: log2_ratio/unshared_log2_ratio</li><li><b>acceptDUA: </b>Accept DUA variable, example: true/false</li></ul>This API also works with the following parameters:<br><br><b>?query= { quantDataMatrix(study_id: '{study_id}'  data_type: '{data_type}' acceptDUA: {acceptDUA}) }</b><br><br><b>Fields:<ul><li>study_id:</b> Study ID, example: dbe94609-1fb3-11e9-b7f8-0a80fada099c</li><li><b>date_type: </b>Data type, example: log2_ratio/unshared_log2_ratio</li><li><b>acceptDUA: </b>Accept DUA variable, example: true/false</li></ul><br>Please click <a href='/API_documentation/PDC_clustergram.html' target='_blank'><b>here</b></a> to know more on how to test this API.",
                   "operationId": "quantDataMatrix",
                   "produces": [
                     "application/json"
                   ],
/*                    "parameters": [{
                           "name": "study_submitter_id",
                           "in": "path",
                           "description": "Study Submitter ID, example : S044-1",
                           "required": true,
                           "type": "string"
                     }, {
                           "name": "data_type",
                           "in": "path",
                           "description": "Data type, example: log2_ratio",
                           "required": true,
                           "type": "string"
                     }
                   ], */
                   //"x-explorer-enabled": false,
                   "responses": {
                     "200": {
                       "description": "successful operation",
                       "schema": {
                         "$ref": "#/definitions/quantDataMatrix"
                       }
                     }
                   }
                  }
                 },
/*                 '?query={ quantDataMatrix(pdc_study_id: "{pdc_study_id}" data_type: "{data_type}") }': {
                  "get": {
                            "tags": ["Quantitative"],
                    "summary": "Returns quant data matrix for a PDC Study ID",
                    "description": "Returns quant data matrix for a Study Submitter ID.<br/>The API takes a long time to execute because of the huge volume of data.<br/><b>Fields:<ul><li>pdc_study_id:</b> PDC Study ID, example: PDC000127</li><li><b>date_type: </b>Data type, example: log2_ratio</li></ul>",
                    "operationId": "quantDataMatrix",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                            "name": "pdc_study_id",
                            "in": "path",
                            "description": "PDC Study ID, example : PDC000127",
                            "required": true,
                            "type": "string"
                      }, {
                            "name": "data_type",
                            "in": "path",
                            "description": "Data type, example: log2_ratio",
                            "required": true,
                            "type": "string"
                      }
                    ],
                    //"x-explorer-enabled": false,
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/quantDataMatrix"
                        }
                      }
                    }
                   }
                  },
                 '?query={ quantDataMatrix(study_id: "{study_id}"  data_type: "{data_type}") }': {
                  "get": {
                            "tags": ["Quantitative"],
                    "summary": "Returns quant data matrix for Study ID",
                    "description": "Returns quant data matrix for a Study ID.<br/>The API takes a long time to execute because of the huge volume of data.<br/><b>Fields:<ul><li>study_id:</b> Study ID, example: dbe94609-1fb3-11e9-b7f8-0a80fada099c</li><li><b>date_type: </b>Data type, example: log2_ratio</li></ul>",
                    "operationId": "quantDataMatrix",
                    "produces": [
                      "application/json"
                    ],
                    "parameters": [{
                         "name": "study_id",
                         "in": "path",
                         "description": "Study ID, example : dbe94609-1fb3-11e9-b7f8-0a80fada099c",
                         "required": true,
                         "type": "string"
                      }, {
                            "name": "data_type",
                            "in": "path",
                            "description": "Data type, example: log2_ratio",
                            "required": true,
                            "type": "string"
                      }
                    ],
                    //"x-explorer-enabled": false,
                    "responses": {
                      "200": {
                        "description": "successful operation",
                        "schema": {
                          "$ref": "#/definitions/quantDataMatrix"
                        }
                      }
                    }
                  }             
               },*/
   },
   "definitions": {
         "Gene":{
             "type":"object",
             "properties":{
                "gene_name":{
                   "type":"string",
                   "example":"A1BG"
                },
                "NCBI_gene_id":{
                   "type":"integer",
                   "example":1
                },
                "authority":{
                   "type":"string",
                   "example":"HGNC:5"
                },
                "description":{
                   "type":"string",
                   "example":"alpha-1-B glycoprotein"
                },
                "organism":{
                   "type":"string",
                   "example":"Homo sapiens"
                },
                "chromosome":{
                   "type":"string",
                   "example":"19"
                },
                "locus":{
                   "type":"string",
                   "example":"19q13.43"
                },
                "proteins":{
                   "type":"string",
                   "example":"M0R009;NP_570602.2;P04217;P04217-2"
                },
                "assays":{
                   "type":"string",
                   "example":"non-CPTAC-1064"
                },
                "spectralCounts":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/spectralCountsDesc"
                   }
                }
             },
             "xml":{
                "name":"Gene"
             }
          },
          "SpectralCount":{
             "type":"object",
             "required":[
                "gene_name_id",
                "study_submitter_id",
                "project_id",
                "uuid"
             ],
             "properties":{
                "gene_name_id":{
                   "type":"string",
                   "description":"PK"
                },
                "study_submitter_id":{
                   "type":"string",
                   "description":"PK"
                },
                "project_id":{
                   "type":"string"
                },
                "uuid":{
                   "type":"string",
                   "description":"unique identifier"
                },
                "plex":{
                   "type":"string",
                   "example":"All"
                },
                "spectral_count":{
                   "type":"integer",
                   "format":"int32"
                },
                "distinct_peptide":{
                   "type":"integer",
                   "format":"int32"
                },
                "unshared_peptide":{
                   "type":"integer",
                   "format":"int32"
                },
                "gene":{
                   "$ref":"#/definitions/Gene"
                }
             },
             "xml":{
                "name":"SpectralCount"
             }
          },
          "Case":{
             "type":"object",
             "properties":{
               "case_id":{
                  "type":"string",
                  "example":"a023e964-118a-11e9-afb9-0a9c39d33490"
               },
               "case_submitter_id":{
                  "type":"string",
                  "example":"C3N-00386"
               },
               "days_to_lost_to_followup":{
                  "type":"integer",
                  "example":0
               },
               "disease_type":{
                  "type":"string",
                  "example":"Uterine Corpus Endometrial Carcinoma"
               },
               "index_date":{
                  "type":"string",
                  "example":"Diagnosis"
               },
               "lost_to_followup":{
                  "type":"string",
                  "example":""
               },
               "primary_site":{
                  "type":"string",
                  "example":"Uterus, NOS"
               },
                "samples":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/Sample"
                   }
                }
             },
             "xml":{
                "name":"Case"
             }
          },
          "Project":{
             "type":"object",
             "required":[
                "project_id"
             ],
             "properties":{
                "project_id":{
                   "type":"string",
                   "description":"PK"
                },
                "name":{
                   "type":"string",
                   "example":"Clinical Proteomic Tumor Analysis Consortium"
                },
                "project_type":{
                   "type":"string",
                   "example":"Research"
                },
                "studies":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/Study"
                   }
                },
                "program":{
                   "$ref":"#/definitions/Program"
                }
             },
             "xml":{
                "name":"Project"
             }
          },
          "Demographic":{
             "type":"object",
             "properties":{
                "demographic_id":{
                   "type":"string",
                   "example":"848b480c-0f56-11e9-a064-0a9c39d33490"
                },
                "ethnicity":{
                   "type":"string",
                   "example":"Not Reported"
                },
                "gender":{
                   "type":"string",
                   "example":"Female"
                },
                "demographic_submitter_id":{
                   "type":"string",
                   "example":"C3N-00386-DEMO"
                },
                "race":{
                   "type":"string",
                   "example":"Not Reported"
                },
                "cause_of_death":{
                   "type":"string",
                   "example":"Not Reported"
                },
                "days_to_birth":{
                   "type":"integer",
                   "format":"int32",
                   "example":"-16190"
                },
                "days_to_death":{
                   "type":"integer",
                   "format":"int32",
                   "example":"0"
                },
                "vital_status":{
                   "type":"string",
                   "example":"Alive"
                },
                "year_of_birth":{
                   "type":"integer",
                   "format":"int32",
                   "example":"1972"
                },
                "year_of_death":{
                   "type":"integer",
                   "format":"int32",
                   "example":"0"
                }
             },
             "xml":{
                "name":"Demographic"
             }
          },
          "Sample":{
             "type":"object",
             "properties":{
                "sample_id":{
                   "type":"string",
                   "example":"99a4bcef-1259-11e9-afb9-0a9c39d33490"
                },
                "sample_submitter_id":{
                   "type":"string",
                   "example":"C3N-00386-02"
                },
                "sample_type":{
                   "type":"string",
                   "example":"Primary Tumor"
                },
                "sample_type_id":{
                   "type":"string",
                   "example":"null"
                },
                "gdc_sample_id":{
                   "type":"string",
                   "example":"null"
                },
                "gdc_project_id":{
                   "type":"string",
                   "example":"null"
                },
                "biospecimen_anatomic_site":{
                   "type":"string",
                   "example":"Not Reported"
                },
                "composition":{
                   "type":"string",
                   "example":"Solid Tissue"
                },
                "current_weight":{
                   "type":"string",
                   "example":"0"
                },
                "days_to_collection":{
                   "type":"string",
                   "example":"0"
                },
                "days_to_sample_procurement":{
                   "type":"string",
                   "example":"0"
                },
                "diagnosis_pathologically_confirmed": {
                  "type":"string",
                  "example":"Not Reported"                
                },
                "freezing_method":{
                   "type":"string",
                   "example":"LN2"
                },
                "initial_weight":{
                   "type":"string",
                   "example":"400"
                },
                "intermediate_dimension":{
                   "type":"string",
                   "example":"null"
                },
                "is_ffpe":{
                   "type":"string",
                   "example":"0"
                },
                "longest_dimension":{
                   "type":"string",
                   "example":"null"
                },
                "method_of_sample_procurement":{
                   "type":"string",
                   "example":"Not Reported"
                },
                "oct_embedded":{
                   "type":"string",
                   "example":"Yes"
                },
                "pathology_report_uuid":{
                   "type":"string",
                   "example":"null"
                },
                "preservation_method":{
                   "type":"string",
                   "example":"Snap Frozen"
                },
                "shortest_dimension":{
                   "type":"string",
                   "example":"null"
                },
                "time_between_clamping_and_freezing":{
                   "type":"string",
                   "example":"0"
                },
                "time_between_excision_and_freezing":{
                   "type":"string",
                   "example":"11"
                },
                "tissue_type":{
                   "type":"string",
                   "example":"Tumor"
                },
                "tumor_code":{
                   "type":"string",
                   "example":"null"
                },
                "tumor_code_id":{
                   "type":"string",
                   "example":"null"
                },
                "tumor_descriptor":{
                   "type":"string",
                   "example":"Not Reported"
                },
                "aliquots":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/Aliquot"
                   }
                }
             },
             "xml":{
                "name":"Sample"
             }
          },
          "Diagnosis":{
             "type":"object",
             "properties":{
               "diagnosis_id":{
                  "type":"string",
                  "example": "f748299b-0f5a-11e9-a064-0a9c39d33490"
               },
                "tissue_or_organ_of_origin":{
                   "type":"number",
                   "example":"Corpus uteri"
                },
                "age_at_diagnosis":{
                  "type":"string",
                  "example": "16190"
               },
                "primary_diagnosis":{
                   "type":"string",
                   "example":"Endometrioid adenocarcinoma, NOS"
                },
                "tumor_grade":{
                   "type":"string",
                   "example": "G1"
                },
                "tumor_stage":{
                   "type":"string",
                   "example": "Stage I"
                },
                "diagnosis_submitter_id":{
                   "type":"string",
                   "example": "C3N-00386-DIAG"
                },
                "classification_of_tumor":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "days_to_last_follow_up":{
                   "type":"string",
                   "example": "673"
                },
                "days_to_last_known_disease_status":{
                   "type":"string",
                   "example": "673"
                },
                "days_to_recurrence": {
                  "type":"string",
                  "example": "0"
                },
                "last_known_disease_status":{
                   "type":"string",
                   "example": "Tumor free"
                },
                "morphology":{
                   "type":"string",
                   "example": "8380/3"
                },
                "progression_or_recurrence":{
                   "type":"string",
                   "example": "no"
                },
                "site_of_resection_or_biopsy":{
                   "type":"string",
                   "example": "Corpus uteri"
                },
                "prior_malignancy":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "ajcc_clinical_m":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "ajcc_clinical_n":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "ajcc_clinical_stage":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "ajcc_clinical_t":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "ajcc_pathologic_m":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "ajcc_pathologic_n":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "ajcc_pathologic_stage":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "ajcc_pathologic_t":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "ann_arbor_b_symptoms":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "ann_arbor_clinical_stage":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "ann_arbor_extranodal_involvement":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "ann_arbor_pathologic_stage":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "best_overall_response":{
                   "type":"string",
                   "example": "null"
                },
                "burkitt_lymphoma_clinical_variant":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "circumferential_resection_margin":{
                   "type":"string",
                   "example": "null"
                },
                "colon_polyps_history":{
                   "type":"string",
                   "example":"null"
                },
                "days_to_best_overall_response":{
                   "type":"string",
                   "example": "null"
                },
                "days_to_diagnosis":{
                   "type":"string",
                   "example": "null"
                },
                "days_to_hiv_diagnosis":{
                   "type":"string",
                   "example": "null"
                },
                "days_to_new_event":{
                   "type":"string",
                   "example": "null"
                },
                "figo_stage":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "hiv_positive":{
                   "type":"string",
                   "example": "null"
                },
                "hpv_positive_type":{
                   "type":"string",
                   "example": "null"
                },
                "hpv_status":{
                   "type":"string",
                   "example": "null"
                },
                "iss_stage":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "laterality":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "ldh_level_at_diagnosis":{
                   "type":"string",
                   "example": "null"
                },
                "ldh_normal_range_upper":{
                   "type":"string",
                   "example": "null"
                },
                "lymph_nodes_positive":{
                   "type":"string",
                   "example": "null"
                },
                "lymphatic_invasion_present":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "method_of_diagnosis":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "new_event_anatomic_site":{
                   "type":"string",
                   "example": "null"
                },
                "new_event_type":{
                   "type":"string",
                   "example": "null"
                },
                "overall_survival":{
                   "type":"string",
                   "example": "null"
                },
                "perineural_invasion_present":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "prior_treatment":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "progression_free_survival":{
                   "type":"string",
                   "example": "null"
                },
                "progression_free_survival_event":{
                   "type":"string",
                   "example": "null"
                },
                "residual_disease":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "vascular_invasion_present":{
                   "type":"string",
                   "example": "Not Reported"
                },
                "year_of_diagnosis":{
                   "type":"string",
                   "example": "null"
                },
                "icd_10_code":{
                  "type":"string",
                  "example": "null"
               },
               "synchronous_malignancy":{
                  "type":"string",
                  "example": "null"
               }
             },
             "xml":{
                "name":"Diagnosis"
             }
          },
          "Study":{
             "type":"object",
             "required":[
                "study_id",
                "project_id"
             ],
             "properties":{
                "study_id":{
                   "type":"string",
                   "description":"PK"
                },
               "pdc_study_id":{
                  "type":"string",
               },
                "project_id":{
                   "type":"string"
                },
                "analytical_fraction":{
                   "type":"string",
                   "example":"Phosphoproteome"
                },
                "experiment_type":{
                   "type":"string",
                   "example":"TMT10"
                },
                "cases":{
                   "$ref":"#/definitions/Case"
                },
                "diagnoses":{
                   "$ref":"#/definitions/Diagnosis"
                },
                "study_run_metadata":{
                   "$ref":"#/definitions/Study_run_metadata"
                }
             },
             "xml":{
                "name":"Study"
             }
          },
          "Program":{
             "type":"object",
             "required":[
                "program_id"
             ],
             "properties":{
                "program_id":{
                   "type":"string",
                   "description":"PK"
                },
                "name":{
                   "type":"string",
                   "example":"Clinical Proteomic Tumor Analysis Consortium"
                },
                "sponsor":{
                   "type":"string",
                   "example":"NCI"
                },
                "start_date":{
                   "type":"string",
                   "format":"date-time"
                },
                "end_date":{
                   "type":"string",
                   "format":"date-time"
                },
                "program_manager":{
                   "type":"string",
                   "example":"John Doe"
                },
                "projects":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/Project"
                   }
                }
             },
             "xml":{
                "name":"Program"
             }
          },
          "Aliquot":{
             "type":"object",
             "required":[
                "aliquot_id",
                "aliquot_submitter_id"
             ],
             "properties":{
                "aliquot_id":{
                   "type":"string",
                   "example":"141959ca-6424-11e8-bcf1-0a2705229b82"
                },
                "aliquot_submitter_id":{
                   "type":"string",
                   "example":"3f957017-d081-45f4-b458-ec3f8d_D2"
                },
                "analyte_type":{
                   "type":"string",
                   "example":"Protein"
                }, 
                "aliquot_run_metadata":{
                  "type":"array",
                  "items":{
                     "$ref":"#/definitions/aliquotRunMetaDataForPaginated"
                  }
               }           
             },
             "xml":{
                "name":"Aliquot"
             }
          },
          "aliquotRunMetaDataForPaginated": {
            "type":"object",
            "properties":{
               "aliquot_run_metadata_id":{
                  "type":"string",
                  "example":"1661cee5-5731-11e8-b664-00a098d917f8"
               },
            }
          },
          "Study_run_metadata":{
             "type":"object",
             "properties":{
                "study_run_metadata_submitter_id":{
                   "type":"string",
                   "example":"S015-2-27"
                },
                "fraction":{
                   "type":"string",
                   "example":"1-12, A"
                },
                "aliquot_run_metadata":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/Aliquot_run_metadata"
                   }
                },
                "files":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/fileInformation"
                   }
                }
             },
             "xml":{
                "name":"Study_run_metadata"
             }
          },
          "Aliquot_run_metadata":{
             "type":"object",
             "properties":{
                "aliquot_submitter_id":{
                   "type":"string",
                   "example":"TCGA-AO-A12B-01A-41-A21V-30"
                },
                "aliquot_run_metadata_id":{
                  "type":"string",
                  "example":"2384aae1-5732-11e8-b664-00a098d917f8"
               }
             },
             "xml":{
                "name":"Aliquot_run_metadata"
             }
          },
          "fileInformation":{
             "type":"object",
             "properties":{
                "file_type":{
                   "type":"string",
                   "example":"Proprietary"
                },
                "data_category":{
                   "type":"string",
                   "example":"Raw Mass Spectra"
                },
                "file_location":{
                   "type":"string",
                   "example":"raw-files/10/30/TCGA_A2-A0YG_E2-A150_BH-A18N_117C_P_BI_20130920_H-PM_f07.raw"
                }
             },
             "xml":{
                "name":"fileInformation"
             }
          },
          "Protocol":{
             "type":"object",
             "properties":{
                "protocol_id":{
                   "type":"string",
                   "description":"PK"
                },
                "protocol_submitter_id":{
                   "type":"string"
                },
                "project_submitter_id":{
                   "type":"string"
                },
                "protocol_submitter_name":{
                   "type":"string"
                },
                "analytical_fraction":{
                   "type":"string"
                },
                "experiment_type":{
                   "type":"string"
                },
                "asp_name":{
                   "type":"string"
                },
                "asp_type":{
                   "type":"string"
                },
                "asp_starting_amount":{
                   "type":"string"
                },
                "asp_proteolysis":{
                   "type":"string"
                },
                "asp_alkylation":{
                   "type":"string"
                },
                "asp_enrichment":{
                   "type":"string"
                },
                "asp_labelling":{
                   "type":"string"
                },
                "asp_fractionation":{
                   "type":"string"
                },
                "asp_fractions":{
                   "type":"string"
                },
                "asp_updated":{
                   "type":"string"
                },
                "asp_document":{
                   "type":"string"
                },
                "cp_name":{
                   "type":"string"
                },
                "cp_column_type":{
                   "type":"string"
                },
                "cp_injected":{
                   "type":"string"
                },
                "cp_column_length":{
                   "type":"string"
                },
                "cp_inside_diameter":{
                   "type":"string"
                },
                "cp_particle_size":{
                   "type":"string"
                },
                "cp_particle_type":{
                   "type":"string"
                },
                "cp_gradient_length":{
                   "type":"string"
                },
                "cp_updated":{
                   "type":"string"
                },
                "cp_document":{
                   "type":"string"
                },
                "msp_name":{
                   "type":"string"
                },
                "msp_instrument":{
                   "type":"string",
                   "example":"Thermo LTQ Orbitrap Velos"
                },
                "msp_type":{
                   "type":"string",
                   "example":"Orbitrap Mass Spectrometry Protocol"
                },
                "msp_dissociation":{
                   "type":"string"
                },
                "msp_ms1_resolution":{
                   "type":"string"
                },
                "msp_ms2_resolution":{
                   "type":"string"
                },
                "msp_precursors":{
                   "type":"string"
                },
                "msp_collision_energy":{
                   "type":"string"
                },
                "msp_updated":{
                   "type":"string"
                },
                "msp_document":{
                   "type":"string"
                },
                "study":{
                   "$ref":"#/definitions/Study"
                }
             },
             "xml":{
                "name":"Protocol"
             }
          },
          "allExperiments":{
             "type":"object",
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/allExperimentsDef"
                }
             },
             "xml":{
                "name":"allExperiments"
             }
          },
          "allExperimentsDef":{
             "type":"object",
             "properties":{
                "allExperimentTypes":{
                 "type":"array",
                 "items":{
                   "$ref":"#/definitions/Experiment"
                 }
                }
             },
             "xml":{
                "name":"allExperimentsDef"
             }
          },
          "Experiment":{
             "type":"object",
             "properties":{
                "experiment_type":{
                   "type":"string",
                   "example":"Label Free"
                },
                "tissue_or_organ_of_origin":{
                   "type":"string",
                   "example":"Kidney, NOS"
                },
                "disease_type":{
                   "type":"string",
                   "example":"Clear Cell Renal Cell Carcinoma"
                }
             },
             "xml":{
                "name":"Experiment"
             }
          },
          "quantDataMatrix":{
            "type":"object",
            "properties":{
               "data":{
                  "type":"string",
                  "$ref":"#/definitions/quantDataMatrixDef"
               }
            },
            "xml":{
               "name":"quantDataMatrix"
            }
         },
         "quantDataMatrixDef":{
            "type":"object",
            "properties":{
               "quantDataMatrix":{
                "type":"array",
                "items":{
                  "$ref":"#/definitions/quantDataMatrixDesc"
                }
               }
            },
            "xml":{
               "name":"quantDataMatrixDef"
            }
         },
         "quantDataMatrixDesc":{
            "type":"object",
            "properties":{
               "Gene/Aliquot":{
                  "type":"string",
               }
            },
            "xml":{
               "name":"quantDataMatrixDesc"
            }
         },
          "SearchRecord":{
             "type":"object",
             "properties":{
                "record_type":{
                   "type":"string",
                   "example":"study"
                },
                "name":{
                   "type":"string",
                   "example":"TCGA BRCA Proteome S015-1"
                },
                "submitter_id_name":{
                   "type":"string",
                   "example":"TCGA_Breast_Cancer_Proteome"
                },
                "pdc_study_id":{
                  "type":"string",
                  "example":"PDC000173"
               }
             },
             "xml":{
                "name":"SearchRecord"
             }
          },
          "studySearchByPDCStudyIdDetails":{
            "type":"object",
            "properties":{
               "record_type":{
                  "type":"string",
                  "example":"study"
               },
               "name":{
                  "type":"string",
                  "example":"TCGA BRCA Proteome S015-1"
               },
               "submitter_id_name":{
                  "type":"string",
                  "example":"TCGA Breast Cancer Proteome"
               },
               "study_id":{
                  "type":"string",
                  "example":"b8da9eeb-57b8-11e8-b07a-00a098d917f8"
               },
               "study_submitter_id":{
                 "type":"string",
                 "example":"S015-1"
              },
               "pdc_study_id":{
                 "type":"string",
                 "example":"PDC000173"
              }
            },
            "xml":{
               "name":"studySearchByPDCStudyIdDetails"
            }
         },
         "pdcEntityReferenceDetails":{
            "type":"object",
            "properties":{
               "reference_id":{
                  "type":"string",
                  "example":"25b2ff66-88bc-11ea-bc9a-0a16d369a41f"
               },
               "entity_type":{
                  "type":"string",
                  "example":"study"
               },
               "entity_id":{
                  "type":"string",
                  "example":"dbe94609-1fb3-11e9-b7f8-0a80fada099c"
               },
               "reference_type":{
                  "type":"string",
                  "example":"external"
               },
               "reference_entity_type":{
                 "type":"string",
                 "example":"study"
              },
               "reference_entity_alias":{
                 "type":"string",
                 "example":"S044"
              },
              "reference_resource_name":{
               "type":"string",
               "example":"Clinical Proteomic Tumor Analysis Consortium"
               },
               "reference_resource_shortname":{
                  "type":"string",
                  "example":"CPTAC"
               },
               "reference_entity_location":{
               "type":"string",
               "example":"https://cptac-data-portal.georgetown.edu/cptac/s/S044\r"
            }
            },
            "xml":{
               "name":"pdcEntityReferenceDetails"
            }
         },
          "File":{
             "type":"object",
             "required":[
                "study_submitter_id",
                "uuid"
             ],
             "properties":{
                "file_id":{
                   "type":"string",
                   "description":"PK"
                },
                "study_submitter_id":{
                   "type":"string"
                },
                "uuid":{
                   "type":"string",
                   "description":"unique identifier"
                },
                "files_count":{
                   "type":"integer",
                   "format":"int32"
                },
                "file_name":{
                   "type":"string",
                   "example":"06a0ff24-325a-4c70-b480-882eb0ae9a0e.tar.gz"
                },
                "file_type":{
                   "type":"string",
                   "example":"PSM"
                },
                "md5sum":{
                   "type":"string",
                   "example":"6635c5c335c1aad60a3c331b65977564"
                }
             },
             "xml":{
                "name":"File"
             }
          },
          "FilePerStudy":{
             "type":"object",
             "properties":{
                "study_id":{
                   "type":"string"
                },
                "study_submitter_id":{
                   "type":"string"
                },
                "study_name":{
                   "type":"string"
                },
                "file_id":{
                   "type":"string"
                },
                "file_name":{
                   "type":"string",
                   "example":"06a0ff24-325a-4c70-b480-882eb0ae9a0e.tar.gz"
                },
                "file_submitter_id":{
                   "type":"string",
                   "example":"TCGA_114C_36-2547-01A-01_36-1578-01A-01_36-2542-01A-01_W_JHUZ_20130524_F7.raw.cap.psm"
                },
                "file_type":{
                   "type":"string",
                   "example":"PSM"
                },
                "file_location":{
                   "type":"string"
                },
                "file_size":{
                   "type":"string"
                },
                "md5sum":{
                   "type":"string",
                   "example":"6635c5c335c1aad60a3c331b65977564"
                }
             },
             "xml":{
                "name":"FilePerStudy"
             }
          },
          "Paginated":{
             "type":"object",
             "required":[
                "total"
             ],
             "properties":{
                "total":{
                   "type":"integer",
                   "description":"total number of records"
                },
                "files":{
                   "type":"string"
                },
                "cases":{
                   "type":"string"
                },
                "caseDiagnosesPerStudy":{
                   "type":"string"
                },
                "caseDemographicsPerStudy":{
                   "type":"string"
                },
                "casesSamplesAliquots":{
                   "type":"string"
                },
                "dataMatrix":{
                   "type":"string"
                },
                "pagination":{
                   "$ref":"#/definitions/Pagination"
                }
             },
             "xml":{
                "name":"Paginated"
             }
          },
          "pdcDataStatsDesc":{
             "type":"object",
             "properties":{
                "program":{
                   "type":"integer",
                   "example":2
                },
                "study":{
                   "type":"integer",
                   "example":20
                },
                "spectra":{
                   "type":"integer",
                   "example":64720831
                },
                "protein":{
                   "type":"integer",
                   "example":12704
                },
                "project":{
                   "type":"integer",
                   "example":4
                },
                "peptide":{
                   "type":"integer",
                   "example":991578
                },
                "data_size":{
                   "type":"integer",
                   "example":8
                },
                "data_label":{
                   "type":"string",
                   "example":"test4"
                },
                "data_file":{
                   "type":"integer",
                   "example":31172
                }
             },
             "xml":{
                "name":"pdcDataStatsDesc"
             }
          },
          "ExperimentProjects":{
             "type":"object",
             "properties":{
                "experiment_type":{
                   "type":"string"
                },
                "project_id":{
                   "type":"string"
                },
                "primary_diagnosis":{
                   "type":"string",
                   "example":"Inflitrating Ductal Carcinoma"
                }
             },
             "xml":{
                "name":"ExperimentProjects"
             }
          },
          "quantitiveDataCPTAC2Desc":{
             "type":"object",
             "properties":{
                "gene_abundance_id":{
                   "type":"string",
                   "example":"4fbf28f4-22ea-11e9-b7f8-0a80fada099c"
                },
                "gene_id":{
                   "type":"string",
                   "example":"f6ba4bc5-b814-11e8-907f-0a2705229b82"
                },
                "gene_name":{
                   "type":"string",
                   "example":"A1BG"
                },
                "study_id":{
                   "type":"string",
                   "example":"b8da9eeb-57b8-11e8-b07a-00a098d917f8"
                },
                "pdc_study_id":{
                  "type":"string",
                  "example":"PDC000180"
               },                
                "study_submitter_id":{
                   "type":"string",
                   "example":"S015-1"
                },
                "study_run_metadata_id":{
                   "type":"string",
                   "example":"d9b03458-56ca-11e8-b664-00a098d917f8"
                },
                "aliquot_id":{
                   "type":"string",
                   "example":"47b645da-642a-11e8-bcf1-0a2705229b82"
                },
                "project_id":{
                   "type":"string",
                   "example":"48af5040-5546-11e8-b664-00a098d917f8"
                },
                "project_submitter_id":{
                   "type":"string",
                   "example":"CPTAC-TCGA"
                },
                "analytical_fraction":{
                   "type":"string",
                   "example":"Proteome"
                },
                "experiment_type":{
                   "type":"string",
                   "example":"iTRAQ4"
                },
                "aliquot_alias":{
                   "type":"string",
                   "example":"263d3f-I"
                },
                "precursor_area":{
                   "type":"string",
                   "example":""
                },
                "cud_label":{
                   "type":"string",
                   "example":"TCGA_Breast_BI_Proteome.itraq.tsv\r"
                }
             },
             "xml":{
                "name":"quantitiveDataCPTAC2Desc"
             }
          },
          "workflowMetadataDesc":{
             "type":"object",
             "properties":{
                "workflow_metadata_submitter_id":{
                   "type":"string",
                   "example":"TCGA_Breast_Cancer_Proteome"
                },
                "pdc_study_id":{
                  "type":"string",
                  "example":"PDC000173"
                },
                "study_submitter_id":{
                   "type":"string",
                   "example":"S015-1"
                },
                "protocol_submitter_id":{
                   "type":"string",
                   "example":"P-S015-1"
                },
                "cptac_study_id":{
                   "type":"string",
                   "example":"S015"
                },
                "submitter_id_name":{
                   "type":"string",
                   "example":"MSGF+ iTRAQ 4-plex (Thermo Q-Exactive HCD)"
                },
                "study_submitter_name":{
                   "type":"string",
                   "example":"TCGA_Breast_Cancer_Proteome"
                },
                "analytical_fraction":{
                   "type":"string",
                   "example":"Proteome"
                },
                "experiment_type":{
                   "type":"string",
                   "example":"iTRAQ4"
                },
                "instrument":{
                   "type":"string",
                   "example":"Thermo Q Exactive"
                },
                "refseq_database_version":{
                   "type":"string",
                   "example":"RefSeq human build 37"
                },
                "uniport_database_version":{
                   "type":"string",
                   "example":"N/A"
                },
                "hgnc_version":{
                   "type":"string",
                   "example":""
                },
                "raw_data_processing":{
                   "type":"string",
                   "example":"ReAdw4Mascot2.exe version 1.2 ConvVer 20130604a"
                },
                "raw_data_conversion":{
                   "type":"string",
                   "example":"msconvert 3.0.3827"
                },
                "sequence_database_search":{
                   "type":"string",
                   "example":"MSGF+ v9733"
                },
                "search_database_parameters":{
                   "type":"string",
                   "example":"java –Xmx3500M –jar MSGFPlus.jar -d <file>.fasta -t 20ppm -e 1 -m (3 for QExactive, 1 for Orbitrap) -inst (1 for QExactive, 1 for Orbitrap) -ntt 1 -thread 2 -tda 1 -ti 0,1 -n 1 -maxLength 50 -mod <file>.txt"
                },
                "phosphosite_localization":{
                   "type":"string",
                   "example":""
                },
                "ms1_data_analysis":{
                   "type":"string",
                   "example":"ProMS"
                },
                "psm_report_generation":{
                   "type":"string",
                   "example":"single_file_report.exe"
                },
                "cptac_dcc_mzidentml":{
                   "type":"string",
                   "example":"1.2.2"
                },
                "mzidentml_refseq":{
                   "type":"string",
                   "example":"r82"
                },
                "mzidentml_uniprot":{
                   "type":"string",
                   "example":"2017_06"
                },
                "gene_to_prot":{
                   "type":"string",
                   "example":"2017-07-20"
                },
                "cptac_galaxy_workflows":{
                   "type":"string",
                   "example":"N/A"
                },
                "cptac_galaxy_tools":{
                   "type":"string",
                   "example":"N/A"
                },
                "cdap_reports":{
                   "type":"string",
                   "example":"N/A"
                },
                "cptac_dcc_tools":{
                   "type":"string",
                   "example":"N/A"
                }
             },
             "xml":{
                "name":"WorkflowMetadata"
             }
          },
          "Pagination":{
             "type":"object",
             "required":[
                "count",
                "from",
                "page",
                "total",
                "pages",
                "size"
             ],
             "properties":{
                "count":{
                   "type":"integer",
                   "example":"10"
                },
                "sort":{
                   "type":"string"
                },
                "from":{
                   "type":"integer",
                   "example":"0"
                },
                "page":{
                   "type":"integer",
                   "example":"1"
                },
                "total":{
                   "type":"integer",
                   "example":"10"
                },
                "pages":{
                   "type":"integer",
                   "example":"1"
                },
                "size":{
                   "type":"integer",
                   "example":"10"
                }
             },
             "xml":{
                "name":"Pagination"
             }
          },
          "caseSearch":{
             "type":"object",
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/caseSearchDef"
                }
             },
             "xml":{
                "name":"caseSearch"
             }
          },
          "caseSearchDef":{
             "type":"object",
             "properties":{
                "caseSearch":{
                   "type":"string",
                     "$ref":"#/definitions/caseSearchDesc"
                }
             },
             "xml":{
                "name":"caseSearchDef"
             }
          },
          "caseSearchDesc":{
             "type":"object",
             "properties":{
                "searchCases":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/searchCases"
                   }
                }
             },
             "xml":{
                "name":"caseSearchDesc"
             }
          },
          "searchCases":{
             "type":"object",
             "properties":{
                "record_type":{
                   "type":"string",
                   "example":"case"
                },
                "name":{
                   "name":"string",
                   "example":"TCGA-61-1724"
                },
                "submitter_id_name":{
                  "type":"string",
                  "example":"null"
               },
               "case_id":{
                  "name":"string",
                  "example":"f8e64f02-63d7-11e8-bcf1-0a2705229b82"
               },
               "description":{
                  "type":"string",
                  "example":"null"
               },
               "proteins":{
                  "name":"string",
                  "example":"null"
               }
             },
             "xml":{
                "name":"searchCases"
             }
          },
          "paginatedCasesSamplesAliquots":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/paginatedCasesSamplesAliquotsDef"
                }
             },
             "xml":{
                "name":"paginatedCasesSamplesAliquots"
             }
          },
          "paginatedCasesSamplesAliquotsDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "paginatedCasesSamplesAliquots":{
                   "type":"string",
                   "$ref":"#/definitions/casesSamplesAliquotsDesc"
                }
             },
             "xml":{
                "name":"paginatedCasesSamplesAliquotsDef"
             }
          },
          "casesSamplesAliquotsDesc":{
             "type":"object",
             "properties":{
                "total":{
                   "type":"number",
                   "example":958
                },
                "casesSamplesAliquots":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/Case"
                   }
                },
                "pagination": {             
                  "type":"string",
                  "$ref":"#/definitions/Pagination"
                }
             },
             "xml":{
                "name":"casesSamplesAliquotsDesc"
             }
          },
          "paginatedSpectralCountPerStudyAliquot":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/paginatedSpectralCountPerStudyAliquotDef"
                }
             },
             "xml":{
                "name":"paginatedSpectralCountPerStudyAliquot"
             }
          },
          "paginatedSpectralCountPerStudyAliquotDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "paginatedSpectralCountPerStudyAliquot":{
                   "type":"string",
                   "$ref":"#/definitions/paginatedSpectralCountPerStudyAliquotDesc"
                }
             },
             "xml":{
                "name":"paginatedSpectralCountPerStudyAliquotDef"
             }
          },
          "paginatedSpectralCountPerStudyAliquotDesc":{
             "type":"object",
             "properties":{
                "total":{
                   "type":"number",
                   "example":1
                },
                "spectralCounts":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/spectralCountsPaginatedAliquot"
                   }
                },
                "pagination":{
                   "type":"Object",
                   "$ref":"#/definitions/Pagination"
                }
             },
             "xml":{
                "name":"paginatedSpectralCountPerStudyAliquotDesc"
             }
          },
          "spectralCountsPaginatedAliquot":{
             "type":"object",
             "properties":{
                "study_submitter_id":{
                   "type":"string",
                   "example":"TCGA BRCA Phosphoproteome S015-2"
                },
                "pdc_study_id":{
                  "type":"string",
                  "example":"PDC000174"
               },
                "plex":{
                   "type":"string",
                   "example":"06TCGA_A2-A0D0-01A_BH-A0HK-01A_C8-A12T-01A_Phosphoproteome_BI_20130329"
                },
                "spectral_count":{
                   "type":"number",
                   "example":94
                },
                "distinct_peptide":{
                   "type":"number",
                   "example":37
                },
                "unshared_peptide":{
                   "type":"number",
                   "example":36
                }
             },
             "xml":{
                "name":"spectralCountsPaginatedAliquot"
             }
          },
          "paginatedDataMatrix":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/paginatedDataMatrixDef"
                }
             },
             "xml":{
                "name":"paginatedDataMatrix"
             }
          },
          "paginatedDataMatrixDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "paginatedDataMatrix":{
                   "type":"string",
                   "$ref":"#/definitions/paginatedDataMatrixDesc"
                }
             },
             "xml":{
                "name":"paginatedDataMatrixDef"
             }
          },
          "paginatedDataMatrixDesc":{
             "type":"object",
             "properties":{
                "total":{
                   "type":"number",
                   "example":90
                },
                "dataMatrix":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/dataMatrixDef"
                   }
                }
             },
             "xml":{
                "name":"paginatedDataMatrixDesc"
             }
          },
          "dataMatrixDef":{
             "type":"object",
             "properties":{
                "Gene/Aliquot":{
                   "type":"string"
                },
                "case_submitter_id":{
    
                },
                "disease_type":{
    
                },
                "primary_site":{
    
                },
                "diagnoses":{
    
                }
             },
             "xml":{
                "name":"dataMatrixDef"
             }
          },
          "paginatedCaseDiagnosesPerStudy":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/paginatedCaseDiagnosesPerStudyDef"
                }
             },
             "xml":{
                "name":"paginatedCaseDiagnosesPerStudy"
             }
          },
          "paginatedCaseDiagnosesPerStudyDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "paginatedCaseDiagnosesPerStudy":{
                   "type":"string",
                   "$ref":"#/definitions/paginatedCaseDiagnosesPerStudyDesc"
                }
             },
             "xml":{
                "name":"paginatedCaseDiagnosesPerStudyDef"
             }
          },
          "paginatedCaseDiagnosesPerStudyDesc":{
             "type":"object",
             "properties":{
                "total":{
                   "type":"number",
                   "example":90
                },
                "caseDiagnosesPerStudy":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/paginatedCaseDiagnosis"
                   }
                },
                "pagination":{
                  "$ref":"#/definitions/Pagination"
               }
             },
             "xml":{
                "name":"paginatedCaseDiagnosesPerStudyDesc"
             }
          },
          "paginatedCaseDiagnosis":{
             "type":"object",
             "properties":{
                "case_id":{
                   "type":"string",
                   "example":"a023e964-118a-11e9-afb9-0a9c39d33490"
                },
                "case_submitter_id":{
                   "type":"string",
                   "example":"C3N-00386"
                },
                "disease_type":{
                   "type":"string",
                   "example":"Uterine Corpus Endometrial Carcinoma"
                },
                "primary_site":{
                   "type":"string",
                   "example":"Uterus, NOS"
                },
                "diagnoses":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/Diagnosis"
                   }
                }
             },
             "xml":{
                "name":"paginatedCaseDemographics"
             }
          },
          "paginatedCaseDemographicsPerStudy":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/paginatedCaseDemographicsPerStudyDef"
                }
             },
             "xml":{
                "name":"paginatedCaseDemographicsPerStudy"
             }
          },
          "paginatedCaseDemographicsPerStudyDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "paginatedCaseDemographicsPerStudy":{
                   "type":"string",
                   "$ref":"#/definitions/paginatedCaseDemographicsPerStudyDesc"
                }
             },
             "xml":{
                "name":"paginatedCaseDemographicsPerStudyDef"
             }
          },
          "paginatedCaseDemographicsPerStudyDesc":{
             "type":"object",
             "properties":{
                "total":{
                   "type":"number",
                   "example":93
                },
                "caseDemographicsPerStudy":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/paginatedCaseDemographics"
                   }
                },
                "pagination":{
                  "$ref":"#/definitions/Pagination"
                }
             },
             "xml":{
                "name":"paginatedCaseDemographicsPerStudyDesc"
             }
          },
          "paginatedCaseDemographics":{
             "type":"object",
             "properties":{
                "case_id":{
                   "type":"string",
                   "example":"a023e964-118a-11e9-afb9-0a9c39d33490"
                },
                "case_submitter_id":{
                   "type":"string",
                   "example":"C3N-00386"
                },
                "disease_type":{
                   "type":"string",
                   "example":"Uterine Corpus Endometrial Carcinoma"
                },
                "primary_site":{
                   "type":"string",
                   "example":"Uterus, NOS"
                },
                "demographics":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/Demographic"
                   }
                }
             },
             "xml":{
                "name":"paginatedCaseDemographics"
             }
          },
          "getPaginatedFiles":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/getPaginatedFilesDef"
                }
             },
             "xml":{
                "name":"getPaginatedFiles"
             }
          },
          "getPaginatedFilesDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "getPaginatedFiles":{
                   "type":"string",
                   "$ref":"#/definitions/getPaginatedFilesDesc"
                },
                "pagination": {
                  "type":"string",
                  "$ref":"#/definitions/Pagination"
                }
             },
             "xml":{
                "name":"getPaginatedFilesDef"
             }
          },
          "getPaginatedFilesDesc":{
             "type":"object",
             "properties":{
                "total":{
                   "type":"number",
                   "example":37809
                },
                "files":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/filesForPaginatedRecords"
                   }
                }
             },
             "xml":{
                "name":"getPaginatedFilesDesc"
             }
          },
          "filesForPaginatedRecords":{
             "type":"object",
             "properties":{
               "pdc_study_id":{
                  "type":"string",
                  "example":"PDC000206"
                },
                "study_submitter_id":{
                   "type":"string",
                   "example":"CPTAC GBM Discovery Study - CompRef Phosphoproteome"
                },
                "file_name":{
                   "type":"string",
                   "example":"02CPTAC_CompRef_GBM_P_PNNL_20190306_B2S5_f10.mzML.gz"
                },
                "file_type":{
                   "type":"string",
                   "example":"Open Standard"
                },
                "md5sum":{
                   "type":"string",
                   "example":"058ab22afbf1fb18563f8e499ad3ad8d"
                }
             },
             "xml":{
                "name":"filesForPaginatedRecords"
             }
          },
          "getPaginatedGenes":{
            "type":"object",
            "required":[
   
            ],
            "properties":{
               "data":{
                  "type":"string",
                  "$ref":"#/definitions/getPaginatedGenesDef"
               }
            },
            "xml":{
               "name":"getPaginatedGenes"
            }
         },
         "getPaginatedGenesDef":{
            "type":"object",
            "required":[
   
            ],
            "properties":{
               "getPaginatedGenes":{
                  "type":"string",
                  "$ref":"#/definitions/getPaginatedGenesDesc"
               }
            },
            "xml":{
               "name":"getPaginatedGenesDef"
            }
         },
         "getPaginatedGenesDesc":{
            "type":"object",
            "properties":{
               "total":{
                  "type":"number",
                  "example":2
               },
               "genesProper":{
                  "type":"array",
                  "items":{
                     "$ref":"#/definitions/genesProper"
                  }
               },
               "pagination":{
                 "$ref":"#/definitions/Pagination"
              }
            },
            "xml":{
               "name":"getPaginatedCasesDesc"
            }
         },
         "genesProper":{
            "type":"object",
            "properties":{
               "gene_id":{
                  "type":"string",
                  "example":"f6baad59-b814-11e8-907f-0a2705229b82"
               },
               "gene_name":{
                  "type":"string",
                  "example":"A2ML1"
               },
               "NCBI_gene_id":{
                  "type":"number",
                  "example":"144568"
               },
               "authority":{
                  "type":"string",
                  "example":"HGNC:23336"
               },
               "description":{
                  "type":"string",
                  "example":"alpha-2-macroglobulin like 1"
               },
               "organism":{
                  "type":"string",
                  "example":"Homo sapiens"
               },
               "chromosome":{
                  "type":"string",
                  "example":"12"
               },
               "locus":{
                  "type":"string",
                  "example":"12p13.31"
               },
               "proteins":{
                  "type":"string",
                  "example":"A8K2U0;A8K2U0-2;F5GXP1;F5GYG7;H0YGG5;H0YH14;NP_001269353.1;NP_653271.2;XP_011518868.1;XP_011518869.1;XP_016874357.1;XP_016874358.1;XP_016874359.1"
               },
               "assays":{
                  "type":"string",
                  "example":"non-CPTAC-1064"
               },
            },
            "xml":{
               "name":"genesProper"
            }
         },
          "getPaginatedCases":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/getPaginatedCasesDef"
                }
             },
             "xml":{
                "name":"getPaginatedCases"
             }
          },
          "getPaginatedCasesDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "getPaginatedCases":{
                   "type":"string",
                   "$ref":"#/definitions/getPaginatedCasesDesc"
                }
             },
             "xml":{
                "name":"getPaginatedCasesDef"
             }
          },
          "getPaginatedCasesDesc":{
             "type":"object",
             "properties":{
                "total":{
                   "type":"number",
                   "example":977
                },
                "cases":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/allCasesDesc"
                   }
                },
                "pagination":{
                  "$ref":"#/definitions/Pagination"
               }
             },
             "xml":{
                "name":"getPaginatedCasesDesc"
             }
          },
          "casePerFile":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/casePerFileDef"
                }
             },
             "xml":{
                "name":"casePerFile"
             }
          },
          "casePerFileDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "casePerFile":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/casePerFileDesc"
                   }
                }
             },
             "xml":{
                "name":"casePerFileDef"
             }
          },
          "casePerFileDesc":{
             "type":"object",
             "properties":{
                "file_id":{
                   "type":"string",
                   "example":"10ffa258-14c2-4c74-861e-91ed02fb4cf6"
                },
                "case_id":{
                   "type":"string",
                   "example": "null"
                },
                "case_submitter_id":{
                   "type":"string",
                   "example": "null"
                }
             },
             "xml":{
                "name":"casePerFileDesc"
             }
          },
          "fileMetadata":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/fileMetadataDef"
                }
             },
             "xml":{
                "name":"fileMetadata"
             }
          },
          "fileMetadataDef":{
             "type":"object",
             "properties":{
                "fileMetadata":{
                   "type":"array",
                   "items": {
                   "$ref":"#/definitions/fileMetadataDesc"
                   }
                }
             },
             "xml":{
                "name":"fileMetadataDef"
             }
          },
          "fileMetadataDesc":{
             "type":"object",
             "properties":{
               "file_id":{
                  "type":"string",
                  "example":"00046804-1b57-11e9-9ac1-005056921935"
               },
                "file_name":{
                   "type":"string",
                   "example":"06CPTAC_CCRCC_W_JHU_20171120_LUMOS_f09.mzid.gz"
                },
                "file_size":{
                   "type":"string",
                   "example":"7290779"
                },
                "md5sum":{
                   "type":"string",
                   "example":"e8d4417af70878bb1cf45f8a0fca9433"
                },
                "file_location":{
                   "type":"string",
                   "example":"studies/127/PSM/mzid/06CPTAC_CCRCC_W_JHU_20171120_LUMOS_f09.mzid.gz"
                },
                "file_submitter_id":{
                   "type":"string",
                   "example":"06CPTAC_CCRCC_W_JHU_20171120_LUMOS_f09.mzid.gz"
                },
                "fraction_number":{
                   "type":"string",
                   "example":"9"
                },
                "experiment_type":{
                   "type":"string",
                   "example":"TMT10"
                },
                "data_category":{
                   "type":"string",
                   "example":"Peptide Spectral Matches"
                },
                "file_type":{
                   "type":"string",
                   "example":"Open Standard"
                },
                "file_format":{
                   "type":"string",
                   "example":"mzIdentML"
                },
                "plex_or_dataset_name":{
                   "type":"string",
                   "example":"06CPTAC_CCRCC_Proteome_JHU_20171120"
                },
                "analyte":{
                  "type":"string",
                  "example":"Proteome"
               },
               "instrument":{
                  "type":"string",
                  "example":"Orbitrap Fusion Lumos"
               },
               "study_run_metadata_submitter_id":{
                  "type":"string",
                  "example":"S044-1-9"
               },
               "study_run_metadata_id":{
                  "type":"string",
                  "example":"f7fdea37-2074-11e9-b7f8-0a80fada099c"
               },
                "aliquots":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/fileMetadataAliquotsDesc"
                   }
                }
             },
             "xml":{
                "name":"fileMetadataDesc"
             }
          },
          "fileMetadataAliquotsDesc":{
             "type":"object",
             "properties":{
                "aliquot_id":{
                   "type":"string",
                   "example":"4f9821f1-2053-11e9-b7f8-0a80fada099c"
                },
                "aliquot_submitter_id":{
                   "type":"string",
                   "example":"CPT0000790001"
                },
                "sample_id":{
                   "type":"string",
                   "example":"7e25284f-204c-11e9-b7f8-0a80fada099c"
                },
                "sample_submitter_id":{
                   "type":"string",
                   "example":"C3L-00097-06"
                },
                "case_id":{
                   "type":"string",
                   "example":"b76d3749-1fb8-11e9-b7f8-0a80fada099c"
                },
                "case_submitter_id":{
                   "type":"string",
                   "example":"C3L-00097"
                }
             },
             "xml":{
                "name":"fileMetadataAliquotsDesc"
             }
          },
          "diseaseTypesPerProject":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/diseaseTypesPerProjectDef"
                }
             },
             "xml":{
                "name":"diseaseTypesPerProject"
             }
          },
          "diseaseTypesPerProjectDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "diseaseTypesPerProject":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/diseaseTypesPerProjectDesc"
                   }
                }
             },
             "xml":{
                "name":"diseaseTypesPerProjectDef"
             }
          },
          "diseaseTypesPerProjectDesc":{
             "type":"object",
             "properties":{
                "project_submitter_id":{
                   "type":"string",
                   "example":"Proteogenomic Analysis of Pediatric Brain Cancer Tumors Pilot Study"
                },
                "experiment_type":{
                   "type":"number",
                   "example":"TMT11"
                },
                "analytical_fraction":{
                   "type":"string",
                   "example":"Proteome"
                },
                "cases":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/casesForDiseaseTypeDesc"
                   }
                }
             },
             "xml":{
                "name":"diseaseTypesPerProjectDesc"
             }
          },
          "casesForDiseaseTypeDesc":{
             "type":"object",
             "properties":{
                "disease_type":{
                   "type":"string",
                   "example":"Clear Cell Renal Cell Carcinoma"
                },
                "count":{
                   "type":"number",
                   "example":6
                }
             },
             "xml":{
                "name":"casesForDiseaseTypeDesc"
             }
          },
          "filesPerStudy":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/filesPerStudyDef"
                }
             },
             "xml":{
                "name":"filesPerStudy"
             }
          },
          "filesPerStudyDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "filesPerStudy":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/filesPerStudyDesc"
                   }
                }
             },
             "xml":{
                "name":"filesPerStudyDef"
             }
          },
          "filesPerStudyDesc":{
             "type":"object",
             "properties":{
                "study_id":{
                   "type":"string",
                   "example":"0ea91a54-1798-11ea-9bfa-0a42f3c845fe"
                },
                "pdc_study_id":{
                  "type":"string",
                  "example":"PDC000206"
                },
                "study_submitter_id":{
                   "type":"string",
                   "example":"CPTAC GBM Discovery Study - CompRef Phosphoproteome"
                },
                "study_name":{
                   "type":"string",
                   "example":"CPTAC GBM Discovery Study - CompRef Phosphoproteome"
                },
                "file_id":{
                   "type":"string",
                   "example":"057a5b76-a582-4a3b-87d7-4897750d18c3"
                },
                "file_name":{
                   "type":"string",
                   "example":"02CPTAC_CompRef_GBM_P_PNNL_20190306_B2S5_f10.mzML.gz"
                },
                "file_submitter_id":{
                   "type":"string",
                   "example":"02CPTAC_CompRef_GBM_P_PNNL_20190306_B2S5_f10.mzML.gz"
                },
                "file_type":{
                   "type":"string",
                   "example":"Open Standard"
                },
                "md5sum":{
                   "type":"string",
                   "example":"058ab22afbf1fb18563f8e499ad3ad8d"
                },
                "file_location":{
                   "type":"string",
                   "example":"studies/206/mzml/02CPTAC_CompRef_GBM_P_PNNL_20190306_B2S5_f10.mzML.gz"
                },
                "file_size":{
                   "type":"string",
                   "example":"145180612"
                },
                "data_category":{
                   "type":"string",
                   "example":"Processed Mass Spectra"
                },
                "file_format":{
                   "type":"string",
                   "example":"mzML"
                },
                "signedUrl":{
                  "type":"array",
                  "items":{
                     "$ref":"#/definitions/signedUrlDesc"
                  }
               }
             },
             "xml":{
                "name":"filesPerStudyDesc"
             }
          },
          "signedUrlDesc":{
            "type":"object",
            "properties":{
               "url":{
                  "type":"string",
                  "example":"https://pdcdatastore.s3.amazonaws.com/studies/206/mzml/02CPTAC_CompRef_GBM_P_PNNL_20190306_B2S5_f10.mzML.gz?AWSAccessKeyId=AKIAQPWI5WIU7M4BLQXG&Expires=1602261172&Signature=W2wF3metuSJUtoZQQFkrfVX0dek%3D"
               }
              },
            "xml":{
               "name":"signedUrlDesc"
            }
         },
          "filesCountPerStudy":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/filesCountPerStudyDef"
                }
             },
             "xml":{
                "name":"filesCountPerStudy"
             }
          },
          "filesCountPerStudyDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "filesCountPerStudy":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/filesCountPerStudyDesc"
                   }
                }
             },
             "xml":{
                "name":"filesCountPerStudyDef"
             }
          },
          "filesCountPerStudyDesc":{
             "type":"object",
             "properties":{
               "pdc_study_id":{
                  "type":"string",
                  "example":"PDC000206"
                },
                "study_submitter_id":{
                   "type":"string",
                   "example":"CPTAC GBM Discovery Study - CompRef Phosphoproteome"
                },
                "file_type":{
                   "type":"number",
                   "example":"Document"
                },
                "files_count":{
                   "type":"number",
                   "example":11
                },
                "data_category":{
                   "type":"string",
                   "example":"Other Metadata"
                }
             },
             "xml":{
                "name":"filesCountPerStudyDesc"
             }
          },
          "diseasesAvailable":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/diseasesAvailableDef"
                }
             },
             "xml":{
                "name":"diseasesAvailable"
             }
          },
          "diseasesAvailableDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "diseasesAvailable":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/diseasesAvailableDesc"
                   }
                }
             },
             "xml":{
                "name":"diseasesAvailableDef"
             }
          },
          "diseasesAvailableDesc":{
             "type":"object",
             "properties":{
                "disease_type":{
                   "type":"string",
                   "example":"Breast Invasive Carcinoma"
                },
                "project_submitter_id":{
                   "type":"string",
                   "example":"CPTAC-2"
                },
                "cases_count":{
                   "type":"string",
                   "example":"116"
                },
                "tissue_or_organ_of_origin":{
                   "type":"number",
                   "example":"Breast, NOS"
                }
             },
             "xml":{
                "name":"diseasesAvailableDesc"
             }
          },
          "geneSearch":{
             "type":"object",
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/geneSearchDef"
                }
             },
             "xml":{
                "name":"geneSearch"
             }
          },
          "geneSearchDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "geneSearch":{
                   "type":"string",
                   "$ref":"#/definitions/geneSearchDesc"
                }
             },
             "xml":{
                "name":"geneSearchDef"
             }
          },
          "geneSearchDesc":{
             "type":"object",
             "properties":{
                "genes":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/genesDesc"
                   }
                }
             },
             "xml":{
                "name":"geneSearchDesc"
             }
          },
          "genesDesc":{
             "type":"object",
             "properties":{
                "record_type":{
                   "type":"string",
                   "example":"gene"
                },
                "name":{
                   "type":"number",
                   "example":"A1BG"
                },
                "submitter_id_name":{
                  "type":"string",
                  "example":"null"
               },
               "description":{
                  "type":"number",
                  "example":"alpha-1-B glycoprotein"
               },
               "proteins":{
                  "type":"string",
                  "example":"null"
               }
             },
             "xml":{
                "name":"genesDesc"
             }
          },
          "geneSpectralCount":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/geneSpectralCountDef"
                }
             },
             "xml":{
                "name":"geneSpectralCount"
             }
          },
          "geneSpectralCountDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "geneSpectralCount":{
                   "type":"string",
                   "$ref":"#/definitions/aliquotSpectralCountDesc"
                }
             },
             "xml":{
                "name":"geneSpectralCountDef"
             }
          },
          "aliquotSpectralCount":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/aliquotSpectralCountDef"
                }
             },
             "xml":{
                "name":"aliquotSpectralCount"
             }
          },
          "aliquotSpectralCountDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "aliquotSpectralCount":{
                   "type":"string",
                   "$ref":"#/definitions/aliquotSpectralCountDesc"
                }
             },
             "xml":{
                "name":"aliquotSpectralCountDef"
             }
          },
          "aliquotSpectralCountDesc":{
             "type":"object",
             "properties":{
                "gene_id":{
                   "type":"string",
                   "example":"f6ba4bc5-b814-11e8-907f-0a2705229b82"
                },
                "gene_name":{
                   "type":"string",
                   "example":"A1BG"
                },
                "NCBI_gene_id":{
                   "type":"number",
                   "example":"1"
                },
                "authority":{
                   "type":"string",
                   "example":"HGNC:5"
                },
                "description":{
                   "type":"string",
                   "example":"alpha-1-B glycoprotein"
                },
                "organism":{
                   "type":"string",
                   "example":"Homo sapiens"
                },
                "chromosome":{
                   "type":"string",
                   "example":"19"
                },
                "locus":{
                   "type":"string",
                   "example":"19q13.43"
                },
                "proteins":{
                   "type":"string",
                   "example":"M0R009;NP_570602.2;P04217;P04217-2"
                },
                "assays":{
                   "type":"string",
                   "example":"non-CPTAC-1064"
                },
                "spectral_counts":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/spectralCountsDesc"
                   }
                }
             },
             "xml":{
                "name":"aliquotSpectralCountDesc"
             }
          },
          "spectralCountsDesc":{
             "type":"object",
             "properties":{
                "project_submitter_id":{
                   "type":"string",
                   "example":"CPTAC-TCGA"
                },
                "plex":{
                   "type":"string",
                   "example":"06TCGA_A2-A0D0-01A_BH-A0HK-01A_C8-A12T-01A_Phosphoproteome_BI_20130329"
                },
                "spectral_count":{
                   "type":"number",
                   "example":"11"
                },
                "distinct_peptide":{
                   "type":"number",
                   "example":"5"
                },
                "unshared_peptide":{
                   "type":"number",
                   "example":"5"
                },
                "study_submitter_id":{
                   "type":"number",
                   "example":"S015-2"
                },
                "pdc_study_id":{
                  "type":"number",
                  "example":"PDC000174"
               }
             },
             "xml":{
                "name":"spectralCountsDesc"
             }
          },
          "studySearch":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/studySearchDef"
                }
             },
             "xml":{
                "name":"studySearch"
             }
          },
          "studySearchDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "studySearch":{
                   "type":"string",
                   "$ref":"#/definitions/studySearchDesc"
                }
             },
             "xml":{
                "name":"studySearchDef"
             }
          },
          "studySearchDesc":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "studies":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/SearchRecord"
                   }
                }
             },
             "xml":{
                "name":"studySearchDesc"
             }
          },
          "studySearchByPDCStudyId":{
            "type":"object",
            "required":[
   
            ],
            "properties":{
               "data":{
                  "type":"string",
                  "$ref":"#/definitions/studySearchByPDCStudyIdDef"
               }
            },
            "xml":{
               "name":"studySearch"
            }
         },
         "studySearchByPDCStudyIdDef":{
            "type":"object",
            "required":[
   
            ],
            "properties":{
               "studySearchByPDCStudyId":{
                  "type":"string",
                  "$ref":"#/definitions/studySearchByPDCStudyIdDesc"
               }
            },
            "xml":{
               "name":"studySearchByPDCStudyIdDef"
            }
         },
         "studySearchByPDCStudyIdDesc":{
            "type":"object",
            "required":[
   
            ],
            "properties":{
               "studies":{
                  "type":"array",
                  "items":{
                     "$ref":"#/definitions/studySearchByPDCStudyIdDetails"
                  }
               }
            },
            "xml":{
               "name":"studySearchByPDCStudyIdDesc"
            }
         },
         "pdcEntityReference":{
            "type":"object",
            "required":[
   
            ],
            "properties":{
               "data":{
                  "type":"string",
                  "$ref":"#/definitions/pdcEntityReferenceDef"
               }
            },
            "xml":{
               "name":"pdcEntityReference"
            }
         },
         "pdcEntityReferenceDef":{
            "type":"object",
            "required":[  
            ],
            "properties":{
               "pdcEntityReference":{
                  "type":"array",
                  "items":{
                     "$ref":"#/definitions/pdcEntityReferenceDetails"
                  }
               }
            },
            "xml":{
               "name":"pdcEntityReferenceDef"
            }
         },
         "studySearchByExternalId":{
            "type":"object",
            "required":[  
            ],
            "properties":{
               "data":{
                  "type":"string",
                  "$ref":"#/definitions/studySearchByExternalIdDef"
               }
            },
            "xml":{
               "name":"studySearchByExternalId"
            }
         },
         "studySearchByExternalIdDef":{
            "type":"object",
            "required":[
            ],
            "properties":{
               "studySearchByExternalId":{
                  "type":"string",
                  "$ref":"#/definitions/studySearchByPDCStudyIdDesc"
               }
            },
            "xml":{
               "name":"studySearchByPDCStudyIdDef"
            }
         },
          "clinicalPerStudy":{
             "type":"object",
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/clinicalPerStudyDef"
                }
             },
             "xml":{
                "name":"clinicalPerStudy"
             }
          },
          "clinicalPerStudyDef":{
             "type":"object",
             "properties":{
                "clinicalPerStudy":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/clinicalPerStudyDesc"
                   }
                }
             },
             "xml":{
                "name":"clinicalPerStudyDef"
             }
          },
          "clinicalPerStudyDesc":{
             "type":"object",
             "properties":{
                "case_id":{
                   "type":"string",
                   "example":"f98c2cb5-63d8-11e8-bcf1-0a2705229b82"
                },
                "case_submitter_id":{
                   "type":"string",
                   "example":"TCGA-C8-A131"
                },
                "status":{
                   "type":"string",
                   "example":"Qualified"
                },
                "ethnicity":{
                   "type":"string",
                   "example":"not hispanic or latino"
                },
                "gender":{
                   "type":"string",
                   "example":"Female"
                },
                "race":{
                   "type":"string",
                   "example":"asian"
                },
                "morphology":{
                   "type":"string",
                   "example":"8500/3"
                },
                "primary_diagnosis":{
                   "type":"string",
                   "example":"Infiltrating duct carcinoma, NOS"
                },
                "site_of_resection_or_biopsy":{
                   "type":"string",
                   "example":"Breast, NOS"
                },
                "tissue_or_organ_of_origin":{
                   "type":"string",
                   "example":"Breast, NOS"
                },
                "tumor_grade":{
                   "type":"string",
                   "example":"Not Reported"
                },
                "tumor_stage":{
                   "type":"string",
                   "example":"Stage IIIA"
                },
                "icd_10_code":{
                  "type":"string",
                  "example":"null"
               },
               "synchronous_malignancy":{
                  "type":"string",
                  "example":"null"
               },
                "externalReferences": {
                  "type":"array",
                  "items":{
                     "$ref":"#/definitions/ExternalReferencesClinical"
                  }
                },
             },
             "xml":{
                "name":"clinicalPerStudyDesc"
             }
          },
          "ExternalReferencesClinical":{
            "type":"object",
            "properties":{
               "external_reference_id":{
                  "type":"string",
                  "example":"c49e3b18-fd88-48f4-8b01-300692ceb367"
               },
               "reference_resource_shortname":{
                  "type":"string",
                  "example":"GDC"
               },
               "reference_resource_name":{
                  "type":"string",
                  "example":"Genomic Data Commons"
               },
               "reference_entity_location":{
                  "type":"string",
                  "example":"https://portal.gdc.cancer.gov/cases/c49e3b18-fd88-48f4-8b01-300692ceb367"
               }
            },
            "xml":{
               "name":"ExternalReferencesClinical"
            }
         },

          "studyDetailsPerStudyID":{
             "type":"object",
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/studyDetailsPerStudyIDDef"
                }
             },
             "xml":{
                "name":"studyDetailsPerStudyID"
             }
          },
          "studyDetailsPerStudyIDDef":{
             "type":"object",
             "properties":{
                "study":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/studyDetailsPerStudyIDDesc"
                   }
                }
             },
             "xml":{
                "name":"studyDetailsPerStudyIDDef"
             }
          },
          "studyDetailsPerStudyIDDesc":{
             "type":"object",
             "properties":{
                "study_id":{
                   "type":"string",
                   "example":"dbe94609-1fb3-11e9-b7f8-0a80fada099c"
                },
                "pdc_study_id":{
                  "type":"string",
                  "example":"PDC000127"
                },
                "study_submitter_id":{
                   "type":"string",
                   "example":"S044-1"
                },
                "program_id":{
                   "type":"string",
                   "example":"10251935-5540-11e8-b664-00a098d917f8"
                },
                "project_id":{
                   "type":"string",
                   "example":"267d6671-0e78-11e9-a064-0a9c39d33490"
                },
                "study_name":{
                   "type":"string",
                   "example":"CPTAC CCRCC Discovery Study - Proteome"
                },
                "program_name":{
                   "type":"string",
                   "example":"Clinical Proteomic Tumor Analysis Consortium"
                },
                "project_name":{
                   "type":"string",
                   "example":"CPTAC3 Discovery"
                },
                "disease_type":{
                   "type":"string",
                   "example":"Clear Cell Renal Cell Carcinoma;Other"
                },
               "primary_site":{
                   "type":"string",
                   "example":"Kidney;N/A"
                },
                "analytical_fraction":{
                   "type":"string",
                   "example":"Proteome"
                },
                "experiment_type":{
                   "type":"string",
                   "example":"TMT10"
                },
                "embargo_date": {
                    "type": "string",
                    "example": "2019-06-01"
                },
                "cases_count":{
                   "type":"number",
                   "example":126
                },
                "aliquots_count":{
                   "type":"number",
                   "example":218
                },
                "filesCount":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/fileDetailsPerStudyIDDesc"
                   }
                }
             },
             "xml":{
                "name":"studyDetailsPerStudyIDDesc"
             }
          },
         "fileDetailsPerStudyIDDesc":{
              "type":"object",
              "properties":{
                 "data_category":{
                    "type":"string",
                    "example":"Other Metadata"
                 },
                 "file_type":{
                    "type":"number",
                    "example":"Document"
                 },
                 "files_count":{
                    "type":"number",
                    "example": 7
                 }
              },
              "xml":{
                 "name":"filesCountPerStudyDesc"
              }
           },
          "biospecimenPerStudy":{
             "type":"object",
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/biospecimenPerStudyDef"
                }
             },
             "xml":{
                "name":"biospecimenPerStudy"
             }
          },
          "biospecimenPerStudyDef":{
             "type":"object",
             "properties":{
                "biospecimenPerStudy":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/biospecimenPerStudyDesc"
                   }
                }
             },
             "xml":{
                "name":"biospecimenPerStudyDef"
             }
          },
          "biospecimenPerStudyDesc":{
             "type":"object",
             "properties":{
                "aliquot_id":{
                   "type":"string",
                   "example":"bd34fbb3-2053-11e9-b7f8-0a80fada099c"
                },
                "sample_id":{
                   "type":"string",
                   "example":"b72322c6-204c-11e9-b7f8-0a80fada099c"
                },
                "case_id":{
                   "type":"string",
                   "example":"dae8930e-1fb8-11e9-b7f8-0a80fada099c"
                },
                "aliquot_submitter_id":{
                   "type":"string",
                   "example":"CPT0026410003"
                },
                "sample_submitter_id":{
                   "type":"string",
                   "example":"C3L-00791-01"
                },
                "case_submitter_id":{
                   "type":"string",
                   "example":"C3L-00791"
                },
                "aliquot_status":{
                   "type":"string",
                   "example":"Qualified"
                },
                "case_status":{
                   "type":"string",
                   "example":"Qualified"
                },
                "sample_status":{
                   "type":"string",
                   "example":"Qualified"
                },
                "project_name":{
                   "type":"string",
                   "example":"CPTAC3 Discovery"
                },
                "sample_type":{
                   "type":"string",
                   "example":"Primary Tumor"
                },
                "disease_type":{
                   "type":"string",
                   "example":"Clear Cell Renal Cell Carcinoma"
                },
                "primary_site":{
                   "type":"string",
                   "example":"Kidney"
                },
                "pool":{
                  "type":"string",
                  "example":"No"
               },
               "taxon":{
                  "type":"string",
                  "example":"Homo sapiens"
               },
               "externalReferences": {
                  "type":"array",
                  "items":{
                     "$ref":"#/definitions/ExternalReferencesBipspecimen"
                  }
                },
             },
             "xml":{
                "name":"biospecimenPerStudyDesc"
             }
          },
          "ExternalReferencesBipspecimen":{
            "type":"object",
            "properties":{
               "external_reference_id":{
                  "type":"string",
                  "example":"ad9a7ce1-9f9e-4092-8eae-493297289022"
               },
               "reference_resource_shortname":{
                  "type":"string",
                  "example":"GDC"
               },
               "reference_resource_name":{
                  "type":"string",
                  "example":"Genomic Data Commons"
               },
               "reference_entity_location":{
                  "type":"string",
                  "example":"https://portal.gdc.cancer.gov/cases/ad9a7ce1-9f9e-4092-8eae-493297289022"
               }
            },
            "xml":{
               "name":"ExternalReferencesBipspecimen"
            }
         },
          "protocolPerStudy":{
             "type":"object",
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/protocolPerStudyDef"
                }
             },
             "xml":{
                "name":"protocolPerStudy"
             }
          },
          "protocolPerStudyDef":{
             "type":"object",
             "properties":{
                "protocolPerStudy":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/protocolPerStudyDesc"
                   }
                }
             },
             "xml":{
                "name":"protocolPerStudyDef"
             }
          },
          "protocolPerStudyDesc":{
             "type":"object",
             "properties":{
                "protocol_id":{
                   "type":"string",
                   "example":"1c06aff5-3b26-11e9-9a07-0a80fada099c"
                },
                "protocol_submitter_id":{
                   "type":"string",
                   "example":"P-S015-2"
                },
                "study_id":{
                   "type":"string",
                   "example":"b93bb1e9-57b8-11e8-b07a-00a098d917f8"
                },
                "pdc_study_id":{
                  "type":"string",
                  "example":"PDC000174"
               },
                "study_submitter_id":{
                   "type":"string",
                   "example":"TCGA BRCA Phosphoproteome S015-2"
                },
                "program_id":{
                   "type":"string",
                   "example":"10251935-5540-11e8-b664-00a098d917f8"
                },
                "program_submitter_id":{
                   "type":"string",
                   "example":"CPTAC"
                },
                "protocol_name":{
                   "type":"string",
                   "example":"TCGA_Breast_Cancer_Phosphoproteome"
                },
                "protocol_date":{
                   "type":"string",
                   "example":"2013-02-02"
                },
                "document_name":{
                   "type":"string",
                   "example":" "
                },
                "quantitation_strategy":{
                   "type":"string",
                   "example":"Isobaric label quantitation"
                },
                "experiment_type":{
                   "type":"string",
                   "example":"iTRAQ4"
                },
                "label_free_quantitation":{
                   "type":"string",
                   "example":" "
                },
                "labeled_quantitation":{
                   "type":"string",
                   "example":"iTRAQ quantitation"
                },
                "isobaric_labeling_reagent":{
                   "type":"string",
                   "example":"iTRAQ"
                },
                "reporter_ion_ms_level":{
                   "type":"string",
                   "example":"2"
                },
                "starting_amount":{
                   "type":"string",
                   "example":"4.00"
                },
                "starting_amount_uom":{
                   "type":"string",
                   "example":"mg"
                },
                "digestion_reagent":{
                   "type":"string",
                   "example":"Lys-C/Trypsin"
                },
                "alkylation_reagent":{
                   "type":"string",
                   "example":"Iodoacetamide"
                },
                "enrichment_strategy":{
                   "type":"string",
                   "example":"Phosphoproteome"
                },
                "enrichment":{
                   "type":"string",
                   "example":"Phosphopeptide enrichment with immobilized metal affinity chromatography (NiNTA beads stripped with EDTA and loaded with FeCl3; Qiagen)"
                },
                "chromatography_dimensions_count":{
                   "type":"string",
                   "example":"2"
                },
                "one_d_chromatography_type":{
                   "type":"string",
                   "example":"bRPLC (pH 10)"
                },
                "two_d_chromatography_type":{
                   "type":"string",
                   "example":"RPLC"
                },
                "fractions_analyzed_count":{
                   "type":"string",
                   "example":"13"
                },
                "column_type":{
                   "type":"string",
                   "example":"New Objective; PicoFrit SELF/P"
                },
                "amount_on_column":{
                   "type":"string",
                   "example":" "
                },
                "amount_on_column_uom":{
                   "type":"string",
                   "example":" "
                },
                "column_length":{
                   "type":"string",
                   "example":"20"
                },
                "column_length_uom":{
                   "type":"string",
                   "example":"cm"
                },
                "column_inner_diameter":{
                   "type":"string",
                   "example":"75"
                },
                "column_inner_diameter_uom":{
                   "type":"string",
                   "example":"µm"
                },
                "particle_size":{
                   "type":"string",
                   "example":"1.9"
                },
                "particle_size_uom":{
                   "type":"string",
                   "example":"µm"
                },
                "particle_type":{
                   "type":"string",
                   "example":"Dr Maisch GmbH; ReproSil-Pur 120 C18-AQ; 1.9 um"
                },
                "gradient_length":{
                   "type":"string",
                   "example":"110"
                },
                "gradient_length_uom":{
                   "type":"string",
                   "example":"min"
                },
                "instrument_make":{
                   "type":"string",
                   "example":"Thermo Scientific"
                },
                "instrument_model":{
                   "type":"string",
                   "example":"Q Exactive"
                },
                "dissociation_type":{
                   "type":"string",
                   "example":"HCD"
                },
                "ms1_resolution":{
                   "type":"string",
                   "example":"70000"
                },
                "ms2_resolution":{
                   "type":"string",
                   "example":"17500"
                },
                "dda_topn":{
                   "type":"string",
                   "example":"Top12"
                },
                "normalized_collision_energy":{
                   "type":"string",
                   "example":"28%"
                },
                "acquistion_type":{
                   "type":"string",
                   "example":"DDA"
                },
                "dia_multiplexing":{
                   "type":"string",
                   "example":"N/A"
                },
                "dia_ims":{
                   "type":"string",
                   "example":"N/A"
                }
             },
             "xml":{
                "name":"biospecimenPerStudyDesc"
             }
          },
          "studyExperimentalDesign":{
             "type":"object",
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/studyExperimentalDesignDef"
                }
             },
             "xml":{
                "name":"studyExperimentalDesign"
             }
          },
          "studyExperimentalDesignDef":{
             "type":"object",
             "properties":{
                "studyExperimentalDesign":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/studyExperimentalDesignDesc"
                   }
                }
             },
             "xml":{
                "name":"studyExperimentalDesignDef"
             }
          },
          "studyExperimentalDesignDesc":{
             "type":"object",
             "properties":{
               "pdc_study_id":{
                  "type":"string",
                  "example":"PDC000127"
               },
                "study_run_metadata_id":{
                   "type":"string",
                   "example":"de9ebff4-2074-11e9-b7f8-0a80fada099c"
                },
                "study_run_metadata_submitter_id":{
                   "type":"string",
                   "example":"S044-1-1"
                },
                "study_id":{
                   "type":"string",
                   "example":"dbe94609-1fb3-11e9-b7f8-0a80fada099c"
                },
                "study_submitter_id":{
                   "type":"string",
                   "example":"S044-1"
                },
                "analyte":{
                   "type":"string",
                   "example":"Proteome"
                },
                "acquisition_type":{
                   "type":"string",
                   "example":"DDA"
                },
                "experiment_type":{
                   "type":"string",
                   "example":"TMT10"
                },
                "plex_dataset_name":{
                   "type":"string",
                   "example":"01CPTAC_CCRCC_Proteome_JHU_20171007"
                },
                "experiment_number":{
                   "type":"string",
                   "example":"1"
                },
                "number_of_fractions":{
                   "type":"string",
                   "example":"25"
                },
                "label_free":{
                   "type":"string",
                   "example":"null"
                },
                "itraq_113":{
                  "type":"string",
                  "example":"null"
                },
                "itraq_114":{
                   "type":"string",
                   "example":"null"
                },
                "itraq_115":{
                   "type":"string",
                   "example":"null"
                },
                "itraq_116":{
                   "type":"string",
                   "example":"null"
                },
                "itraq_117":{
                   "type":"string",
                   "example":"null"
                },
                "itraq_118":{
                  "type":"string",
                  "example":"null"
               },
               "itraq_119":{
                  "type":"string",
                  "example":"null"
               },
               "itraq_121":{
                  "type":"string",
                  "example":"null"
               },
                "tmt_126":{
                   "type":"string",
                   "example":"CPT0079430001"
                },
                "tmt_127n":{
                   "type":"string",
                   "example":"CPT0023360001"
                },
                "tmt_127c":{
                   "type":"string",
                   "example":"CPT0023350003"
                },
                "tmt_128n":{
                   "type":"string",
                   "example":"CPT0079410003"
                },
                "tmt_128c":{
                   "type":"string",
                   "example":"CPT0087040003"
                },
                "tmt_129n":{
                   "type":"string",
                   "example":"CPT0077310003"
                },
                "tmt_129c":{
                   "type":"string",
                   "example":"CPT0077320001"
                },
                "tmt_130n":{
                   "type":"string",
                   "example":"CPT0087050003"
                },
                "tmt_130c":{
                   "type":"string",
                   "example":"CPT0002270011"
                },
                "tmt_131":{
                   "type":"string",
                   "example":"Pooled Sample"
                },
                "tmt_131c":{
                  "type":"string",
                  "example":"null"
               }            
             },
             "xml":{
                "name":"studyExperimentalDesignDesc"
             }
          },
          "pdcDataStats":{
             "type":"object",
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/pdcDataStatsDef"
                }
             },
             "xml":{
                "name":"pdcDataStats"
             }
          },
          "pdcDataStatsDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "pdcDataStats":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/pdcDataStatsDesc"
                   }
                }
             },
             "xml":{
                "name":"pdcDataStatsDef"
             }
          },
          "Protein":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/ProteinDef"
                }
             },
             "xml":{
                "name":"Protein"
             }
          },
          "ProteinDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "protein":{
                   "type":"string",
                   "$ref":"#/definitions/Gene"
                }
             },
             "xml":{
                "name":"ProteinDef"
             }
          },
          "quantitiveDataCPTAC2":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/quantitiveDataCPTAC2Def"
                }
             },
             "xml":{
                "name":"quantitiveDataCPTAC2"
             }
          },
          "quantitiveDataCPTAC2Def":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "quantitiveDataCPTAC2":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/quantitiveDataCPTAC2Desc"
                   }
                }
             },
             "xml":{
                "name":"quantitiveDataCPTAC2Def"
             }
          },
          "experimentalMetadata":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/experimentalMetadataDef"
                }
             },
             "xml":{
                "name":"experimentalMetadata"
             }
          },
          "experimentalMetadataDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "experimentalMetadata":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/experimentalMetadataDesc"
                   }
                }
             },
             "xml":{
                "name":"experimentalMetadataDef"
             }
          },
          "experimentalMetadataDesc":{
             "type":"object",
             "properties":{
                "experiment_type":{
                   "type":"string",
                   "example":"iTRAQ4"
                },
                "analytical_fraction":{
                   "type":"string",
                   "example":"Phosphoproteome"
                },
                "instrument":{
                   "type":"string",
                   "example":"Q Exactive"
                },
                "study_run_metadata":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/Study_run_metadata"
                   }
                }
             },
             "xml":{
                "name":"experimentalMetadataDesc"
             }
          },
          "clinicalMetadata":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/clinicalMetadataDef"
                }
             },
             "xml":{
                "name":"clinicalMetadata"
             }
          },
          "clinicalMetadataDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "clinicalMetadata":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/clinicalMetadataDesc"
                   }
                }
             },
             "xml":{
                "name":"clinicalMetadataDef"
             }
          },
          "clinicalMetadataDesc":{
             "type":"object",
             "properties":{
                "aliquot_submitter_id":{
                   "type":"string",
                   "example":"263d3f-I"
                },
                "morphology":{
                   "type":"string",
                   "example":"8500/3"
                },
                "primary_diagnosis":{
                   "type":"string",
                   "example":"Infiltrating duct carcinoma, NOS"
                },
                "tumor_grade":{
                   "type":"string",
                   "example":"Not Reported"
                },
                "tumor_stage":{
                   "type":"string",
                   "example":"stage iiia"
                }
             },
             "xml":{
                "name":"clinicalMetadataDesc"
             }
          },
          "tissueSitesAvailable":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/tissueSitesAvailableDef"
                }
             },
             "xml":{
                "name":"tissueSitesAvailable"
             }
          },
          "tissueSitesAvailableDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "tissueSitesAvailable":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/tissueSitesAvailableDesc"
                   }
                }
             },
             "xml":{
                "name":"tissueSitesAvailableDef"
             }
          },
          "tissueSitesAvailableDesc":{
             "type":"object",
             "properties":{
                "tissue_or_organ_of_origin":{
                   "type":"string",
                   "example":"Breast"
                },
                "project_submitter_id":{
                   "type":"string",
                   "example":"CPTAC-2"
                },
                "cases_count":{
                   "type":"number",
                   "example":119
                }
             },
             "xml":{
                "name":"tissueSitesAvailableDesc"
             }
          },
          "workflowMetadata":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/workflowMetadataDef"
                }
             },
             "xml":{
                "name":"workflowMetadata"
             }
          },
          "workflowMetadataDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "workflowMetadata":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/workflowMetadataDesc"
                   }
                }
             },
             "xml":{
                "name":"workflowMetadataDef"
             }
          },
          "projectsPerInstrument":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/projectsPerInstrumentDef"
                }
             },
             "xml":{
                "name":"projectsPerInstrument"
             }
          },
          "projectsPerInstrumentDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "projectsPerInstrument":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/projectsPerInstrumentDesc"
                   }
                }
             },
             "xml":{
                "name":"projectsPerInstrumentDef"
             }
          },
          "projectsPerInstrumentDesc":{
             "type":"object",
             "properties":{
                "project_submitter_id":{
                   "type":"string",
                   "example":"CPTAC-TCGA"
                },
                "instrument_model": {
                  "type":"string",
                  "example":"Q Exactive HF"                  
                }
             },
             "xml":{
                "name":"projectsPerInstrumentDesc"
             }
          },
          "projectsPerExperimentType":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/projectsPerExperimentTypeDef"
                }
             },
             "xml":{
                "name":"projectsPerExperimentType"
             }
          },
          "projectsPerExperimentTypeDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "projectsPerExperimentType":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/projectsPerExperimentTypeDesc"
                   }
                }
             },
             "xml":{
                "name":"projectsPerExperimentTypeDef"
             }
          },
          "projectsPerExperimentTypeDesc":{
             "type":"object",
             "properties":{
                "experiment_type":{
                   "type":"string",
                   "example":"THT10"
                },
                "program_submitter_id":{
                   "type":"string",
                   "example":"PJ-CPTAC3"
                },
                "name":{
                   "type":"string",
                   "example":"CPTAC3 Discovery"
                }
             },
             "xml":{
                "name":"projectsPerExperimentTypeDesc"
             }
          },
          "programsProjectsStudies":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/programsProjectsStudiesDef"
                }
             },
             "xml":{
                "name":"programsProjectsStudies"
             }
          },
          "programsProjectsStudiesDef":{
             "type":"object",
             "properties":{
                "programsProjectsStudies":{
                   "type":"array",
                   "items": {
                     "$ref":"#/definitions/programsProjectsStudiesDesc"
                   }
                }
             },
             "xml":{
                "name":"programsProjectsStudiesDef"
             }
          },
          "programsProjectsStudiesDesc":{
             "type":"object",
             "properties":{
                "program_id":{
                   "type":"string",
                   "example":"10251935-5540-11e8-b664-00a098d917f8"
                },
                "program_submitter_id":{
                   "type":"string",
                   "example":"Clinical Proteomic Tumor Analysis Consortium"
                },
                "name":{
                   "type":"string",
                   "example":"Clinical Proteomic Tumor Analysis Consortium"
                },
                "projects":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/programsProjectsStudiesDefforProj"
                   }
                }
             },
             "xml":{
                "name":"programsProjectsStudiesDesc"
             }
          },
          "programsProjectsStudiesDefforProj":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "project_id":{
                   "type":"string",
                   "example":"PJ-CPTAC3"
                },
                "project_submitter_id":{
                   "type":"string",
                   "example":"PJ-CPTAC3"
                },
                "name":{
                   "type":"string",
                   "example":"PJ-CPTAC3"
                },
                "studies":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/programsProjectsStudiesDefforStudies"
                   }
                }
             },
             "xml":{
                "name":"programsProjectsStudiesDefforProj"
             }
          },
          "programsProjectsStudiesDefforStudies":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
               "pdc_study_id":{
                  "type":"string",
                  "example":"PDC000125"
               },
                "study_id":{
                   "type":"string",
                   "example":"c935c587-0cd1-11e9-a064-0a9c39d33490"
                },
                "submitter_id_name":{
                   "type":"string",
                   "example":"CPTAC UCEC Discovery Study - Proteome"
                },
                "study_submitter_id":{
                   "type":"string",
                   "example":"S043-1"
                },
                "analytical_fraction":{
                   "type":"string",
                   "example":"Proteome"
                },
                "experiment_type":{
                   "type":"string",
                   "example":"TMT10"
                },
                "acquisition_type":{
                   "type":"string",
                   "example":"DDA"
                }
             },
             "xml":{
                "name":"programsProjectsStudiesDefforStudies"
             }
          },
          "findProgram":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/findProgramObj"
                }
             },
             "xml":{
                "name":"findProgram"
             }
          },
          "findProgramObj":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "program":{
                   "type":"string",
                   "$ref":"#/definitions/findProgramDef"
                }
             },
             "xml":{
                "name":"findProgramObj"
             }
          },
          "findProgramDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "program_submitter_id":{
                   "type":"string",
                   "example":"CPTAC"
                },
                "projects":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/allProgramsDesc"
                   }
                }
             },
             "xml":{
                "name":"findProgramDef"
             }
          },
          "findProgramDesc":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "project_submitter_id":{
                   "type":"string",
                   "example":"PJ-CPTAC3"
                },
                "name":{
                   "type":"string",
                   "example":"CPTAC3 Discovery"
                }
             },
             "xml":{
                "name":"findProgramDesc"
             }
          },
          "allPrograms":{
             "type":"object",
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/allProgramsDef"
                }
             },
             "xml":{
                "name":"allPrograms"
             }
          },
          "allProgramsDef":{
             "type":"object",
             "properties":{
                "allPrograms":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/allProgramsDesc"
                   }
                }
             },
             "xml":{
                "name":"allProgramsDef"
             }
          },
          "allProgramsDesc":{
             "type":"object",
             "properties":{
                "program_id":{
                   "type":"string",
                   "example":"10251935-5540-11e8-b664-00a098d917f8"
                },
                "program_submitter_id":{
                   "type":"string",
                   "example":"Clinical Proteomic Tumor Analysis Consortium"
                },
                "name":{
                   "type":"string",
                   "example":"Clinical Proteomic Tumor Analysis Consortium"
                },
                "projects":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/allProgramsProject"
                   }
                }
             },
             "xml":{
                "name":"allCasesDesc"
             }
          },
          "allProgramsProject":{
            "type":"object",
            "required":[
               "project_id"
            ],
            "properties":{
               "project_id":{
                  "type":"string",
                  "description":"PK",
                  "example": "267d6671-0e78-11e9-a064-0a9c39d33490"
               },
               "project_submitter_id":{
                  "type":"string",
                  "example":"CPTAC3-Discovery"
               },               
               "name":{
                  "type":"string",
                  "example":"CPTAC3-Discovery"
               },
               "studies":{
                  "type":"array",
                  "items":{
                     "$ref":"#/definitions/allProgramsStudy"
                  }
               }
            },
            "xml":{
               "name":"allProgramsProject"
            }
         },
         "allProgramsStudy":{
            "type":"object",
            "required":[
               "study_id",
               "project_id"
            ],
            "properties":{
               "pdc_study_id":{
                  "type":"string",
                  "example": "PDC000206"
               },
               "study_id":{
                  "type":"string",
                  "description":"PK",
                  "example": "0ea91a54-1798-11ea-9bfa-0a42f3c845fe"
               },
               "study_submitter_id": {
                  "type":"string",
                  "example": "CPTAC GBM Discovery Study - CompRef Phosphoproteome"                 
               },
               "submitter_id_name": {
                  "type":"string",
                  "example": "CPTAC GBM Discovery Study - CompRef Phosphoproteome"                 
               },
               "analytical_fraction":{
                  "type":"string",
                  "example":"Phosphoproteome"
               },
               "experiment_type":{
                  "type":"string",
                  "example":"TMT11"
               },
               "acquisition_type": {
                  "type":"string",
                  "example": "DDA"                 
               },
            },
            "xml":{
               "name":"allProgramsStudy"
            }
         },
          "projectsDesc":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "project_submitter_id":{
                   "type":"string",
                   "example":"PJ-CPTAC3"
                }
             },
             "xml":{
                "name":"projectsDesc"
             }
          },
          "findCase":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/findCaseDef"
                }
             },
             "xml":{
                "name":"findCase"
             }
          },
          "findCaseDef":{
             "type":"object",
             "required":[
    
             ],
             "properties":{
                "case":{
                   "type":"string",
                   "$ref":"#/definitions/caseFullDesc"
                }
             },
             "xml":{
                "name":"findCaseDef"
             }
          },
          "allCases":{
             "type":"object",
             "properties":{
                "data":{
                   "type":"string",
                   "$ref":"#/definitions/allCasesDef"
                }
             },
             "xml":{
                "name":"allCases"
             }
          },
          "allCasesDef":{
             "type":"object",
             "properties":{
                "allCases":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/allCasesDescription"
                   }
                }
             },
             "xml":{
                "name":"allCasesDef"
             }
          },
          "allCasesDescription":{
             "type":"object",
             "properties":{
                "case_id":{
                   "type":"string",
                   "example":"327f8188-0a5d-11eb-bc0e-0aad30af8a83"
                },
                "case_submitter_id":{
                   "type":"string",
                   "example":"05BR016"
                },
                "project_submitter_id":{
                   "type":"string",
                   "example":"CPTAC-2"
                },
                "disease_type":{
                   "type":"string",
                   "example":"Breast Invasive Carcinoma"
                },
                "primary_site":{
                   "type":"string",
                   "example":"Breast"
                },
                "externalReferences": {
                  "type":"array",
                  "items":{
                     "$ref":"#/definitions/ExternalReferencesAllCases"
                  }
                },
             },
             "xml":{
                "name":"allCasesDescription"
             }
          },
          "ExternalReferencesAllCases":{
            "type":"object",
            "properties":{
               "external_reference_id":{
                  "type":"string",
                  "example":"152f9e71-a437-4a4b-8c58-3ffcda41904b"
               },
               "reference_resource_shortname":{
                  "type":"string",
                  "example":"GDC"
               },
               "reference_resource_name":{
                  "type":"string",
                  "example":"Genomic Data Commons"
               },
               "reference_entity_location":{
                  "type":"string",
                  "example":"https://portal.gdc.cancer.gov/cases/152f9e71-a437-4a4b-8c58-3ffcda41904b"
               }
            },
            "xml":{
               "name":"ExternalReferencesAllCases"
            }
         },
          "allCasesDesc":{
             "type":"object",
             "properties":{
                "case_submitter_id":{
                   "type":"string",
                   "example":"05BR016"
                },
                "project_submitter_id":{
                   "type":"string",
                   "example":"CPTAC-2"
                },
                "disease_type":{
                   "type":"string",
                   "example":"Breast Invasive Carcinoma"
                }
             },
             "xml":{
                "name":"allCasesDesc"
             }
          },
          "caseFullDesc":{
             "type":"object",
             "properties":{
                "case_id":{
                   "type":"string",
                   "example":"a023e964-118a-11e9-afb9-0a9c39d33490"
                },
                "case_submitter_id":{
                   "type":"string",
                   "example":"C3N-00386"
                },
                "days_to_lost_to_followup":{
                   "type":"integer",
                   "example":0
                },
                "disease_type":{
                   "type":"string",
                   "example":"Uterine Corpus Endometrial Carcinoma"
                },
                "index_date":{
                   "type":"string",
                   "example":"Diagnosis"
                },
                "lost_to_followup":{
                   "type":"string",
                   "example":""
                },
                "primary_site":{
                   "type":"string",
                   "example":"Uterus, NOS"
                },
                "externalReferences": {
                  "type":"array",
                  "items":{
                     "$ref":"#/definitions/ExternalReferences"
                  }
                },
                "demographics":{
                   "type":"array",
                   "items":{
                      "$ref":"#/definitions/Demographic"
                   }
                },
                "samples":{
                  "type":"array",
                  "items":{
                     "$ref":"#/definitions/Sample"
                  }
                },
                "diagnoses":{
                  "type":"array",
                   "items":{      
                    "$ref":"#/definitions/Diagnosis"
                   }
               }
             },
             "xml":{
                "name":"caseFullDesc"
             }
          },
          "ExternalReferences":{
            "type":"object",
            "properties":{
               "external_reference_id":{
                  "type":"string",
                  "example":"c94de5fb-4fcf-46f0-a4f1-41a88f557770"
               },
               "reference_resource_shortname":{
                  "type":"string",
                  "example":"GDC"
               },
               "reference_resource_name":{
                  "type":"string",
                  "example":"Genomic Data Commons"
               },
               "reference_entity_location":{
                  "type":"string",
                  "example":"https://portal.gdc.cancer.gov/cases/c94de5fb-4fcf-46f0-a4f1-41a88f557770"
               }
            },
            "xml":{
               "name":"ExternalReferences"
            }
         },
          "allCasesDef2":{
             "type":"object",
             "properties":{
                "case_submitter_id":{
                   "type":"string",
                   "example":"TCGA-61-1911"
                },
                "project_submitter_id":{
                   "type":"string",
                   "example":"CPTAC-TCGA"
                },
                "disease_type":{
                   "type":"string",
                   "example":"Ovarian Serous Cystadenocarcinoma"
                }
             },
             "xml":{
                "name":"allCasesDef2"
             }
          },
     "externalDocs": {
     "description": "Find out more about PDC",
     "url": "http://pdc.com"
   }
 }
 }