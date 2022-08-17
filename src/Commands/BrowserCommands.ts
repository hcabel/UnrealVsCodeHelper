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

async function	VerifyKeyword(keyword: string): Promise<string>
{
	if (!keyword || keyword === "") {
		// If no keyword is provided, we show a input box for the user to enter a keyword
		const inputSearch = await vscode.window.showInputBox({
			title: 'DocSearch input box',
			placeHolder: 'DocSearch...',
		});
		// If the user cancel the input box, we return false
		if (!inputSearch) {
			return ("");
		}
		keyword = inputSearch;
	}
	return (keyword);
}

function	OpenPage(url: string)
{
	// Get Settings
	const settingOpenPanelLocation = UVCHSettingsSubsystem.Get<string>("Browser.DocSearch.OpenPanelLocation");
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

function	FormatQuery(keyword: string, websiteList: string[] = []): IGoogleQuery | undefined
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
	const settingSearchFormat = UVCHSettingsSubsystem.Get<string>("Browser.SearchFormat") || "";
	const projectInfos = UVCHDataSubsystem.Get<IProjectInfos>("ProjectInfos");

	const bKeywordContainVersion: boolean =
		RegExp(/(\s|^)((UE[0-9])|((UE)?[0-9]\.[0-9][0-9]?)|((UE)?[0-9]\.[0-9][0-9]\.[0-9][0-9]?))(\s|$)/i)
			.test(keyword);

	const query = settingSearchFormat
		.replace("%KEYWORD%", keyword)
		.replace("%VERSION%", (bKeywordContainVersion ? "" : projectInfos?.UnrealVersion || ""))
		.trim();

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

async function	SendQuery(query: IGoogleQuery): Promise<IGoogleRequest>
{
	// Sending request
	const newRequest = await GoogleThis.search(query.fullQuery, query.options);
	const result = {
		query: query,
		result: newRequest.results
	};
	console.log({ query: query.fullQuery, res: result.result.map((r: any) => r.url)});
	// Update the value
	UVCHDataSubsystem.Set<IGoogleRequest>("LastGoogleRequest", result);

	if (!result.result || result.result.length === 0) {
		vscode.window.showErrorMessage(`No result found for '${query.formatedQuery}'`);
	}

	return (result);
}

export async function	OpenUnrealDoc_Implementation(keyword: string = "", open: boolean = false): Promise<boolean>
{
	keyword = await VerifyKeyword(keyword);
	if (!keyword) {
		return (false);
	}

	// Get website list in the settings
	const websiteList = UVCHSettingsSubsystem.Get<string[]>("Browser.DocSearch.AllowedWebsiteList") || [];
	// Format the query
	const query = FormatQuery(keyword, websiteList);
	if (!query || !query.keyword || !query.formatedQuery || !query.fullQuery) {
		vscode.window.showErrorMessage(`Invalid query: '${keyword}'`);
		return (false);
	}

	// Show UVCHBrowser
	vscode.commands.executeCommand("UVCHBrowser.focus");

	const request = await SendQuery(query);
	if (request.result && open) {
		log_uvch.log(`[UVHC] open url: '${request.result[0].url}' from keyword '${keyword}'`);
		// Open the page into vscode using Simple Browser
		OpenPage(request.result[0].url);
	}


	return (request.result && request.result.length > 0 ? true : false);
}

export function	OpenUnrealDocFromSelection_Implementation(open: boolean = true)
{
	// Find current selection text
	const editor = vscode.window.activeTextEditor;
	const selection = editor?.document.getText(editor.selection);

	// Send request with keyword = selection
	OpenUnrealDoc_Implementation(selection || "", open);
}

export async function	UnrealSearch_Implementation(keyword: string = ""): Promise<boolean>
{
	if (!keyword) {
		return (false);
	}

	// Get website list in the settings
	const websiteList = [
		...(UVCHSettingsSubsystem.Get<string[]>("Browser.DocSearch.AllowedWebsiteList") || []),
		...(UVCHSettingsSubsystem.Get<string[]>("Browser.UnrealSearch.AllowedWebsiteList") || []),
	];
	// Format the query
	const query = FormatQuery(keyword, websiteList);
	if (!query || !query.keyword || !query.formatedQuery || !query.fullQuery) {
		vscode.window.showErrorMessage(`Invalid query: '${query}'`);
		return (false);
	}

	// Show UVCHBrowser
	vscode.commands.executeCommand("UVCHBrowser.focus");

	const request = await SendQuery(query);

	return (request.result && request.result.length > 0 ? true : false);
}

export function	UnrealSearchFromSelection_Implementation()
{
	// Find current selection text
	const editor = vscode.window.activeTextEditor;
	const selection = editor?.document.getText(editor.selection);

	// Send request with keyword = selection
	UnrealSearch_Implementation(selection || "");
}