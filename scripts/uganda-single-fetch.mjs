import robotsParser from 'robots-parser';
import {JOB_USER_AGENT} from './uganda-reliefweb.mjs';

const problem = (message,status='unavailable') => Object.assign(new Error(message),{sourceStatus:status});
// A fresh policy cache is shared by hostname for one collection run. Robots checks
// are separate from the single vacancy-data request, and never retried.
export function createRobotsPolicy(fetcher=fetch) {
 const policies=new Map();
 return async url => {
  const origin=new URL(url).origin;
  if(!policies.has(origin))policies.set(origin,(async()=>{
   const robotsUrl=origin+'/robots.txt';
   const response=await fetcher(robotsUrl,{headers:{'User-Agent':JOB_USER_AGENT},signal:AbortSignal.timeout(25000)});
   if([404,410].includes(response.status))return robotsParser(robotsUrl,'');
   if(!response.ok)throw problem('robots.txt returned HTTP '+response.status+'; vacancy endpoint was not fetched.','manual-review');
   return robotsParser(robotsUrl,await response.text());
  })());
  const policy=await policies.get(origin);
  if(policy.isAllowed(url,'PathwayForum')===false)throw problem('robots.txt disallows automated access to this endpoint; review the official page manually.','manual-review');
 };
}
export function singleFetchClient(checkPolicy,{fetcher=fetch}={}) {
 let count=0,claimed=false;
 const request=async(url,options={})=>{
  if(claimed)throw problem('One vacancy-data request limit reached; additional pages require manual review.','manual-review');
  claimed=true;
  await checkPolicy(url);
  count++;
  let response;
  try{response=await fetcher(url,{...options,redirect:'manual',headers:{...options.headers,'User-Agent':JOB_USER_AGENT},signal:AbortSignal.timeout(30000)})}
  catch(error){throw problem('Vacancy request failed: '+error.message+(error.cause?.code?' ('+error.cause.code+')':''))}
  if(response.status>=300&&response.status<400)throw problem('Endpoint redirects to '+response.headers.get('location')+'; review its canonical URL and robots rules.','manual-review');
  if(!response.ok)throw problem('Vacancy endpoint returned HTTP '+response.status);
  // A redirect to a different host needs its own robots review before use. Do
  // not consume or parse that response as a vacancy feed.
  if(response.url&&new URL(response.url).origin!==new URL(url).origin)throw problem('Endpoint redirects to another host; review its canonical URL and robots rules.','manual-review');
  return response;
 };
 return {request,json:async(url,options)=>(await request(url,options)).json(),get count(){return count}};
}
