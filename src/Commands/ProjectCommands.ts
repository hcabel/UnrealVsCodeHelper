/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ProjectCommands.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/22 15:45:22 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/22 15:45:22 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as vscode from "vscode";
import * as fs from "fs";
import { IUEProject } from "../utils/UETypes";
import log_uvch from "../utils/log_uvch";
import UVCHDataSubsystem from "../DataSubsystem";

function	CastFileHasUEProject(path: string, file: string): IUEProject | undefined
{
	const requiredKeys = ["FileVersion", "EngineAssociation"];
	try {
		const fileContentJSON: any = JSON.parse(fs.readFileSync(`${path}/${file}`, 'utf8'));
		for (const [key, value] of Object.entries(fileContentJSON)) {
			if (!value && requiredKeys.includes(key)) {
				throw Error("Unexpected undefined value");
			}
			fileContentJSON[key] = (value ? value : undefined);
		}
		return (fileContentJSON as IUEProject);
	} catch (e: any) {
		log_uvch.log(`[!ERROR!] Unable to parse '${file}'`);
		console.error(`[!ERROR!] Unable to parse '${file}'`);
	}
}

export interface IProjectInfos {
	Name: string,
	Path: string,
	UnrealVersion: string,
}

export async function	RefreshProjectInfos_Implementation(): Promise<boolean>
{
	if (!vscode.workspace.workspaceFolders) {
		return (false);
	}

	for (const folder of vscode.workspace.workspaceFolders)
	{
		const files = fs.readdirSync(folder.uri.fsPath);
		for (const file of files)
		{
			if (file.endsWith('.uproject') === false) {
				continue;
			}

			const uproject = CastFileHasUEProject(folder.uri.fsPath, file);
			const projectInfos: IProjectInfos = {
				Name: file.replace(".uproject", ''),
				Path: folder.uri.fsPath,
				UnrealVersion: uproject?.EngineAssociation || ""
			};

			// We set even if it's undefined to refresh all the component who depends of those informations
			UVCHDataSubsystem.Set('Project', uproject);
			UVCHDataSubsystem.Set('ProjectInfos', uproject ? projectInfos : undefined);

			if (uproject) {
				vscode.window.showInformationMessage(`[UVCH] Project found: '${projectInfos.Name}' UE${projectInfos.UnrealVersion}.`);
			}
			else {
				vscode.window.showErrorMessage(`Unable to parse '${file}'`);
			}

			return (uproject === undefined ? true : false); // @TODO: UVCH is not handling multiple unreal project at the same time YET
		}
	}
	vscode.window.showErrorMessage("Unable to find valid Unreal project"); // @TODO: add report action
	return (false);
}