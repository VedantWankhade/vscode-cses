import * as vscode from 'vscode';
import { HTMLElement, parse } from 'node-html-parser';

const openProblemInTab = async (html: HTMLElement) => {
    const name = html.querySelector('title')?.text;
    const id = html.querySelector('input[name=task]')?.getAttribute('value');
    if (name === undefined || id === undefined) {throw Error("Some error occurred");}
    const problemView : vscode.WebviewPanel = vscode.window.createWebviewPanel('problem', name + id, vscode.ViewColumn.Active);
    problemView.webview.html = html.toString();
    const probDoc = await vscode.workspace.openTextDocument({
        content: `/**\nProblem Name: ${name}\nProblem ID: ${id}\n*/`,
        language: 'java'
    });
    console.log(probDoc.uri, probDoc.fileName);
    probDoc.save().then((saved: boolean) => {
        console.log("saved: " + saved);
    });
    vscode.workspace.onDidSaveTextDocument(doc => {
        vscode.window.showTextDocument(doc, {
           viewColumn: vscode.ViewColumn.Beside 
        });
    });
};

const getProblem = (id: number) => {

    fetch(`https://cses.fi/problemset/task/${id}`)
    .then((response) => response.text())
    .then((result) => {
        const root = parse(result);
        console.log(result);
        const idEl = root.querySelector(`input[name=task]`);
        if (idEl === null) {
            vscode.window.showErrorMessage("Problem not found");
        } else {
            console.log('Problem found - ' + idEl.getAttribute('value'));
            vscode.window.showInformationMessage('Problem found - ' + idEl.getAttribute('value'));
            const problem = openProblemInTab(root);
            console.log(problem);
        }
    })
    .catch((error) => vscode.window.showErrorMessage(error));
};

export {
    getProblem
};
