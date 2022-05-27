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

declare const window: Window & {
	acquireVsCodeApi: any
};

// eslint-disable-next-line no-unused-vars
function	UnrealDocView(props: { vscode: any })
{
	return (
		<div>
			RIEN
		</div>
	);
}

ReactDOM.render(
	<UnrealDocView vscode={window.acquireVsCodeApi()} />,
	document.getElementById('UnrealDocView-root')
);