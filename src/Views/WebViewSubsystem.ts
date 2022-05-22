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
import log_uvch from '../utils/log_uvch';

export class UVCHWebViewBase
{
	private _BundleFileName: string = '';
	private _Context: vscode.ExtensionContext;
	protected _WebView: vscode.WebviewView | undefined;
	protected _ViewId: string = '';

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
				</head>
				<body>
					<div id="root"></div>
					<script src="${reactAppUri}"></script>
				</body>
			</html>
		`);
	}

	public	GetViewId(): string { return (this._ViewId); }
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