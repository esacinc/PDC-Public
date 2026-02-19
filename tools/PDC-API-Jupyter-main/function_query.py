import requests
import json
def query_pdc(query, variables):
    url = "https://pdc.cancer.gov/graphql"
    print('Sending query.')
    pdc_response = requests.post(url, json={'query': query, 'variables': variables})
    # Check the results
    if(pdc_response.ok):
        jData = json.loads(pdc_response.content)
        return(pdc_response)
        print (json.dumps(jData, indent=4, sort_keys=True))
    else:
        print(f"Query failed to run with a {pdc_response.status_code}. Response: {pdc_response.text}")