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
import * as path from 'path';
import * as vscode from 'vscode';
import UVCHWebViewSubsystem from './SubSystem/WebViewSubsystem';
import {
	GetProjectInfos_Implementation,
	PlayGame_Implementation,
	PlayEditor_Implementation,
	BuildEditor_Implementation
} from "./Commands/ProjectCommands";
import {GetUnrealEnginePath_Implementation } from './Commands/UnrealCommands';
import { SwitchHeaderCppFile_Implementation } from './Commands/FilesCommands';
import UVHCSwitchFileSubsystem from './SubSystem/SwitchFileSubsystem';
import UVCHDataSubsystem from './SubSystem/DataSubsystem';

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
	{ cmd: "SwitchHeaderCppFile", func: SwitchHeaderCppFile_Implementation }
];

// an array containing all the view to create
// @note: adding a string to this is not enough
//     You also have to add the same stringId in the 'webpack.config.js' (at the end)
//     Then Create a file in the 'View' folder (with the same stringId)
//     Add a view to the package.json and set his Id with the same stringId
// @TODO: not working, in fact the view/panel is created but the 'registerWebviewViewProvider' event is never triggered :/
//     So you can't have multiple view IDK why
const viewsId: string[] = [
	"ProjectView"
];

// Function triggered when the 'activationEvents' in the package.json is called
// eslint-disable-next-line @typescript-eslint/naming-convention
export function	activate(context: vscode.ExtensionContext)
{
	log_uvch.log("[UVHC] activate extension");

	// Register all commands
	commands.forEach((command: ICommands) => {
		log_uvch.log(`[UVHC] Register commands [UVCH.${command.cmd}]`);
		context.subscriptions.push(vscode.commands.registerCommand(`UVCH.${command.cmd}`, (...args: any[]) => {
			log_uvch.log(`[UVCH.${command.cmd}] Fired`);
			return (command.func(args));
		}));
	});

	// Create Action Panel
	log_uvch.log(`[UVHC] Create Webview`);
	viewsId.forEach((viewId: string) => {
		log_uvch.log(`[UVHC] Register view [VIEW_${viewId}]`);
		UVCHWebViewSubsystem.RegisterNewView(context, viewId);
	});

	// Init SwitchFile Subsystem
	UVHCSwitchFileSubsystem.Init();
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function	deactivate() {
	log_uvch.log("[UVHC] Deactivate extension");
}
