import { of } from 'rxjs';

import { NewsService } from './news.service';

describe("NewsService", () => {
  let service: NewsService;
  let http: any;

  beforeEach(() => {
    http = { get: url => of(new Response()) };
    service = new NewsService(http);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
    service.getFeedContent("a").subscribe(feed => {
      expect(feed).toBeDefined();
    });
  });
});
