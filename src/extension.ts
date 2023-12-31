// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const lineToInsetMap = new Map<number, { inset: vscode.WebviewEditorInset, audioUrl: string }>();
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "audiocomments" is now active!');

	// Define the directory where audio recordings will be saved
	const audioDir = path.join(__dirname, '../electron_app/audio_recordings');

	// Watch for new audio files in the audioDir
	fs.watch(audioDir, (eventType, filename) => {
		if (eventType === 'rename' && filename && filename.endsWith('.mp3')) {
			const audioUrl = path.join(audioDir, filename);
			const editor = vscode.window.activeTextEditor;
			if (editor) {
				const text = editor.document.getText();
				const lines = text.split('\n');
				lines.forEach((lineText, lineNumber) => {
					if (lineText.trim() === '//') {
						if (!lineToInsetMap.has(lineNumber)) {
							const inset = vscode.window.createWebviewTextEditorInset(editor, lineNumber, 3);
							let insetInfo = { inset, audioUrl: '' };
							// If this line has an inset, update its audioUrl
							insetInfo.audioUrl = audioUrl;
							const webviewAudioUrl = insetInfo.inset.webview.asWebviewUri(vscode.Uri.file(audioUrl));
							const webviewAudioUrlString = webviewAudioUrl.toString();
							insetInfo.inset.webview.options = {
								enableScripts: true,
								localResourceRoots: [vscode.Uri.file(path.join(__dirname, '../electron_app/audio_recordings'))]
							};
							insetInfo.inset.webview.html = `<audio controls src="${webviewAudioUrlString}"></audio>`;
							lineToInsetMap.set(lineNumber, insetInfo);
						}
					}
				});
			}
		}
	});
	

	// Listen for changes to the active text editor
	/*const disposable = vscode.workspace.onDidChangeTextDocument((event) => {
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
								<div style="display: flex; flex-direction: column; align-items: flex-start; margin-right: 5px;">
									<audio id="audio" controls style="width: 200px;"></audio>
								</div>
							</div>
							<script>
								// Pre-existing audio URL
								const audioUrl = "https://example.com/some-audio-file.mp3";

								document.getElementById("audio").src = audioUrl;
								document.getElementById("status").textContent = "Audio Loaded";
							</script>
						`;

						// Mark this line as processed
						lineToInsetMap.set(lineNumber, inset);
					}
				}
            });
        }
    });

	context.subscriptions.push(disposable);*/
}

// This method is called when your extension is deactivated
export function deactivate() {}
