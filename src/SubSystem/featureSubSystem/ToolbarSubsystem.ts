/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ToolbarSubsystem.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/10 13:02:16 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/06/10 13:02:16 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
	GetProjectInfos_Implementation,
	PlayGame_Implementation,
	PlayEditor_Implementation,
	BuildEditor_Implementation,
	GetUnrealEnginePath_Implementation
} from "../../Commands/ToolbarCommands";

import AFeatureSubSystem from "./FeatureSubSystem";

export default class ToolbarSubsystem extends AFeatureSubSystem
{
	protected	Assign()
	{
		this._FeatureName = "Toolbar";
		this._EnableConfigPath = "Global.UseToolbar";
		this._Commands = [
			{ cmd: "GetProjectInfos", func: GetProjectInfos_Implementation },
			{ cmd: "PlayGame", func: PlayGame_Implementation },
			{ cmd: "PlayEditor", func: PlayEditor_Implementation },
			{ cmd: "BuildEditor", func: BuildEditor_Implementation },
			{ cmd: "GetUnrealEnginePath", func: GetUnrealEnginePath_Implementation },
		];
		this._Views = [
			{
				viewId: "UVCH",
				panelIds: [
					"UnrealProjectView"
				]
			}
		];
	}
}