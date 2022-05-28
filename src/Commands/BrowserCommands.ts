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
import Axios from "axios";
import UVCHDataSubsystem from "../SubSystem/DataSubsystem";
import { IProjectInfos } from "./ProjectCommands";
import log_uvch from '../utils/log_uvch';

// @TODO: Finished those interfaces
// I made them by looking into my request but some field might be no fully accurate
// (eg: 'safe' in 'IRestQueryRequest' return 'off' so I'm guessing his type is  '"off" | "on"' but I'm not sure)
// Also some of those field might be undefined depending of the request response

export interface IRestCse {
	src: string
}

export interface IRestMetaTags {
	"apple-mobile-web-app-title": string,
	"application-name": string,
	availability: string,
	crumbs: string,
	host: string,
	"msapplication-tilecolor": string,
	"msapplication-tileimage": string,
	"og:description": string,
	"og:image": string,
	"og:title": string,
	"theme-color": string,
	title: string,
	"twitter:card": string
	viewport: string,
	worker: string,
};

export interface IRestApiItem {
	displayLink: string,
	htmlFormatedUrl: string,
	htmlSnippet: string,
	htmlTitle: string,
	kind: string,
	link: string,
	pagemap: {
		cse_image: IRestCse[],
		cse_thumbnail: IRestCse[],
		metatags: IRestMetaTags[]
	},
	snippet: string,
	title: string,
}

export interface IRestQueryRequest {
	count: number,
	cs: string,
	inputEncoding: string,
	outputEncoding: string,
	safe: string,
	searchTerms: string,
	startIndex: number,
	title: string,
	totalResults: number,
}

export interface IRestRequest {
	context: {
		title: string
	},
	items?: IRestApiItem[],
	kind: string,
	queries: {
		nextPage: IRestQueryRequest[],
		request: IRestQueryRequest[]
	},
	searchInformation: {
		formattedSearchTime: string,
		formattedTotalResults: string,
		searchTime: number
		totalResults: string,
	},
	url: {
		template: string,
		type: string,
	}
};

export async function	OpenUnrealDoc_Implementation(keyword: string = "", redirect: boolean = true): Promise<boolean | undefined>
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

	// Remove extra spaces, and replace them by '+' because space aren't allowed in the url
	keyword = keyword.trim();
	keyword = keyword.replace(/\s\s+/gm, ' ');
	keyword = keyword.replace(' ', '+');

	// If keyword is not valid, we return false
	if (!keyword || /^\s*$/.test(keyword)) {
		return (false);
	}

	// This allow to add the project version in our research query
	let unrealVersion = "";
	const projectInfos = UVCHDataSubsystem.Get<IProjectInfos>("ProjectInfos");
	if (projectInfos && /[4|5]\.[0-9]([0-9])?/.test(keyword) === false) {
		unrealVersion = `+${projectInfos.UnrealVersion}`;
	}

	const query = `${keyword}${unrealVersion}`;
	// @TODO: IMPORTANT: This may throw with a 429 status code, this mean that our google app has reach the limit of request per day
 	const res = await Axios.get<IRestRequest>(
		`https://www.googleapis.com/customsearch/v1?key=AIzaSyAzqhOfdBENpvOveCfKUhyPhZ3oLargph4&cx=082017022e8db588a&q=${query}`);

	UVCHDataSubsystem.Set<IRestRequest>("DocSearchRequest", res.data || undefined);

	if (redirect && res.data.items && res.data.items.length > 0) {
		log_uvch.log(`[UVHC] open url: '${res.data.items[0].link}' from '${keyword}'`);
		vscode.env.openExternal(vscode.Uri.parse(res.data.items[0].link));
		return (true);
	}

	return (res.data ? true : false);
}

export async function	OpenUnrealDocFromSelection_Implementation(redirect: boolean = true)
{
	// Find current selection text
	const editor = vscode.window.activeTextEditor;
	const selection = editor?.document.getText(editor.selection);
	// Send request with keyword = selection
	OpenUnrealDoc_Implementation(selection || "", redirect);
}

export async function	SearchUnrealDoc_Implementation()
{
	OpenUnrealDocFromSelection_Implementation(false);
	// Show UnrealDocView
	vscode.commands.executeCommand("UnrealDocView.focus");
}