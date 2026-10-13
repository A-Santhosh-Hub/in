const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
 const browser = await chromium.launch({channel:'msedge',headless:true});
 try {
  for (const size of [{width:1440,height:1000},{width:390,height:844}]) {
   const page = await browser.newPage({viewport:size});
   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4173',{waitUntil:'domcontentloaded'});
   await page.evaluate(()=>document.fonts.ready);
   await page.waitForTimeout(500);
   await page.keyboard.press('Escape');
   fs.mkdirSync('artifacts',{recursive:true});
   const tracks = await page.locator('.chapter-track').evaluateAll(nodes=>nodes.slice(0,5).map(el=>({top:el.getBoundingClientRect().top+scrollY,height:el.offsetHeight,name:el.dataset.chapter})));
   console.log(size.width,tracks);
   for (let i=0;i<3;i++) {
    const current=tracks[i],next=tracks[i+1];
    for (const fraction of [0,.5,.85,1]) {
     const liveTop=await page.locator('.chapter-track').nth(i+1).evaluate(el=>el.getBoundingClientRect().top+scrollY);
     const y=liveTop-size.height*.62*(1-fraction);
     await page.evaluate(y=>scrollTo({top:Math.max(0,y),behavior:'instant'}),y);
     await page.waitForTimeout(650);
     const state=await page.evaluate(i=>{
      const tracks=[...document.querySelectorAll('.chapter-track')];
      const a=tracks[i].firstElementChild,b=tracks[i+1].firstElementChild;
      return {a:Number(a.style.opacity),b:Number(b.style.opacity),nextTop:b.getBoundingClientRect().top,overflow:document.documentElement.scrollWidth>innerWidth,scale:tracks[i].querySelector('.chapter-surface').style.transform,y:scrollY,tracks:tracks.slice(0,4).map(t=>t.getBoundingClientRect().top+scrollY)};
     },i);
     assert.ok(!state.overflow,'No horizontal overflow during zoom');
     assert.ok(state.a>=.99 || state.b>=.99,`No empty frame between chapters ${i}/${fraction}: ${JSON.stringify(state)}`);
     if(fraction===1) {assert.equal(state.a,0);assert.equal(state.b,1);assert.ok(Math.abs(state.nextTop)<2,JSON.stringify(state));}
     if(fraction===.85 || fraction===1) await page.screenshot({path:`artifacts/transition-${size.width}-${current.name}-${fraction}.png`});
    }
   }
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   await page.waitForTimeout(650);
   await page.mouse.wheel(0,450); await page.waitForTimeout(800);
   assert.equal(await page.locator('.hero-title-stage').evaluate(el=>getComputedStyle(el).opacity),'1');
   assert.equal(await page.locator('.hero-person').evaluate(el=>getComputedStyle(el).opacity),'1');
   await page.mouse.wheel(0,-1000); await page.waitForTimeout(800);
   assert.equal(await page.locator('.chapter-camera').first().evaluate(el=>el.style.opacity),'1');
   await page.locator('.enter-world').click();
   await page.waitForTimeout(1500);
   console.log('anchor',size.width,await page.evaluate(()=>({y:scrollY,hash:location.hash,top:document.querySelector('[data-chapter="intro"] .chapter-camera').getBoundingClientRect().top,opacity:document.querySelector('[data-chapter="intro"] .chapter-camera').style.opacity})));
   assert.ok(await page.locator('[data-chapter="intro"] .chapter-camera').evaluate(el=>Math.abs(el.getBoundingClientRect().top)<2));
   // Every later handoff must cover the outgoing scene, not only the first three.
   const count=await page.locator('.chapter-track').count();
   for(let i=4;i<count;i++) {
    await page.locator('.chapter-track').nth(i).evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'}));
    await page.waitForTimeout(100);
    assert.equal(await page.locator('.chapter-camera').nth(i).evaluate(el=>Number(el.style.opacity)),1,`Chapter ${i} visible at handoff`);
   }
   await page.locator('.project-card').first().focus();
   await page.waitForTimeout(700);
   assert.equal(await page.locator('[data-chapter="projects"] .chapter-camera').evaluate(el=>Number(el.style.opacity)),1,'Keyboard focus restores hidden chapter');
   assert.deepEqual(errors,[]);
   console.log(`PASS ${size.width}: all chapter handoffs, native wheel, reverse, anchor, keyboard focus and no JS errors`);
   await page.close();
  }
 } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exit(1)});
