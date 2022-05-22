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
import UVCHWebViewSubsystem from './Views/controllers';

interface	ICommands {
	cmd: string,
	func: (...args: any[]) => any
}

const commands: ICommands[] = [
];

const viewsId: string[] = [
	"ProjectView"
]

// eslint-disable-next-line @typescript-eslint/naming-convention
export function	activate(context: vscode.ExtensionContext)
{
	log_uvch.log("[UVHC] activate extension");

	// Register all commands
	commands.forEach((command: ICommands) => {
		log_uvch.log(`[UVHC] Register commands: UVCH.${command.cmd}`);
		context.subscriptions.push(vscode.commands.registerCommand(`UVCH.${command.cmd}`, command.func));
	});

	// Create Action Panel
	log_uvch.log(`[UVHC] Create Webview`);
	viewsId.forEach((viewId: string) => {
		log_uvch.log(`[UVHC] Register [VIEW_${viewId}]`);
		UVCHWebViewSubsystem.RegisterNewView(context, viewId);
	})
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function	deactivate() {
	log_uvch.log("[UVHC] Deactivate extension");
}
