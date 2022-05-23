/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   controllers.ts                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/22 13:34:22 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/22 13:34:22 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as path from 'path';
import * as vscode from 'vscode';
import UVCHDataSubsystem from '../DataSubsystem';
import log_uvch from '../utils/log_uvch';

export interface ICommand {
	action: string,
	content: any
}

export class UVCHWebViewBase
{
	private readonly _BundleFileName: string = '';
	private readonly _Context: vscode.ExtensionContext;
	protected readonly _ViewId: string = '';
	protected _WebView: vscode.WebviewView | undefined;
	protected _ListeningDataKeys: string[] = [];

	constructor(context: vscode.ExtensionContext, bundleFileName: string, viewId: string)
	{
		log_uvch.log(`[UVHC] [View_${viewId}] Create`);

		this._Context = context;
		this._BundleFileName = bundleFileName;
		this._ViewId = viewId;

		vscode.window.registerWebviewViewProvider(this._ViewId, {
			resolveWebviewView: (webView: vscode.WebviewView) => {
				this.InitWebView(webView);
			}
		});
	}

	private InitWebView(webView: vscode.WebviewView): vscode.WebviewView
	{
		if (this._WebView === undefined)
		{
			log_uvch.log(`[UVHC] [View_${this._ViewId}] Init`);

			this._WebView = webView;
			this._WebView.webview.options = {
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.file(path.join(this._Context.extensionPath, 'dist')),
				],
			};

			this._WebView.webview.onDidReceiveMessage(this.OnMessageReceived);
			this._WebView.webview.html = this.GetHTMLHasString();
		}
		return (this._WebView);
	}

	private	GetHTMLHasString(): string
	{
		const reactAppPathOnDisk = vscode.Uri.file(
			path.join(this._Context.extensionPath, 'dist', `${this._BundleFileName}.js`)
		);
		const reactAppUri = reactAppPathOnDisk.with({ scheme: "vscode-resource" });

		return (`
			<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8">
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<meta http-equiv="Content-Security-Policy"
					content="default-src 'none';
							img-src https:;
							script-src 'unsafe-eval' 'unsafe-inline' vscode-resource:;
							style-src vscode-resource: 'unsafe-inline';">
					<script>
						window.acquireVsCodeApi = acquireVsCodeApi;
					</script>
				</head>
				<body>
					<div id="root"></div>
					<script src="${reactAppUri}"></script>
				</body>
			</html>
		`);
	}

	// Event triggered when the react component is calling 'props.vscode.postMessage'
	private	OnMessageReceived(command: ICommand)
	{
		switch (command.action) {
		case "ExecuteCommand": // Allow React component to execute vscode commands
			vscode.commands.executeCommand(command.content.cmd);
			return;
		case "ListenToDataSubsystem": // Allow React component to listen to datas
			for (const entry of command.content) {
				if (entry.dataKey && entry.callbackMessageType) {
					this.AddDataListener(entry.dataKey, entry.callbackMessageType);
				}
			}
			return;
		default:
			log_uvch.log(`[View_${this._ViewId}] Unknown vscode action: ${command.action}`);
			return;
		}
	}

	public	GetViewId(): string { return (this._ViewId); }

	private	AddDataListener(dataKey: string, callbackMessageType: string)
	{
		if (this._ListeningDataKeys.includes(dataKey) === false) {
			this._ListeningDataKeys = this._ListeningDataKeys.concat([dataKey]);
			log_uvch.log(`[View_${this._ViewId}] Now listening to ${dataKey}`);

			UVCHDataSubsystem.Listen(dataKey, (data: any) => {
				this._WebView?.webview.postMessage({ type: callbackMessageType, data: data });
			});
		}
		else {
			// @TODO: handle unlistening and callbackMessageType update
			log_uvch.log(`[View_${this._ViewId}] You tried to listen to a datakey that you were already listening to ${dataKey}`);
		}
	}
};

class UVCHWebViewSubsystem
{
	private static _Instance: UVCHWebViewSubsystem | undefined;
	public static get instance(): UVCHWebViewSubsystem {
		if (!this._Instance) {
			this._Instance = new UVCHWebViewSubsystem();
		}
		return (this._Instance);
	}

	private _Views: Map<string, UVCHWebViewBase> = new Map();

	public static	RegisterNewView(context: vscode.ExtensionContext, viewname: string): string
	{
		this.instance._Views.set(viewname, new UVCHWebViewBase(
			context,
			`UVCH-${viewname}`,
			viewname
		));
		return (viewname);
	}

	public static	GetView(viewId: string): UVCHWebViewBase | undefined {
		return (this.instance._Views.get(viewId));
	}

}

export default UVCHWebViewSubsystem;