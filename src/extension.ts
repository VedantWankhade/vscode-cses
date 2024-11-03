import * as vscode from 'vscode';
import { ProblemTreeProvider } from './ProblemTreeProvider';
import { Problem } from './Problem';
import { openProblem, submitProblem } from './commandExecutors';
import { getConfigValue } from './utils';

export function activate(context: vscode.ExtensionContext) {

	// get config
	const config = {
		cookie: getConfigValue('cookie'),
		csrf: getConfigValue('csrf')
	};
	console.log(config);

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
				submitProblem(config, parseInt(id));
			}
		});
	});

	context.subscriptions.push(cmd1);
	context.subscriptions.push(cmd2);
	context.subscriptions.push(cmd3);

	const problems: Problem[] = [new Problem("hello", 1234, vscode.TreeItemCollapsibleState.Collapsed, {
		command: 'problems-explorer.openproblem',
		title: '',
		arguments: [1234]
	})];

	const problemTreeProvider: ProblemTreeProvider = new ProblemTreeProvider(problems);
	vscode.window.registerTreeDataProvider('problems-explorer', problemTreeProvider);
}

export function deactivate() {}
