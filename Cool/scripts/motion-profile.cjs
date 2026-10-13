const { chromium } = require('playwright');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true});
 try {
  const page = await browser.newPage({viewport:process.argv[3]==='mobile'?{width:390,height:844}:{width:1440,height:1000}});
  await page.goto('http://127.0.0.1:4173',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.fonts.ready);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1000);
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  const metrics=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
  const before=await metrics();
  const result=await page.evaluate(async()=>{
   let styles=0,offscreenStyles=0;
   const observer=new MutationObserver(records=>{for(const r of records){styles++;if(r.target.closest('[data-chapter="contact"],[data-chapter="education"],[data-chapter="certificates"]'))offscreenStyles++;}});
   observer.observe(document.querySelector('#main-content'),{subtree:true,attributes:true,attributeFilter:['style']});
   const times=[];let previous;
   for(let i=0;i<180;i++) {
    await new Promise(resolve=>requestAnimationFrame(time=>{if(previous)times.push(time-previous);previous=time;scrollTo({top:(i<90?i:180-i)*22,behavior:'instant'});resolve();}));
   }
   await new Promise(resolve=>setTimeout(resolve,700)); observer.disconnect();
   times.sort((a,b)=>a-b);
   return {frames:times.length,p95FrameMs:times[Math.floor(times.length*.95)],framesOver34ms:times.filter(t=>t>34).length,styleMutations:styles,offscreenStyleMutations:offscreenStyles};
  });
  const after=await metrics();
  for(const name of ['ScriptDuration','LayoutDuration','RecalcStyleDuration','LayoutCount','RecalcStyleCount'])result[name]=after[name]-before[name];
  fs.mkdirSync('artifacts',{recursive:true});
  fs.writeFileSync(`artifacts/motion-profile-${process.argv[2]||'latest'}.json`,JSON.stringify(result,null,2));
  console.log(result);
 } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1)});
