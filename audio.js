// ========================================================
// Global Variables
// ========================================================
const volumeButton = document.getElementById('volume');
const start_button = document.getElementById('start');
const frequency_value = document.getElementById('frequency');
const volume_text=document.getElementById('vol_value');
const freq_text=document.getElementById('freq_value');
const cutoff_text=document.getElementById('cutoff_value');
const peak_text=document.getElementById('peak_value');
const vcf_button=document.getElementById('vcf');
const lfo_button=document.getElementById('lfo');
const attack_slider = document.getElementById('attack_slider');
const decay_slider=document.getElementById('decay_slider');
const sustain_slider=document.getElementById('sustain_slider');
const release_slider=document.getElementById('release_slider');

var myAudioContext;
var typeLFO=0;//1->Tremolo,2->Vibrato
var oscillator,gainNode,analyser,vcf,vca,lfo,osc, adsr;
var state="stopped";
var typeOscillator='triangle';
var activeNotes={};

// ========================================================
// KEYCODE TO MUSICAL FREQUENCY CONVERSION
// ========================================================
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
    vcf.Q.setValueAtTime(0.0001, myAudioContext.currentTime);
		activeNotes[note].stop();
		activeNotes[note].disconnect(vcf);
		activeNotes[note].disconnect(gainNode);
    activeNotes[note].disconnect(adsr);
		delete activeNotes[note];
	}
}

function playNote(note){
	osc=myAudioContext.createOscillator();
	osc.type=typeOscillator;
	osc.connect(vcf);
	activeNotes[note]=osc;
  activeNotes[note].connect(adsr);
	activeNotes[note].connect(gainNode);
	osc.frequency.setValueAtTime(keyboardFrequencyMap[note],myAudioContext.currentTime);
	activeNotes[note].start();

}

// ========================================================
// CREATE AUDIO SETUP
// ========================================================
function audioSetup() {
	myAudioContext = new (window.AudioContext || window.webkitAudioContext)();

	gainNode = myAudioContext.createGain();

	analyser = myAudioContext.createAnalyser();

	vcf=myAudioContext.createBiquadFilter();
	vcf.type="lowpass"
	adsr = myAudioContext.createGain();


	gainNode.connect(analyser);
	analyser.connect(myAudioContext.destination);

};

// ========================================================
// LFO Types (Tremolo, Vibrato)
// ========================================================
function changeLFOtype(type){
  if(typeLFO!=0){
    if(typeLFO===2){
      gainNode.disconnect(oscillator.detune);

    }
    lfo.stop();
    lfo.disconnect();
    delete lfo;
  }
	if(type==="Tremolo"){
		typeLFO=1;
	}else if(type==="Vibrato"){
		typeLFO=2;
  }
  if(typeLFO!=0){

      lfo=myAudioContext.createOscillator();
      if(typeLFO===1){
    		lfo.frequency.value=5;
        lfo.connect(gainNode.gain);

    	}else if(typeLFO===2){
        if(state==="playing"){
          gainNode.connect(oscillator.detune);

        }
    		lfo.frequency.value=2;
        lfo.connect(gainNode);

    	}

      lfo.start();

  }
}


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

		oscillator.connect(vcf);
		//------------------ADSR-----------------------//

		oscillator.connect(adsr);

		adsr.connect(gainNode);
		// attack
		const t1 = attack_slider.value;
		adsr.gain.linearRampToValueAtTime(1, t1);
		// decay
		const t2 = decay_slider.value;
		adsr.gain.setTargetAtTime(sustain_slider.value, t1, t2);
		//--------------------------------------------//

		oscillator.connect(gainNode);

		start_button.innerHTML="Stop Audio";
		state="playing";

    lfo_button.disabled=false;
	}else{
		vcf.Q.setValueAtTime(0.0001, myAudioContext.currentTime);

		//------------------ADSR-----------------------//
		const t = myAudioContext.currentTime;
		adsr.gain.cancelScheduledValues(t);
		adsr.gain.setValueAtTime(adsr.gain.value, t);
		adsr.gain.setTargetAtTime(0, t, release_slider.value);

		const stop = setInterval(() => {
			if (adsr.gain.value < 0.01) {
				oscillator.stop();
			}
		}, 10);
		//-----------------------------------------//

		oscillator.disconnect(vcf);

		oscillator.disconnect(gainNode);

		delete oscillator;
		state="stopped";

		start_button.innerHTML="Start Audio";

	}
},false);

// ========================================================
// VCF Button On/Off
// ========================================================
var connected_vcf=0;
vcf_button.addEventListener('click',function(){
	if(connected_vcf===0){
		vcf.connect(gainNode);

		connected_vcf=1;
		vcf_button.style.backgroundColor='#417bcc'
    vcf_button.innerHTML="VCF OFF"
    document.getElementById("slider_cutoff").style.visibility = "visible";
    document.getElementById("slider_peak").style.visibility = "visible";
	}else{
		vcf.disconnect(gainNode);

		connected_vcf=0;
    vcf_button.style.backgroundColor='white'
    vcf_button.innerHTML="VCF ON"
    document.getElementById("slider_cutoff").style.visibility = "hidden";
    document.getElementById("slider_peak").style.visibility = "hidden";
	}

},false);

// ========================================================
// LFO Button On/Off
// ========================================================
var connected_lfo=0;
lfo_button.addEventListener('click',function(){
	if(connected_lfo===0){

    document.getElementById('tr').checked=true;
    document.getElementById('vib').disabled=false;
    document.getElementById('tr').disabled=false;
    changeLFOtype('Tremolo')
		connected_lfo=1;

    document.getElementById('lfo_type').disabled=false;
		lfo_button.style.backgroundColor='#417bcc'
		lfo_button.innerHTML="LFO OFF";
	}else{
    lfo.stop();
    connected_lfo=0;
		lfo_button.style.backgroundColor='white'
		lfo_button.innerHTML="LFO ON";
    document.getElementById('tr').checked=true;
    document.getElementById('vib').disabled=true;
    document.getElementById('tr').disabled=true;
		typeLFO=0;
	}
},false);

// ========================================================
// Change OCILLARATOR Type (Sine, Square, Sawtooth, Triangle)
// ========================================================
function changeType(type){
	typeOscillator=type;
	if(oscillator){
		oscillator.type=type;
	}
}

// ========================================================
// Frequency Slider
// ========================================================
function changeFrequency(frequency){
	freq_text.innerHTML=frequency;
	if(oscillator){
		oscillator.frequency.value=frequency;
	}
}

// ========================================================
// CutOff Hidden Slider
// ========================================================
function changeCutOff(cutoff){
	cutoff_text.innerHTML=cutoff;
	if(connected_vcf===1){
		vcf.frequency.setValueAtTime(cutoff, myAudioContext.currentTime);
	}
}

// ========================================================
// Peak Hidden Slider
// ========================================================
function changePeak(peak){
	peak_text.innerHTML=peak;
	if(connected_vcf===1){
		vcf.Q.setValueAtTime(peak, myAudioContext.currentTime);
	}
}

// Execute AUDIO SETUP
audioSetup();

// ========================================================
// Volume Bar
// ========================================================
volumeButton.addEventListener('input',function(){
	gainNode.gain.setValueAtTime(this.value/100, myAudioContext.currentTime);
	adsr.gain.setValueAtTime(this.value/100, myAudioContext.currentTime);
	volume_text.innerHTML=this.value;
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
