const { ipcRenderer } = require('electron');
const fs = require('fs');

let mediaRecorder;
let audioChunks = [];

document.addEventListener('DOMContentLoaded', (event) => {

    const statusElement = document.getElementById('status');

    ipcRenderer.on('toggle-recording', () => {

        console.log('Toggle Recording Event Received');

        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            audioChunks = [];
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream, {mimeType:'audio/webm; codecs=opus'});
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm; codecs=opus' });
                    const reader = new FileReader();
                    reader.onload = function() {
                      const buffer = Buffer.from(reader.result);
                      const audioFile = `audio_recordings/audio_${Date.now()}.webm`;
                      fs.writeFileSync(audioFile, buffer);
                      statusElement.textContent = "Recording saved";
                    };
                    reader.readAsArrayBuffer(audioBlob);
                };
                mediaRecorder.start();
                statusElement.textContent = "Recording started";
            });
        }
    });
});
