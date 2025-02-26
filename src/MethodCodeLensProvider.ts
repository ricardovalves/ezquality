import * as vscode from 'vscode';

export class MethodCodeLensProvider implements vscode.CodeLensProvider {
    private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;
    
    public provideCodeLenses(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeLens[]> {
        // Check if CodeLens is enabled
        const config = vscode.workspace.getConfiguration('methodCodelens');
        const enabled = config.get<boolean>('enabled', true);
        
        if (!enabled) {
            return [];
        }
        
        
        const codeLenses: vscode.CodeLens[] = [];
        const text = document.getText();
        const languageId = document.languageId;
        
        try {
            // Find method/function definitions based on language
            const methods = this.findMethodsInDocument(document);
            
            for (const method of methods) {
                const { name, range, fullText } = method;
                
                // Create a CodeLens for this method
                const codeLens = new vscode.CodeLens(range, {
                    title: "EZQuality",
                    command: "ezquality.showMenu",
                    arguments: [document.uri.toString(), name, range, fullText]
                });
                
                codeLenses.push(codeLens);
            }
            
        } catch (error) {
        }
        
        return codeLenses;
    }

    public refresh(): void {
        this._onDidChangeCodeLenses.fire();
    }
    
    public resolveCodeLens(
        codeLens: vscode.CodeLens,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.CodeLens> {
        return codeLens;
    }
    
    private findMethodsInDocument(document: vscode.TextDocument): Array<{ name: string, range: vscode.Range, fullText: string }> {
        const text = document.getText();
        const languageId = document.languageId;
        const methods: Array<{ name: string, range: vscode.Range, fullText: string }> = [];
        
        // Use language-specific regex patterns
        let methodRegex: RegExp;
        
        switch (languageId) {
            case 'javascript':
            case 'typescript':
                methodRegex = /(?:function\s+(\w+)|(?:(?:async\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)|(?:(?:async\s+)?(\w+)\s*\([^)]*\)\s*{))/g;
                break;
            case 'python':
                methodRegex = /def\s+(\w+)\s*\([^)]*\):/g;
                break;
            case 'java':
            case 'csharp':
            case 'cpp':
            case 'c':
                methodRegex = /(?:public|private|protected|static|final|abstract|void|int|string|bool|char|double|float)(?:\s+[\w<>\[\],\s]+)?\s+(\w+)\s*\([^)]*\)\s*(?:throws\s+[\w,\s]+)?\s*(?:\{|;)/gi;
                break;
            case 'php':
                methodRegex = /(?:public|private|protected|static|final|abstract)?\s*function\s+(\w+)\s*\([^)]*\)/g;
                break;
            case 'ruby':
                methodRegex = /def\s+(\w+)(?:\s*\([^)]*\)|\s+[^#\n]+)/g;
                break;
            case 'go':
                methodRegex = /func\s+(\w+)\s*\([^)]*\)\s*(?:\([^)]*\)\s*)?\{/g;
                break;
            case 'rust':
                methodRegex = /fn\s+(\w+)\s*\([^)]*\)(?:\s*->\s*[^{]+)?\s*\{/g;
                break;
            default:
                // Generic fallback for other languages
                methodRegex = /(?:function|def|public|private|protected|static|final|async)?\s+(\w+)\s*\([^)]*\)\s*(?:\{|=>|:|is|as|\n)/g;
                break;
        }
        
        let match;
        while ((match = methodRegex.exec(text)) !== null) {
            // Find the method name from the capture groups
            const methodName = match[1] || match[2] || match[3] || 'unknown';
            
            // Create a range for the method signature
            const startPos = document.positionAt(match.index);
            const signatureEndPos = document.positionAt(match.index + match[0].length);
            
            // Now we need to find the entire method body
            const methodStartIndex = match.index;
            let methodEndIndex = this.findMethodEndIndex(text, methodStartIndex, languageId);
            
            // Create range and get full text
            const range = new vscode.Range(startPos, signatureEndPos);
            const fullMethodRange = new vscode.Range(
                startPos,
                document.positionAt(methodEndIndex)
            );
            const fullText = document.getText(fullMethodRange);
            
            methods.push({
                name: methodName,
                range: range,
                fullText: fullText
            });
        }
        
        return methods;
    }
    
    private findMethodEndIndex(text: string, methodStartIndex: number, languageId: string): number {
        // This is a simplified approach to find the end of a method
        // For accurate results, a proper parser should be used
        
        // For languages with curly braces
        if (['javascript', 'typescript', 'java', 'csharp', 'cpp', 'c', 'php', 'go', 'rust'].includes(languageId)) {
            let openBraces = 0;
            let foundFirstOpenBrace = false;
            
            for (let i = methodStartIndex; i < text.length; i++) {
                const char = text[i];
                
                if (char === '{') {
                    foundFirstOpenBrace = true;
                    openBraces++;
                } else if (char === '}') {
                    openBraces--;
                    
                    if (foundFirstOpenBrace && openBraces === 0) {
                        return i + 1; // Include the closing brace
                    }
                }
            }
        }
        
        // For languages with indentation-based blocks (like Python, Ruby)
        if (['python', 'ruby'].includes(languageId)) {
            // Find the indentation level of the method definition
            let methodLineStart = methodStartIndex;
            while (methodLineStart > 0 && text[methodLineStart - 1] !== '\n') {
                methodLineStart--;
            }
            
            const methodIndentation = this.getIndentationLevel(text.substring(methodLineStart, methodStartIndex));
            
            // Find the next line with same or less indentation
            const lines = text.substring(methodStartIndex).split('\n');
            let currentPos = methodStartIndex;
            
            // Skip the first line (method definition)
            currentPos += lines[0].length + 1;
            
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i];
                const lineIndentation = this.getIndentationLevel(line);
                
                // Empty lines or comments don't count for indentation checking
                if (line.trim() === '' || (languageId === 'python' && line.trim().startsWith('#')) || 
                   (languageId === 'ruby' && line.trim().startsWith('#'))) {
                    currentPos += line.length + 1;
                    continue;
                }
                
                // If we find a line with same or less indentation, we've reached the end of the method
                if (lineIndentation <= methodIndentation) {
                    return currentPos;
                }
                
                currentPos += line.length + 1;
            }
        }
        
        // If we couldn't determine the end, return the end of the file
        return text.length;
    }
    
    private getIndentationLevel(text: string): number {
        let spaces = 0;
        for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') {
                spaces++;
            } else if (text[i] === '\t') {
                spaces += 4; // Assuming tab = 4 spaces
            } else {
                break;
            }
        }
        return spaces;
    }
}