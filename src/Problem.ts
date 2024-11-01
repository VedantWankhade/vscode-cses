import * as vscode from 'vscode';

export class Problem extends vscode.TreeItem {
    constructor(
        public readonly name: string,
        public readonly problemId: number,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly command?: vscode.Command
    ) {
        super(name, collapsibleState);
        this.tooltip = `${this.name}-${this.problemId}`;
        this.description = this.tooltip;
    }
}