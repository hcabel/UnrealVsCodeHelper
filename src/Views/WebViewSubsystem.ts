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
		log_uvch.log(`[View_${viewId}] Create`);

		this._Context = context;
		this._BundleFileName = bundleFileName;
		this._ViewId = viewId;

		// This function is triggered by VsCode the first time the WebView is showed
		vscode.window.registerWebviewViewProvider(this._ViewId, {
			resolveWebviewView: (webView: vscode.WebviewView) => {
				this.InitWebView(webView);
			}
		});
	}

	/**
	 * Init the WebView
	 *
	 * @param webView The WebView you want to init
	 * @returns The WebView initialized
	 */
	private InitWebView(webView: vscode.WebviewView): vscode.WebviewView
	{
		if (this._WebView === undefined)
		{
			log_uvch.log(`[View_${this._ViewId}] Init`);

			this._WebView = webView;
			this._WebView.webview.options = {
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.file(path.join(this._Context.extensionPath, 'dist')),
				],
			};

			this.SetOnMessageReceived();
			this._WebView.webview.html = this.GetHTMLHasString();
		}
		return (this._WebView);
	}

	/**
	 * Get the base HTML to allow showing a React component
	 */
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

	/**
	 * Set the function who's gonna receive all the message from the React WebView
	 */
	private	SetOnMessageReceived()
	{
		this._WebView?.webview.onDidReceiveMessage((command: ICommand) => {
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
		});
	}

	/**
	 * Add a new listerner function to the data referencing by the key in the UVCHDataSubsystem
	 *
	 * @param dataKey The key who's referencing the data you want to listen
	 * @param callbackMessageType The function that you want to be called when the data is changed
	 */
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
	public	GetViewId(): string { return (this._ViewId); }
};

class UVCHWebViewSubsystem
{
	// All of this is for having a single instance of the UVCHWebViewSubsystem
	private static _Instance: UVCHWebViewSubsystem | undefined;
	public static get instance(): UVCHWebViewSubsystem {
		if (!this._Instance) {
			this._Instance = new UVCHWebViewSubsystem();
		}
		return (this._Instance);
	}

	// The Map where all the view has stored with there key is his viewId
	private _Views: Map<string, UVCHWebViewBase> = new Map();

	/**
	 * Register and create a new WebView
	 *
	 * @params context, The vscode context
	 * @Params viewId, The Id of the new view
	 */
	public static	RegisterNewView(context: vscode.ExtensionContext, viewId: string): string
	{
		this.instance._Views.set(viewId, new UVCHWebViewBase(
			context,
			`UVCH-${viewId}`,
			viewId
		));
		return (viewId);
	}

	/**
	 * Get a reference on a WebView
	 *
	 * @param viewId The Id of the WebView you want to get
	 * @returns The WebView or undefined if not exist
	 */
	public static	GetView(viewId: string): UVCHWebViewBase | undefined {
		return (this.instance._Views.get(viewId));
	}

}

export default UVCHWebViewSubsystem;