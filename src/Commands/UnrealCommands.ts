/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UnrealCommands.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/25 08:16:46 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/25 08:16:46 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as vscode from "vscode";
import * as fs from "fs";
import UVCHDataSubsystem from "../SubSystem/DataSubsystem";
import { IUEProject } from "../utils/UETypes";

///////////////////////////////////////////////////////////////////////////////
// GetUnrealEnginePath

function	GetAllMatchDirPath(startPath: string, regex: RegExp): string[]
{
	startPath = startPath.replace(/\/$/, '');
	return (fs.readdirSync(startPath, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory() && regex.test(dirent.name))
		.map((dirent) => `${startPath}/${dirent.name}`)
	);
}

export async function	GetUnrealEnginePath_Implementation(): Promise<boolean>
{
	let uproject: IUEProject | undefined = UVCHDataSubsystem.Get('UProject');
	if (!uproject) {
		await vscode.commands.executeCommand("UVCH.GetProjectInfos");
		uproject = UVCHDataSubsystem.Get('UProject');
		if (!uproject) {
			return (false);
		}
	}

	// @TODO: Check if the path is set in the UVCH config
	// @TODO: Before looking in all the files make sure the Engine is not in the vscode workspace

	// Find all 'Program Files' folders
	const startPath = 'C:/';
	const programFilesPaths = GetAllMatchDirPath(startPath, RegExp(".*Program Files.*"));

	// Find all 'Epic Games' folders in the 'Program Files' folders
	let epicGamesPaths: string[] = [];
	for (const current of programFilesPaths) {
		epicGamesPaths = epicGamesPaths.concat(GetAllMatchDirPath(current, RegExp(".*Epic Games.*")));
	}

	// Find the Engine path corresponding to the engine association, in all the 'Epic Games' folders
	let enginePaths: string[] = [];
	for (const current of epicGamesPaths) {
		enginePaths = enginePaths.concat(GetAllMatchDirPath(current, RegExp(`UE_${uproject.EngineAssociation}`))
			.filter((engineFolders) => {
				return (engineFolders.length > 0);
			}));
		// I assume that people will only have a single version of unreal installed
		// If not they can use the Extension Config
		if (enginePaths.length >= 1) {
			break;
		}
	}

	UVCHDataSubsystem.Set('EnginePath', enginePaths[0].replaceAll('/', '\\'));
	return (true);
}