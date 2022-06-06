/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SwitchFileSubsystem.ts                             :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/26 09:54:14 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/26 09:54:14 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { IProjectInfos } from "../Commands/ProjectCommands";
import log_uvch from "../utils/log_uvch";
import UVCHDataSubsystem from "./DataSubsystem";
import UVCHSettingsSubsystem from "./SettingsSubsystem";

export interface ISwitchFile {
	srcPath: string,
	destPath: string
}

export default class UVHCSwitchFileSubsystem
{
	private static _Instance: UVHCSwitchFileSubsystem | undefined;
	public static get instance(): UVHCSwitchFileSubsystem {
		if (!this._Instance) {
			this._Instance = new UVHCSwitchFileSubsystem();
		}
		return (this._Instance);
	}

	constructor() {
		this.Init();
	}
	public static	Init(): UVHCSwitchFileSubsystem {
		return (this.instance);
	}
	public	Init()
	{
		if (UVCHSettingsSubsystem.Get<boolean>("Default.UseSwitchFile") === false) {
			return;
		}
		log_uvch.log("[UVHC] activate [SWITCH_FILE]");

		// CREATE STATUS BAR
		const switchFileStatusbar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
		switchFileStatusbar.command = `UVCH.SwitchHeaderCppFile`;
		UVCHDataSubsystem.Listen("SwitchFile", (data: ISwitchFile) => {
			if (data) {
				const fileName = path.basename(data.destPath);
				switchFileStatusbar.text = `[${fileName}]`;
				switchFileStatusbar.tooltip = `Switch to ${fileName}`;
				switchFileStatusbar.backgroundColor = undefined;
			}
			else {
				const extension = path.extname(vscode.window.activeTextEditor?.document.fileName || "");
				if (extension === ".h" || extension === ".hpp" || extension === ".cpp") {
					switchFileStatusbar.tooltip = `Sorry but we were not able to find matching the file`;
					switchFileStatusbar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
				}
				switchFileStatusbar.text = `[Unknown]`;
			}
		});
		switchFileStatusbar.show();

		// LISTEN when you focusing on a file and update the 'SwitchFile' (To switch quicker between header/cpp)
		vscode.window.onDidChangeActiveTextEditor(async(ev: vscode.TextEditor | undefined) => {
			if (ev && ev.viewColumn && ev.viewColumn >= vscode.ViewColumn.One) {
				UVHCSwitchFileSubsystem.RequestFindSwitchFile(ev.document);
			}
		});

		// FIND current SwitchFile
		const currentDocument = vscode.window.activeTextEditor?.document;
		if (currentDocument) {
			this.RequestFindSwitchFile(currentDocument);
		}
	}

	/**
	 * Switch to the file associated with the current file focused in the editor
	 * @returns true if the switch file has been found and opened
	 */
	public async	SwitchFile(): Promise<boolean>
	{
		const switchFilePath = UVCHDataSubsystem.Get<ISwitchFile>("SwitchFile");
		if (switchFilePath) {

			log_uvch.log(`[SWITCH_FILE] Switching to file: '${path.basename(switchFilePath.destPath)}'`);
			// Open switch file from path

			const switchFileDoc = await vscode.workspace.openTextDocument(switchFilePath.destPath);
			if (switchFileDoc) {
				await vscode.window.showTextDocument(switchFileDoc, { preview: false });
				return (true);
			}
			vscode.window.showErrorMessage(`[UVCH] Failed to open switch file: ${switchFilePath.destPath}`);
		}
		const filePath = vscode.window.activeTextEditor?.document.fileName.replace('\\', '/') || "";
		const extension = path.extname(filePath);
		if ([".h", ".hpp", ".cpp"].includes(extension)) {
			log_uvch.log(`[SWITCH_FILE] No switch file found ${path.basename(filePath)}`);
			vscode.window.showErrorMessage("[UVCH] No SwitchFile found !"); // @TODO: add report action
		}
		return (false);
	}
	public static	SwitchFile(): Promise<boolean> {
		return (UVHCSwitchFileSubsystem.instance.SwitchFile());
	}

