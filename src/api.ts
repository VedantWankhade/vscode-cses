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

const submitProblem = (id: number, code: string, cookie: string, csrf: string, filename: string, lang: string) => {
    const headers = new Headers();
    headers.append("Cookie", cookie);
    headers.append("Content-Type", "multipart/form-data; boundary=---------------------------105128400631089985942818395571");
    headers.append("Host", "cses.fi");
    headers.append("Origin", "https://cses.fi");
    headers.append("Referer", `https://cses.fi/problemset/submit/${id}/`);
    headers.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/jxl,image/webp,image/png,image/svg+xml,*/*;q=0.8");
    
    const raw = `-----------------------------105128400631089985942818395571\nContent-Disposition: form-data; name="csrf_token"\n\n${csrf}\n-----------------------------105128400631089985942818395571\nContent-Disposition: form-data; name="task"\n\n${id}\n-----------------------------105128400631089985942818395571\nContent-Disposition: form-data; name="file"; filename="${filename}"\nContent-Type: text/x-${lang.toLowerCase()}\n\n${code}\n\n-----------------------------105128400631089985942818395571\nContent-Disposition: form-data; name="lang"\n\n${lang}\n-----------------------------105128400631089985942818395571\nContent-Disposition: form-data; name="type"\n\ncourse\n-----------------------------105128400631089985942818395571\nContent-Disposition: form-data; name="target"\n\nproblemset\n-----------------------------105128400631089985942818395571--\n`;
    
    const options: RequestInit = {
      method: "POST",
      headers: headers,
      body: raw,
      redirect: "manual"
    };

    console.log('submitting');    
    // fetch("https://cses.fi/course/send.php", options)
    //   .then((response) => response.text())
    //   .then((result) => console.log(result))
    //   .catch((error) => console.error(error));
};