// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const cp = require('child_process');
const path = require('path');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
let myStatusBarItem;

var isEnableBuilding = true
var isWorking = false

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "beact-plugin" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	/*const disposable = vscode.commands.registerCommand('beact-plugin.enable', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Beact!');
	});*/

	const myCommandId = 'beact-plugin.enable';
	context.subscriptions.push(vscode.commands.registerCommand(myCommandId, () => {
		isEnableBuilding = !isEnableBuilding
		updateStatusBarItem();
		const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
		if (isEnableBuilding) {
			vscode.window.showInformationMessage(`Beact is enabled`);
		} else {
			vscode.window.showInformationMessage(`Beact is disabled`);
		}
	}));

	// create a new status bar item that we can now manage
	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	myStatusBarItem.command = myCommandId;
	myStatusBarItem.tooltip = 'Click to enable/disable Beact';;
	context.subscriptions.push(myStatusBarItem);

	// register some listener that make sure the status bar 
	// item always up-to-date
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
	//context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem));

	// update status bar item once at start
	updateStatusBarItem();


	vscode.workspace.onDidSaveTextDocument((document) => {
		/*vscode.workspace.workspaceFolders.forEach(folder => {
			vscode.window.showInformationMessage(`Folder ${folder.uri.fsPath}`);
		})*/
		if (isEnableBuilding) {
			//extension.runCommands(document);
			isWorking = true
			console.log('Document saved', document.fileName);
			var filePath = path.dirname(document.fileName);
			if (vscode.workspace.workspaceFolders.length != 0) {
				if (isWithin(vscode.workspace.workspaceFolders[0].uri.fsPath, document.fileName)) {
					filePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
				}
			}

			console.log('File name', filePath);
			myStatusBarItem.text = `$(loading~spin) Building the project...`;
			cp.exec(`beact build`, {
				cwd: filePath
			}, (err, stdout, stderr) => {
				console.log('stdout: ' + stdout);
				console.log('stderr: ' + stderr);
				if (err) {
					console.log('error: ' + err);
				}
				myStatusBarItem.text = `$(check) Project built successfully`;
				vscode.window.showInformationMessage(`Build in ${filePath}`);
				setTimeout(() => {
					isWorking = false
					updateStatusBarItem();
				}
					, 2000);
			});
		}


	});

	//context.subscriptions.push(disposable);
}
function isWithin(outer, inner) {
    const rel = path.relative(outer, inner);
    return !rel.startsWith('..\\') && rel !== '..' && rel !== '';
}
function updateStatusBarItem() {
	if (!isWorking) {
		if (isEnableBuilding) {
			myStatusBarItem.text = `Beact is ready`;
		} else {
			myStatusBarItem.text = `$(error) Beact is disabled`;
		}
	}
	myStatusBarItem.show();
}

/*function updateStatusBarItem() {
	const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
	if (n > 0) {
		myStatusBarItem.text = `$(megaphone) ${n} line(s) selected`;
		myStatusBarItem.show();
	} else {
		myStatusBarItem.hide();
	}
	myStatusBarItem.text = `$(megaphone) ${n} line(s) selected`;
		myStatusBarItem.show();
}*/

function getNumberOfSelectedLines(editor) {
	let lines = 0;
	if (editor) {
		lines = editor.selections.reduce((prev, curr) => prev + (curr.end.line - curr.start.line), 0);
	}
	return lines;
}


// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
