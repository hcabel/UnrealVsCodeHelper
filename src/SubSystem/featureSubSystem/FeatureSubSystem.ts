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
import UVCHWebViewSubsystem, { IReactWebView } from '../WebViewSubsystem';

export interface	IVscodeCommand {
	cmd: string,
	func: (...args: any[]) => any
}

/**
 * This class purpose is to manage the features of the extension
 */
export default class AFeatureSubSystem extends ASubsystem
{
	// Human readable name of the feature
	protected _FeatureName: string = "Unknown";
	// Path to the config file to enable/disable the feature
	protected _EnableConfigPath: ConfigPath | undefined = undefined;
	// list of commands related to the feature
	protected _Commands: IVscodeCommand[] = [];
	// list of views/panel related to the feature
	protected _Views: IReactWebView[] = [];

	/**
	 * This function allow you to overrite the properties before being initalized
	 * @note for some reason when I'm doing on the constructor, the properties are not set
	 */
	protected	Assign()
	{
		this._FeatureName = "Unknown";
		this._EnableConfigPath = undefined;
		this._Commands = [];
		this._Views	= [];
	}

	/**
	 * This function is called when the extension is loaded
	 */
	protected	Init()
	{
		const activated = (this._EnableConfigPath ? UVCHSettingsSubsystem.Get<boolean>(this._EnableConfigPath) : false);
		log_uvch.log(`[FEATURE] ${activated ? "Enable" : "Disable"} [${this._FeatureName}]`);
		if (activated) {
			this.RegisterCommands(this._Commands || []);
			this.RegisterViews(this._Views || []);
			this.Activate();
		}
		else {
			// Register commands overriding implementation to show an error message
			// Do not add a 'when' condition to the command because we want to display this nice message
			// with a button allowing user to easily turn the feature back on
			this.RegisterCommands((this._Commands || []).map((cmd) => {
				// We had to stored it before because calling this in the function wont be equal to the feature subsystem
				const enableConfigPath = this._EnableConfigPath!;
				return ({
					cmd: cmd.cmd,
					func: () => {
						log_uvch.log(`[UVCH] ${cmd.cmd} is desactivated`);
						vscode.window.showInformationMessage(
							`${this._FeatureName} feature is disabled in the settings.`,
							"Turn back on",
							"Open settings"
						).then((selection) => {
							if (selection === "Open settings") {
								vscode.commands.executeCommand("workbench.action.openWorkspaceSettings",
									{ jsonEditor: false, query: `@ext:HugoCabel.uvch` }
								);
							}
							else if (selection === "Turn back on") {
								UVCHSettingsSubsystem.Set<boolean>(enableConfigPath, true)
									.then(() => {
										vscode.commands.executeCommand("workbench.action.reloadWindow");
									});
							}
						});
					}
				});
			}));
			// We can't unregister the views because this is controlled by the package json
			// when registering view, we actually just assigning HTML/ReactComponent to the view how's automatically
			// Registered by vscode.
			// /!\ Make sure to add a 'when' condition to your view in the package JSON to avoid vscode to register it
			// eg: "when": "congig.path.to.my.setting == true"

			this.Desactivate();
		}
	}

	// To override
	/**
	 * This function is called when the extension is activated
	 */
	protected	Activate() {}
	/**
	 * This function is called when the extension is desactivated
	 */
	protected	Desactivate() {}

	/**
	 * This will register the commands to the vscode
	 * @param commands, list of commands to register
	 * @throws if is not context is found in the DataSubsystem
	 */
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

	/**
	 * This will set the views registered in package.json
	 * @param views list of views to register
	 */
	protected RegisterViews(views: IReactWebView[]): void {
		views.forEach((reactView: IReactWebView) => {
			const view = UVCHWebViewSubsystem.GetView(reactView.viewId);
			if (view) { // if the view is already registered, we add a new panel to it
				reactView.panelIds.forEach((panelId: string) => {
					log_uvch.log(`[VIEW_${reactView.viewId}] Add pannel [VIEW_${panelId}]`);
					view.RegisterNewPanel(panelId);
				});
			}
			else {
				log_uvch.log(`[UVHC] Register view [VIEW_${reactView.viewId}]`);
				UVCHWebViewSubsystem.RegisterNewView(reactView);
			}
		});
	}
}