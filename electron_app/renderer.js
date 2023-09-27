const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

let mediaRecorder;

document.addEventListener('DOMContentLoaded', (event) => {
    const statusElement = document.getElementById('status');

    ipcRenderer.on('toggle-recording', () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        } else {
            navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                let audioChunks = [];
                mediaRecorder.ondataavailable = event => {
                    audioChunks.push(event.data);
                };
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const reader = new FileReader();
                    reader.onload = function() {
                        const buffer = Buffer.from(reader.result);
                        const oggFilePath = path.join(__dirname, `audio_recordings/audio_${Date.now()}.webm`);
                        fs.writeFileSync(oggFilePath, buffer);
                        const mp3FilePath = oggFilePath.replace('.webm', '.mp3');
                        convertToMp3(oggFilePath, mp3FilePath);
                    };
                    reader.readAsArrayBuffer(audioBlob);
                };
                mediaRecorder.start();
                statusElement.textContent = "Recording started";
            });
        }
    });
});

function convertToMp3(webmFilePath, mp3FilePath) {
    return new Promise((resolve, reject) => {
        ffmpeg(webmFilePath)
            .format('mp3')
            .on('end', () => {
                statusElement.textContent = "Recording saved as MP3";
                // Delete the original .webm file
                fs.unlinkSync(webmFilePath);
                resolve();
            })
            .on('error', (err) => {
                console.log('An error occurred: ' + err.message);
                reject(err);
            })
            .save(mp3FilePath);
    });
}