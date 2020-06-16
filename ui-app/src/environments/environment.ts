// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

//@@@PDC-262 link headers to data dictionary

export const environment = {
  production: false,
  submission_portal_docs_url: '/workspace/pages/support.html#/questions/faq',
  private_api_url: '/pdcapi/user/',
  // private_api_url: 'http://localhost:3002/pdcapi/user/',
  heatmap_url: '/view_heatmap.html?fname=pdc/',
  server_url_local: 'http://localhost:8000/pdc/',
  server_url_dev: 'http://pdc-dev.esacinc.com/pdc/',
  dictionary_base_url: '/data-dictionary/',
  server_url_workflow_local: 'http://localhost:3010/api',
  graphql_server_url: '/graphql',
  PDC_CLUSTER_NAME: 'PDC-CDAP',
  BUILD_TAG: '1.0.8-dev',
  idle_session_timeout_seconds: 1800,
  GA_TRACKING_ID: 'UA-128656552-1',
  gdc_case_id_url: 'https://portal.gdc.cancer.gov/cases/',
  chorus_jwt_url: '/chorusapi/login',
  pdcapi_jwt_url: '/pdcapi/login',
  openfile_signedurl_url: '/pdcapi/file/signedURL/',
  dcf_fence_login_url: 'https://nci-crdc-staging.datacommons.io/user/oauth2/authorize?client_id=%dcf_client_id%&response_type=code&redirect_uri=https%3A%2F%2Fpdc-dev.esacinc.com%2Fpdc%2Ffence&scope=openid+data+user',
  dcf_redirect_url: 'https://pdc-dev.esacinc.com/pdc/fence',
  dcf_client_id:'%dcf_client_id%',
  dcf_client_secret:'%dcf_client_secret%',
  dcf_oauth2_url:'https://nci-crdc-staging.datacommons.io/user/oauth2/token',
  dcf_index_url:'https://nci-crdc-staging.datacommons.io/index/index',
  dcf_fence_signedurl_url:'https://nci-crdc-staging.datacommons.io/user/data/download/',
  workspace_url:'/workspace/pages/v2/index.html',
  kidsFirst_url: 'https://portal.kidsfirstdrc.org/participant/',
  pepquery_url: 'http://pepquery.esacinc.com/pepquery/',
  // workspace_url:'/workspace/pages/dashboard.html#/projects/all'
};

