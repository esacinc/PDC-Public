import { Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';

@Component({
    selector: 'app-api-documentation',
    templateUrl: './api-documentation.component.html',
    styleUrls: ['./api-documentation.component.css'],
    standalone: false
})
export class ApiDocumentationComponent implements OnInit {
    fragment;

  curl_example = `
     curl https://pdc.cancer.gov/graphql \
     -H "Content-Type: application/json" \
     -d '{"query": "{ case(case_submitter_id: \"01BR001\" acceptDUA: true) \
     { case_submitter_id project_submitter_id disease_type }}"}'

     {
     "data": {
     "case": {
    "case_submitter_id": "01BR001",
    "project_submitter_id": "CPTAC-2",
    "disease_type": "Breast Invasive Carcinoma"
    }
    }
   }
  `;

  code = `
  #Get details about a single file
  import requests
  import json

  # The URL for our API calls
  url = 'https://pdc.cancer.gov/graphql'

  # query to get file metadata

  query = '''{
    fileMetadata(file_id: "00046804-1b57-11e9-9ac1-005056921935" acceptDUA: true) {
      file_name
      file_size
      md5sum
      file_location
      file_submitter_id
      fraction_number
      experiment_type
      aliquots {
        aliquot_id
        aliquot_submitter_id
        sample_id
        sample_submitter_id
      }
    }
  }'''


  response = requests.post(url, json={'query': query})

  if(response.ok):
      #If the response was OK then print the returned JSON
      jData = json.loads(response.content)

      print (json.dumps(jData, indent=4, sort_keys=True))
  else:
      # If response code is not ok (200), print the resulting http error code with description
      response.raise_for_status()

  OUTPUT

  {
    "data": {
        "fileMetadata": [
            {
                "aliquots": [
                    {
                      "aliquot_id": "4f9821f1-2053-11e9-b7f8-0a80fada099c",
                      "aliquot_submitter_id": "CPT0000790001",
                      "sample_id": "7e25284f-204c-11e9-b7f8-0a80fada099c",
                      "sample_submitter_id": "C3L-00097-06"
                    },
                    {
                      "aliquot_id": "cc5d8c5e-2053-11e9-b7f8-0a80fada099c",
                      "aliquot_submitter_id": "CPT0066480003",
                      "sample_id": "2964fdc0-204d-11e9-b7f8-0a80fada099c",
                      "sample_submitter_id": "C3N-00150-01"
                    },
                    {
                      "aliquot_id": "4d459888-2053-11e9-b7f8-0a80fada099c",
                      "aliquot_submitter_id": "CPT0000780007",
                      "sample_id": "7be7a634-204c-11e9-b7f8-0a80fada099c",
                      "sample_submitter_id": "C3L-00097-01"
                    },
                    {
                      "aliquot_id": "67338432-2053-11e9-b7f8-0a80fada099c",
                      "aliquot_submitter_id": "CPT0001550001",
                      "sample_id": "63fb3588-204c-11e9-b7f8-0a80fada099c",
                      "sample_submitter_id": "C3L-00004-06"
                    },
                    {
                      "aliquot_id": "cd83e35b-2053-11e9-b7f8-0a80fada099c",
                      "aliquot_submitter_id": "CPT0066520001",
                      "sample_id": "2b2b1036-204d-11e9-b7f8-0a80fada099c",
                      "sample_submitter_id": "C3N-00150-06"
                    },
                    {
                      "aliquot_id": "c4d3ef91-2053-11e9-b7f8-0a80fada099c",
                      "aliquot_submitter_id": "CPT0065450001",
                      "sample_id": "b5d5b153-204d-11e9-b7f8-0a80fada099c",
                      "sample_submitter_id": "C3N-00953-06"
                    },
                    {
                      "aliquot_id": "3040dd8d-2054-11e9-b7f8-0a80fada099c",
                      "aliquot_submitter_id": "Pooled Sample",
                      "sample_id": "12589be6-204e-11e9-b7f8-0a80fada099c",
                      "sample_submitter_id": "Pooled Sample"
                    },
                    {
                      "aliquot_id": "c40d7a9a-2053-11e9-b7f8-0a80fada099c",
                      "aliquot_submitter_id": "CPT0065430003",
                      "sample_id": "b3e4b8b4-204d-11e9-b7f8-0a80fada099c",
                      "sample_submitter_id": "C3N-00953-02"
                    },
                    {
                      "aliquot_id": "664fbd43-2053-11e9-b7f8-0a80fada099c",
                      "aliquot_submitter_id": "CPT0001540009",
                      "sample_id": "6240511e-204c-11e9-b7f8-0a80fada099c",
                      "sample_submitter_id": "C3L-00004-01"
                    },
                    {
                      "aliquot_id": "29de104b-2054-11e9-b7f8-0a80fada099c",
                      "aliquot_submitter_id": "QC2",
                      "sample_id": "04afc8fb-204e-11e9-b7f8-0a80fada099c",
                      "sample_submitter_id": "QC2"
                    }
                ],
                "file_name": "06CPTAC_CCRCC_W_JHU_20171120_LUMOS_f09.mzid.gz",
                "file_size": "7290779",
                "md5sum": "e8d4417af70878bb1cf45f8a0fca9433",
                "file_location": "studies/127/PSM/mzid/06CPTAC_CCRCC_W_JHU_20171120_LUMOS_f09.mzid.gz",
                "file_submitter_id": "06CPTAC_CCRCC_W_JHU_20171120_LUMOS_f09.mzid.gz",
                "fraction_number": "9",
                "experiment_type": "TMT10",
            }
        ]
    }
}
  `

  constructor(private route:ActivatedRoute,private viewportScroller: ViewportScroller) { }



  ngOnInit() {
    //@@@PDC-4747 back button apidocumentation page not working 
    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
  }






}
