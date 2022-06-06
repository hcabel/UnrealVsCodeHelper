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

const configPrefix = "UVCH";
export type ConfigSubSection = "Default" | "Toolbar" | "Switch" | "Documentation";
export type ConfigPath = `${ConfigSubSection}.${string}`;

export default class UVCHSettingsSubsystem
{
	private static _Instance: UVCHSettingsSubsystem | undefined;
	public static get instance(): UVCHSettingsSubsystem {
		if (!this._Instance) {
			this._Instance = new UVCHSettingsSubsystem();
		}
		return (this._Instance);
	}

	constructor() {
		this.Init();
	}
	public static	Init(): UVCHSettingsSubsystem {
		return (this.instance);
	}
	public	Init() {}

	public static Get<T = any>(section: ConfigPath): any | undefined {
		return (this.instance.Get<T>(section));
	}
	public Get<T = any>(section: ConfigPath): any | undefined {
		return (
			vscode.workspace.getConfiguration(section ? configPrefix : undefined)
				.get<T>(section)
		);
	}

}
