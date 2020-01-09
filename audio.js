// ========================================================
// Global Variables
// ========================================================
const volumeButton = document.getElementById('volume');
const start_button = document.getElementById('start');
const frequency_value = document.getElementById('frequency');
const attack_value = document.getElementById('attack');
const decay_value = document.getElementById('decay');
const sustain_value = document.getElementById('sustain');
const release_value= document.getElementById('release');
const adsr_button = document.getElementById('adsr');





var myAudioContext;
var oscillator,gainNode,analyser,vcf,vca;
var state="stopped";
var typeOscillator='triangle';
var activeNotes={};


//KEYCODE TO MUSICAL FREQUENCY CONVERSION
  const keyboardFrequencyMap = {
    '90': 261.625565300598634,  //Z - C
    '83': 277.182630976872096, //S - C#
    '88': 293.664767917407560,  //X - D
    '68': 311.126983722080910, //D - D#
    '67': 329.627556912869929,  //C - E
    '86': 349.228231433003884,  //V - F
    '71': 369.994422711634398, //G - F#
    '66': 391.995435981749294,  //B - G
    '72': 415.304697579945138, //H - G#
    '78': 440.000000000000000,  //N - A
    '74': 466.163761518089916, //J - A#
    '77': 493.883301256124111,  //M - B
    '81': 523.251130601197269,  //Q - C
    '50': 554.365261953744192, //2 - C#
    '87': 587.329535834815120,  //W - D
    '51': 622.253967444161821, //3 - D#
    '69': 659.255113825739859,  //E - E
    '82': 698.456462866007768,  //R - F
    '53': 739.988845423268797, //5 - F#
    '84': 783.990871963498588,  //T - G
    '54': 830.609395159890277, //6 - G#
    '89': 880.000000000000000,  //Y - A
    '55': 932.327523036179832, //7 - A#
    '85': 987.766602512248223,  //U - B
  }
window.addEventListener('keydown',keyDown,false);
window.addEventListener('keyup',keyUp,false);

function keyDown(event){
	const note=(event.detail || event.which).toString();
	if(!activeNotes[note] && keyboardFrequencyMap[note]){
		playNote(note)
	}
}

function keyUp(event){
	const note=(event.detail || event.which).toString();
	if(activeNotes[note] && keyboardFrequencyMap[note]){
		activeNotes[note].stop();
		delete activeNotes[note];
	}
}

function playNote(note){
	var osc=myAudioContext.createOscillator();
	osc.type=typeOscillator;
	osc.frequency.setValueAtTime(keyboardFrequencyMap[note],myAudioContext.currentTime);
	activeNotes[note]=osc;
	activeNotes[note].connect(gainNode);
	activeNotes[note].start();


}
function audioSetup() {
	myAudioContext = new (window.AudioContext || window.webkitAudioContext)();
	gainNode = myAudioContext.createGain();
	analyser = myAudioContext.createAnalyser();
	vcf=myAudioContext.createBiquadFilter();
	vca=myAudioContext.createGain();
	gainNode.connect(analyser);
	analyser.connect(myAudioContext.destination);

};

// ========================================================
// Start/Stop Button
// ========================================================
start_button.addEventListener('click', function() {
	if (myAudioContext.state === 'suspended') {
		 myAudioContext.resume();
	 }
	if(state==="stopped"){
		oscillator = myAudioContext.createOscillator();
		oscillator.type = typeOscillator;
		oscillator.start();
		oscillator.connect(gainNode);
		start_button.innerHTML="Stop Audio";
		state="playing";
	}else{
		oscillator.stop();
		delete oscillator
		state="stopped";
		start_button.innerHTML="Start Audio";
	}
},false);



function changeType(type){
	typeOscillator=type;
	if(oscillator){
		oscillator.type=type;
	}
}

 function changeFrequency(frequency){
	 oscillator.frequency.value=frequency;
	 frequency_value.innerHTML=frequency;
 }
 
 // ========================================================
// adsr functions
// ========================================================

  function changeattack(attack){
	 oscillator.attack.value=attack;
	 attack_value.innerHTML=attack;
 }
  function changedecay(decay){
	 oscillator.decay.value=decay;
	 decay_value.innerHTML=decay;
 }
  function changesustain(sustain){
	 oscillator.sustain.value=sustain;
	 sustain_value.innerHTML=sustain;
 }
  function changerelease(release){
	 oscillator.release.value=release;
	 release_value.innerHTML=release;
 }

 
audioSetup();

// ========================================================
// Volume Bar
// ========================================================
volumeButton.addEventListener('input',function(){
	gainNode.gain.value=this.value/100;
},false);

// ========================================================
// adsr start
// ========================================================





adsr_button.addEventListener('click',function(){
	  
	 // oscillator = myAudioContext.createOscillator();
		//oscillator.type = typeOscillator;
		//oscillator.start();
		//oscillator.connect(gainNode);
	  
	  oscillator = myAudioContext.createOscillator();
      gainNode = myAudioContext.createGain();
	  
	  oscillator.connect(gainNode);
      gainNode.connect(myAudioContext.destination);
	  
	  
	  const t0 = myAudioContext.currentTime;
      oscillator.start(t0);
                 // vol:0 
   // gainNode.gain.setValueAtTime(0, t0);              error
                 // attack
      const t1 = t0 + attack;
    //  gainNode.gain.linearRampToValueAtTime(1, t1);   error
                 // decay
      const t2 = decay;
    // gainNode.gain.setTargetAtTime(sustain, t1, t2);  error
	
	  const t = myAudioContext.currentTime;
      gainNode.gain.cancelScheduledValues(t);
      gainNode.gain.setValueAtTime(gainNode.gain.value, t);
      gainNode.gain.setTargetAtTime(0, t, release);
    
      const stop = setInterval(() => {
     
        if (gainNode.gain.value < 0.01) {
          oscillator.stop();
          clearInterval(stop);
        }
      }, 10);
	
	
},false);


// ========================================================
// Create Wave Form
// ========================================================

var canvas = document.querySelector('.visualizer');
var myCanvas = canvas.getContext("2d");
analyser.fftSize = 1024;

const waveform = new Float32Array(analyser.frequencyBinCount);
analyser.getFloatTimeDomainData(waveform);

function updateWaveForm() {
  requestAnimationFrame(updateWaveForm);
  analyser.getFloatTimeDomainData(waveform);
}

// ========================================================
// Draw Oscilloscope
// ========================================================

function drawOscilloscope() {
	requestAnimationFrame(drawOscilloscope);

	const scopeCanvas = document.getElementById('oscilloscope');
	const scopeContext = scopeCanvas.getContext('2d');

	scopeCanvas.width = waveform.length;
	scopeCanvas.height = 200;

	scopeContext.clearRect(0, 0, scopeCanvas.width, scopeCanvas.height);
	scopeContext.beginPath();

	for (let i = 0; i < waveform.length; i++) {
		const x = i;
		const y = (0.5 + waveform[i] / 2) * scopeCanvas.height;

		if (i == 0) {
		  scopeContext.moveTo(x, y);
		} else {
		  scopeContext.lineTo(x, y);
		}
	}

	scopeContext.strokeStyle = '#5661FA';
	scopeContext.lineWidth = 2;
	scopeContext.stroke();
}

drawOscilloscope();
updateWaveForm();
