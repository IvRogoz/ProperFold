import * as vscode from 'vscode';

export async function foldAllHandler(context: vscode.ExtensionContext): Promise<void> {
    const textEditor = vscode.window.activeTextEditor;
    if (textEditor === null) {
        return;
    }
    const document = textEditor.document;
    const text = document.getText();
    const foldRanges: vscode.Range[] = [];
    const stack: {char: string, pos: vscode.Position}[] = [];

    let match;
    const regex = /[{}]/g; // Regular expression to find all { and }
    while ((match = regex.exec(text)) !== null) {
        const char = match[0];
        const pos = document.positionAt(match.index);

        if (char === '{') {
            stack.push({ char, pos });
        } else if (char === '}' && stack.length > 0 && stack[stack.length - 1].char === '{') {
            const start = stack.pop()!.pos;
            const end = pos.translate(0, 1);
            if (stack.length === 0) { // Only consider outermost braces
                foldRanges.push(new vscode.Range(start, end));
            }
        }
    }

    // Apply all folding ranges at once
    if (foldRanges.length > 0) {
        for (let range of foldRanges) {
            textEditor.selections = [new vscode.Selection(range.start, range.end)];
            await vscode.commands.executeCommand("editor.createFoldingRangeFromSelection");
        }
    }
}
