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
	/**
	 * Get a property in the UVCH setting
	 * @param section the seting path to get
	 * @returns the value of the setting cast as the given type
	 */
	public static Get<T = any>(section: ConfigPath): T | undefined {
		return (UVCHSettingsSubsystem.GetInstance<UVCHSettingsSubsystem>()!.Get<T>(section));
	}
	public Get<T = any>(section: ConfigPath): T | undefined {
		return (
			vscode.workspace.getConfiguration(section ? configPrefix : undefined)
				.get<T>(section)
		);
	}

	public static Set<T = any>(section: ConfigPath, value: T): Thenable<void> {
		return (UVCHSettingsSubsystem.GetInstance<UVCHSettingsSubsystem>()!.Set<T>(section, value));
	}
	public Set<T = any>(section: ConfigPath, value: T): Thenable<void> {
		return (
			vscode.workspace.getConfiguration(section ? configPrefix : undefined)
				.update(section, value, 1)
		);
	}

}
