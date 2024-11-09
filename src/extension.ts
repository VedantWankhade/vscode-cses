import * as vscode from 'vscode';
import { ProblemTreeProvider } from './ProblemTreeProvider';
import { Problem } from './Problem';
import { openProblem, submitProblem } from './commandExecutors';
import { getConfigValue } from './utils';
import * as api from './api';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "vscode-cses" is now active!');

	const cmd1 = vscode.commands.registerCommand('vscode-cses.openproblem', () => {
		vscode.window.showInputBox({
			prompt: "Problem ID",
			validateInput: (id) => {
				const res: number = parseInt(id);
				return isNaN(res) ? "Please enter a valid number" : null;
			}
		}).then(id => {
			if (id !== undefined) {
				openProblem(parseInt(id));
			}
		});
	});

	const cmd2 = vscode.commands.registerCommand('problems-explorer.openproblem', problemId => {
		openProblem(problemId);
	});

	const cmd3 = vscode.commands.registerCommand('vscode-cses.submitproblem', () => {
		vscode.window.showInputBox({
			prompt: "Problem ID",
			validateInput: (id) => {
				const res: number = parseInt(id);
				return isNaN(res) ? "Please enter a valid number" : null;
			}
		}).then(id => {
			if (id !== undefined) {
				// get config
				const config = {
					cookie: getConfigValue('cookie'),
					csrf: getConfigValue('csrf')
				};
				console.log(config);
				submitProblem(config, parseInt(id));
			}
		});
	});

	const cmd4 = vscode.commands.registerCommand('vscode-cses.login', () => {
		// TODO)) implement login
		// ask creds
		// get csrf from website berfore login
		// send login request
		// save csrf and cookie to config
		vscode.window.showInputBox()
		.then(user => {
			vscode.window.showInputBox()
			.then(async pass => {
				const [cookie, csrf] = await api.getSession();
				await api.login(cookie, csrf, user === undefined ? '' : user, pass === undefined ? '' : pass);
				api.getProblemsList().then((problems: Problem[]) => {
					console.log(problems);
		
					refreshView(problems);
				}).catch(err => console.log("ERRR: ", err));
			});
		});
		
	});

	context.subscriptions.push(cmd1);
	context.subscriptions.push(cmd2);
	context.subscriptions.push(cmd3);
	context.subscriptions.push(cmd4);

	const config = {
		cookie: getConfigValue('cookie'),
		csrf: getConfigValue('csrf')
	};
	if (config.cookie !== undefined && config.cookie !== '' && config.csrf !== undefined && config.csrf !== '')	{
		api.getProblemsList().then((problems: Problem[]) => {
			console.log(problems);

			refreshView(problems);
		}).catch(err => console.log("ERRR: ", err));
	} else {
		refreshView([]);
	}

	// TODO))
    // needs better implementation
	// restrict to cses activity view
    vscode.workspace.onDidSaveTextDocument(doc => {
        vscode.window.showTextDocument(doc, {
           viewColumn: vscode.ViewColumn.Beside 
        });
    });
}

const refreshView = (problems: Problem[]) => {
	const problemTreeProvider: ProblemTreeProvider = new ProblemTreeProvider(problems);
	vscode.window.registerTreeDataProvider('problems-explorer', problemTreeProvider);
};

export function deactivate() {}
