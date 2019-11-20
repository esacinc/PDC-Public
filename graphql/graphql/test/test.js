//@@@PDC-137 unit test
//@@@PDC-712 update unit test
import { assert } from 'chai';
//import resolvers from '../data/resolvers';
import { resolvers as queryResolvers } from '../pdc/resolvers/queries';
import { resolvers as subResolvers } from '../pdc/resolvers/subqueries';

//@@@PDC-140 authorization
const projects = ["CPTAC-2", "CPTAC-TCGA"];
const context = {value: projects};

//unit test the resolver of allPrograms
describe('Test allPrograms method', function () {
  it('gets all programs', function (done) {
    const args = '';
    const obj = '_';
	//console.log('In test moduleb 1');

    setTimeout(function () {	
    queryResolvers.Query.allPrograms(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	}, 1000);
	})
})

//unit test the resolver of program
describe('Test program method', function () {
  it('gets a program', function (done) {
    const args = {program_submitter_id: 'CPTAC'};
    const obj = '_';
	//console.log('In test moduleb 2');

    setTimeout(function () {	
    queryResolvers.Query.program(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	}, 1000);
	})
})

//unit test the resolver of allCases
describe('Test allCases method', function () {
  it('gets all cases', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.allCases(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of geneSpectralCount
describe('Test geneSpectralCount method', function () {
  it('gets a geneSpectralCount', function (done) {
    const args = {gene_name: 'A1BG'};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.geneSpectralCount(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of protein
describe('Test protein method', function () {
  it('gets a gene using protein', function (done) {
	
    const args = {protein: 'P04217-2'};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.protein(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of tissueSitesAvailable
describe('Test tissueSitesAvailable method', function () {
  it('gets all tissue sites', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.tissueSitesAvailable(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of diseasesAvailable
describe('Test diseasesAvailable method', function () {
  it('gets all diseases available', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.diseasesAvailable(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of allExperimentTypes
describe('Test allExperimentTypes method', function () {
  it('gets all all experiment types', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.allExperimentTypes(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of diseaseTypesPerProject
describe('Test diseaseTypesPerProject method', function () {
  it('gets disease types per project', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.diseaseTypesPerProject(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of case
describe('Test case method', function () {
  it('gets a case', function (done) {
    const args = {case_submitter_id: '01BR001'};
    const obj = '_';
	//console.log('In test moduleb 2');

    setTimeout(function () {	
    queryResolvers.Query.case(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	}, 1000);
	})
})

//unit test the resolver of aliquotSpectralCount
describe('Test aliquotSpectralCount method', function () {
  it('gets an aliquotSpectralCount', function (done) {
	
    const args = {gene_name: 'A1BG', dataset_alias: "A2-A0D0-01A"};
    const obj = '_';
	//console.log('In test moduleb 3');
    queryResolvers.Query.aliquotSpectralCount(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of projectsPerExperimentType
describe('Test projectsPerExperimentType method', function () {
  it('gets a projectsPerExperimentType', function (done) {
    const args = {experiment_type: "TMT10"};
    const obj = '_';
	//console.log('In test moduleb 2');

    setTimeout(function () {	
    queryResolvers.Query.projectsPerExperimentType(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	}, 1000);
	})
})

//unit test the resolver of filesCountPerStudy
describe('Test filesCountPerStudy method', function () {
  it('gets a filesCountPerStudy', function (done) {
    const args = {file_type: "RAW"};
    const obj = '_';
	//console.log('In test moduleb 2');

    setTimeout(function () {	
    queryResolvers.Query.filesCountPerStudy(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	}, 1000);
	})
})

//unit test the resolver of filesPerStudy
describe('Test filesPerStudy method', function () {
  it('gets a filesPerStudy', function (done) {
    const args = {study_submitter_id: "S038-3"};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.filesPerStudy(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of projectsPerInstrument
describe('Test projectsPerInstrument method', function () {
  it('gets a projectsPerInstrument', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.projectsPerInstrument(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of workflowMetadata
describe('Test workflowMetadata method', function () {
  it('gets a workflowMetadata', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.workflowMetadata(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiStudy
describe('Test uiStudy method', function () {
  it('gets a uiStudy', function (done) {
    const args = {project_name: "CPTAC-Retrospective"};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiStudy(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiCase
describe('Test uiCase method', function () {
  it('gets a uiCase', function (done) {
    const args = {disease_type: "Ovarian Serous Cystadenocarcinoma"};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiCase(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiFile
describe('Test uiFile method', function () {
  it('gets a uiFile', function (done) {
    const args = {study_name: "TCGA_Breast_Cancer_Proteome"};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiFile(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiAnalyticalFractionsCount
describe('Test uiAnalyticalFractionsCount method', function () {
  it('gets a uiAnalyticalFractionsCount', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiAnalyticalFractionsCount(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiExperimentPie
describe('Test uiExperimentPie method', function () {
  it('gets a uiExperimentPie', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiExperimentPie(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiExperimentBar
describe('Test uiExperimentBar method', function () {
  it('gets a uiExperimentBar', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiExperimentBar(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiTissueSiteCaseCount
describe('Test uiTissueSiteCaseCount method', function () {
  it('gets a uiTissueSiteCaseCount', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiTissueSiteCaseCount(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of pdcDataStats
describe('Test pdcDataStats method', function () {
  it('gets a pdcDataStats', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.pdcDataStats(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of getPaginatedUIFile
describe('Test getPaginatedUIFile method', function () {
  it('gets a getPaginatedUIFile', function (done) {
	
    const args = {offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.getPaginatedUIFile(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of getPaginatedUICase
describe('Test getPaginatedUICase method', function () {
  it('gets a getPaginatedUICase', function (done) {
    const args = {offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.getPaginatedUICase(obj, args, context).then(function(result) {
		//console.log("PUICase"+JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of getPaginatedFiles
describe('Test getPaginatedFiles method', function () {
  it('gets a getPaginatedFiles', function (done) {
    const args = {offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.getPaginatedFiles(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of getPaginatedCases
describe('Test getPaginatedCases method', function () {
  it('gets a getPaginatedCases', function (done) {
    const args = {offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.getPaginatedCases(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of getPaginatedUIClinical
describe('Test getPaginatedUIClinical method', function () {
  it('gets a getPaginatedUIClinical', function (done) {
    const args = {offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.getPaginatedUIClinical(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of caseSearch
describe('Test caseSearch method', function () {
  it('gets a caseSearch', function (done) {
    const args = {name: "TCGA-61", offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.caseSearch(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of geneSearch
describe('Test geneSearch method', function () {
  it('gets a geneSearch', function (done) {
    const args = {name: "42EP", offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.geneSearch(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of studySearch
describe('Test studySearch method', function () {
  it('gets a studySearch', function (done) {
    const args = {name: "TCGA", offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.studySearch(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiAnalyticalFractionsCount
describe('Test uiAnalyticalFractionsCount method', function () {
  it('gets a uiAnalyticalFractionsCount', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiAnalyticalFractionsCount(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiProtocol
describe('Test uiProtocol method', function () {
  it('gets a uiProtocol', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiProtocol(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiPublication
describe('Test uiPublication method', function () {
  it('gets a uiPublication', function (done) {
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiPublication(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiExperimentFileCount
describe('Test uiExperimentFileCount method', function () {
  it('gets a uiExperimentFileCount', function (done) {
    const args = {case_submitter_id: "TCGA-61-1911"};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiExperimentFileCount(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiDataCategoryFileCount
describe('Test uiDataCategoryFileCount method', function () {
  it('gets a uiDataCategoryFileCount', function (done) {
    const args = {case_submitter_id: "TCGA-61-1911"};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiDataCategoryFileCount(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiGeneStudySpectralCount
describe('Test uiGeneStudySpectralCount method', function () {
  it('gets a uiGeneStudySpectralCount', function (done) {
    const args = {gene_name: "A1BG"};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiGeneStudySpectralCount(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of uiGeneAliquotSpectralCount
describe('Test uiGeneAliquotSpectralCount method', function () {
  it('gets a uiGeneAliquotSpectralCount', function (done) {
    const args = {gene_name: "CDC42EP1"};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiGeneAliquotSpectralCount(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of getPaginatedUIStudy
describe('Test getPaginatedUIStudy method', function () {
  it('gets a getPaginatedUIStudy', function (done) {
    const args = {offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.getPaginatedUIStudy(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of getPaginatedUIPtm
describe('Test getPaginatedUIPtm method', function () {
  it('gets a getPaginatedUIPtm', function (done) {
	
    const args = {gene_name: "CDC42EP1", offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.getPaginatedUIPtm(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of fileMetadata
describe('Test fileMetadata method', function () {
  it('gets a fileMetadata', function (done) {
	
    const args = {file_name: "10ffa258-14c2-4c74-861e-91ed02fb4cf6.raw"};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.fileMetadata(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of paginatedPtmDataMatrix
/*describe('Test paginatedPtmDataMatrix method', function () {
  it('gets an paginatedPtmDataMatrix', function (done) {
	
    const args = {study_submitter_id: "S038-3", offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.paginatedPtmDataMatrix(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})*/

//unit test the resolver of uiSunburstChart
describe('Test uiSunburstChart method', function () {
  it('gets a uiSunburstChart', function (done) {
	
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiSunburstChart(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of paginatedSpectralCountPerStudyAliquot
describe('Test paginatedSpectralCountPerStudyAliquot method', function () {
  it('gets a paginatedSpectralCountPerStudyAliquot', function (done) {
	
    const args = {study_submitter_id: "S015-2", plex_name: "A2-A0D0-01A:BH-A0HK-01A:C8-A12T-01A:POOL", gene_name: "A2M", offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.paginatedSpectralCountPerStudyAliquot(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of paginatedDataMatrix
describe('Test paginatedDataMatrix method', function () {
  it('gets a paginatedDataMatrix', function (done) {
	
    const args = {study_submitter_id: "S015-2", data_type: "spectral_count", offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.paginatedDataMatrix(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})
//unit test the resolver of quantitiveDataCPTAC2
describe('Test quantitiveDataCPTAC2 method', function () {
  it('gets a quantitiveDataCPTAC2', function (done) {
	
    const args = {study_submitter_id: "S037-2"};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.quantitiveDataCPTAC2(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})
//unit test the resolver of uiFilters
describe('Test uiFilters method', function () {
  it('gets a uiFilters', function (done) {
	
    const args = {acquisition_type: "DIA"};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.uiFilters(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})
//unit test the resolver of paginatedCaseDiagnosesPerStudy
describe('Test paginatedCaseDiagnosesPerStudy method', function () {
  it('gets a paginatedCaseDiagnosesPerStudy', function (done) {
	
    const args = {study_submitter_id: "S015-1", offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.paginatedCaseDiagnosesPerStudy(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})
//unit test the resolver of paginatedCaseDemographicsPerStudy
describe('Test paginatedCaseDemographicsPerStudy method', function () {
  it('gets a paginatedCaseDemographicsPerStudy', function (done) {
	
    const args = {study_name: "TCGA_Colon_Cancer_Proteome", offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.paginatedCaseDemographicsPerStudy(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})
//unit test the resolver of programsProjectsStudies
describe('Test programsProjectsStudies method', function () {
  it('gets a programsProjectsStudies', function (done) {
	
    const args = {};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.programsProjectsStudies(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of paginatedCasesSamplesAliquots
describe('Test paginatedCasesSamplesAliquots method', function () {
  it('gets a paginatedCasesSamplesAliquots', function (done) {
	
    const args = {study_submitter_id: "S015-1", offset: 0, limit: 10};
    const obj = '_';
	//console.log('In test moduleb 3');

    queryResolvers.Query.paginatedCasesSamplesAliquots(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of demographics
describe('Test demographics method', function () {
  it('gets a demographics', function (done) {
    const args = {};
    const obj = {case_submitter_id: "TCGA-61-1911"};
	//console.log('In test moduleb 3');

    subResolvers.Case.demographics(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of diagnoses
describe('Test diagnoses method', function () {
  it('gets a diagnoses', function (done) {
    const args = {};
    const obj = {case_submitter_id: "TCGA-61-1911"};
	//console.log('In test moduleb 3');

    subResolvers.Case.diagnoses(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of samples
describe('Test samples method', function () {
  it('gets a samples', function (done) {
    const args = {};
    const obj = {case_submitter_id: "TCGA-61-1911"};
	//console.log('In test moduleb 3');

    subResolvers.Case.samples(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})

//unit test the resolver of aliquots
describe('Test aliquots method', function () {
  it('gets a aliquots', function (done) {
    const args = {};
    const obj = {sample_submitter_id: "TCGA-AG-A00Y-01A"};
	//console.log('In test moduleb 3');

    subResolvers.Sample.aliquots(obj, args, context).then(function(result) {
		//console.log(JSON.stringify(result));
		try {	
			assert.isNotNull(result);
			done();
		}
        catch (e) {
            done(e);
        }
	});
	})
})
