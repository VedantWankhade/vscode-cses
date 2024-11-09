import * as vscode from 'vscode';
import { parse } from 'node-html-parser';
import { openProblemInTab } from './utils';
import { Problem } from './Problem';

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

const submitProblem = async (id: number, code: string, cookie: string, csrf: string, filename: string, lang: string) => {
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

    await fetch("https://cses.fi/course/send.php", options)
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

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
			title: "Submitting",
			cancellable: false
        }, async progress => {
                while (status === 'PENDING' || status.includes('TESTING')) {
                    
                    if (status.includes('TESTING')) {
                        const comp = status.split(" ")[1];
                        let perc = "";
                        for (let i = 0; i < comp.length - 1; i++) {perc += comp[i]; }
                        progress.report({ increment: parseInt(perc) });
                    }
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
                    // reject();
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
        });
      })
      .catch((error) => {
            vscode.window.showErrorMessage("Failed to submit " + error);
            return;
      });
};

const getProblemsList = async (): Promise<Problem[]> => {
    return new Promise((resolve, reject) => {
        fetch("https://cses.fi/problemset/")
        .then((response) => response.text())
        .then((result) => {
            // console.log(result);
            const root = parse(result);
            const problemList = root.querySelectorAll('a[href^="/problemset/task/"]');
            console.log(problemList.length);
            // console.log(problemList[0].text, problemList[0].rawAttributes.href);
        
            const problems: Problem[] = [];
            
            for (let i = 0; i < problemList.length; i++) {
                // console.log(problemList[i].text);
                const id = parseInt(problemList[i].rawAttributes.href.split('/')[3]);
                problems.push(new Problem(problemList[i].text, id, vscode.TreeItemCollapsibleState.Collapsed, {
                    command: 'problems-explorer.openproblem',
                    title: '',
                    arguments: [id]
                }));
            }
            resolve(problems);
        })
        .catch(err => {
            console.log(err);
            vscode.window.showErrorMessage("Error fetching problem set " + err);
            reject("errror");
        });
    });
};

const getSession = async (): Promise<string[]> => {
    return new Promise(async (resolve, reject) => {
        console.log("getting session");
        await fetch('https://cses.fi/login')
        .then(async res => {
            const cookie = res.headers.getSetCookie()[0];
            const cookieValue = cookie.slice(0, cookie.indexOf(';'));
            console.log(cookie, cookieValue);
            const root = parse(await res.text());
            const csrf = root.querySelector('input[name="csrf_token"]')?.rawAttributes.value;
            console.log(csrf);
            if (csrf === undefined || csrf === '' || cookieValue === undefined || cookieValue === '') {
                throw new Error("csrf or cookie is invalid");
            }
            vscode.workspace.getConfiguration('vscode-cses').update('csrf', csrf, true);
            vscode.workspace.getConfiguration('vscode-cses').update('cookie', cookieValue, true);
            resolve([cookieValue, csrf]);
        })
        .catch(err => {
            console.log("cannot get session", err);
            vscode.window.showErrorMessage('Cannot get session', err);
            reject([]);
        });
    });
};

const login = (cookie: string, csrf: string, user: string, pass: string) => {
    console.log("chippin in");
    const headers = new Headers();
    if (cookie === undefined || cookie === '' || csrf === undefined || csrf === '') {
        console.log('login error');
        vscode.window.showErrorMessage('loginr error');
        return;
    }
    headers.append("Cookie", cookie);
    headers.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    urlencoded.append("csrf_token", csrf);
    urlencoded.append("nick", user);
    urlencoded.append("pass", pass);

    const options: RequestInit = {
        method: "POST",
        headers,
        body: urlencoded,
        redirect: "follow"
    };

    fetch("https://cses.fi/login", options)
    .then(async res => {
        const root = parse(await res.text());
        const resUser = root.querySelector(`a[href^="/user/"]`)?.innerText;
        console.log(resUser);
        if (resUser !== undefined || resUser !== '') {
            vscode.window.showInformationMessage("Logged in as " + resUser);
        }
        else {
            vscode.window.showInformationMessage("Failed to log in");
        }
    })
    .catch((error) => console.error(error));
};

export {
    getProblem, submitProblem, getProblemsList, getSession, login
};