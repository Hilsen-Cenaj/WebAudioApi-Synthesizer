// ========================================================
// Global Variables
// ========================================================
const volumeButton = document.getElementById('volume');
const start_button = document.getElementById('start');
const frequency_button = document.getElementById('frequency');

var myAudioContext;
var oscillator, analyser, gainNode;
var state="stopped";


function audioSetup() {
	myAudioContext = new (window.AudioContext || window.webkitAudioContext)();

	gainNode = myAudioContext.createGain();
	analyser = myAudioContext.createAnalyser();
	oscillator = myAudioContext.createOscillator();
	oscillator.type = 'triangle';
	oscillator.start();
	oscillator.connect(gainNode);
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
		gainNode.gain.value=1;
		start_button.innerHTML="Stop Audio";
		state="playing";
	}else{
		gainNode.gain.value=0;
		state="stopped";
		start_button.innerHTML="Start Audio";
	}
},false);

audioSetup();

// ========================================================
// Volume Bar
// ========================================================
volumeButton.addEventListener('input',function(){	
	gainNode.gain.value=this.value/100;
},false);

// ========================================================
// Frequecy Bar
// ========================================================
frequency_button.addEventListener('input',function(){
	oscillator.frequency.value()
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