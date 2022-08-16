/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   RestApiEntry.tsx                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/28 16:14:23 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/28 16:14:23 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from "react";
import { IGoogleRequestEntry } from "../../Commands/BrowserCommands";

import "./RestApiEntry.css";

const usefulURL: string[] = [
	// UFUNCTION
	"https://docs.unrealengine.com/4.27/en-US/ProgrammingAndScripting/GameplayArchitecture/Functions",
	// UPROPERTY
	"https://docs.unrealengine.com/5.0/en-US/unreal-engine-uproperty-specifiers",
	// METATAGS
	"https://docs.unrealengine.com/5.0/en-US/metadata-specifiers-in-unreal-engine"
];

export function	RestApiEntry(props: { vscode: any, item: IGoogleRequestEntry })
{
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_Thumbnail, /* set_Thumbnail */] = React.useState<string>(props.item.favicons.high_res || "");

	function	OnClick()
	{
		props.vscode.postMessage({
			action: "ExecuteCommand",
			content: {
				cmd: "simpleBrowser.api.open",
				args: [
					props.item.url,
					{
						preserveFocus: true,
						viewColumn: -2 // This is the value to open the tab "beside" the current one
					}
				]
			}
		});
	}

	return (
		<div className={`RestApiEntry ${usefulURL.includes(props.item.url) ? "ImportantLink" : ''}`} onClick={OnClick}>
			{/* Title */}
			<div className="RestApiEntryTitle">
				{props.item.title.replace('...', '')}
			</div>
			{/* CONTENT */}
			<div className="RestApiEntryContent">
				{_Thumbnail &&
					<img className="RestApiEntryThumbnail" src={_Thumbnail} />
				}
				{/* Snippet */}
				<div className="RestApiEntrySnippet">
					{props.item.description}
				</div>
			</div>
			{/* URL */}
			<div className="RestApiEntryUrl">
				{props.item.url}
			</div>
		</div>
	);
}
