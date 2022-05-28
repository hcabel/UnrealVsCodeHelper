/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UnrealProjectView.tsx                              :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/21 20:10:15 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/21 20:10:15 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IProjectInfos } from '../Commands/ProjectCommands';
import ToolBar from './components/Toolbar';
import { HorizontalBox } from './style/BaseStyle';

declare const window: Window & {
	acquireVsCodeApi: any
};

function	UnrealProjectView(props: { vscode: any })
{
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_ProjectInfos, set_ProjectInfos] = React.useState<IProjectInfos | undefined>();
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_ErrorMessage, set_ErrorMessage] = React.useState<string>("Loading...");

	function	UpdateProjectInfos(projectInfos: any)
	{
		projectInfos = projectInfos || undefined;
		set_ProjectInfos(projectInfos);

		if (!projectInfos) {
			set_ErrorMessage("Unable to find your project");
		}
	}

	// Message Received from VsCode
	function	OnMessage(message: any) {
		if (message.data.type === "Update-Project-Infos") {
			UpdateProjectInfos(message.data.data);
		}
	}

	// Constructor
	React.useEffect(() => {
		window.addEventListener('message', OnMessage);

		// Listen to our data changes
		props.vscode.postMessage({
			action: "ListenToDataSubsystem",
			content: [
				{ dataKey: "ProjectInfos", callbackMessageType: "Update-Project-Infos" }
			]
		});

		// Refresh project infos (or find them if never open before)
		props.vscode.postMessage({
			action: "ExecuteCommand",
			content: {
				cmd: "UVCH.GetProjectInfos"
			}
		});

		return () => window.removeEventListener('message', OnMessage);
	}, [false]);

	return (
		<div>
			{_ProjectInfos === undefined ?
				// ERROR MSG
				<h1 style={{ textAlign: "center" }}>
					{_ErrorMessage}
				</h1>
				:
				// INTERFACE
				<div>
					<div style={HorizontalBox} >
						<h3 style={{ marginTop: "0px" }}>
							{_ProjectInfos.Name}
						</h3>
						<h5 style={{ marginTop: "0px" }}>
							{_ProjectInfos.UnrealVersion}
						</h5>
					</div>
					<ToolBar vscode={props.vscode} />
					<img
						style={{
							position: "absolute",
							bottom: '0',
							left: '0',
							right: '0',
							margin: 'auto',
							maxWidth: '350px',
							width: '100%'
						}}
						src="https://i.giphy.com/media/Gm5cxiFJRVf0YZecFm/giphy.webp"
					/>
					<div
						style={{
							position: "absolute",
							bottom: '0',
							left: '0',
							padding: "0 5px",
							fontSize: '11px'
						}}
					>
						{/* @TODO: Do this programmatically */}
						Last update: <span style={{ fontWeight: 'bold' }}>28/05/2022</span>
					</div>
				</div>
			}
		</div>
	);
}

ReactDOM.render(
	<UnrealProjectView vscode={window.acquireVsCodeApi()} />,
	document.getElementById('UnrealProjectView-root')
);