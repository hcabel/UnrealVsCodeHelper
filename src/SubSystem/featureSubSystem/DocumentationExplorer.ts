/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   DocumentationExplorer.ts                           :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/13 09:21:28 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/06/13 09:21:28 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import {
	OpenUnrealDoc_Implementation,
	OpenUnrealDocFromSelection_Implementation,
	SearchUnrealDoc_Implementation
} from '../../Commands/BrowserCommands';

import AFeatureSubSystem from "./FeatureSubSystem";

export default class DocumentationExplorerSubsystem extends AFeatureSubSystem
{
	protected	Assign()
	{
		this._FeatureName = "DocumentationExplorer";
		this._EnableConfigPath = "Global.UseDocumentationExplorer";
		this._Commands = [
			{ cmd: "OpenUnrealDoc", func: OpenUnrealDoc_Implementation },
			{ cmd: "OpenUnrealDocFromSelection", func: OpenUnrealDocFromSelection_Implementation },
			{ cmd: "SearchUnrealDoc", func: SearchUnrealDoc_Implementation }
		];
		this._Views = [
			{
				viewId: "UVCH",
				panelIds: [
					"UnrealDocView"
				]
			}
		];
	}
}