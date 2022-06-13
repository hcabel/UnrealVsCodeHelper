/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   FeatureSubSystem.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/12 18:37:27 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/06/12 18:37:27 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as vscode from 'vscode';
import log_uvch from '../../utils/log_uvch';
import UVCHDataSubsystem from '../DataSubsystem';
import UVCHSettingsSubsystem, { ConfigPath } from '../SettingsSubsystem';
import ASubsystem from '../Subsystem';
import UVCHWebViewSubsystem, { IReactWebView, WebViewBase } from '../WebViewSubsystem';

export interface	IVscodeCommand {
	cmd: string,
	func: (...args: any[]) => any
}

export default class AFeatureSubSystem extends ASubsystem
{
	protected _FeatureName: string = "Unknown";
	protected _EnableConfigPath: ConfigPath | undefined = undefined;
	protected _Commands: IVscodeCommand[] = [];
	protected _Views: IReactWebView[] = [];

	protected	Assign()
	{
		this._FeatureName = "Unknown";
		this._EnableConfigPath = undefined;
		this._Commands = [];
		this._Views	= [];
	}

	protected	Init()
	{
		const activated = (this._EnableConfigPath ? UVCHSettingsSubsystem.Get<boolean>(this._EnableConfigPath) : false);
		log_uvch.log(`[UVHC] ${activated ? "Enable" : "Disable"} [${this._FeatureName}]`);
		if (activated) {
			this.RegisterCommands(this._Commands || []);
			this.RegisterViews(this._Views || []);
			this.Activate();
		}
		else {
			// Register commands overriding implementation to show an error message
			this.RegisterCommands((this._Commands || []).map((cmd) => {
				return ({
					cmd: cmd.cmd,
					func: () => {
						log_uvch.log(`[UVCH] ${cmd.cmd} is desactivated`);
						vscode.window.showInformationMessage(`${this._FeatureName} feature is disabled in the settings.`);
					}
				});
			}));
			this.Desactivate();
		}
	}

	// To override
	protected	Activate() {}
	protected	Desactivate() {}

	protected RegisterCommands(commands: IVscodeCommand[]): void {
		const context = UVCHDataSubsystem.Get<vscode.ExtensionContext>("Context");
		if (!context) {
			throw Error("[UVCH] Context is not defined");
		}

		commands.forEach((command: IVscodeCommand) => {
			log_uvch.log(`[UVHC] Register commands [UVCH.${command.cmd}]`);
			context.subscriptions.push(vscode.commands.registerCommand(`UVCH.${command.cmd}`, async(...args: any[]) => {
				log_uvch.log(`[UVCH.${command.cmd}] Fired`);
				return (await command.func(...args));
			}));
		});
	}

	protected RegisterViews(views: IReactWebView[]): void {
		views.forEach((reactView: IReactWebView) => {
			const view = UVCHWebViewSubsystem.GetView(reactView.viewId);
			if (!view) {
				log_uvch.log(`[UVHC] Register view [VIEW_${reactView.viewId}]`);
				UVCHWebViewSubsystem.RegisterNewView(reactView);
			}
			else {
				reactView.panelIds.forEach((panelId: string) => {
					log_uvch.log(`[VIEW_${reactView.viewId}] Add pannel [VIEW_${panelId}]`);
					view.RegisterNewPanel(panelId);
				});
			}
		});
	}
}