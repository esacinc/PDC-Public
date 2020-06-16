import { SearchStylePipe } from './search-style.pipe';

describe('SearchStylePipe', () => {
  const pipe = new SearchStylePipe();
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('search results with highlight', ()=>{
    const result = pipe.transform('GN: AAK1 (AP2 associated kinase 1)','kinas')
    expect(result).toContain("<div style='display:flex; flex-direction:row; box-sizing:border-box;position:relatve; outline:none;'>");
    expect(result).toContain("<strong>KINAS</strong>");
  });
});
