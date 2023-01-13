const headTitle = document.title;
const DEFAULT_VOLUME = 30;
const DEFAULT_CUTOFF = 300;
let vol = DEFAULT_VOLUME;
let cutoff = DEFAULT_CUTOFF;

class Noise {
  constructor(settings) {
    this.audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    this.noiseNode = this.audioContext.createBufferSource();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = 0;
    this.volume = settings.volume ?? 0.5; // init volume
    this.isPlaying = false;

    this.filterNode = this.audioContext.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = settings.cutoff || 1000;

    // Node connections
    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination); 
  }

  play() {
    const bufferSize = 10 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(
      1,
      bufferSize,
      this.audioContext.sampleRate
    );
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;
    this.gainNode.gain.setTargetAtTime(this.volume, this.audioContext.currentTime, 1); // Slight Fade in
    this.noiseNode.start();
    this.isPlaying = true;
  }

  stop() {
    // Slight fade out and stop
    this.gainNode.gain.setTargetAtTime(0, this.audioContext.currentTime, 0.1);
    this.noiseNode.stop(this.audioContext.currentTime + 1);
    this.isPlaying = false;
  }
}

const playpauseButton = document.getElementById('playpause');
let newNoise;

playpauseButton.addEventListener('click', () => {
  const buttonIcon = playpauseButton.querySelector('.ic');
  if(buttonIcon.classList.contains('ic-play')) {
    buttonIcon.classList.remove('ic-play');
    buttonIcon.classList.add('ic-pause');
    newNoise = new Noise({ volume: vol/100, cutoff: 300 });
    newNoise.play();
  } else {
    buttonIcon.classList.remove('ic-pause');
    buttonIcon.classList.add('ic-play');
    newNoise.stop();
  }
});

// Credits: https://www.freecodecamp.org/news/javascript-debounce-example/
function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function initNoiseMaker(){
  const settings = {
    volume: vol / 100,
    cutoff: 300
  }
  newNoise = new Noise(settings);
  newNoise.play();
}

let volDial = document.getElementById('vol');
let speaker = document.getElementById('speaker');
let dial = document.getElementById('dial');
let cutoffDial = document.getElementById('cutoff-dial');
let body = document.body;

const volClick = (event) => {
  // localStorage.setItem('volume', e);
  var startX = event.clientX;
  var startY = event.clientY;
  var startVol = vol;

  function drag(e){
    body.style.cursor = 'grabbing';
    volDrag(e.clientX,e.clientY,startX,startY,startVol);
  }
  // const drag = debounce((e) => {volDrag(e.clientX,e.clientY,startX,startY,startVol);});

  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', function undrag(){
    window.removeEventListener('mousemove', drag);
    body.style.cursor = 'unset';
    window.removeEventListener('mouseup', undrag);
  });
};

const cutoffChange = (event) => {
  // localStorage.setItem('volume', e);
  var startX = event.clientX;
  var startY = event.clientY;
  var startVol = vol;

  function drag(e){
    body.style.cursor = 'grabbing';
    cfDrag(e.clientX,e.clientY,startX,startY,startVol);
  }
  // const drag = debounce((e) => {volDrag(e.clientX,e.clientY,startX,startY,startVol);});

  window.addEventListener('mousemove', drag);
  window.addEventListener('mouseup', function undrag(){
    window.removeEventListener('mousemove', drag);
    body.style.cursor = 'unset';
    window.removeEventListener('mouseup', undrag);
  });
};

const checkStartNoise = debounce(() => {
  if(newNoise.isPlaying) {
    newNoise.stop();
    initNoiseMaker();
  }
});

const updateVol = () => {
  dial.style.transform = `rotate(${vol * 1.8}deg)`;
  if(vol < 1) {
    speaker.style.opacity = 0.4;
    dial.style.opacity = 0.4;
  } else {
    speaker.style.opacity = 1;
    dial.style.opacity = 1;
  }
  checkStartNoise();
}

const updateCf = () => {
  cutoffDial.style.transform = `rotate(${vol * 1.8}deg)`;
  if(vol < 1) {
    speaker.style.opacity = 0.4;
    dial.style.opacity = 0.4;
  } else {
    speaker.style.opacity = 1;
    dial.style.opacity = 1;
  }
  checkStartNoise();
}

function volDrag(x,y, startX, startY, startVol){
  var moveDist = (x - startX + startY - y) / window.innerHeight;
  var volChange = (moveDist / 0.75) * 100;
  vol = Math.max(Math.min((startVol + volChange), 100),0);
  updateVol();
}

function cfDrag(x,y, startX, startY, startVol){
  var moveDist = (x - startX + startY - y) / window.innerHeight;
  var volChange = (moveDist / 0.75) * 100;
  vol = Math.max(Math.min((startVol + volChange), 100),0);
  updateCf();
}

updateVol();