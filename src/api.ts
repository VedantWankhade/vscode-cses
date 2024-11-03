import * as vscode from 'vscode';
import { HTMLElement, parse } from 'node-html-parser';

// TODO))
// move to ./utils.ts
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

    // TODO))
    // submit problem
    // start polling for result

    fetch("https://cses.fi/course/send.php", options)
      .then((response) => response.headers.get('Location'))
      .then(async (result) => {
        if (result === null || result === undefined || result === '') {
            vscode.window.showErrorMessage("Failed to get results");
            return;
        }
        let status = 'PENDING';
        const jobid = result.split('/')[3];
        console.log(jobid);
        headers.delete('Content-Type');
        headers.set('Accept', '*/*');
        const formdata = new FormData();
        formdata.append("csrf_token", csrf);

        // TODO))
        // do this using vscode.window.withProgress
        // but it requires asunc call
        while (status === 'PENDING' || status.includes('TESTING')) {
            console.log(status);
            await fetch(`https://cses.fi/ajax/get_status.php?entry=${jobid}`, {
                method: "GET",
                headers,
                // body: formdata,
                redirect: 'manual'
            })
            .then(async res => {
                status = await res.text();
                console.log(status);
            }).catch(err => {console.log(err); status = 'ERROR';});
        }
        if (status === 'ERROR') {
            vscode.window.showErrorMessage("Failed to get results");
            return;
        }
    
        fetch(`https://cses.fi/problemset/result/${jobid}/`, {
            method: 'GET',
            headers,
            redirect: 'manual'
        })
        .then((response) => response.text())
        .then((result) => {
            console.log(result); 
            const resultWebView = vscode.window.createWebviewPanel('result', 'result ' + id, vscode.ViewColumn.Beside);
            resultWebView.webview.html = result;
        })
        .catch((error) => console.error(error));
      })
      .catch((error) => {
            vscode.window.showErrorMessage("Failed to submit " + error);
            return;
      });
};

export {
    getProblem, submitProblem
};