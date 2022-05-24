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
import UVCHDataSubsystem from "../SubSystem/DataSubsystem";

/**
 * Read a all file parse it has a JSON object then create a IUEProject
 * replacing all unvalid value by 'undefined'
 *
 * @param path The path to the file
 * @param file The file name (with the extension)
 * @return IUEProject, if found and parsed
 * @return undefined, if failed to parse/found
 */
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

// Project infos that we want to keep but who's not referencing into the .uproject
export interface IProjectInfos {
	Name: string,
	Path: string,
	UnrealVersion: string,
	WorkspaceFoldersIndex: number,
}

/**
 * Search, find and parse a .uproject in the current workspace folders.
 * This function auto set the values found in the 'UVCHDataSubsystem'
 *
 * @return true or false depending if yes or no we succeeded finding and parsing the project
 */
export async function	RefreshProjectInfos_Implementation(): Promise<boolean>
{
	if (!vscode.workspace.workspaceFolders) {
		return (false);
	}

	// For each folders open in VsCode
	let workspaceFoldersIndex: number = 0;
	for (const folder of vscode.workspace.workspaceFolders)
	{
		// Get all the files and loop through them
		const files = fs.readdirSync(folder.uri.fsPath);
		for (const file of files)
		{
			// If the file is a '.uproject'
			if (file.endsWith('.uproject') === false) {
				continue;
			}

			// parse the file
			const uproject = CastFileHasUEProject(folder.uri.fsPath, file);
			const projectInfos: IProjectInfos = {
				Name: file.replace(".uproject", ''),
				Path: folder.uri.fsPath,
				UnrealVersion: uproject?.EngineAssociation || "",
				WorkspaceFoldersIndex: workspaceFoldersIndex
			};

			// store the project informations
			// Even when undefined(if failed) to refresh all the component who depends of those informations
			console.log(4);
			UVCHDataSubsystem.Set('Project', uproject);
			UVCHDataSubsystem.Set('ProjectInfos', uproject ? projectInfos : undefined);

			// Show a nice message to inform that we found(or not) a project
			if (uproject) {
				vscode.window.showInformationMessage(`[UVCH] Project found: '${projectInfos.Name}' UE${projectInfos.UnrealVersion}.`);
			}
			else {
				vscode.window.showErrorMessage(`[UVCH] Unable to parse '${file}'`);
			}

			return (uproject === undefined ? true : false); // @TODO: UVCH is not handling multiple unreal project at the same time YET
		}
		workspaceFoldersIndex++;
	}
	vscode.window.showErrorMessage("[UVCH] Unable to find valid Unreal project"); // @TODO: add report action
	return (false);
}

export async function	PlayGame_Implementation(): Promise<boolean>
{
	const uproject = UVCHDataSubsystem.Get('ProjectInfos');
	if (uproject)
	{
		// @TODO: start uproject with --game
	}
	return (false);
}