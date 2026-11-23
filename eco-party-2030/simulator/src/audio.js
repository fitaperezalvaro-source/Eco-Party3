let audio, bed, filter, gain, nextNote=0, note=0;
export function activate(){
  if(!globalThis.AudioContext)return;
  if(!audio){
    audio=new AudioContext();
    const buffer=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate);
    const signal=buffer.getChannelData(0);
    for(let i=0;i<signal.length;i++)signal[i]=Math.random()*2-1;
    bed=audio.createBufferSource();bed.buffer=buffer;bed.loop=true;
    filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=420;
    gain=audio.createGain();gain.gain.value=0;
    bed.connect(filter).connect(gain).connect(audio.destination);bed.start();
  }
  if(audio.state==='suspended')audio.resume().catch(()=>{});
}
function tone(freq,when,len,vol,type){
  const osc=audio.createOscillator(), env=audio.createGain();
  osc.type=type;osc.frequency.value=freq;env.gain.value=.0001;
  osc.connect(env).connect(audio.destination);
  env.gain.setValueAtTime(.0001,when);env.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),when+.04);
  env.gain.exponentialRampToValueAtTime(.0001,when+len);
  osc.start(when);osc.stop(when+len);
}
export function chime(s,kind){
  if(!audio||!s.sound||!s.volume)return;
  const tones={collect:[700,930],buy:[440,660,880],win:[523,659,784,1047],map:[392,523,784],rustle:[190]};
  tones[kind].forEach((f,i)=>tone(f,audio.currentTime+i*.075,.16,s.volume*.19,'sine'));
}
export function ambient(s,air){
  if(!audio)return;
  const now=audio.currentTime;
  gain.gain.setTargetAtTime(air&&s.sound?s.volume*.14:0,now,.06);
  if(s.sound&&s.music&&s.volume&&now>=nextNote){
    tone([196,293.66,329.63,392,261.63,329.63,293.66,246.94][note++%8],now,1.4,s.volume*.12,'sine');
    nextNote=now+.8;
  }
}
