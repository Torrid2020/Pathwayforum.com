import test from 'node:test';
import assert from 'node:assert/strict';
import {suspiciousRecruitment} from './recruitment-language.mjs';
test('official fee disclaimers and warnings do not create false positives',()=>{
 for(const text of ["M-KOPA does not collect/charge any money ... we never ask for 'recruitment fees', 'processing fees'",'UNICEF does not charge a processing fee.','Beware of scams asking you to pay an application fee.','Training fees are reimbursed.'])assert.equal(suspiciousRecruitment(text),false,text);
});
test('actual fee requests and messaging-only applications remain flagged',()=>{
 for(const text of ['Pay a processing fee of UGX 50,000 to receive your interview letter','Apply via WhatsApp only','Apply only via Telegram','Applicants must pay UGX 50000 to apply.','Never pay fraudulent recruiters. Pay an application fee to us.'])assert.equal(suspiciousRecruitment(text),true,text);
});
test('employer submissions and community tips retain strict screening',()=>assert(suspiciousRecruitment('We never charge a processing fee.',{strictCheck:true})));
