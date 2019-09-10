//@@@PDC-380 gene search by proteins
//@@@PDC-472 casesSamplesAliquots API
//@@@PDC-475 caseDiagnosesPerStudy API
//@@@PDC-473 caseDemographicsPerStudy API
//@@@PDC-486 data matrix API
//@@@PDC-485 spectral count per study/aliquot API
//@@@PDC-579 gene tabe pagination
//@@@PDC-678 ptm data matrix API
//@@@PDC-681 ui ptm data API

const Paginated = `
type Paginated {
	total: Int
	uiStudies: [UIStudy]
    uiFiles: [UIFile]
	uiCases: [UICase]
	uiClinical: [UIClinical]
	uiGenes: [UIGene]
	uiGeneStudySpectralCounts: [UIGeneStudySpectralCount]
	uiGeneAliquotSpectralCounts:[UIGeneStudySpectralCount]
	uiPtm: [UIPtm]
	files: [File]
	cases: [Case]
	caseDiagnosesPerStudy: [Case]
	caseDemographicsPerStudy: [Case]
	casesSamplesAliquots: [Case]
	genes: [SearchRecord]
	genesWithProtein: [SearchRecord]
	studies: [SearchRecord]
	searchCases: [SearchRecord]
	spectralCounts: [Spectral_count]
	dataMatrix: [[String]]
	ptmDataMatrix: [[String]]
	pagination: Pagination
}`
;

export default Paginated;