	/**
	 * Get the current file and return the header/cpp file corresponding
	 *
	 * @param document The document that you wish find his header/cpp file
	 */
	public async	RequestFindSwitchFile(document: vscode.TextDocument)
	{
		// If you currently are at the destination of the previous switch file request, swap values instead of doing a new request
		const oldSwitchFile: ISwitchFile | undefined = UVCHDataSubsystem.Get("SwitchFile");
		if (oldSwitchFile && path.basename(oldSwitchFile.destPath) === path.basename(document.fileName)) {
			UVCHDataSubsystem.Set<ISwitchFile>("SwitchFile", {
				srcPath: oldSwitchFile.destPath,
				destPath: oldSwitchFile.srcPath
			});
			return;
		}

		UVCHDataSubsystem.Set("SwitchFile", undefined);
		// Create a new request, who's gonna find the switch file and store it in the data subsystem
		new Promise<boolean>(async(resolve) => {
			resolve(await this.FindSwitchFileRequest(document));
		});

	}
	public static	RequestFindSwitchFile(document: vscode.TextDocument) {
		return (UVHCSwitchFileSubsystem.instance.RequestFindSwitchFile(document));
	}

	private async	FindSwitchFileRequest(document: vscode.TextDocument): Promise<boolean>
	{
		let projectInfos: IProjectInfos | undefined = UVCHDataSubsystem.Get('ProjectInfos');
		if (!projectInfos) {
			await vscode.commands.executeCommand("UVCH.GetProjectInfos");
			projectInfos = UVCHDataSubsystem.Get('ProjectInfos');
			if (!projectInfos) {
				return (false);
			}
		}

		const documentFullPath = document.fileName.replaceAll('\\', '/');
		const switchSourceFile = path.basename(documentFullPath);
		log_uvch.log(`[SWITCH_FILE] Start finding SwitchFile for '${switchSourceFile}'`);

		const switchFileFullPath = await this.FindSwitchFile(documentFullPath);
		if (switchFileFullPath) {
			log_uvch.log(`[SWITCH_FILE] Switch file found: '${path.basename(switchFileFullPath)}'`);
			UVCHDataSubsystem.Set<ISwitchFile>("SwitchFile", {
				srcPath: documentFullPath,
				destPath: switchFileFullPath
			});
			return (true);
		}
		return (false);
	}

	/**
	 * Find the header/cpp file corresponding to the file pointed by the 'sourceFullPath'
	 *
	 * @param sourceFullPath The full path of file you want to find his matching header/cpp file
	 * @returns The header/cpp file full path corresponding to 'sourceFullPath'
	 * @returns undefined if no header/cpp file was found
	 */
	public	FindSwitchFile(sourceFullPath: string): Promise<string | undefined> | undefined
	{
		// Get document extension
		const extension = path.extname(sourceFullPath);

		if (extension === ".h" || extension === ".hpp") {
			return (this.FindCppFileCorresponding(sourceFullPath));
		}
		else if (extension === ".cpp") {
			return (this.FindHeaderFileCorresponding(sourceFullPath));
		}
		return (undefined);
	}

	/**
	 * Find the header file corresponding to the file pointed by the 'sourceFullPath'
	 *
	 * @param sourceFullPath The full path of file you want to find his matching header file
	 * @returns The header file full path corresponding to 'sourceFullPath'
	 * @returns undefined if no header file was found
	 */
	public async	FindHeaderFileCorresponding(sourceFullPath: string): Promise<string | undefined>
	{
		const switchSourceFileNameNoExtension = path.basename(sourceFullPath).replace(path.extname(sourceFullPath), '');
		const switchSourceFilePath = path.dirname(sourceFullPath);

		// TECHNIQUE: 1, Find the header file in the public folder
		const resultOne = this.SearchSwitchFileUsingPublicPrivateFolders(
			switchSourceFileNameNoExtension, switchSourceFilePath, [".h", ".hpp"]);
		if (resultOne !== undefined) {
			return (resultOne);
		}

		// TECHNIQUE: 2, Find the header file in the same folder

		// Get all files in the same folder as an array of full path
		const filesInCurrentFolder = fs.readdirSync(switchSourceFilePath)
			.map((file: string) => `${switchSourceFilePath}/${file}`);

		// For each full path, check if it is the SwitchFile we are looking for
		for (const file of filesInCurrentFolder) {
			if (file.endsWith(`${switchSourceFileNameNoExtension}.h`) || file.endsWith(`${switchSourceFileNameNoExtension}.hpp`)) {
				log_uvch.log(`[SWITCH_FILE] Found header file: '${path.basename(file)}'`);
				return (file);
			}
		}

		// TECHNIQUE: 3, Look on every folder in vscode
		// TODO: Add extension settings to exclude folders
		return (new Promise<string | undefined>(
			(resolve) => {
				vscode.workspace.findFiles(`**/${switchSourceFileNameNoExtension}.{h,hpp}`, undefined, 1)
					.then((fileFound: vscode.Uri[]) => {
						resolve(fileFound.length > 0 ? fileFound[0].fsPath : undefined);
					});
			}
		));
	}

