/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SettingsSubsystem.ts                               :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/06 09:49:03 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/06/06 09:49:03 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as vscode from 'vscode';
import ASubsystem from './Subsystem';

const configPrefix = "UVCH";
export type ConfigSubSection = "Global" | "Toolbar" | "Switch" | "Documentation";
export type ConfigPath = `${ConfigSubSection}.${string}`;

export default class UVCHSettingsSubsystem extends ASubsystem
{
	public static Get<T = any>(section: ConfigPath): any | undefined {
		return (UVCHSettingsSubsystem.GetInstance<UVCHSettingsSubsystem>()!.Get<T>(section));
	}
	public Get<T = any>(section: ConfigPath): any | undefined {
		return (
			vscode.workspace.getConfiguration(section ? configPrefix : undefined)
				.get<T>(section)
		);
	}

}
