const strict=/\b(?:application|processing|training|recruitment) fees?|pay to apply|telegram only|whatsapp only/i;
export function suspiciousRecruitment(text,{strictCheck=false}={}) {
 if(strictCheck)return strict.test(text);
 const sentences=String(text||'').match(/[^.!?\n]+(?:[.!?]|$)/g)||[];
 return sentences.some(sentence=>{
  if(/\b(?:not|never|no|beware|fraud|scam)\b|\bfree of charge\b/i.test(sentence))return false;
  if(/\b(?:apply|applications?|submit|send|contact)\b[^.!?]{0,100}\b(?:telegram|whatsapp)\s+only\b|\bonly\s+(?:via|through|on)\s+(?:telegram|whatsapp)\b/i.test(sentence))return true;
  const fee=/\b(?:application|processing|training|recruitment|registration|interview) fees?\b/i.test(sentence);
  const request=/\b(?:pay|send|deposit|transfer|remit|charged?|required|must|fee of|non.refundable)\b/i.test(sentence);
  const payment=/\bpay\b[^.!?]{0,100}(?:UGX|USD|KES|\$|to apply|interview letter)/i.test(sentence);
  return fee&&request||payment;
 });
}