	/**
	 * Find the cpp file corresponding to document
	 *
	 * @param sourceFullPath The full path of file you want to find his matching cpp file
	 * @returns The header file full path corresponding to 'sourceFullPath'
	 * @returns undefined if no cpp file was found
	 */
	public async	FindCppFileCorresponding(sourceFullPath: string): Promise<string | undefined>
	{
		const switchSourceFileNameNoExtension = path.basename(sourceFullPath).replace(path.extname(sourceFullPath), '');
		const switchSourceFilePath = path.dirname(sourceFullPath);

		// TECHNIQUE: 1, Find the header file in the public folder
		const resultOne = this.SearchSwitchFileUsingPublicPrivateFolders(
			switchSourceFileNameNoExtension, switchSourceFilePath, [".cpp"]);
		if (resultOne !== undefined) {
			return (resultOne);
		}

		// TECHNIQUE: 2, Find the header file in the same folder

		// Get all files in the same folder as an array of full path
		const filesInCurrentFolder = fs.readdirSync(switchSourceFilePath)
			.map((file: string) => `${switchSourceFilePath}/${file}`);

		// For each full path, check if it is the SwitchFile we are looking for
		for (const file of filesInCurrentFolder) {
			if (file.endsWith(`${switchSourceFileNameNoExtension}.cpp`)) {
				log_uvch.log(`[SWITCH_FILE] Found header file: '${path.basename(file)}'`);
				return (file);
			}
		}

		// TECHNIQUE: 3, Look on every folder in vscode
		// TODO: Add extension settings to exclude folders
		return (new Promise<string | undefined>(
			(resolve) => {
				vscode.workspace.findFiles(`**/${switchSourceFileNameNoExtension}.cpp`, undefined, 1)
					.then((fileFound: vscode.Uri[]) => {
						resolve(fileFound.length > 0 ? fileFound[0].fsPath : undefined);
					});
			}
		));
	}

	/**
	 * Seach the SwitchFile in the public folder, using the SwitchSourceFile private path
	 * (eg: /Source/Private/MyClass.h => /Source/Public/MyClass.hpp)
	 *
	 * @param sourceNameNoExtension The name of the SwitchSourceFile without extension
	 * @param sourcePath The path of the SwitchSourceFile
	 * @param extensions The potential extensions of the SwitchFile
	 * @returns The SwitchFile path if found else undefined
	 */
	private		SearchSwitchFileUsingPublicPrivateFolders(sourceNameNoExtension: string, sourcePath: string,
		extensions: string[]): string | undefined
	{
		let bIsSouceInPrivateFolder = false;

		// Look for the last private folder
		let privateFolderName = "";
		const allFoldersName = sourcePath.split('/');
		for (const folderName of allFoldersName) {
			if (/private/i.test(folderName)) {
				bIsSouceInPrivateFolder = true;
				privateFolderName = folderName;
				break;
			}
			else if (/public/i.test(folderName)) {
				privateFolderName = folderName;
				break;
			}
		}

		// Search the public folder at the same path has the private folder
		const pathBeforePrivate = sourcePath.substring(0, sourcePath.lastIndexOf(privateFolderName) - 1);
		const publicFolderName = fs.readdirSync(pathBeforePrivate)
			.find((folderName) => {
				if (bIsSouceInPrivateFolder) {
					return (/public/i.test(folderName));
				}
				return (/private/i.test(folderName));
			});

		if (publicFolderName)
		{
			const publicPath = sourcePath.replace(privateFolderName, publicFolderName);
			const publicRootPath = `${publicPath}/${sourceNameNoExtension}`;

			// Search for the switch file in the public folder using all the extension in params
			for (const extension of extensions) {
				const switchFile = `${publicRootPath}${extension}`;
				if (fs.existsSync(switchFile)) {
					return (switchFile);
				}
			}
		}
		return (undefined);
	}
}