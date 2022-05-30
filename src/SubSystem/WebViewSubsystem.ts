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
import UVCHDataSubsystem from './DataSubsystem';
import log_uvch from '../utils/log_uvch';

export interface ICommand {
	action: string,
	content: any
}

export interface IReactWebView {
	viewId: string,
	panelIds: string[]
}

/**
 * This class is the handler of a single Section in a webview
 */
export class ViewPanelBase
{
	private readonly _BundleFileName: string = '';
	private readonly _Context: vscode.ExtensionContext;
	protected readonly _PanelId: string = '';
	private _Panel: vscode.WebviewView | undefined;
	protected _ListeningDataKeys: string[] = [];

	constructor(context: vscode.ExtensionContext, panelId: string)
	{
		log_uvch.log(`[Panel_${panelId}] Create`);

		this._BundleFileName = `UVCH-${panelId}`;
		this._PanelId = panelId;
		this._Context = context;

		vscode.window.registerWebviewViewProvider(this._PanelId, {
			resolveWebviewView: async(panel: vscode.WebviewView) => {
				this.InitReactPanel(panel);
			}
		});
	}

	/**
	 * Init the WebView
	 *
	 * @param webView The WebView you want to init
	 * @returns The WebView initialized
	 */
	private	InitReactPanel(panel: vscode.WebviewView): vscode.WebviewView
	{
		if (this._Panel === undefined)
		{
			log_uvch.log(`[Panel_${this._PanelId}] Init`);

			this._Panel = panel;
			this._Panel.webview.options = {
				enableScripts: true,
				localResourceRoots: [
					vscode.Uri.file(path.join(this._Context.extensionPath, 'dist')),
				],
			};

			this.SetOnMessageReceived();
			this._Panel.webview.html = this.GetHTMLHasString();
		}
		return (this._Panel);
	}

	/**
	 * Set the function who's gonna receive all the message from the React WebView
	 */
	private	SetOnMessageReceived()
	{
		this._Panel?.webview.onDidReceiveMessage((command: ICommand) => {
			switch (command.action) {
			case "ExecuteCommand": // Allow React component to execute vscode commands
				vscode.commands.executeCommand(command.content.cmd, ...(command.content.args || []));
				return;
			case "ListenToDataSubsystem": // Allow React component to listen to datas
				for (const entry of command.content) {
					if (entry.dataKey && entry.callbackMessageType) {
						this.AddDataListener(entry.dataKey, entry.callbackMessageType);
					}
				}
				return;
			default:
				log_uvch.log(`[Panel_${this._PanelId}] Unknown vscode action: ${command.action}`);
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
			log_uvch.log(`[Panel_${this._PanelId}] Now listening to ${dataKey}`);

			UVCHDataSubsystem.Listen(dataKey, (data: any) => {
				this._Panel?.webview.postMessage({ type: callbackMessageType, data: data });
			});
		}
		else {
			// If he tried to listen to the same data twice, we trigger the listener to make sure his updated
			const data: any | undefined = UVCHDataSubsystem.Get(dataKey);
			this._Panel?.webview.postMessage({ type: callbackMessageType, data: data });

			// @TODO: handle unlistening and callbackMessageType update
			log_uvch.log(`[Panel_${this._PanelId}] You tried to listen to a datakey that you were already listening to ${dataKey}`);
		}
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
				 <body style="padding: 0">
					 <div id="${this._PanelId}-root"></div>
					 <script src="${reactAppUri}"></script>
				 </body>
			 </html>
		 `);
	 }

	public get PanelId(): string { return (this._PanelId); }
}

export class WebViewBase
{
	protected readonly _ViewId: string = '';
	protected _Panels: ViewPanelBase[] = [];
	protected _WebView: vscode.WebviewView | undefined;

	constructor(context: vscode.ExtensionContext, reactWebView: IReactWebView)
	{
		log_uvch.log(`[View_${reactWebView.viewId}] Create`);

		this._ViewId = reactWebView.viewId;
		this._Panels = reactWebView.panelIds.map((panelId) => {
			return (new ViewPanelBase(context, panelId));
		});
	}

	public get ViewId(): string { return (this._ViewId); }
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
	private _Views: Map<string, WebViewBase> = new Map();

	/**
	 * Register and create a new WebView
	 *
	 * @params context, The vscode context
	 * @Params viewId, The Id of the new view
	 * @Params panelIds, The Id of all the panel in the view
	 * @returns The new WebView id
	 */
	public static	RegisterNewView(context: vscode.ExtensionContext, reactWebView: IReactWebView): string
	{
		this.instance._Views.set(reactWebView.viewId, new WebViewBase(context, reactWebView));
		return (reactWebView.viewId);
	}

	/**
	 * Get a reference on a WebView
	 *
	 * @param viewId The Id of the WebView you want to get
	 * @returns The WebView or undefined if not exist
	 */
	public static	GetView(viewId: string): WebViewBase | undefined {
		return (this.instance._Views.get(viewId));
	}

}

export default UVCHWebViewSubsystem;