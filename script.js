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
    }
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
        // Stopping video stream
        stream.getVideoTracks().forEach(track => {
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

capture.onclick = () => {
    takeShot();
}

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

const takeShot = () => {
    if (video.paused || video.ended) {
        return;
    }
    // Pausing player
    video.pause();
    play.innerHTML = `<i data-feather="play"></i>`
    feather.replace();

    // Sending Image to backend
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const img = canvas.toDataURL('image/png');
    showLoading();
    search(img);
}
const showLoading = () => {
    results.innerHTML = `<span class="loading">Loading</span>`
    results.scrollIntoView({ behavior: 'smooth' })
}
const search = (image) => {

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ img: image })
    }).then(res => res.json())
        .then(res => {
            if (res.message) {
                results.innerHTML = `<span>${res.message}</span>`;
                return;
            }
            const wrapper = document.createElement('div');
            wrapper.classList.add('wrapper');

            const name = document.createElement('div');
            name.innerHTML = `Name of Product: <span class='name'>${res.name}</span>`;
            wrapper.appendChild(name);

            const list = document.createElement('ul');
            list.classList.add('recommendations')
            if (res.products) {
                res.products.forEach(elem => {
                    const child = document.createElement('li');
                    child.textContent = elem;
                    list.appendChild(child);
                })
            } else {
                const child = document.createElement('li');
                child.textContent = 'No similar products found';
                list.appendChild(child);
            }
            wrapper.appendChild(list);
            results.innerHTML = '';
            results.appendChild(wrapper);
        })
}
getCameraSelection();
