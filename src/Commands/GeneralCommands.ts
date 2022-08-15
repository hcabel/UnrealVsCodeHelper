/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   GeneralCommands.ts                                 :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/08/15 20:42:15 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/08/15 20:42:15 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as vscode from 'vscode';

export function	GoToSettings_Implementation()
{
	vscode.commands.executeCommand("workbench.action.openSettings", "@ext:HugoCabel.uvch");
	return true;
}