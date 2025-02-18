// eslint-disable-next-line @typescript-eslint/naming-convention
import * as _vscode from "vscode";

declare global {
    const tsvscode: {
        postMessage: ({ command:string, text:any}) => void;
        
    };
} 