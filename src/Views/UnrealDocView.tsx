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
import { IRestApiItem, IRestQueryRequest, IRestRequest } from '../Commands/BrowserCommands';
import { RestApiEntry } from './components/RestApiEntry';
import SearchBar from './components/SearchBar';

import "./UnrealDocView.css";

declare const window: Window & {
	acquireVsCodeApi: any
};

function	UnrealDocView(props: { vscode: any })
{
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_RestApiItems, set_RestApiItems] = React.useState<IRestApiItem[]>([]);
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_Query, set_Query] = React.useState<IRestQueryRequest | undefined>();
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_Loading, set_Loading] = React.useState<boolean>(false); // This is a number to display the loading animation

	function	UpdateUrls(request: IRestRequest | undefined)
	{
		set_Loading(false);
		if (request) {
			set_RestApiItems(request.items || []);
			set_Query(request.queries.request?.[0] || undefined);
		}
	}

	function	OnMessage(message: any) {
		if (message.data.type === "Update-Request") {
			UpdateUrls(message.data.data);
		}
	}

	function	OnBlur(value: string)
	{
		if (value) {
			set_Loading(true);
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
				{ dataKey: "DocSearchRequest", callbackMessageType: "Update-Request" }
			]
		});

		return () => window.removeEventListener('message', OnMessage);
	}, [ false ]);

	return (
		<div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
			<div style={{ width: "100%" }}>
				<SearchBar
					onBlur={OnBlur}
					blurType={["OnEnter", "OnIconClicked"]}
					placeholder="Search in unreal docs"
					value={decodeURIComponent(_Query?.searchTerms || "")}
				/>
			</div>
			<ul style={{ width: "calc(100% - 10px)", height: "100%", padding: 0, margin: "5px 5px 0px 5px", boxSizing: "border-box" }}>
				{_Loading ?
					// LOADING ANIMATION
					Array.from(Array(10).keys()).map(() => {
						return (
							<li style={{ listStyle: "none", margin: "5px", marginBottom: "10px" }} className="animated-loading"/>
						);
					})
					:
					(_RestApiItems.length > 0 ?
						// ALL RESULTS
						_RestApiItems.map((item: IRestApiItem) => {
							return (
								<li style={{ listStyle: "none", margin: "5px", marginBottom: "10px" }}>
									<RestApiEntry vscode={props.vscode} item={item} />
								</li>
							);
						})
						:
						// NOTHING FOUND
						<li style={{ listStyle: "none", margin: "5px", marginBottom: "10px" }}>
							<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
								<span style={{ color: "gray" }}>{!_Query?.searchTerms ? "Nothing to search" : "No results found"}</span>
							</div>
						</li>
					)
				}
			</ul>
		</div>
	);
}

ReactDOM.render(
	<UnrealDocView vscode={window.acquireVsCodeApi()} />,
	document.getElementById('UnrealDocView-root')
);