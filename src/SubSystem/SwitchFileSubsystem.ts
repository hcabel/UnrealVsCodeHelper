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
		// Create Switch File status bar
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

		// Find current SwitchFile
		const currentDocument = vscode.window.activeTextEditor?.document;
		if (currentDocument) {
			this.RequestFindSwitchFile(currentDocument);
		}

		// Listen when you focusing on a file and update the 'SwitchFile' (To switch quicker between header/cpp)
		vscode.window.onDidChangeActiveTextEditor(async(ev: vscode.TextEditor | undefined) => {
			if (ev && ev.viewColumn && ev.viewColumn >= vscode.ViewColumn.One) {
				UVHCSwitchFileSubsystem.RequestFindSwitchFile(ev.document);
			}
		});
	}

	/**
	 * Switch to the file associated with the current file focused in the editor
	 * @returns true if the switch file has been found and opened
	 */
	public async	SwitchFile(): Promise<boolean>
	{
		const switchFilePath = UVCHDataSubsystem.Get<ISwitchFile>("SwitchFile");
		if (switchFilePath) {

			log_uvch.log(`[Switch] Switching to file: '${path.basename(switchFilePath.destPath)}'`);
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
			log_uvch.log(`[SWITCH] No switch file found ${path.basename(filePath)}`);
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
		let projectInfos: IProjectInfos = UVCHDataSubsystem.Get('ProjectInfos');
		if (!projectInfos) {
			await vscode.commands.executeCommand("UVCH.GetProjectInfos");
			projectInfos = UVCHDataSubsystem.Get('ProjectInfos');
			if (!projectInfos) {
				return (false);
			}
		}

		const documentPath = document.fileName.replaceAll('\\', '/');
		const switchSourceFile = documentPath.substring(documentPath.lastIndexOf("/") + 1);
		log_uvch.log(`[SWITCH] Start finding SwitchFile for '${switchSourceFile}'`);

		const switchFile = this.FindSwitchFile(document, `${projectInfos.RootPath}/Source`);
		if (switchFile) {
			log_uvch.log(`[SWITCH] Switch file found: '${switchFile.substring(switchFile.lastIndexOf("/") + 1)}'`);
			UVCHDataSubsystem.Set<ISwitchFile>("SwitchFile", {
				srcPath: documentPath,
				destPath: switchFile
			});
			return (true);
		}
		return (false);
	}

	/**
	 * Find the switch file for the given document
	 * This function will never search before the root path
	 *
	 * @param document The document that you wish find his header/cpp file
	 * @param rootPath The root path of were to find the header/cpp file
	 * @returns The header/cpp file path corresponding to the document
	 * @returns undefined if no header/cpp file was found
	 */
	public	FindSwitchFile(document: vscode.TextDocument, rootPath: string): string | undefined
	{
		// Get document extension
		const extensionIndex = document.fileName.lastIndexOf('.');
		const extension = document.fileName.substring(extensionIndex);

		let switchFile: string | undefined = undefined;
		if (extension === ".h" || extension === ".hpp") {
			switchFile = this.FindCppFileCorresponding(document, rootPath);
		}
		else if (extension === ".cpp") {
			switchFile = this.FindHeaderFileCorresponding(document, rootPath);
		}
		return (switchFile);
	}

	/**
	 * Find the header file corresponding to document
	 *
	 * @param document The document that you wish find his header file
	 * @param rootPath The root path of were to start find the header file
	 * @returns The SwitchFile path corresponding to the document
	 */
	public	FindHeaderFileCorresponding(document: vscode.TextDocument, rootPath: string): string | undefined
	{
		const filePath = document.fileName.replaceAll('\\', '/').replace(`${rootPath}/`, '');
		const switchSourceFileNameNoExtension = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.'));
		const switchSourceFilePath = filePath.substring(0, filePath.lastIndexOf('/'));

		// TECHNIQUE: 1, Find the header file in the public folder
		const resultOne = this.SearchSwitchFileUsingPublicPrivateFolders(
			rootPath, switchSourceFileNameNoExtension, switchSourceFilePath, [".h", ".hpp"]);
		if (resultOne !== undefined) {
			return (resultOne);
		}

		// TECHNIQUE: 2, Find the header file in the same folder

		// Get all files in the same folder as an array of full path
		const filesInCurrentFolder = fs.readdirSync(`${rootPath}/${switchSourceFilePath}`)
			.map((file: string) => `${rootPath}/${switchSourceFilePath}/${file}`);

		// For each full path, check if it is the SwitchFile we are looking for
		for (const file of filesInCurrentFolder) {
			if (file.endsWith(`${switchSourceFileNameNoExtension}.h`) || file.endsWith(`${switchSourceFileNameNoExtension}.hpp`)) {
				log_uvch.log(`[SWITCH] Found header file: '${path.basename(file)}'`);
				return (file);
			}
		}

		// @TODO: Find the header file in the same folder
		return (undefined);
	}

	/**
	 * Find the cpp file corresponding to document
	 *
	 * @param document The document that you wish find his cpp file
	 */
	public	FindCppFileCorresponding(document: vscode.TextDocument, rootPath: string): string | undefined
	{
		const filePath = document.fileName.replaceAll('\\', '/').replace(`${rootPath}/`, '');
		const switchSourceFileNameNoExtension = filePath.substring(filePath.lastIndexOf('/') + 1, filePath.lastIndexOf('.'));
		const switchSourceFilePath = filePath.substring(0, filePath.lastIndexOf('/'));

		// TECHNIQUE: 1, Find the header file in the public folder
		const resultOne = this.SearchSwitchFileUsingPublicPrivateFolders(
			rootPath, switchSourceFileNameNoExtension, switchSourceFilePath, [".cpp"]);
		if (resultOne !== undefined) {
			return (resultOne);
		}

		// TECHNIQUE: 2, Find the header file in the same folder

		// Get all files in the same folder as an array of full path
		const filesInCurrentFolder = fs.readdirSync(`${rootPath}/${switchSourceFilePath}`)
			.map((file: string) => `${rootPath}/${switchSourceFilePath}/${file}`);

		// For each full path, check if it is the SwitchFile we are looking for
		for (const file of filesInCurrentFolder) {
			if (file.endsWith(`${switchSourceFileNameNoExtension}.cpp`)) {
				log_uvch.log(`[SWITCH] Found header file: '${path.basename(file)}'`);
				return (file);
			}
		}

		return (undefined);
	}

	/**
	 * Seach the SwitchFile in the public folder, using the SwitchSourceFile private path
	 * (eg: /Source/Private/MyClass.h => /Source/Public/MyClass.hpp)
	 *
	 * @param rootPath The path were to start the search
	 * @param sourceNameNoExtension The name of the SwitchSourceFile without extension
	 * @param sourcePath The path of the SwitchSourceFile
	 * @param extensions The potential extensions of the SwitchFile
	 * @returns The SwitchFile path if found else undefined
	 */
	 private	SearchSwitchFileUsingPublicPrivateFolders(rootPath: string, sourceNameNoExtension: string,
		sourcePath: string, extensions: string[]): string | undefined
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
		const pathBeforePrivate = `${rootPath}/${sourcePath.substring(0, sourcePath.lastIndexOf(privateFolderName) - 1)}`;
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
			const publicRootPath = `${rootPath}/${publicPath}/${sourceNameNoExtension}`;

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