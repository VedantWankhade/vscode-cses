import * as vscode from 'vscode';
import * as api from './api';

const openProblem = (id: number) => {
    vscode.window.showInformationMessage(`Open problem ${id}!`);
    api.getProblem(id);
};

export {
    openProblem
};