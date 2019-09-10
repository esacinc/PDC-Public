import { by, browser, element } from 'protractor';

import { AppPage } from './app.po';

describe('Conduit App E2E Test Suite', () => {
	const homePage = new AppPage();
	describe('home page should work fine', () => {
		beforeAll(() => {
			homePage.navigateTo();
		});
		
		it('should have right title', () => {
			homePage.getPageTitle()
				.then((title: string) => {
					expect(title).toEqual('Proteomic Data Commons');
				});
		})
		
	});
});
view raw