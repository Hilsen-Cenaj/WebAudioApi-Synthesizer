
var myAudioContext;
var oscillator,gainNode,analyser;
var state="stopped";
var start_button = document.getElementById('start');
var frequency_value = document.getElementById('valuefreq');
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

//Play/Stop Button
start_button.addEventListener('click', function() {
	if (myAudioContext.state === 'suspended') {
		 myAudioContext.resume();
	 }
	if(state==="stopped"){
		gainNode.gain.value=1;
		start_button.innerHTML="Stop Oscillator"
		state="playing";
	}else{
		gainNode.gain.value=0;
		state="stopped";
		start_button.innerHTML="Start Oscillator"

	}
},false);
function changeType(type){
	oscillator.type=type;
}

 function changeFrequency(frequency){
	 oscillator.frequency.value=frequency;
	 frequency_value.innerHTML=frequency;
 }
audioSetup();

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
