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

export async function	OpenUnrealDoc_Implementation(keyword: string | undefined)
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

	Axios.get(`https://www.googleapis.com/customsearch/v1?key=AIzaSyCx5A22um1KpZHQrVnEziTFml-sFXXfdAs&c&&cx=082017022e8db588a&q=C%2B%2B+${keyword}+${unrealVersion}`)
		.then((res) => {
			if (res.data) {
				if (res.data.items && res.data.items.length > 0) {
					log_uvch.log(`[UVHC] open url: '${res.data.items[0].link}' from '${keyword}'`);
					vscode.env.openExternal(vscode.Uri.parse(res.data.items[0].link));
				}
			}
		});
}

export async function	OpenUnrealDocFromSelection_Implementation()
{
	const editor = vscode.window.activeTextEditor;
	const selection = editor?.document.getText(editor.selection);
	OpenUnrealDoc_Implementation(selection);
}