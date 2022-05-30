/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   extension.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/21 18:34:27 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/21 18:34:27 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import log_uvch from './utils/log_uvch';
import * as vscode from 'vscode';
import UVCHWebViewSubsystem, { IReactWebView } from './SubSystem/WebViewSubsystem';
import UVHCSwitchFileSubsystem from './SubSystem/SwitchFileSubsystem';
import {
	GetProjectInfos_Implementation,
	PlayGame_Implementation,
	PlayEditor_Implementation,
	BuildEditor_Implementation
} from "./Commands/ProjectCommands";
import {GetUnrealEnginePath_Implementation } from './Commands/UnrealCommands';
import { SwitchHeaderCppFile_Implementation } from './Commands/FilesCommands';
import {
	OpenUnrealDoc_Implementation,
	OpenUnrealDocFromSelection_Implementation,
	SearchUnrealDoc_Implementation
} from './Commands/BrowserCommands';

interface	ICommands {
	cmd: string,
	func: (...args: any[]) => any
}

// An Array containing all the commands and the function to called when the command is triggered
const commands: ICommands[] = [
	{ cmd: "GetProjectInfos", func: GetProjectInfos_Implementation },
	{ cmd: "PlayGame", func: PlayGame_Implementation },
	{ cmd: "PlayEditor", func: PlayEditor_Implementation },
	{ cmd: "BuildEditor", func: BuildEditor_Implementation },
	{ cmd: "GetUnrealEnginePath", func: GetUnrealEnginePath_Implementation },
	{ cmd: "SwitchHeaderCppFile", func: SwitchHeaderCppFile_Implementation },
	{ cmd: "OpenUnrealDoc", func: OpenUnrealDoc_Implementation },
	{ cmd: "OpenUnrealDocFromSelection", func: OpenUnrealDocFromSelection_Implementation },
	{ cmd: "SearchUnrealDoc", func: SearchUnrealDoc_Implementation }
];

// an array containing all the view to create
// @note: adding a string to this is not enough
//     You also have to add the same stringId in the 'webpack.config.js' (at the end)
//     Then Create a file in the 'View' folder (with the same stringId)
//     Add a view to the package.json and set his Id with the same stringId
const reactViews: IReactWebView[] = [
	{
		viewId: "UVCH",
		panelIds: [
			"UnrealProjectView",
			"UnrealDocView"
		]
	}
];

// Function triggered when the 'activationEvents' in the package.json is called
// eslint-disable-next-line @typescript-eslint/naming-convention
export function	activate(context: vscode.ExtensionContext)
{
	log_uvch.log("[UVHC] activate extension");

	// Register all commands
	commands.forEach((command: ICommands) => {
		log_uvch.log(`[UVHC] Register commands [UVCH.${command.cmd}]`);
		context.subscriptions.push(vscode.commands.registerCommand(`UVCH.${command.cmd}`, async(...args: any[]) => {
			log_uvch.log(`[UVCH.${command.cmd}] Fired`);
			return (await command.func(...args));
		}));
	});

	// Create Action Panel
	log_uvch.log(`[UVHC] Create Webview`);
	reactViews.forEach((reactView: IReactWebView) => {
		log_uvch.log(`[UVHC] Register view [VIEW_${reactView.viewId}]`);
		UVCHWebViewSubsystem.RegisterNewView(context, reactView);
	});

	// Init SwitchFile Subsystem @TODO: Add settings to turn him off
	UVHCSwitchFileSubsystem.Init();
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function	deactivate() {
	log_uvch.log("[UVHC] Deactivate extension");
}
