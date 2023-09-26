// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

const lineToInsetMap = new Map<number, vscode.WebviewEditorInset>();
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "audiocomments" is now active!');

	// Listen for changes to the active text editor
	const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            const text = editor.document.getText();
			const lines = text.split('\n');
			lines.forEach((lineText, lineNumber) => {
				if (lineText.includes('//a')) {
                // Check if an inset has already been created for this line
					if (!lineToInsetMap.has(lineNumber)) {
						// Create the inset
						const inset = vscode.window.createWebviewTextEditorInset(editor, lineNumber, 3);
						inset.webview.options = {
							// Allow scripts in the webview
							enableScripts: true,
						};
						// Audio recorder HTML
						inset.webview.html = `
							<div style="display: flex; align-items: center;">
								<div id="status"></div>
								<div style="display: flex; flex-direction: column; align-items: flex-start; margin-right: 5px;">
									<button id="startRecord" style="width: 50px; font-size: 10px; margin-bottom: 2px;">Start</button>
									<button id="stopRecord" style="width: 50px; font-size: 10px;" disabled>Stop</button>
								</div>
								<audio id="audio" controls style="width: 200px;"></audio>
							</div>
							<script>
								let mediaRecorder;
								let audioChunks = [];

								document.getElementById("status").textContent = "Script loaded";
								
								// Get audio stream from the microphone	
								navigator.mediaDevices.getUserMedia({ audio: true })
								.then(stream => {
									mediaRecorder = new MediaRecorder(stream);
									
									mediaRecorder.ondataavailable = event => {
										audioChunks.push(event.data);
									};
									
									mediaRecorder.onstop = () => {
										const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
										const audioUrl = URL.createObjectURL(audioBlob);
										document.getElementById("audio").src = audioUrl;
									};
								}).catch(err => {
									document.getElementById("status").textContent = "Error:" + err;
								});


								// Start Recording
								document.getElementById("startRecord").addEventListener("click", () => {
									mediaRecorder.start();
									document.getElementById("startRecord").disabled = true;
									document.getElementById("stopRecord").disabled = false;
								});

								// Stop Recording
								document.getElementById("stopRecord").addEventListener("click", () => {
									mediaRecorder.stop();
									document.getElementById("startRecord").disabled = false;
									document.getElementById("stopRecord").disabled = true;
									audioChunks = [];
								});
							</script>
						`;

						// Mark this line as processed
						lineToInsetMap.set(lineNumber, inset);
					}
				}
            });
        }
    });

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
