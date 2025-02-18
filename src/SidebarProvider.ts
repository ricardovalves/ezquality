import * as vscode from "vscode";
import ollama from "ollama";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
      }
    });
  }

  public async createUnitTest(code:string) {
    const system = "You are a seasoned developer. Given the code below, please generate a comprehensive unit test.";

    let responseText = '';

    let prompt = system + "\n" + code;

    try {
      const streamResponse = await ollama.chat({
        model: 'deepseek-r1:latest',
        messages: [{role: 'user', content: prompt}],
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

  public async explainCode(code:string) {
    const system = "You are a seasoned developer. Given the code below, please explain what it does.";

    let responseText = '';

    let prompt = system + "\n" + code;

    try {
      const streamResponse = await ollama.chat({
        model: 'deepseek-r1:latest',
        messages: [{role: 'user', content: prompt}],
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
    // const styleResetUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    // );
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/Sidebar.js")
    );
    // const styleMainUri = webview.asWebviewUri(
    //   vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.css")
    // );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    // // Use a nonce to only allow a specific script to be run.
    // const nonce = getNonce();

    return /*html*/`
    <!DOCTYPE html>
			<html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="${styleVSCodeUri}" rel="stylesheet">
        </head>
        <body>
          <script src="${scriptUri}"></script>
        </body>
			</html>`;
  }
}