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

///////////////////////////////////////////////////////////////////////////////
// GetProjectInfos

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
export async function	GetProjectInfos_Implementation(): Promise<boolean>
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
			UVCHDataSubsystem.Set('UProject', uproject);
			UVCHDataSubsystem.Set('ProjectInfos', uproject ? projectInfos : undefined);

			if (!uproject) {
				vscode.window.showErrorMessage(`[UVCH] Unable to parse '${file}'`);
			}

			return (uproject === undefined ? true : false); // @TODO: UVCH is not handling multiple unreal project at the same time YET
		}
		workspaceFoldersIndex++;
	}
	vscode.window.showErrorMessage("[UVCH] Unable to find valid Unreal project"); // @TODO: add report action
	return (false);
}

///////////////////////////////////////////////////////////////////////////////
// PlayGame

export async function	PlayGame_Implementation(): Promise<boolean>
{
	const uproject = UVCHDataSubsystem.Get('ProjectInfos');
	if (uproject)
	{
		// @TODO: start uproject with --game
	}
	return (false);
}

///////////////////////////////////////////////////////////////////////////////
// PlayEditor

export async function	PlayEditor_Implementation(): Promise<boolean>
{
	await vscode.commands.executeCommand("UVCH.BuildEditor");

	// Get Project data if not exist, trigger the command then try again
	let projectInfos: IProjectInfos = UVCHDataSubsystem.Get('ProjectInfos');
	if (!projectInfos) {
		await vscode.commands.executeCommand("UVCH.GetProjectInfos");
		projectInfos = UVCHDataSubsystem.Get('ProjectInfos');
		if (!projectInfos) {
			return (false);
		}
	}

	let enginePath: string = UVCHDataSubsystem.Get("EnginePath");
	if (!enginePath) {
		await vscode.commands.executeCommand("UVCH.GetUnrealEnginePath");
		enginePath = UVCHDataSubsystem.Get('EnginePath');
		if (!enginePath) {
			return (false);
		}
	}

	// Find Or Create terminal
	let terminal = vscode.window.terminals.find((term) => term.name === '[UVCH] Terminal');
	if (!terminal) {
		terminal = vscode.window.createTerminal('[UVCH] Terminal');
	}

	// The .exe is changing depending of the UE version
	// @TODO: Find a better way to do this
	const unrealExeName = projectInfos.UnrealVersion.charAt(0) === '4' ? 'UE4Editor' : 'UnrealEditor';
	const buildCommand: string = `${enginePath}\\Engine\\Binaries\\Win64\\${unrealExeName}.exe`;
	const args: string[] = [
		`'${projectInfos.Path}/${projectInfos.Name}.uproject'`,
	];
	terminal.sendText(`& '${buildCommand}' ${args.join(' ')}`);
	terminal.sendText(`exit`); // We exit the terminal at the end because I think it's not usefull to keep it
	return (true);
}

///////////////////////////////////////////////////////////////////////////////
// BuildEditor

export async function	BuildEditor_Implementation(): Promise<boolean>
{
	// Get Project data if not exist, trigger the command then try again
	let projectInfos: IProjectInfos = UVCHDataSubsystem.Get('ProjectInfos');
	if (!projectInfos) {
		await vscode.commands.executeCommand("UVCH.GetProjectInfos");
		projectInfos = UVCHDataSubsystem.Get('ProjectInfos');
		if (!projectInfos) {
			return (false);
		}
	}

	let enginePath: string = UVCHDataSubsystem.Get("EnginePath");
	if (!enginePath) {
		await vscode.commands.executeCommand("UVCH.GetUnrealEnginePath");
		enginePath = UVCHDataSubsystem.Get('EnginePath');
		if (!enginePath) {
			return (false);
		}
	}

	// Find Or Create terminal
	let terminal = vscode.window.terminals.find((term) => term.name === '[UVCH] Terminal');
	if (!terminal) {
		terminal = vscode.window.createTerminal('[UVCH] Terminal');
	}

	const buildCommand: string = `${enginePath}\\Engine\\Build\\BatchFiles\\Build.bat`;
	const args: string[] = [
		`${projectInfos.Name}Editor`,
		"Win64",
		"Development",
		`'${projectInfos.Path}/${projectInfos.Name}.uproject'`,
		"-waitmutex"
	];
	terminal.sendText(`& '${buildCommand}' ${args.join(' ')}`);
	return (true);
}