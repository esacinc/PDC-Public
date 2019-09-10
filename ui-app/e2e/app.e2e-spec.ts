import { AppPage } from './app.po';

describe('ui-app App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getPageTitle()).toEqual('Proteomic Data Commons');
    expect(page.getWelcomeText()).toEqual('Join NCI Proteomic Data Portal Alpha Program!');
  });
  it('should display welcome message', () => {
    expect(page.getWelcomeText()).toEqual('Join NCI Proteomic Data Portal Alpha Program!');
  });
  it('should display google login', () => {
    expect(page.clickGoogleLogin());
  });
});
