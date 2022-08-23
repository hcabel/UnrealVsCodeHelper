/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   BrowserSubsystem.ts                                :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 09:21:28 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/06/13 09:21:28 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
	QuickSearch_Implementation,
	QuickSearchFromSelection_Implementation,
	BrowserSearch_Implementation,
	BrowserSearchFromSelection_Implementation
} from '../../Commands/BrowserCommands';

import AFeatureSubSystem from "./FeatureSubSystem";

export default class BrowserSubsystem extends AFeatureSubSystem
{
	protected	Assign()
	{
		this._FeatureName = "Browser";
		this._EnableConfigPath = "Global.UseBrowser";
		this._Commands = [
			{ cmd: "QuickSearch", func: QuickSearch_Implementation },
			{ cmd: "QuickSearchFromSelection", func: QuickSearchFromSelection_Implementation },
			{ cmd: "BrowserSearch", func: BrowserSearch_Implementation },
			{ cmd: "BrowserSearchFromSelection", func: BrowserSearchFromSelection_Implementation },
		];
		this._Views = [
			{
				viewId: "UVCH",
				panelIds: [
					"UVCHBrowser"
				]
			}
		];
	}
}