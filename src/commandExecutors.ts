import * as vscode from 'vscode';
import * as api from './api';

const openProblem = (id: number) => {
    vscode.window.showInformationMessage(`Open problem ${id}!`);
    api.getProblem(id);
};

const submitProblem =(config: {cookie: string | undefined, csrf: string | undefined}, id: number) => {
    if (config.cookie === undefined) {
        vscode.window.showErrorMessage("Please set cookie value in extension setting");
    }
    if (config.csrf === undefined) {
        vscode.window.showErrorMessage("Please set csrf value in extension setting");
    }
    if (config.csrf === undefined || config.csrf === '' || config.cookie === undefined || config.cookie === '') {
        return;    
    }
    vscode.window.showInformationMessage("Submitting problem " + id);
    console.log("submitting execture");
    
    const textEditor = vscode.window.activeTextEditor;
    if (textEditor === undefined) {
        vscode.window.showErrorMessage("Error reading text document");
        return;
    }
    const _lang = textEditor.document.languageId;
    const lang = _lang.slice(0, 1).toUpperCase() + _lang.slice(1);
    const code = textEditor.document.getText();
    const filePath = textEditor.document.fileName;
    const fileName = filePath.substring(filePath.lastIndexOf('/') + 1);

    api.submitProblem(id, code, config.cookie, config.csrf, fileName, lang);

    // TODO))
    // collect all properties - id, filename, code (text document)
    // call submit problem api
};

export {
    openProblem, submitProblem
};