import * as vscode from 'vscode';

const openProblem = (id: number) => {
    vscode.window.showInformationMessage(`Open problem ${id}!`);
};

export {
    openProblem
};