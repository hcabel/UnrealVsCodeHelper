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

export interface IRestApiItem {
	displayLink: string,
	htmlFormatedUrl: string,
	htmlSnippet: string,
	htmlTitle: string,
	kind: string,
	link: string,
	pagemap: {
		cse_image: [{
			src: string
		}],
		cse_thumbnail: [{
			src: string
		}],
		metatags: [{
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

		}]
	},
	snippet: string,
	title: string,
}

export async function	OpenUnrealDoc_Implementation(keyword: string = "", redirect: boolean = false): Promise<boolean | undefined>
{
	if (!keyword || keyword === "") {
		const inputSearch = await vscode.window.showInputBox({
			title: 'Unreal keywords',
			placeHolder: 'type your search'
		});
		if (!inputSearch) {
			return;
		}
		keyword = inputSearch.replace(' ', '+');
	}

	const projectInfos = UVCHDataSubsystem.Get<IProjectInfos>("ProjectInfos");

	let unrealVersion = "";
	if (projectInfos) {
		unrealVersion = `+${projectInfos.UnrealVersion}`;
	}

	const res = await Axios.get(`https://www.googleapis.com/customsearch/v1?key=AIzaSyCx5A22um1KpZHQrVnEziTFml-sFXXfdAs&c&&cx=082017022e8db588a&q=C%2B%2B+${keyword}+${unrealVersion}`);
	if (res.data) {
		const items = res.data.items || undefined;
		if (items) {
			if (redirect && items.length > 0) {
				log_uvch.log(`[UVHC] open url: '${items[0].link}' from '${keyword}'`);
				vscode.env.openExternal(vscode.Uri.parse(items[0].link));
			}
			UVCHDataSubsystem.Set("DocSearchResult", items);
			return (true);
		}
	}
	UVCHDataSubsystem.Set("DocSearchResult", undefined);
	return (false);
}

export async function	OpenUnrealDocFromSelection_Implementation()
{
	const editor = vscode.window.activeTextEditor;
	const selection = editor?.document.getText(editor.selection);
	OpenUnrealDoc_Implementation(selection || "", true);
}