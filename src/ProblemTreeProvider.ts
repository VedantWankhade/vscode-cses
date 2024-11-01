import * as vscode from 'vscode';

import { Problem } from './Problem';

export class ProblemTreeProvider implements vscode.TreeDataProvider<Problem> {
    
    private _onDidChangeTreeData: vscode.EventEmitter<Problem | undefined | void> = new vscode.EventEmitter<Problem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<Problem | undefined | void> = this._onDidChangeTreeData.event;

    constructor(private problems: Problem[]) {
        
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: Problem): vscode.TreeItem {
        return element;
    }
    getChildren(element?: Problem): Thenable<Problem[]> {
        if (element === undefined) {
            return Promise.resolve(this.problems);
        }
        return Promise.resolve([]);
    }    
}