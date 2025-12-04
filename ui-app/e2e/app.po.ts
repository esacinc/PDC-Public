import { browser, by, element } from 'protractor';


export class AppPage {
  navigateTo() {
    return browser.get('/');
  }

  getPageTitle() {
		return browser.getTitle();
  }

  getWelcomeText() {
    return element(by.css('mat-card h2')).getText();
  }

  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }
}
