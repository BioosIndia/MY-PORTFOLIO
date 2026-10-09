// Dependency-free event regression checks. These verify application handlers,
// not browser layout, native dialog rendering, or device-specific behavior.
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const page = readFileSync(new URL('../dist/index.html', import.meta.url), 'utf8');
const code = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
const documentListeners = new Map();
const nodes = new Map();
const classes = new Map();
const opened = [];
const downloaded = [];
const historyEntries = [];
const observers = [];
let document;

const attributes = text => Object.fromEntries([...text.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2].replaceAll('&amp;', '&')]));
class Element {
  constructor(tag='div', attrs={}, text='') {
    this.tag=tag; this.attrs={...attrs}; this.textContent=text; this.listeners=new Map(); this.parent=null;
    this.isConnected=true; this.open=false; this.disabled=false; this.dataset={};
    for(const [name,value] of Object.entries(attrs)) if(name.startsWith('data-')) this.dataset[name.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=value;
    const set=new Set((attrs.class||'').split(/\s+/).filter(Boolean));
    this.classList={add:(...s)=>s.forEach(v=>set.add(v)),remove:(...s)=>s.forEach(v=>set.delete(v)),contains:s=>set.has(s),toggle:(s,value)=>{const on=value??!set.has(s);on?set.add(s):set.delete(s);return on;}};
    this.style={setProperty:()=>{}};
  }
  get href(){return new URL(this.attrs.href||'', 'https://portfolio.example/').href;}
  get target(){return this.attrs.target||'';}
  getAttribute(name){return this.attrs[name]??null;}
  setAttribute(name,value){this.attrs[name]=String(value);}
  removeAttribute(name){delete this.attrs[name];}
  hasAttribute(name){return name in this.attrs;}
  matches(selector){return selector.split(',').some(s=>s.trim().startsWith('.')?this.classList.contains(s.trim().slice(1)):false);}
  closest(selector){if(selector==='a[href]')return this.tag==='a'&&this.hasAttribute('href')?this:this.parent?.closest(selector);if(selector.startsWith('#')&&this.attrs.id===selector.slice(1))return this;if(selector.startsWith('.')&&this.classList.contains(selector.slice(1)))return this;if(selector===this.tag)return this;return this.parent?.closest(selector)||null;}
  contains(node){for(let e=node;e;e=e.parent)if(e===this)return true;return false;}
  addEventListener(type,handler){if(!this.listeners.has(type))this.listeners.set(type,[]);this.listeners.get(type).push(handler);}
  emit(type,data={}){const e={type,target:this,button:0,detail:1,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...data};for(const fn of this.listeners.get(type)||[])fn(e);return e;}
  focus(){document.activeElement=this;}
  querySelector(selector){if(this===nav&&selector==='a')return navLinks[0];if(selector.startsWith('.'))return classes.get(selector.slice(1))||null;return null;}
  querySelectorAll(selector){if(this===nav&&selector.startsWith('a'))return navLinks;if(this===dialog)return [nodes.get('navigation-close'),nodes.get('navigation-cancel'),nodes.get('navigation-continue')];return [];}
  getBoundingClientRect(){return {top:1200,bottom:1300,left:20,right:500,width:480,height:100};}
  scrollIntoView(options){this.scrollOptions=options;}
  showModal(){this.open=true;}
  close(){this.open=false;this.emit('close');}
  cloneNode(){return new Element(this.tag,this.attrs,this.textContent);}
  click(){this.emit('click');if(this.tag==='a'){const e=dispatch('click',{target:this});if(!e.defaultPrevented&&this.hasAttribute('download'))downloaded.push(this.href);}}
  append(element){element.parent=this;}
  remove(){this.isConnected=false;}
}
for(const m of page.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)){
  const attrs=attributes(m[2]);const e=new Element(m[1].toLowerCase(),attrs);
  if(attrs.id)nodes.set(attrs.id,e);
  for(const name of (attrs.class||'').split(/\s+/))if(name&&!classes.has(name))classes.set(name,e);
}
const header=classes.get('site-header');
const nav=nodes.get('primary-nav');nav.parent=header;
const menu=classes.get('menu-toggle');menu.parent=header;
const dialog=nodes.get('navigation-dialog');
const navMarkup=page.match(/<nav\b[\s\S]*?<\/nav>/)[0];
const navLinks=[...navMarkup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(m=>{const e=new Element('a',attributes(m[1]),m[2]);e.parent=nav;return e;});
const media=new Map();
function matchMedia(query){if(!media.has(query)){const handlers=[];media.set(query,{matches:query.includes('1120'),addEventListener:(_,fn)=>handlers.push(fn),change(value){this.matches=value;handlers.forEach(fn=>fn({matches:value}));}});}return media.get(query);}
class Observer{constructor(fn){this.fn=fn;this.targets=[];observers.push(this);}observe(target){this.targets.push(target);}}
const revealTargets=['proof-band','section-top','feature-card','research-card','thesis-card'].map(name=>classes.get(name)).filter(Boolean);
document={activeElement:null,hidden:false,documentElement:new Element('html'),body:new Element('body'),querySelector(selector){return selector.startsWith('#')?nodes.get(selector.slice(1))||null:classes.get(selector.slice(1))||null;},querySelectorAll(selector){if(selector==='.portrait-scene, .architecture-orbit, .feature-card')return [classes.get('portrait-scene'),classes.get('architecture-orbit')].filter(Boolean);if(selector.startsWith('.proof-band,')||selector==='[data-reveal]')return revealTargets;return [];},addEventListener(type,fn){if(!documentListeners.has(type))documentListeners.set(type,[]);documentListeners.get(type).push(fn);}};
const window={innerHeight:900,scrollY:0,matchMedia,addEventListener:()=>{},IntersectionObserver:Observer,location:{href:''},open:(url,target,options)=>opened.push({url,target,options})};
function dispatch(type,data={}){const e={type,target:new Element(),button:0,detail:1,defaultPrevented:false,preventDefault(){this.defaultPrevented=true;},...data};for(const fn of documentListeners.get(type)||[])fn(e);return e;}
vm.runInNewContext(code,{document,window,IntersectionObserver:Observer,URL,history:{pushState:(_,__,url)=>historyEntries.push(url)},requestAnimationFrame:fn=>fn(),setTimeout:fn=>fn(),console});
const continueButton=nodes.get('navigation-continue');
const cancel=nodes.get('navigation-cancel');
const close=nodes.get('navigation-close');
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS '+name);}
function link(href,attrs={}){assert(page.includes(href),'Test destination must exist in actual page');return new Element('a',{href,target:'_blank',...attrs},'Selected item');}

test('Keyboard menu opens to first link; Escape closes and restores focus',()=>{menu.emit('click',{detail:0});assert.equal(document.activeElement,navLinks[0]);dispatch('keydown',{key:'Escape'});assert(!nav.classList.contains('open'));assert.equal(document.activeElement,menu);});
test('Cancel from a mobile navigation link returns to the visible menu button',()=>{menu.emit('click');const e=navLinks[0].emit('click');dispatch('click',{target:navLinks[0]});assert(dialog.open);assert.equal(document.activeElement,cancel);cancel.click();assert(!dialog.open);assert.equal(document.activeElement,menu);assert(!document.body.classList.contains('dialog-open'));});
test('PDF requires confirmation; cancel opens nothing and restores origin',()=>{const e=link('./assets/docs/Rahul_Dewangan_Resume.pdf');dispatch('click',{target:e});assert(dialog.open);assert.equal(opened.length,0);close.click();assert.equal(document.activeElement,e);assert.equal(opened.length,0);});
test('Confirmed PDF opens the actual local asset without opener access',()=>{dispatch('click',{target:link('./assets/docs/Rahul_Dewangan_Resume.pdf')});continueButton.click();assert.equal(opened.at(-1).url,'https://portfolio.example/assets/docs/Rahul_Dewangan_Resume.pdf');assert.equal(opened.at(-1).options,'noopener,noreferrer');assert(!dialog.open);});
test('Architecture image gets an image-specific destination description',()=>{dispatch('click',{target:link('./assets/diagrams/BEACON_RIS_Architecture.png')});assert(nodes.get('navigation-title').textContent.includes('architecture image'));assert(nodes.get('navigation-description').textContent.includes('full size'));close.click();});
test('Middle-click also asks for permission before opening the external site',()=>{const event=dispatch('auxclick',{button:1,target:link('https://forge.r4dewangan.chatgpt.site/')});assert(event.defaultPrevented);assert(dialog.open);continueButton.click();assert.equal(opened.at(-1).url,'https://forge.r4dewangan.chatgpt.site/');});
test('Section confirmation preserves its real fragment and moves keyboard focus',()=>{dispatch('click',{target:link('#forge-work-samples',{target:''})});continueButton.click();assert.equal(historyEntries.at(-1),'#forge-work-samples');assert.equal(document.activeElement,nodes.get('forge-work-samples'));assert.equal(nodes.get('forge-work-samples').scrollOptions.behavior,'smooth');});
test('Tab and Shift-Tab remain inside the open confirmation',()=>{dispatch('click',{target:link('./assets/docs/PRAMANEX_TRACE_DOI_23096983.pdf')});close.focus();const back=dialog.emit('keydown',{key:'Tab',shiftKey:true});assert(back.defaultPrevented);assert.equal(document.activeElement,continueButton);const forward=dialog.emit('keydown',{key:'Tab',shiftKey:false});assert(forward.defaultPrevented);assert.equal(document.activeElement,close);cancel.click();});
test('Native Escape cancellation closes dialog and releases scroll lock',()=>{dispatch('click',{target:link('./assets/docs/PRAMANEX_Bharat_VPop_DOI_23238917.pdf')});const event=dialog.emit('cancel');assert(event.defaultPrevented);assert(!dialog.open);assert(!document.body.classList.contains('dialog-open'));});
for (const [title,path,doi] of [
  ['TRACE','PRAMANEX_TRACE_DOI_23096983.pdf','23096983'],
  ['Bharat-VPop','PRAMANEX_Bharat_VPop_DOI_23238917.pdf','23238917'],
  ['ClaimGraph-RD','PRAMANEX_ClaimGraph_RD_DOI_23239242.pdf','23239242'],
]) {
  test(title+' confirmed paper opens its own updated DOI PDF',()=>{
    const source=link('./assets/docs/'+path);
    const before=opened.length;
    dispatch('click',{target:source});assert(dialog.open);assert.equal(opened.length,before);
    assert(nodes.get('navigation-title').textContent.includes('document'));
    continueButton.click();assert.equal(opened.at(-1).url,'https://portfolio.example/assets/docs/'+path);assert(!dialog.open);
  });
  test(title+' DOI record retains separate external confirmation and cancel',()=>{
    const before=opened.length;
    dispatch('click',{target:link('https://doi.org/10.5281/zenodo.'+doi)});
    assert(dialog.open);assert(nodes.get('navigation-description').textContent.includes('external'));
    cancel.click();assert.equal(opened.length,before);assert(!dialog.open);
  });
}
test('Confirmed download retains the actual supplied resume destination',()=>{dispatch('click',{target:link('./assets/docs/Rahul_Dewangan_Resume.pdf',{download:'Rahul_Dewangan_Resume.pdf'})});continueButton.click();assert.equal(downloaded.at(-1),'https://portfolio.example/assets/docs/Rahul_Dewangan_Resume.pdf');});
test('Outside pointer dismisses the mobile navigation',()=>{menu.emit('click');assert(nav.classList.contains('open'));dispatch('pointerdown',{target:new Element()});assert(!nav.classList.contains('open'));});
test('Viewport change does not leave focus on a hidden navigation link',()=>{menu.emit('click');navLinks[2].focus();media.get('(max-width: 1120px)').change(true);assert.equal(document.activeElement,menu);});
test('Scroll reveal returns on upward and downward re-entry',()=>{const observer=observers[0];const target=revealTargets[0];assert(target.hasAttribute('data-reveal'));observer.fn([{target,isIntersecting:true,boundingClientRect:{top:100,bottom:200}}]);assert(target.classList.contains('is-visible'));observer.fn([{target,isIntersecting:false,boundingClientRect:{top:-200,bottom:-100}}]);assert(!target.classList.contains('is-visible'));observer.fn([{target,isIntersecting:true,boundingClientRect:{top:100,bottom:200}}]);assert(target.classList.contains('is-visible'));observer.fn([{target,isIntersecting:false,boundingClientRect:{top:1000,bottom:1100}}]);assert(!target.classList.contains('is-visible'));observer.fn([{target,isIntersecting:true,boundingClientRect:{top:100,bottom:200}}]);assert(target.classList.contains('is-visible'));});
test('Restricted project access is explained before navigation and cancellation remains safe',()=>{const before=opened.length;dispatch('click',{target:link('https://ledger-q.r4dewangan.chatgpt.site/',{'data-access-note':'This product currently uses restricted site access; an authorized account may be required.'})});assert(dialog.open);assert(nodes.get('navigation-description').textContent.includes('restricted site access'));cancel.click();assert.equal(opened.length,before);});
test('Hero LEDGER-Q identifies the correct product and verification stays above the fold',()=>{const hero=page.slice(page.indexOf('class="hero-actions"'),page.indexOf('aria-label="Portrait'));assert(hero.includes('data-document-title="LEDGER-Q · main website"'));assert(hero.includes('BEACON VERIFICATION'));assert(!/href="#regulatory-work"[^>]*target="_blank"/.test(hero));});
test('System reduced-motion preference pauses decorative hero without obsolete action controls',()=>{media.get('(prefers-reduced-motion: reduce)').change(true);assert(!nodes.has('hero-motion'));assert(!nodes.has('orbit-motion'));assert(classes.get('evidence-sculpture').classList.contains('hero-motion-paused'));assert(revealTargets.every(target=>target.classList.contains('is-visible')));const css=readFileSync(new URL('../dist/styles.css',import.meta.url),'utf8');assert(css.includes('@media(prefers-reduced-motion:reduce)'));assert(css.includes('animation:none!important'));});
test('Hidden page pauses background animation work and restores when visible',()=>{document.hidden=true;dispatch('visibilitychange');assert(document.documentElement.classList.contains('page-motion-paused'));document.hidden=false;dispatch('visibilitychange');assert(!document.documentElement.classList.contains('page-motion-paused'));});
test('Off-screen scenes pause; visible scenes resume',()=>{const observer=observers.at(-1);const scene=observer.targets[0];observer.fn([{target:scene,isIntersecting:false}]);assert(scene.classList.contains('is-offscreen-motion'));observer.fn([{target:scene,isIntersecting:true}]);assert(!scene.classList.contains('is-offscreen-motion'));});
console.log(JSON.stringify({passed,scope:'Application event handlers; not browser/device visual QA'}));
