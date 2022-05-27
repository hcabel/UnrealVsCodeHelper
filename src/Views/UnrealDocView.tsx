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
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_Loading, set_Loading] = React.useState<number>(0); // This is a number to display the loading animation

	function	UpdateUrls(items: IRestApiItem[])
	{
		set_Loading(0);
		set_RestApiItems(items || []);
	}

	function	OnMessage(message: any) {
		if (message.data.type === "Update-Urls") {
			UpdateUrls(message.data.data);
		}
	}

	function	OnBlur(value: string)
	{
		if (value) {
			set_Loading(10);
			set_RestApiItems([]);
			props.vscode.postMessage({
				action: "ExecuteCommand",
				content: {
					cmd: "UVCH.OpenUnrealDoc",
					args: [value, false]
				}
			});
		}
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

		return () => window.removeEventListener('message', OnMessage);
	}, [ false ]);

	return (
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
			<div style={{ width: "75%" }}>
				<SearchBar
					onBlur={OnBlur}
					blurType={["OnEnter"]}
				/>
			</div>
			<ul style={{ width: "100%", height: "100%", padding: 0 }}>
				{_Loading <= 0 ?
					<>
						{_RestApiItems.map((item: IRestApiItem) => {
							return (
								<li style={{ listStyle: "none", marginBottom: "10px" }}>
									<RestApiEntry vscode={props.vscode} item={item} />
								</li>
							);
						})}
					</>
					:
					<>
						{Array.from(Array(10).keys()).map(() => {
							return (
								<li style={{
									boxSizing: "border-box",
									listStyle: "none",
									marginBottom: "10px",
									width: "100%",
									display: "flex",
									alignContent: "center",
									justifyContent: "center",
									padding: "35px",
									fontSize: "2em",
								}}>
									. . .
								</li>
							);
						})}
					</>
				}
			</ul>
		</div>
	);
}

ReactDOM.render(
	<UnrealDocView vscode={window.acquireVsCodeApi()} />,
	document.getElementById('UnrealDocView-root')
);