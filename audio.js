
var myAudioContext;
var oscillator;
function audioSetup() {
	// Variables
	var frequencyLabel;
	var volumeLabel;
	var start_button = document.getElementById('start');

	myAudioContext = new (window.AudioContext || window.webkitAudioContext)();
	
	var gainNode;
	
	var state="stopped";
	
	
    //gainNode = myAudioContext.createGainNode();
  
    
  
    //gainNode.connect(myAudioContext.destination);
    
	
	//Play/Stop Button
	start_button.addEventListener('click', function() {
	  if (myAudioContext.state === 'suspended') {
		   myAudioContext.resume();
	   }
		if(state==="stopped"){
			oscillator = myAudioContext.createOscillator();
			oscillator.type = 'triangle';
			oscillator.connect(myAudioContext.destination);
			oscillator.start();
			state="playing";
		}else{
			oscillator.stop(myAudioContext.currentTime +0.5);
			oscillator.disconnect(myAudioContext.destination);
			state="stopped";
			delete oscillator
		}
	},false);
};


audioSetup();

// ========================================================
// Create Wave Form
// ========================================================

const analyser = myAudioContext.createAnalyser();
oscillator.connect(analyser);

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