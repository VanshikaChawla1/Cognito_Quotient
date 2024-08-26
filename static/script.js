feather.replace();

const controls = document.querySelector('.controls');
const cameraOptions = document.querySelector('.video-options>select');
const video = document.querySelector('video');
const canvas = document.createElement('canvas');
const screenshotImage = document.querySelector('img');
const [play, capture] = [...controls.querySelectorAll('button')];
const info = document.querySelector('.info-text')
const results = document.getElementById('results')
let streamStarted = false;
let stream;
const constraints = {
    video: {
        facingMode: 'environment'
    },
    audio : true
}

const getCameraSelection = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    const options = videoDevices.map(videoDevice => {
        return `<option value="${videoDevice.deviceId}">${videoDevice.label || 'Unknown'}</option>`;
    });
    cameraOptions.innerHTML = options.join('');
};
play.onclick = () => {
    if (video.paused && streamStarted){ 
        video.play()
        play.innerHTML = `<i data-feather="pause"></i>`
        feather.replace();
        return;
    }
    if (streamStarted) {

        stream.getTracks().forEach(track => {
            if (track.readyState == 'live') {
                track.stop();
            }
        });
        play.innerHTML = `<i data-feather="play"></i>`
        feather.replace();
        streamStarted = false;
        info.style.color = 'white'
        return;
    }
    if ('mediaDevices' in navigator && navigator.mediaDevices.getUserMedia) {
        const updatedConstraints = {
            ...constraints,
            deviceId: {
                exact: cameraOptions.value
            }
        };
        startStream(updatedConstraints);
    }
};



const startStream = async (constraints) => {
    stream = await navigator.mediaDevices.getUserMedia(constraints);
    info.style.color = 'transparent';
    handleStream(stream);
};

const handleStream = (stream) => {
    video.srcObject = stream;
    play.innerHTML = `<i data-feather="square"></i>`
    feather.replace();
    streamStarted = true;
};

let mediaRecorder;
let recordedChunks = [];

const startRecording = () => {

    recordedChunks = [];

    const stream = video.captureStream();
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.start();
    console.log("Recording started");

};

const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        // Stop recording
        mediaRecorder.stop();
        console.log("Recording stopped");

        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            search(blob);
        };
    }
};


document.getElementById('startButton').addEventListener('click', startRecording);
document.getElementById('stopButton').addEventListener('click', stopRecording);

const showLoading = () => {
    results.innerHTML = `<span class="loading">Loading</span>`
    results.scrollIntoView({ behavior: 'smooth' })
}


const search = (videoBlob) => {
    const formData = new FormData();
    formData.append('video', videoBlob, 'recording.webm');

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        // Handle success response
    })
    .catch((error) => {
        console.error('Error:', error);
        // Handle error response
    });
};
getCameraSelection();
