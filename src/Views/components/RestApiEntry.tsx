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

// WHOOOA THIS CSS IS VERY CRAPPY (hope nobody actualy see this)
// @TODO: Create css files

export function	RestApiEntry(props: { vscode: any, item: IRestApiItem })
{
	return (
		<div
			style={{
				height: '100px',
				width: "100%",
				cursor: "pointer",
			}}
			onClick={() => {
				// Open item url in browser
				props.vscode.postMessage({
					action: "OpenUrl",
					content: props.item.link
				});
			}}
		>
			{/* Title */}
			<div style={{
				fontSize: "1em",
				color: "#8ab4f8",
				overflow: "hidden",
				whiteSpace: "nowrap",
				backgroundColor: '#fff',
				fontWeight: 'bold'
			}}>
				{props.item.title}
			</div>
			{/* CONTENT */}
			<div style={{
				boxSizing: "border-box",
				padding: "5px",
				backgroundColor: "#fff",
				width: "100%",
				height: "calc(100% - 15px - 1.1em)",
				display: "flex",
				flex: "row"
			}}>
				<img src={props.item.pagemap.metatags[0]['og:image']} height="100%" />
				{/* Description */}
				<div style={{
					height: '100%',
					width: "100%",
					display: "flex",
					flexDirection: "column",
					fontSize: "0.75em",
					overflowX: "hidden",
					overflowY: "scroll",
				}}>
					{props.item.snippet}
				</div>
			</div>
			{/* URL */}
			<div style={{
				backgroundColor: "#888",
				width: "100%",
				height: "15px",
				whiteSpace: "nowrap",
				overflow: "hidden",
				fontSize: "12px"
			}}>
				{props.item.link}
			</div>
		</div>
	);
}
