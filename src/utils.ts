import * as vscode from 'vscode';

const getConfigValue = (prop: string): string | undefined => {
    const config = vscode.workspace.getConfiguration('vscode-cses');
    
    let propVal: string | undefined = config.get(prop);
    
    if (propVal === undefined || propVal === '') {
        vscode.window.showWarningMessage(`Please set ${prop} value in extension setting`);
    }

    return propVal;
};

export {
    getConfigValue
};