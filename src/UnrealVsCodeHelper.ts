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
import SwitchFileSubsystem from './SubSystem/featureSubSystem/SwitchFileSubsystem';
import UVCHDataSubsystem from './SubSystem/DataSubsystem';
import UVCHSettingsSubsystem from './SubSystem/SettingsSubsystem';
import ToolbarSubsystem from './SubSystem/featureSubSystem/ToolbarSubsystem';
import DocumentationExplorerSubsystem from './SubSystem/featureSubSystem/DocumentationExplorer';

// Function triggered when the 'activationEvents' in the package.json is called
// eslint-disable-next-line @typescript-eslint/naming-convention
export function	activate(context: vscode.ExtensionContext)
{
	log_uvch.log("[UVHC] activate extension");

	UVCHSettingsSubsystem.Init();
	UVCHDataSubsystem.Init();
	UVCHDataSubsystem.Set<vscode.ExtensionContext>("Context", context); // We store the context to access it wherever we are

	// Feature Subsystems, those are the Subsystems who's handling a specific feature, and they can be disbled/enabled
	// You should not use a feature outise of the Subsystems, but if you do make sure there not disabled
	SwitchFileSubsystem.Init();
	ToolbarSubsystem.Init();
	DocumentationExplorerSubsystem.Init();
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function	deactivate() {
	log_uvch.log("[UVHC] Deactivate extension");
}
