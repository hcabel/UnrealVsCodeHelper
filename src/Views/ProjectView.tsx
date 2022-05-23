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

	function	OnMessage(message: any) {
		if (message.data.type === "Reload-View_ProjectView") {
			UpadateProjectInfos(message.data.data);
		}
	}

	React.useEffect(() => {
		window.addEventListener('message', OnMessage);

		props.vscode.postMessage({
			action: "ListenToDataSubsystem",
			content: [
				{ dataKey: "ProjectInfos", callbackMessageType: "Reload-View_ProjectView" }
			]
		});

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
				<h1 style={{ textAlign: "center" }}>
					{_ErrorMessage}
				</h1>
				:
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