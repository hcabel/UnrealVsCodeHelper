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
import SwitchFileSubsystem from "../SubSystem/featureSubSystem/SwitchFileSubsystem";

export async function	SwitchHeaderCppFile_Implementation(): Promise<boolean>
{
	if (UVCHSettingsSubsystem.Get<boolean>("Global.UseSwitchFile") === true) {
		return (await SwitchFileSubsystem.SwitchFile());
	}
	vscode.window.showInformationMessage("[UVCH] Switch file is disabled in the settings.");
	return (false);
}