/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ToolbarCommands.ts                                 :+:      :+:    :+:   */
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
import UVCHSettingsSubsystem from "../SubSystem/SettingsSubsystem";

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
 * @return a promise<boolean> that resolve if the command as successfully been send to the terminal
 */
export async function	PlayGame_Implementation(): Promise<boolean>
{
	return new Promise<boolean>((resolve, reject) =>
	{
		vscode.commands.executeCommand<boolean>("UVCH.BuildEditor")
			.then(async(succeeded: boolean) =>
			{
				if (!succeeded) {
					// This is does not mean that the build failed, just that the command failed
					resolve(false);
					return;
				}

				// Get Project data if not exist, trigger the command then try again
				let projectInfos: IProjectInfos | undefined = UVCHDataSubsystem.Get('ProjectInfos');
				if (!projectInfos) {
					await vscode.commands.executeCommand("UVCH.GetProjectInfos");
					projectInfos = UVCHDataSubsystem.Get('ProjectInfos');
					if (!projectInfos) {
						reject("Unable to get project infos");
						return;
					}
				}

				let enginePath: string | undefined = UVCHDataSubsystem.Get("EnginePath");
				if (!enginePath) {
					await vscode.commands.executeCommand("UVCH.GetUnrealEnginePath");
					enginePath = UVCHDataSubsystem.Get('EnginePath');
					if (!enginePath) {
						reject("Unable to get engine path");
						return;
					}
				}

				// The .exe is changing depending of the UE version
				// @TODO: Find a better way to do this
				const unrealExeName = projectInfos.UnrealVersion.charAt(0) === '4' ? 'UE4Editor' : 'UnrealEditor';
				const natvisName = (projectInfos.UnrealVersion.charAt(0) === '4' ? 'UE4' : 'Unreal');

				const settingArgs =
					UVCHSettingsSubsystem.Get<string[]>(`Toolbar.PlayGameLaunchParameters`)!
						.map((arg: string) => {
							return (
								arg === "%PROJECT%" ? `${projectInfos!.RootPath}/${projectInfos!.Name}.uproject` : arg
							);
						});

				vscode.debug.startDebugging(
					vscode.workspace.workspaceFolders![0],
					{
						name: 'Play Editor',
						type: 'cppvsdbg', // @TODO: Add settings for using lldb
						request: 'launch',
						program: `${enginePath}\\Engine\\Binaries\\Win64\\${unrealExeName}.exe`,
						args: [
							...settingArgs
						],
						console: "newExternalWindow",
						cwd: enginePath,
						visualizerFile: `${enginePath}\\Engine\\Extras\\VisualStudioDebugging\\${natvisName}.natvis`,
						sourceFileMap: {
							"D:\build\++UE5\Sync": enginePath
						}
					}
				);

				resolve(true);
			});
	});
}

///////////////////////////////////////////////////////////////////////////////
// PlayEditor

/**
 * Launch the Unreal Editor with the current project
 * @return a promise<boolean> that resolve if the command as successfully been send to the terminal
 */
export async function	PlayEditor_Implementation(): Promise<boolean>
{
	return new Promise<boolean>((resolve, reject) =>
	{
		vscode.commands.executeCommand<boolean>("UVCH.BuildEditor")
			.then(async(succeeded: boolean) =>
			{
				if (!succeeded) {
					// This is does not mean that the build failed, just that the command failed
					// @TODO: find a way to know if the build failed (I tried but it didn't work)
					resolve(false);
					return;
				}

				// Get Project data if not exist, trigger the command then try again
				let projectInfos: IProjectInfos | undefined = UVCHDataSubsystem.Get('ProjectInfos');
				if (!projectInfos) {
					await vscode.commands.executeCommand("UVCH.GetProjectInfos");
					projectInfos = UVCHDataSubsystem.Get('ProjectInfos');
					if (!projectInfos) {
						reject("Unable to get project infos");
						return;
					}
				}

				let enginePath: string | undefined = UVCHDataSubsystem.Get("EnginePath");
				if (!enginePath) {
					await vscode.commands.executeCommand("UVCH.GetUnrealEnginePath");
					enginePath = UVCHDataSubsystem.Get('EnginePath');
					if (!enginePath) {
						reject("Unable to get engine path");
						return;
					}
				}

				// The .exe is changing depending of the UE version
				// @TODO: Find a better way to do this
				const unrealExeName = (projectInfos.UnrealVersion.charAt(0) === '4' ? 'UE4Editor' : 'UnrealEditor');
				const natvisName = (projectInfos.UnrealVersion.charAt(0) === '4' ? 'UE4' : 'Unreal');

				const settingArgs =
					UVCHSettingsSubsystem.Get<string[]>(`Toolbar.PlayEditorLaunchParameters`)!
						.map((arg: string) => {
							return (
								arg === "%PROJECT%" ? `${projectInfos!.RootPath}/${projectInfos!.Name}.uproject` : arg
							);
						});

				vscode.debug.startDebugging(
					vscode.workspace.workspaceFolders![0],
					{
						name: 'Play Editor',
						type: 'cppvsdbg', // @TODO: Add settings for using lldb
						request: 'launch',
						program: `${enginePath}\\Engine\\Binaries\\Win64\\${unrealExeName}.exe`,
						args: [
							...settingArgs
						],
						cwd: enginePath,
						visualizerFile: `${enginePath}\\Engine\\Extras\\VisualStudioDebugging\\${natvisName}.natvis`,
						sourceFileMap: {
							"D:\build\++UE5\Sync": enginePath
						}
					}
				);

				resolve(true);
			});
	});
}

///////////////////////////////////////////////////////////////////////////////
// BuildEditor

/**
 * Launch the Unreal builder with the current project
 * @returns a promise<boolean> that resolve if the command as successfully been send to the terminal
 */
export async function	BuildEditor_Implementation(): Promise<boolean>
{
	return new Promise<boolean>(async(resolve, reject) =>
	{
		// Get Project data if not exist, trigger the command then try again
		let projectInfos = UVCHDataSubsystem.Get<IProjectInfos>('ProjectInfos');
		if (!projectInfos) {
			await vscode.commands.executeCommand("UVCH.GetProjectInfos");
			projectInfos = UVCHDataSubsystem.Get<IProjectInfos>('ProjectInfos');
			if (!projectInfos) {
				reject("Unable to get project infos");
				return;
			}
		}

		let enginePath: string | undefined = UVCHDataSubsystem.Get("EnginePath");
		if (!enginePath) {
			await vscode.commands.executeCommand("UVCH.GetUnrealEnginePath");
			enginePath = UVCHDataSubsystem.Get('EnginePath');
			if (!enginePath) {
				reject("Unable to get engine path");
				return;
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
				resolve(true);
			}
		});
	});
}