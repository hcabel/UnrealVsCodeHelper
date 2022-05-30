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

export function	RestApiEntry(props: { vscode: any, item: IRestApiItem })
{
	function	OnClick()
	{
		props.vscode.postMessage({
			action: "OpenUrl",
			content: props.item.link
		});
	}

	return (
		<div className={`RestApiEntry ${usefulURL.includes(props.item.link) ? "ImportantLink" : ''}`} onClick={OnClick}>
			{/* Title */}
			<div className="RestApiEntryTitle">
				{props.item.title}
			</div>
			{/* CONTENT */}
			<div className="RestApiEntryContent">
				<img className="RestApiEntryThumbnail" src={props.item.pagemap.metatags[0]['og:image']} />
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
