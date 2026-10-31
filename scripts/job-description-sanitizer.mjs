import sanitizeHtml from 'sanitize-html';
import * as he from 'he';

export const DESCRIPTION_TAGS=['p','br','ul','ol','li','strong','em','b','i','h3','h4','a'];
export function sanitizeDescription(value,sourceUrl) {
 let input=he.decode(String(value||''));
 if(!/<\/?[a-z][a-z0-9]*[\s/>]/i.test(input))input=input.split(/\n\s*\n/).map(p=>'<p>'+he.encode(p).replace(/\n/g,'<br>')+'</p>').join('');
 return sanitizeHtml(input,{
  allowedTags:DESCRIPTION_TAGS,
  allowedAttributes:{a:['href','rel','target']},
  allowedSchemes:['http','https'],allowProtocolRelative:false,
  nonTextTags:['script','style','iframe','form','textarea','option','svg','math','object','template','noscript'],
  transformTags:{h1:'h3',h2:'h3',h5:'h4',h6:'h4',a:(tag,attributes)=>{
   let href;try{if(!attributes.href)throw Error();const u=new URL(attributes.href,sourceUrl);if(['http:','https:'].includes(u.protocol)&&!u.username&&!u.password)href=u.href}catch{}
   return {tagName:'a',attribs:href?{href,rel:'nofollow noopener',target:'_blank'}:{}};
  }},
  textFilter:text=>text.replace(/\s+/g,' ')
 }).replace(/>\s+</g,'><').trim();
}

