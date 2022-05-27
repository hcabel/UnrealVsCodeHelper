/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UnrealDocView.tsx                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/21 20:10:15 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/21 20:10:15 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IRestApiItem } from '../Commands/BrowserCommands';
import SearchBar from './components/SearchBar';

declare const window: Window & {
	acquireVsCodeApi: any
};

// WHOOOA THIS CSS IS VERY CRAPPY (hope nobody actualy see this)
// @TODO: Create css files

function	RestApiEntry(props: { vscode: any, item: IRestApiItem })
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
				backgroundColor: '#fff'
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
					overflow: "hidden",
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

function	UnrealDocView(props: { vscode: any })
{
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_RestApiItems, set_RestApiItems] = React.useState<IRestApiItem[]>([]);

	function	UpdateUrls(items: IRestApiItem[])
	{
		set_RestApiItems(items || []);
	}

	function	OnMessage(message: any) {
		if (message.data.type === "Update-Urls") {
			UpdateUrls(message.data.data);
		}
	}

	function	OnBlur(value: string)
	{
		props.vscode.postMessage({
			action: "ExecuteCommand",
			content: {
				cmd: "UVCH.OpenUnrealDoc",
				args: [value, false]
			}
		});
	}

	// constructor
	React.useEffect(() => {
		window.addEventListener('message', OnMessage);

		props.vscode.postMessage({
			action: "ListenToDataSubsystem",
			content: [
				{ dataKey: "DocSearchResult", callbackMessageType: "Update-Urls" }
			]
		});

		OnBlur("FString");
		return () => window.removeEventListener('message', OnMessage);
	}, [ false ]);

	return (
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
			<div style={{ width: "75%" }}>
				<SearchBar
					onBlur={OnBlur}
				/>
			</div>
			<ul style={{ width: "100%", height: "100%", padding: 0 }}>
				{_RestApiItems.map((item: IRestApiItem) => {
					return (
						<li style={{ listStyle: "none", marginBottom: "10px" }}>
							<RestApiEntry vscode={props.vscode} item={item} />
						</li>
					);
				})}
			</ul>
		</div>
	);
}

ReactDOM.render(
	<UnrealDocView vscode={window.acquireVsCodeApi()} />,
	document.getElementById('UnrealDocView-root')
);