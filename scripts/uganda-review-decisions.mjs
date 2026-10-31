import {createHash} from 'node:crypto';

export const contentHash = value => createHash('sha256').update(String(value)).digest('hex');
export function reviewFingerprint(job) {
 return job.verification?.contentHash || contentHash(JSON.stringify([job.title,job.summary,job.experience,job.location,job.sourceUrl,job.applicationUrl]));
}

export function applyReviewDecision(job, decisions, now=Date.now()) {
 if(job.verification?.status!=='review')return job;
 if(job.deadline && Date.parse(job.deadline)<=now)return job;
 const fingerprint=reviewFingerprint(job);
 const decision=decisions.find(d=>d.id===job.id&&d.title===job.title&&d.sourceUrl===job.sourceUrl&&d.applicationUrl===job.applicationUrl&&(d.scope==='listing'||d.fingerprint===fingerprint||(!job.verification.contentHash&&d.snapshotFingerprint===fingerprint)));
 if(!decision||decision.status!=='approved'||!decision.reviewedBy||!Number.isFinite(Date.parse(decision.reviewedAt)))return job;
 const flags=job.verification.flags||[];
 if(!flags.length||flags.some(flag=>!decision.approvedFlags?.includes(flag)))return job;
 return {...job,...(decision.summary?{summary:decision.summary}:{}),verification:{...job.verification,status:'official-source',label:'Reviewed by Pathway Forum',flags:[],reviewedFlags:flags,reviewedBy:decision.reviewedBy,reviewedAt:decision.reviewedAt}};
}
