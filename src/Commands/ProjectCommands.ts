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
	RootPath: string,
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
				RootPath: folder.uri.fsPath.toString().replaceAll('\\', '/'),
				UnrealVersion: uproject?.EngineAssociation || "",
				WorkspaceFoldersIndex: workspaceFoldersIndex
			};

			// store the project informations
			// Even when undefined(if failed) to refresh all the component who depends of those informations
			UVCHDataSubsystem.Set('UProject', uproject);
			UVCHDataSubsystem.Set('ProjectInfos', uproject ? projectInfos : undefined);

			if (!uproject) {
				vscode.window.showErrorMessage(`[UVCH] Unable to parse '${file}'`); // @TODO: add report action in case it's an error
			}

			return (uproject === undefined ? true : false); // @TODO: UVCH is not handling multiple unreal project at the same time YET
		}
		workspaceFoldersIndex++;
	}

	// Refresh all components
	UVCHDataSubsystem.Set('UProject', undefined);
	UVCHDataSubsystem.Set('ProjectInfos', undefined);
	return (false);
}

///////////////////////////////////////////////////////////////////////////////
// PlayGame

/**
 * Launch the project in game mode
 *
 * @returns If the command as successfully been send to the terminal
 */
export async function	PlayGame_Implementation(): Promise<boolean>
{
	await vscode.commands.executeCommand("UVCH.BuildEditor");

	// Get Project data if not exist, trigger the command then try again
	let projectInfos: IProjectInfos | undefined = UVCHDataSubsystem.Get('ProjectInfos');
	if (!projectInfos) {
		await vscode.commands.executeCommand("UVCH.GetProjectInfos");
		projectInfos = UVCHDataSubsystem.Get('ProjectInfos');
		if (!projectInfos) {
			return (false);
		}
	}

	let enginePath: string | undefined = UVCHDataSubsystem.Get("EnginePath");
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
	const natvisName = (projectInfos.UnrealVersion.charAt(0) === '4' ? 'UE4' : 'Unreal');

	vscode.debug.startDebugging(
		vscode.workspace.workspaceFolders![0],
		{
			name: 'Play Editor',
			type: 'cppvsdbg', // @TODO: Add settings for using lldb
			request: 'launch',
			program: `${enginePath}\\Engine\\Binaries\\Win64\\${unrealExeName}.exe`,
			args: [
				`${projectInfos.RootPath}/${projectInfos.Name}.uproject`,
				`-game`
				// @TODO: Add settings for using additional parameters such has -ResX, -ResY and more
			],
			cwd: enginePath,
			visualizerFile: `${enginePath}\\Engine\\Extras\\VisualStudioDebugging\\${natvisName}.natvis`,
			sourceFileMap: {
				"D:\build\++UE5\Sync": enginePath
			}
		}
	);

	return (true);
}

///////////////////////////////////////////////////////////////////////////////
// PlayEditor

/**
 * Launch the Unreal Editor with the current project
 *
 * @returns If the command as successfully been send to the terminal
 */
export async function	PlayEditor_Implementation(): Promise<boolean>
{
	await vscode.commands.executeCommand("UVCH.BuildEditor");

	// Get Project data if not exist, trigger the command then try again
	let projectInfos: IProjectInfos | undefined = UVCHDataSubsystem.Get('ProjectInfos');
	if (!projectInfos) {
		await vscode.commands.executeCommand("UVCH.GetProjectInfos");
		projectInfos = UVCHDataSubsystem.Get('ProjectInfos');
		if (!projectInfos) {
			return (false);
		}
	}

	let enginePath: string | undefined = UVCHDataSubsystem.Get("EnginePath");
	if (!enginePath) {
		await vscode.commands.executeCommand("UVCH.GetUnrealEnginePath");
		enginePath = UVCHDataSubsystem.Get('EnginePath');
		if (!enginePath) {
			return (false);
		}
	}

	// The .exe is changing depending of the UE version
	// @TODO: Find a better way to do this
	const unrealExeName = (projectInfos.UnrealVersion.charAt(0) === '4' ? 'UE4Editor' : 'UnrealEditor');
	const natvisName = (projectInfos.UnrealVersion.charAt(0) === '4' ? 'UE4' : 'Unreal');

	vscode.debug.startDebugging(
		vscode.workspace.workspaceFolders![0],
		{
			name: 'Play Editor',
			type: 'cppvsdbg', // @TODO: Add settings for using lldb
			request: 'launch',
			program: `${enginePath}\\Engine\\Binaries\\Win64\\${unrealExeName}.exe`,
			args: [
				`${projectInfos.RootPath}/${projectInfos.Name}.uproject`,
			],
			cwd: enginePath,
			visualizerFile: `${enginePath}\\Engine\\Extras\\VisualStudioDebugging\\${natvisName}.natvis`,
			sourceFileMap: {
				"D:\build\++UE5\Sync": enginePath
			}
		}
	);

	return (true);
}

///////////////////////////////////////////////////////////////////////////////
// BuildEditor

/**
 * Launch the Unreal builder with the current project
 *
 * @returns If the command as successfully been send to the terminal
 */
export async function	BuildEditor_Implementation(): Promise<boolean>
{
	// Get Project data if not exist, trigger the command then try again
	let projectInfos = UVCHDataSubsystem.Get<IProjectInfos>('ProjectInfos');
	if (!projectInfos) {
		await vscode.commands.executeCommand("UVCH.GetProjectInfos");
		projectInfos = UVCHDataSubsystem.Get<IProjectInfos>('ProjectInfos');
		if (!projectInfos) {
			return (false);
		}
	}

	let enginePath: string | undefined = UVCHDataSubsystem.Get("EnginePath");
	if (!enginePath) {
		await vscode.commands.executeCommand("UVCH.GetUnrealEnginePath");
		enginePath = UVCHDataSubsystem.Get('EnginePath');
		if (!enginePath) {
			return (false);
		}
	}

	const buildCommand: string = `${enginePath}\\Engine\\Build\\BatchFiles\\Build.bat`;
	const args: string[] = [
		`${projectInfos.Name}Editor`,
		"Win64",
		"Development",
		`'${projectInfos.RootPath}/${projectInfos.Name}.uproject'`,
		"-waitmutex"
	];

	const task = new vscode.Task(
		{ type: 'shell' },
		vscode.workspace.workspaceFolders![0],
		`Build`,
		'UVCH',
		new vscode.ShellExecution(`& '${buildCommand}' ${args.join(' ')}`),
	);
	const execution = await vscode.tasks.executeTask(task);

	vscode.tasks.onDidEndTask((event: vscode.TaskEndEvent) => {
		if (event.execution.task === execution.task) {
			vscode.window.showInformationMessage(`${projectInfos!.Name} build completed`);
		}
	});

	return (true);
}