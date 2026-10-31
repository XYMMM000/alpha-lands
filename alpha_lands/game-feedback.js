/* Synthesized local sound: no audio downloads or microphone access. */
window.AlphaFeedback=(()=>{
  const demo=typeof location!=='undefined'&&new URLSearchParams(location.search).get('demo')==='1';
  let enabled=true,context=null,lastSound=-Infinity,userGesture=false;
  if(!demo)try{enabled=localStorage.getItem('alphaLandsAudioV1')!=='off'}catch{}
  function unlock(){if(!enabled||!userGesture)return;try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!context)context=new Audio();if(context.state==='suspended')context.resume().catch(()=>{})}catch{}}
  function play(kind){if(!enabled)return;unlock();if(!context||context.state!=='running')return;const now=context.currentTime;if(now-lastSound<0.07)return;lastSound=now;
    const notes={combine:[523.25,659.25,783.99],award:[392,523.25,659.25,1046.5],reveal:[659.25,783.99,1046.5,1318.5],tap:[523.25]}[kind]||[523.25];
    try{notes.forEach((frequency,i)=>{const start=now+i*.085,osc=context.createOscillator(),gain=context.createGain();osc.type=i%2?'sine':'triangle';osc.frequency.setValueAtTime(frequency,start);gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.045,start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+.23);osc.connect(gain);gain.connect(context.destination);osc.start(start);osc.stop(start+.25);osc.onended=()=>{osc.disconnect();gain.disconnect()}})}catch{}
  }
  function toggle(){enabled=!enabled;if(!demo)try{localStorage.setItem('alphaLandsAudioV1',enabled?'on':'off')}catch{}if(enabled){unlock();play('tap')}else if(context)context.suspend().catch(()=>{});return enabled}
  function burst(x,y,big=false){if(!document.body||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;let layer=document.querySelector('#fxLayer');if(!layer){layer=document.createElement('div');layer.id='fxLayer';layer.setAttribute('aria-hidden','true');document.body.appendChild(layer)}for(let i=0;i<(big?20:10);i++){const p=document.createElement('i'),angle=i*Math.PI*2/(big?20:10),distance=(big?110:48)+Math.random()*35;p.className='fx-spark';p.style.left=x+'px';p.style.top=y+'px';p.style.setProperty('--dx',Math.cos(angle)*distance+'px');p.style.setProperty('--dy',Math.sin(angle)*distance+'px');p.style.setProperty('--turn',(i*37)+'deg');p.style.background=['#e9bb5a','#91bd8a','#fff5d4'][i%3];layer.appendChild(p);p.addEventListener('animationend',()=>p.remove(),{once:true});window.setTimeout(()=>p.remove(),1300)}}
  function celebrate(element,kind){play(kind);if(!element)return;element.classList.add(kind==='combine'?'combine-born':'reward-glow');const r=element.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,kind!=='combine')}
  function reveal(element){play('reveal');if(!element)return;const show=()=>{element.classList.add('is-revealed');const r=element.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,true)};if(window.requestAnimationFrame)window.requestAnimationFrame(()=>window.requestAnimationFrame(show));else show()}
  const gesture=()=>{userGesture=true;unlock()};document.addEventListener('pointerdown',gesture,{passive:true});document.addEventListener('keydown',gesture,{passive:true});
  return {play,toggle,enabled:()=>enabled,celebrate,reveal};
})();
