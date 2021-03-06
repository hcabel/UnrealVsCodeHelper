/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Toolbar.tsx                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/24 16:12:35 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/24 16:12:35 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from "react";
import Tooltip from "./ToolTip";

import "./ToolBar.css";

export default function ToolBar(props: { vscode: any })
{
	function	OnPlayGameButtonClick()
	{
		props.vscode.postMessage({
			action: "ExecuteCommand",
			content: {
				cmd: "UVCH.PlayGame"
			}
		});
	}

	function	OnPlayEditorButtonClick()
	{
		props.vscode.postMessage({
			action: "ExecuteCommand",
			content: {
				cmd: "UVCH.PlayEditor"
			}
		});
	}

	function	OnBuildButtonClick()
	{
		props.vscode.postMessage({
			action: "ExecuteCommand",
			content: {
				cmd: "UVCH.BuildEditor"
			}
		});
	}

	return (
		<div style={{
			display: 'flex',
			justifyContent: "space-around",
			flexDirection: "row",
		}}>
			<div style={{
				display: 'flex',
				justifyContent: "space-around",
				flexDirection: "row",
				alignItems: 'center',
				width: "75%",
				backgroundColor: "var(--vscode-editor-background)",
				borderRadius: "5px",
				padding: "2px 5px"
			}}>
				<Tooltip msg="Play Game">
					<svg className="IconSvg" width="20" height="20"
						viewBox="0 0 20 20" fill="#89d185"
						onClick={OnPlayGameButtonClick}
					>
						<path d="M3.1 17.9L17.4 10.2C17.9 9.9 17.9 9.2 17.4 8.9L3.1 1.1C2.6 0.799997 2 1.2 2 1.8V17.3C2 17.8 2.6 18.2 3.1 17.9Z"/>
					</svg>
				</Tooltip>
				<Tooltip msg="Play Editor">
					<svg className="IconSvg" style={{ height: "28px", width: "30px", marginTop: "5px" }}
						viewBox="0 0 20 20" fill="#89d185"
						onClick={OnPlayEditorButtonClick}
					>
						<path d="M1,14.9,13.59,8.1a.67.67,0,0,0,0-1.2L1,.1A.66.66,0,0,0,0,.7V14.4A.65.65,0,0,0,1,14.9Z"/>
						<path opacity={0.5} d="M4.51,18.49c8.49-1.32,10.82-5.13,10.82-5.13l-2-2,6.42-1.12-1.12,6.42-2-2S13.36,18.4,4.51,18.49Z"/>
					</svg>
				</Tooltip>
				<Tooltip msg="Build">
					<svg className="IconSvg"
						width="20" height="20" viewBox="0 0 20 20" fill="#757575"
						onClick={OnBuildButtonClick}
					>
						<path d="M6 15H3V18H6V15Z"/>
						<path d="M10 15H7V18H10V15Z"/>
						<path d="M14 15H11V18H14V15Z"/>
						<path d="M18 15H15V18H18V15Z"/>
						<path d="M18 11H15V14H18V11Z"/>
						<path d="M14 11H11V14H14V11Z"/>
						<path d="M10 11H7V14H10V11Z"/>
						<path d="M6 11H3V14H6V11Z"/>
						<path d="M14 7H11V10H14V7Z"/>
						<path d="M18 7H15V10H18V7Z"/>
						<path d="M18 3H15V6H18V3Z"/>
						<path opacity="0.5" d="M12 1H9V4H12V1Z"/>
						<path opacity="0.5" d="M8 5H5V8H8V5Z"/>
						<path opacity="0.5" d="M4 0H1V3H4V0Z"/>
					</svg>
				</Tooltip>
			</div>
		</div>
	);
}