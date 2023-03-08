import { SearchStylePipe } from './search-style.pipe';

describe('SearchStylePipe', () => {
  const pipe = new SearchStylePipe();
  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('search results with highlight', ()=>{
    const result = pipe.transform('GN: A1bg (AP2 associated kinase 1)','A1bg')
    expect(result).toContain("<div style='display:flex; flex-direction:row; box-sizing:border-box;position:relatve; outline:none;'>");
    //expect(result).toContain("<strong>KINAS</strong>");
	//@@@PDC-6325 gene name is case sensitive
    expect(result).toContain("<strong>A1bg</strong>");
  });
});
