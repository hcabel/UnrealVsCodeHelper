/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   FilesCommands.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/25 22:11:11 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/25 22:11:11 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as vscode from 'vscode';
import UVCHSettingsSubsystem from "../SubSystem/SettingsSubsystem";
import UVHCSwitchFileSubsystem from "../SubSystem/SwitchFileSubsystem";

export async function	SwitchHeaderCppFile_Implementation(): Promise<boolean>
{
	if (UVCHSettingsSubsystem.Get<boolean>("Default.UseSwitchFile")) {
		return (await UVHCSwitchFileSubsystem.SwitchFile());
	}
	vscode.window.showInformationMessage("[UVCH] Switch file is disabled in the settings.");
	return (false);
}