/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   BrowserCommands.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/27 13:07:59 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/27 13:07:59 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as vscode from 'vscode';
import GoogleThis from 'googlethis';
import UVCHDataSubsystem from "../SubSystem/DataSubsystem";
import { IProjectInfos } from "./ToolbarCommands";
import log_uvch from '../utils/log_uvch';
import UVCHSettingsSubsystem from '../SubSystem/SettingsSubsystem';

export interface IGoogleRequestEntry {
	title: string,
	description: string,
	url: string,
	favicons: {
		high_res: string,
		low_res: string,
	}
};
export interface IGoogleQuery {
	keyword: string, // The keyword originally used
	formatedQuery: string, // The query formated with the user format in the settings
	fullQuery: string, // formatedQuery + hidden properties (e.g.: allowed websites)
	options: object // The options to use for the query
}

export interface IGoogleRequest {
	query: IGoogleQuery,
	result: IGoogleRequestEntry[]
}

function	OpenPage(url: string)
{
	// Get Settings
	const settingOpenPanelLocation = UVCHSettingsSubsystem.Get<string>("DocumentationExplorer.OpenPanelLocation");
	if (!settingOpenPanelLocation) {
		throw new Error("OpenPanelLocation setting is not set");
	}

	let viewColumn: number = -1;
	switch (settingOpenPanelLocation)
	{
	case "Active":
		viewColumn = -1; break;
	case "Beside":
		viewColumn = -2; break;
	case "One":
		viewColumn = 1; break;
	case "Two":
		viewColumn = 2; break;
	case "Three":
		viewColumn = 3; break;
	case "Four":
		viewColumn = 4; break;
	case "Five":
		viewColumn = 5; break;
	case "Six":
		viewColumn = 6; break;
	case "Seven":
		viewColumn = 7; break;
	case "Eight":
		viewColumn = 8; break;
	case "Nine":
		viewColumn = 9; break;
	default: // Beside
		viewColumn = -1; break;
	}

	// @TODO: add settings to redirect instead of open in vscode (and maybe choose his browser)
	vscode.commands.executeCommand('simpleBrowser.api.open', url, {
		preserveFocus: true,
		viewColumn: viewColumn
	});
}

function	FormatQuery(keyword: string): IGoogleQuery | undefined
{
	// Remove extra white spaces
	keyword = keyword.replace(/\s\s+/gm, ' ');
	keyword = keyword.trim();

	// If keyword is not valid, we return false
	if (!keyword || /^\s*$/.test(keyword)) {
		vscode.window.showErrorMessage(`Invalid keyword: '${keyword}'`);
		return (undefined);
	}

	// Construct query from settings format
	const settingResearchFormat = UVCHSettingsSubsystem.Get<string>("DocumentationExplorer.ResearchFormat") || "";
	const projectInfos = UVCHDataSubsystem.Get<IProjectInfos>("ProjectInfos");

	const bKeywordContainVersion: boolean =
		RegExp(/(\s|^)((UE[0-9])|((UE)?[0-9]\.[0-9][0-9]?)|((UE)?[0-9]\.[0-9][0-9]\.[0-9][0-9]?))(\s|$)/i)
			.test(keyword);

	const query = settingResearchFormat
		.replace("%KEYWORD%", keyword)
		.replace("%VERSION%", (bKeywordContainVersion ? "" : projectInfos?.UnrealVersion || ""))
		.trim();

	// Get website list in the settings
	const websiteList = UVCHSettingsSubsystem.Get<string[]>("DocumentationExplorer.ResearchWebsiteList") || [];
	// format all the url into a single string parsable by the google search engine
	const allowedWebsiteString =
		(websiteList.length > 0 ? ` site:${websiteList.join(" OR site:")}` : "");

	return ({
		formatedQuery: query,
		fullQuery: query + allowedWebsiteString,
		keyword: keyword,
		options: {
			page: 0,
			safe: false,
			additional_params: {}
		}
	});
}

export async function	OpenUnrealDoc_Implementation(keyword: string = "", open: boolean = true): Promise<boolean | undefined>
{
	if (!keyword || keyword === "") {
		// If no keyword is provided, we show a input box for the user to enter a keyword
		const inputSearch = await vscode.window.showInputBox({
			title: 'Unreal keywords',
			placeHolder: 'type your search'
		});
		// If the user cancel the input box, we return false
		if (!inputSearch) {
			return (false);
		}
		keyword = inputSearch;
	}

	const query = FormatQuery(keyword);
	if (!query) {
		vscode.window.showErrorMessage(`Invalid query: '${query}'`);
		return (false);
	}

	// This help against request spaming
	const oldRequest = UVCHDataSubsystem.Get<IGoogleRequest>("LastGoogleRequest");
	if (oldRequest && oldRequest.query.keyword === query.keyword) {
		// If the request is the same
		if (open) {
			if (oldRequest.result && oldRequest.result.length > 0) {
				OpenPage(oldRequest.result[0].url);
			}
			else {
				vscode.window.showErrorMessage(`No result found for '${keyword}'`);
			}
		}
		// Even if nothing change we set the value to trigger all listener
		UVCHDataSubsystem.Set<IGoogleRequest>("LastGoogleRequest", UVCHDataSubsystem.Get<IGoogleRequest>("LastGoogleRequest"));
		return (true);
	}

	const result = {
		query: query,
		result: (await GoogleThis.search(query.fullQuery, query.options)).results
	};
	UVCHDataSubsystem.Set<IGoogleRequest>("LastGoogleRequest", result);

	if (open) {
		if (result.result && result.result.length > 0) {
			log_uvch.log(`[UVHC] open url: '${result.result[0].url}' from keyword '${keyword}'`);

			// Open the page into vscode using Simple Browser
			OpenPage(result.result[0].url);
			return (true);
		}
		vscode.window.showErrorMessage(`No result found for '${keyword}'`);
		return (false);
	}

	return (result.result.length > 0 ? true : false);
}

export async function	OpenUnrealDocFromSelection_Implementation(open: boolean = true)
{
	// Find current selection text
	const editor = vscode.window.activeTextEditor;
	const selection = editor?.document.getText(editor.selection);
	// Send request with keyword = selection
	OpenUnrealDoc_Implementation(selection || "", open);
}

export async function	SearchUnrealDoc_Implementation()
{
	OpenUnrealDocFromSelection_Implementation(false);
	// Show UnrealDocView
	vscode.commands.executeCommand("UnrealDocView.focus");
}