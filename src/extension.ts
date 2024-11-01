import * as vscode from 'vscode';
import { ProblemTreeProvider } from './ProblemTreeProvider';
import { Problem } from './Problem';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "vscode-cses" is now active!');

	const disposable1 = vscode.commands.registerCommand('vscode-cses.openproblem', () => {
		vscode.window.showInputBox({
			prompt: "type id",
		}).then((ans) => 
			vscode.window.showInformationMessage(`Open problem ${ans}!`)
		);
	});

	context.subscriptions.push(disposable1);

	const disposable = vscode.commands.registerCommand('problems-explorer.openproblem', (problemId) => {
		vscode.window.showInformationMessage(`Open problem ${problemId}!`);
	});

	context.subscriptions.push(disposable);

	const problems: Problem[] = [new Problem("hello", 1234, vscode.TreeItemCollapsibleState.Collapsed, {
		command: 'problems-explorer.openproblem',
		title: '',
		arguments: [1234]
	})];

	const problemTreeProvider: ProblemTreeProvider = new ProblemTreeProvider(problems);
	vscode.window.registerTreeDataProvider('problems-explorer', problemTreeProvider);
}

export function deactivate() {}
