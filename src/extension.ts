// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import { MethodCodeLensProvider } from './MethodCodeLensProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	
	registerCodeLensProvider(context);
	registerShowMenuCommand(context);


	// init sidebar
	const sidebarProvider = new SidebarProvider(context);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"ezquality-sidebar",
			sidebarProvider,
		)
	);

	// register create unit test command
	context.subscriptions.push(
		vscode.commands.registerCommand('ezquality.createUnitTest', async () => {
			let code = context.workspaceState.get("selectedMethod");
			if (!code) {
				const {activeTextEditor} = vscode.window;
				if (!activeTextEditor) {
					vscode.window.showInformationMessage("No active text editor");
					return ;
				}
				code = activeTextEditor.document.getText(activeTextEditor.selection);
			} else {
				context.workspaceState.update("selectedMethod", undefined);
			}
			sidebarProvider.createUnitTest(String(code));			
		})
	);

	// register explain code command
	context.subscriptions.push(
		vscode.commands.registerCommand('ezquality.explainCode', async() => {
			let code = context.workspaceState.get("selectedMethod");
			if (!code) {
				const {activeTextEditor} = vscode.window;
				if (!activeTextEditor) {
					vscode.window.showInformationMessage("No active text editor");
					return ;
				}
				code = activeTextEditor.document.getText(activeTextEditor.selection);
			} else {
				context.workspaceState.update("selectedMethod", undefined);
			}
			sidebarProvider.explainCode(String(code));
		})
	);
}

// Register the command that will be executed when the CodeLens is clicked
function registerShowMenuCommand(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand(
        'ezquality.showMenu',
        (uri: string, methodName: string, range: vscode.Range, fullMethodText: string) => {
            
            // Check if the document is still open
            const openDocuments = vscode.workspace.textDocuments;
            let document: vscode.TextDocument | undefined;
            
            for (const doc of openDocuments) {
                if (doc.uri.toString() === uri) {
                    document = doc;
                    break;
                }
            }
            
            if (!document) {
                vscode.window.showErrorMessage(`Unable to execute method: document not found`);
                return;
            }
            
			// Save method text to workspace state (global for this session)
			context.workspaceState.update("selectedMethod", fullMethodText);

	  		vscode.commands.executeCommand("workbench.action.showCommands").then(() => {
				setTimeout(() => {
			  		vscode.env.clipboard.writeText("> EZQuality -  ").then(() => {
						vscode.commands.executeCommand("editor.action.clipboardPasteAction");
			  		});
				}, 100); // Small delay to ensure the palette is open
		  	});
        }
    );
    
    context.subscriptions.push(disposable);
}

function registerCodeLensProvider(context: vscode.ExtensionContext) {
	
	// Register the CodeLens provider for all languages
    const codelensProvider = new MethodCodeLensProvider();
    
    // Register for specific languages
    const supportedLanguages = [
        { language: 'javascript' },
        { language: 'typescript' },
        { language: 'python' },
        { language: 'java' },
        { language: 'csharp' },
        { language: 'php' },
        { language: 'ruby' },
        { language: 'go' },
        { language: 'rust' },
        { language: 'c' },
        { language: 'cpp' }
    ];
    
    for (const language of supportedLanguages) {
        const disposable = vscode.languages.registerCodeLensProvider(
            language,
            codelensProvider
        );
        context.subscriptions.push(disposable);
    }
    
    // Refresh CodeLens when configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('methodCodelens.enabled')) {
                codelensProvider.refresh();
            }
        })
    );
    
    // Force refresh CodeLens on activation
    codelensProvider.refresh();
}


// This method is called when your extension is deactivated
export function deactivate() {}

