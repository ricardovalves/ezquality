import * as vscode from "vscode";
import ollama from "ollama";
import { AppSettings, response, appendToResponse  } from "./store/store";



export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  private _settings: AppSettings;

  constructor(private readonly context: vscode.ExtensionContext) {

    // Load settings initially
    this._settings = this.loadSettings();

    // list to changes in configuration
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration("ezquality")) {
          this._settings = this.loadSettings();
        }
      })
    );
  }

  private loadSettings(): AppSettings {
    const config = vscode.workspace.getConfiguration("ezquality");
    return {
      modelSelection: config.get<string>("modelSelection", "deepseek-coder"),
    };
  }

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,
      localResourceRoots: [this.context.extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.command) {
        case "getSettings":
          // Send settings to webview
          webviewView.webview.postMessage({ 
            command: "loadSettings", 
            settings: this._settings 
        });
        case "saveSettings":
          // Save settings
          if (data.settings) {
            // Update memory copy
            this._settings = data.settings;
            
            // Update VS Code settings
            const config = vscode.workspace.getConfiguration("ezquality");
            for (const [key, value] of Object.entries(data.settings)) {
              await config.update(key, value, vscode.ConfigurationTarget.Global);
            }
            
            // Confirm save
            webviewView.webview.postMessage({ 
              command: "settingsSaved"
            });
          }
        // fetch all available models  
        case "getModels":
          const response = await ollama.list();
          const models = response.models.map((model) => model.name); // Extract model names
          this._view?.webview.postMessage({command: 'getModels', models: models});
      }
    });
  }
  /**
   * Analyses the provided function or piece of code, and generates the unit code
   * @param code - The code to analyse for unit testing generation
   */
  public async createUnitTest(code:string) {
    const system = "You are a seasoned developer. Given the code below, please generate a comprehensive unit test.";
    let responseText = '';

    try {
      const streamResponse = await ollama.chat({
        model: this._settings.modelSelection,
        messages: [
          {role: 'system', content: system},
          {role: 'user', content: code}
        ],
        stream: true
      });

      for await (const part of streamResponse) {
        this._view?.webview.postMessage({
          command: 'chatResponse',
          text: part.message.content
        });
      }
      // Notify webview when done
      this._view?.webview.postMessage({ command: "chatResponseComplete" });
    } catch (err) {
      response.set(`Error: ${String(err)}`);
      this._view?.webview.postMessage({ command: "chatResponseError", text: `Error: ${String(err)}` });
    }
  }

  /**
   * Takes as input a piece of code, or a full function or class, analyses it, and explains it in natural language
   * @param code - The code to be analysed and explained
   */
  public async explainCode(code:string) {
    const system = "You are a seasoned developer. Given the code below, please explain what it does.";

    let responseText = '';

    try {
      const streamResponse = await ollama.chat({
        model: this._settings.modelSelection,
        messages: [
          {role: 'system', content: system},
          {role: 'user', content: code}
        ],
        stream: true
      });

      for await (const part of streamResponse) {
        responseText += part.message.content;
        this._view?.webview.postMessage({command: 'chatResponse', text: responseText });
      }
    } catch (err) {
      this._view?.webview.postMessage({command: 'chatResponse', text: `Error: ${String(err)}`});
    }
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "out", "compiled/Sidebar.js")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "vscode.css")
    );

    const webViewCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "media", "webview.css")
    );

    return /*html*/`
    <!DOCTYPE html>
			<html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${styleVSCodeUri}" rel="stylesheet">
          <link href="${webViewCodeUri}" rel="stylesheet">
          <script> 
            const tsvscode = acquireVsCodeApi();
          </script>
        </head>
        <body>
          <script src="${scriptUri}"></script>
        </body>
			</html>`;
  }
}