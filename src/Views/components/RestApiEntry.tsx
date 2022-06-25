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
import { IRestApiItem } from "../../Commands/BrowserCommands";

import "./RestApiEntry.css";

const usefulURL: string[] = [
	// UFUNCTION specifiers
	"https://docs.unrealengine.com/4.27/en-US/ProgrammingAndScripting/GameplayArchitecture/Functions",
	// UPROPERTY Specifers
	"https://docs.unrealengine.com/5.0/en-US/unreal-engine-uproperty-specifiers"
];

function	GetImage(item: IRestApiItem)
{
	if (item.pagemap.cse_image) {
		for (const img of item.pagemap.cse_image) {
			if (img.src) {
				return (img.src);
			}
		}
	}
	if (item.pagemap.cse_thumbnail) {
		for (const img of item.pagemap.cse_thumbnail) {
			if (img.src) {
				return (img.src);
			}
		}
	}
	if (item.pagemap.metatags) {
		for (const img of item.pagemap.metatags) {
			if (img["og:image"]) {
				return (img["og:image"]);
			}
		}
	}
	return ("");
}

export function	RestApiEntry(props: { vscode: any, item: IRestApiItem })
{
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_Thumbnail, /* set_Thumbnail */] = React.useState<string>(GetImage(props.item));

	function	OnClick()
	{
		props.vscode.postMessage({
			action: "ExecuteCommand",
			content: {
				cmd: "simpleBrowser.api.open",
				args: [
					props.item.link,
					{
						preserveFocus: true,
						viewColumn: -2 // This is the value to open the tab "beside" the current one
					}
				]
			}
		});
	}

	return (
		<div className={`RestApiEntry ${usefulURL.includes(props.item.link) ? "ImportantLink" : ''}`} onClick={OnClick}>
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
					{props.item.snippet}
				</div>
			</div>
			{/* URL */}
			<div className="RestApiEntryUrl">
				{props.item.link}
			</div>
		</div>
	);
}
