

function audioSetup() {
	// Variables
	var frequencyLabel;
	var volumeLabel;
	var start_button = document.getElementById('start');

	var myAudioContext = window.AudioContext || window.webkitAudioContext;
	var oscillator;
	var gainNode;

	// Notes
	var lowNote = 261.63; // C4
	var highNote = 493.88; // B4
	
	
	oscillator = myAudioContext.createOscillator();
    gainNode = myAudioContext.createGainNode();
  
    oscillator.type = 'triangle';
	oscillator.frequency.setValueAtTime(440, myAudioContext.currentTime); // value in hertz
  
    gainNode.connect(myAudioContext.destination);
    oscillator.connect(gainNode);
	oscillator.start(0);
  
    
	//Button 
    start_button.addEventListener('click', function () {
		if (songPlaying) {
		  start_button.innerHTML = 'Start Audio';
		  oscillator.start(0);
		} else {
		  song.play();
		  drawOscilloscope();
		  updateWaveForm();
		  start_button.innerHTML = 'Stop Audio';
		  oscillator.stop(0);
		}

		songPlaying = !songPlaying;
	});
})();


audioSetup();

// ========================================================
// Create Wave Form
// ========================================================

const analyser = audioContext.createAnalyser();
masterGain.connect(analyser);

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