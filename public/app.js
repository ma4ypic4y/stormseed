import { ALGORITHM, bytesToHex, derive, parseSnapshot, parseChoices, validateRange, dataAge } from './core.js';
import { drawAscii } from './art.js';
import { createLivingSky } from './live-sky.js';
const $ = id => document.getElementById(id);
let snapshot = null, wrapper = null, mode = 'number', last = null, busy = false, loading = false;
const labels = { number:'Generate a number', coin:'Flip a coin', dice:'Roll the die', choice:'Make a choice' };
const resultNames = { number:'The sky picked', coin:'The coin landed on', dice:'The die landed on', choice:'The sky picked' };
let livingSky;
const artReady = document.fonts.ready.then(() => { livingSky=createLivingSky($('living-sky')); }).catch(error => console.warn('ASCII scene unavailable:',error.message));
function report(message) { $('action-status').textContent=message; }
function showError(message) { $('error').textContent=message; $('error').hidden=!message; }
function rangeText() { return `A number from ${$('min').value || '…'} to ${$('max').value || '…'}`; }
function resetResult() {
  last=null; $('result').textContent='—'; $('result').className='result empty';
  $('result-label').textContent=mode==='number'?rangeText():mode==='coin'?'Heads or tails':mode==='dice'?`One ${$('sides').value}-sided die`:'Let the sky choose';
  $('result-actions').hidden=true; $('receipt').disabled=true; $('receipt-note').textContent='Generate a result first. A receipt for “Choose” includes your list.'; $('observation').hidden=true;
  showError(''); report(''); updateAge();
}
function setMode(next) {
  if(busy)return;
  mode=next;
  document.querySelectorAll('[data-mode]').forEach(tab=>{
    const selected=tab.dataset.mode===mode;
    tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;
    $(`panel-${tab.dataset.mode}`).hidden=!selected;
  });
  $('generate-label').textContent=snapshot?labels[mode]:'Retry connection';
  resetResult();
}
document.querySelectorAll('[data-mode]').forEach(tab=>{
  tab.addEventListener('click',()=>setMode(tab.dataset.mode));
  tab.addEventListener('keydown',event=>{
    const tabs=[...document.querySelectorAll('[data-mode]')];let idx=tabs.indexOf(tab);
    if(event.key==='ArrowRight')idx=(idx+1)%tabs.length;else if(event.key==='ArrowLeft')idx=(idx+tabs.length-1)%tabs.length;else if(event.key==='Home')idx=0;else if(event.key==='End')idx=tabs.length-1;else return;
    event.preventDefault();if(busy)return;setMode(tabs[idx].dataset.mode);tabs[idx].focus();
  });
});
['min','max','choices','sides'].forEach(id=>$(id).addEventListener('input',()=>{if(!busy)resetResult();}));
function updateAge() {
  if(!snapshot)return;
  const shown=last?JSON.parse(last.snapshot.material):snapshot;
  const age=dataAge(shown.observedEnd);
  $('source-button').replaceChildren(document.createTextNode(`${age.stale?'Older snapshot · ':''}${age.label} ↗`));
  $('source-subtitle').textContent=age.stale?'Using the last real snapshot · updates may be delayed':'NOAA satellite data · refreshes about every 30 min';
  $('status-dot').classList.toggle('stale',age.stale);
  const sats=[...new Set(shown.sources.map(s=>s.satellite))].join(' + ');
  $('source-count').textContent=`${shown.flashes.length.toLocaleString('en-US')} flash observations`;
  $('source-count').nextElementSibling.textContent=sats;
  $('source-button').title=`Observation window ends ${shown.observedEnd}. Snapshot fetched ${shown.collectedAt}. ${shown.warnings.join(' ')}`;
}
async function loadData() {
  if(loading)return;
  loading=true;
  if(!snapshot){$('generate').disabled=true;$('generate-label').textContent='Connecting to the sky…';}
  try {
    if(!globalThis.crypto?.subtle)throw new Error('This browser needs a secure connection to generate results. Open the HTTPS site.');
    const response=await fetch('./data/lightning.json',{cache:'no-store',signal:AbortSignal.timeout(15000)});
    if(!response.ok)throw new Error('Could not load the lightning snapshot. Check your connection and try again.');
    const candidate=await response.json();const parsed=await parseSnapshot(candidate);
    wrapper=candidate;snapshot=parsed;updateAge();showError('');
    if(!last){await artReady;livingSky?.setSeed(snapshot.seed);}
  } catch(error) {
    if(snapshot){$('source-subtitle').textContent='Refresh unavailable · using the last loaded snapshot';}
    else{$('source-button').textContent='Snapshot unavailable · retry ↗';$('source-subtitle').textContent='No result is generated without lightning data.';$('status-dot').classList.add('stale');showError(error.name==='TimeoutError'?'The data request timed out. Try connecting again.':error.message);}
  } finally {
    loading=false;if(!busy){$('generate').disabled=false;$('generate-label').textContent=snapshot?labels[mode]:'Retry connection';}
  }
}
function settings() {
  if(mode==='number') {
    if($('min').value.trim()===''||$('max').value.trim()==='')throw new Error('Enter both ends of the range.');
    const min=Number($('min').value),max=Number($('max').value);validateRange(min,max);return{min,max};
  }
  if(mode==='coin')return{min:0,max:1};
  if(mode==='dice')return{min:1,max:Number($('sides').value)};
  const choices=parseChoices($('choices').value);return{min:0,max:choices.length-1,choices};
}
async function generate() {
  if(busy)return;if(!snapshot){await loadData();return;}
  showError('');report('');let config;
  try{config=settings();}catch(error){showError(error.message);return;}
  busy=true;$('generate').disabled=true;$('generate-label').textContent='A little chaos…';
  const controls=[...document.querySelectorAll('.modes button,.settings input,.settings select,.settings textarea')];controls.forEach(el=>el.disabled=true);
  try {
    const inputSnapshot=snapshot, inputWrapper=wrapper, inputMode=mode;
    const nonce=bytesToHex(crypto.getRandomValues(new Uint8Array(32)));
    const outcome=await derive(inputSnapshot.seed,nonce,config.min,config.max);
    const value=inputMode==='coin'?(outcome.value===0?'Heads':'Tails'):inputMode==='choice'?config.choices[outcome.value]:String(outcome.value);
    const flash=inputSnapshot.flashes[parseInt(outcome.digest.slice(8,16),16)%inputSnapshot.flashes.length];
    last={version:1,algorithm:ALGORITHM,generatedAt:new Date().toISOString(),mode:inputMode,config,nonce,seed:inputSnapshot.seed,outcome,displayValue:value,flash,source:inputSnapshot.sources[flash.source],snapshot:inputWrapper};
    $('result-label').textContent=resultNames[inputMode];$('result').textContent=value;
    $('result').className=`result${inputMode==='choice'?' choice':value.length>6?' long':value.length>3?' medium':''}`;
    $('result-actions').hidden=false;$('receipt').disabled=false;$('receipt-note').textContent=inputMode==='choice'?'This receipt includes your full choice list.':'Includes the exact inputs needed to reproduce this result.';livingSky?.strike(outcome.digest);updateAge();
    if(!$('observation').hidden)showObservation();
  }catch(error){showError(`Could not generate a result. ${error.message}`);}
  finally{busy=false;$('generate').disabled=false;$('generate-label').textContent=labels[mode];controls.forEach(el=>el.disabled=false);}
}
$('generate').addEventListener('click',generate);
function openMethod(scroll=true) {
  $('how-it-works').hidden=false;$('method-link').setAttribute('aria-expanded','true');
  if(scroll)$('how-it-works').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
$('method-link').setAttribute('aria-expanded','false');$('method-link').setAttribute('aria-controls','how-it-works');
$('method-link').addEventListener('click',event=>{event.preventDefault();openMethod();});
$('close-method').addEventListener('click',()=>{$('how-it-works').hidden=true;$('method-link').setAttribute('aria-expanded','false');$('method-link').focus();});
function showObservation() {
  if(!snapshot){loadData();return;}
  const flash=last?.flash||snapshot.flashes[0],source=last?.source||snapshot.sources[flash.source];
  $('observation').hidden=false;$('flash-details').replaceChildren();
  const pairs=[['Latitude',`${Math.abs(flash.lat).toFixed(3)}° ${flash.lat>=0?'N':'S'}`],['Longitude',`${Math.abs(flash.lon).toFixed(3)}° ${flash.lon>=0?'E':'W'}`],['Observed (UTC)',new Date(flash.time).toISOString().replace('T',' ').slice(0,23)],['Satellite',source.satellite]];
  pairs.forEach(([name,value])=>{const div=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=name;dd.textContent=value;div.append(dt,dd);$('flash-details').append(div);});
  $('raw-source').href=source.url;
}
$('source-button').addEventListener('click',()=>{showObservation();if(snapshot)$('observation').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
function download(blob,name) {
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
$('receipt').addEventListener('click',()=>{if(last){download(new Blob([JSON.stringify(last,null,2)],{type:'application/json'}),`stormseed-receipt-${last.outcome.digest.slice(0,10)}.json`);report('Receipt saved.');}});
$('copy-result').addEventListener('click',async()=>{if(!last)return;try{await navigator.clipboard.writeText(last.displayValue);report('Result copied.');}catch{report('Copy is unavailable here. Select the result to copy it.');}});
function wrapText(ctx,text,maxWidth) {
  const words=text.split(' '),lines=[];let line='';
  for(const word of words){
    if(ctx.measureText(word).width>maxWidth){if(line){lines.push(line);line='';}let part='';for(const char of word){if(ctx.measureText(part+char).width>maxWidth){lines.push(part);part='';}part+=char;}line=part;continue;}
    const candidate=line?`${line} ${word}`:word;if(ctx.measureText(candidate).width>maxWidth){lines.push(line);line=word;}else line=candidate;
  }
  if(line)lines.push(line);return lines;
}
async function makeCard(result) {
  await document.fonts.ready;
  const c=document.createElement('canvas');c.width=1200;c.height=1500;const ctx=c.getContext('2d');
  ctx.fillStyle='#07171d';ctx.fillRect(0,0,c.width,c.height);
  const art=document.createElement('canvas');drawAscii(art,result.outcome.digest,900,1400);ctx.globalAlpha=.72;ctx.drawImage(art,350,-20);ctx.globalAlpha=1;
  ctx.fillStyle='#eaf1eb';ctx.font='500 37px "Space Grotesk"';ctx.fillText('stormseed',80,105);
  ctx.fillStyle='#9dafb3';ctx.font='22px "Space Grotesk"';ctx.fillText('A little chaos. A clear answer.',80,165);
  ctx.fillStyle='#d9efae';ctx.font='25px "Space Grotesk"';ctx.fillText(result.mode==='coin'?'The coin landed on':result.mode==='dice'?'The die landed on':'The sky picked',80,570);
  const length=result.displayValue.length;let size=length<5?190:length<10?125:74;
  ctx.fillStyle='#eaf1eb';ctx.font=`${size}px "Space Grotesk"`;
  let lines=wrapText(ctx,result.displayValue,1010);
  while(lines.length*size*1.2>340 && size>35){size-=3;ctx.font=`${size}px "Space Grotesk"`;lines=wrapText(ctx,result.displayValue,1010);}
  lines.forEach((line,i)=>ctx.fillText(line,73,620+size+i*size*1.2));
  const detail=result.mode==='number'?`A number from ${result.config.min} to ${result.config.max}`:result.mode==='dice'?`One ${result.config.max}-sided die`:result.mode==='coin'?'One coin. Two possibilities.':`One of ${result.config.choices.length} choices`;
  ctx.fillStyle='#9dafb3';ctx.font='23px "Space Grotesk"';ctx.fillText(detail,80,1060);
  ctx.strokeStyle='#34505a';ctx.beginPath();ctx.moveTo(80,1130);ctx.lineTo(1120,1130);ctx.stroke();
  ctx.fillStyle='#d9efae';ctx.font='18px "IBM Plex Mono"';ctx.fillText('REAL LIGHTNING + BROWSER RANDOMNESS',80,1190);
  ctx.fillStyle='#9dafb3';ctx.font='19px "IBM Plex Mono"';ctx.fillText(`Snapshot: ${JSON.parse(result.snapshot.material).observedEnd.slice(0,16).replace('T',' ')} UTC`,80,1235);
  ctx.fillText(`Result ${result.outcome.digest.slice(0,12)} · ${result.generatedAt.slice(0,10)}`,80,1270);
  ctx.fillStyle='#eaf1eb';ctx.font='24px "Space Grotesk"';ctx.fillText('Let lightning decide.',80,1370);
  ctx.fillStyle='#9dafb3';ctx.font='19px "IBM Plex Mono"';ctx.fillText('ma4ypic4y.github.io/stormseed',80,1415);
  return new Promise((resolve,reject)=>c.toBlob(blob=>blob?resolve(blob):reject(new Error('Image export failed.')),'image/png'));
}
$('save-card').addEventListener('click',async()=>{
  if(!last)return;const result=last;$('save-card').disabled=true;
  try{download(await makeCard(result),`stormseed-${result.outcome.digest.slice(0,10)}.png`);report('Your piece of the storm is saved.');}catch{report('The card could not be saved. Try again.');}finally{$('save-card').disabled=false;}
});
$('share').addEventListener('click',async()=>{
  if(!last)return;
  const text=`The sky picked ${last.displayValue}. ⚡ A random choice seeded by real lightning.`;
  const url='https://ma4ypic4y.github.io/stormseed/';
  try{if(navigator.share){await navigator.share({title:'Stormseed — Let lightning decide.',text,url});report('Shared.');}else{await navigator.clipboard.writeText(`${text}\n${url}`);report('Result and link copied. Ready to share.');}}catch(error){if(error.name!=='AbortError')report('Sharing is unavailable. You can still save a card.');}
});
if(location.hash==='#how-it-works')openMethod(false);
loadData();setInterval(updateAge,60000);setInterval(()=>{if(!document.hidden)loadData();},1800000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)updateAge();});
