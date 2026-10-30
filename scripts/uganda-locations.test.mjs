import test from 'node:test';
import assert from 'node:assert/strict';
import {UGANDA_PLACES,isUgandaLocation,ugandaLocations} from '../assets/uganda-locations.mjs';
import {normal} from './uganda-extra-sources.mjs';
test('Uganda place names work without the country word and respect word boundaries',()=>{
 for(const place of UGANDA_PLACES) assert(isUgandaLocation(place),place);
 for(const place of ['Nairobi, Kenya','Kigali, Rwanda','Tuvalu','Lirab','Anywhere','East Africa'])assert(!isUgandaLocation(place),place);
 assert(isUgandaLocation('Fort-Portal'));assert(isUgandaLocation('Kampala / Nairobi'));
 assert.equal(ugandaLocations(['Nairobi','Kampala','Accra']),'Kampala');
});
test('description mentions do not turn foreign locations into Uganda jobs',()=>{
 const source={id:'test',name:'Test',employer:'Test'};
 const job={id:'1',title:'Officer',description:'Support the Uganda country team.',sourceUrl:'https://example.org/1',applicationUrl:'https://example.org/apply'};
 assert.equal(normal(source,{...job,location:'Nairobi, Kenya'}),null);
 for(const location of ['Fort Portal','Mukono','Wakiso','Soroti','Kasese','Isingiro'])assert(normal(source,{...job,location}),location);
});
