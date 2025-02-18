// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	const sidebarProvider = new SidebarProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"ezquality-sidebar",
			sidebarProvider,
		)
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ezquality.createUnitTest', () => {
			const {activeTextEditor} = vscode.window;

			if (!activeTextEditor) {
				vscode.window.showInformationMessage("No active text editor");
				return ;
			}
			const code = activeTextEditor.document.getText(activeTextEditor.selection);
			sidebarProvider.createUnitTest(code);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('ezquality.explainCode', () => {
			const {activeTextEditor} = vscode.window;

			if (!activeTextEditor) {
				vscode.window.showInformationMessage("No active text editor");
				return ;
			}
			const code = activeTextEditor.document.getText(activeTextEditor.selection);
			sidebarProvider.explainCode(code);
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}
