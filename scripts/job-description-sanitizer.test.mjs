import test from 'node:test';
import assert from 'node:assert/strict';
import {sanitizeDescription} from './job-description-sanitizer.mjs';
test('description allow-list preserves paragraphs, headings and lists without presentation attributes',()=>{
 const html=sanitizeDescription('<div><h2 style="color:red">Role</h2><p class="x">Read <strong>carefully</strong>.</p><ul><li>One</li><li>Two</li></ul></div>');
 assert.equal(html,'<h3>Role</h3><p>Read <strong>carefully</strong>.</p><ul><li>One</li><li>Two</li></ul>');
});
test('malicious scripts, onerror images, handlers, forms and unsafe links are removed',()=>{
 const html=sanitizeDescription('<script>alert(1)</script><style>body{display:none}</style><img src=x onerror="alert(2)"><iframe src="https://evil.example"></iframe><form><input name=x>Secret</form><p onclick="steal()" style="position:fixed">Safe</p><a href="jav&#x61;script:alert(3)" onmouseover="steal()">Bad</a><a href="data:text/html,x">Data</a>');
 assert.equal(html,'<p>Safe</p><a>Bad</a><a>Data</a>');
 assert(!/script|onerror|onclick|iframe|<img|style=|form|javascript:|data:/i.test(html));
});
test('safe links are absolute http/https only with required new-tab and rel attributes',()=>{
 const html=sanitizeDescription('<a href="/apply" target="_self" rel="opener">Apply</a><a href="mailto:x@example.org">Email</a>','https://employer.example/jobs/1');
 assert.equal(html,'<a href="https://employer.example/apply" rel="nofollow noopener" target="_blank">Apply</a><a>Email</a>');
});
test('encoded Greenhouse HTML is sanitised after decoding, including encoded attacks',()=>{
 assert.equal(sanitizeDescription('&lt;p&gt;Hello&lt;/p&gt;&lt;script&gt;bad()&lt;/script&gt;'),' <p>Hello</p>'.trim());
 assert.equal(sanitizeDescription('Line one\n\nLine two'),'<p>Line one</p><p>Line two</p>');
});
