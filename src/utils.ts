import { HTMLElement } from 'node-html-parser';
import * as vscode from 'vscode';

const getConfigValue = (prop: string): string | undefined => {
    const config = vscode.workspace.getConfiguration('vscode-cses');
    
    let propVal: string | undefined = config.get(prop);
    
    if (propVal === undefined || propVal === '') {
        vscode.window.showWarningMessage(`Please set ${prop} value in extension setting`);
    }

    return propVal;
};


const openProblemInTab = async (html: HTMLElement) => {
    const name = html.querySelector('title')?.text;
    const id = html.querySelector('input[name=task]')?.getAttribute('value');
    if (name === undefined || id === undefined) {throw Error("Some error occurred");}
    const problemView : vscode.WebviewPanel = vscode.window.createWebviewPanel('problem', name + id, vscode.ViewColumn.Active);
    problemView.webview.html = html.toString();
    const probDoc = await vscode.workspace.openTextDocument({
        content: `/**\nProblem Name: ${name}\nProblem ID: ${id}\n*/`,
        // TODO))
        // create config for preferred language
        language: 'java'
    });
    console.log(probDoc.uri, probDoc.fileName);
    probDoc.save().then((saved: boolean) => {
        console.log("saved: " + saved);
    });
};

export {
    getConfigValue, openProblemInTab
};