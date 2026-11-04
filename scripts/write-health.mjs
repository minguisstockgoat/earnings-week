import fs from 'node:fs';
const us=JSON.parse(fs.readFileSync('app/us-earnings.json','utf8'));
const jp=JSON.parse(fs.readFileSync('app/japan-earnings.json','utf8'));
fs.mkdirSync('public',{recursive:true});
fs.writeFileSync('public/health.json',JSON.stringify({builtAt:new Date().toISOString(),usUpdatedAt:us.updatedAt,usRangeStart:us.rangeStart,usRangeEnd:us.rangeEnd,japanRangeEnd:jp.rows.map(x=>x.date).sort().at(-1),japanAutomatic:false}));
