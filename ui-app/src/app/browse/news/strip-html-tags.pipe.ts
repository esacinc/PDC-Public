import { Pipe, PipeTransform } from '@angular/core';

const tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

const tagOrComment = new RegExp(
      '<(?:'
      // Comment body.
      + '!--(?:(?:-*[^->])*--+|-?)'
      // Special "raw text" elements whose content should be elided.
      + '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
      + '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
      // Regular name
      + '|/?[a-z]'
      + tagBody
      + ')>',
      'gi');
@Pipe({
  name: 'stripHtmlTags'
})
export class StripHtmlTagsPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    let oldHtml;
  do {
    oldHtml = value;
    value = value.replace(tagOrComment, '');
  } while (value !== oldHtml);
  return value.replace(/</g, '&lt;');
  }

}
