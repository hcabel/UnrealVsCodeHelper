/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   index.tsx                                          :+:      :+:    :+:   */
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

declare const window: Window & {
	acquireVsCodeApi: any
};

function	UVCHProjectView(props: { vscode: any })
{
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_ProjectInfos, set_ProjectInfos] = React.useState<IProjectInfos | undefined>();
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_ErrorMessage, set_ErrorMessage] = React.useState<string>("Loading...");

	function	UpadateProjectInfos(projectInfos: any)
	{
		projectInfos = projectInfos || undefined;
		set_ProjectInfos(projectInfos);

		if (!projectInfos) {
			set_ErrorMessage("Unable to find your project");
		}
	}

	// Message Received from VsCode
	function	OnMessage(message: any) {
		console.log(7);
		if (message.data.type === "Update-Project-Infos") {
			UpadateProjectInfos(message.data.data);
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
				cmd: "UVCH.RefreshProjectInfos"
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
					{_ProjectInfos.Name}
				</div>
			}
		</div>
	);
}

ReactDOM.render(
	<UVCHProjectView vscode={window.acquireVsCodeApi()} />,
	document.getElementById('root')
);