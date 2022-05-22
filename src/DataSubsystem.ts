/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   DataSubsystem.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/21 19:26:06 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/21 19:26:06 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

/**
 * This class will get store/manage all the data of UVCH
 */
export default class UVCHDataSubsystem
{
	private static _Instance: UVCHDataSubsystem | undefined;
	public static get instance(): UVCHDataSubsystem {
		if (!this._Instance) {
			this._Instance = new UVCHDataSubsystem();
		}
		return (this._Instance);
	}

	private _Datas: Map<string, any> = new Map();

	public static Get(key: string) {
		return (this.instance._Datas.get(key));
	}

	public static Set(key: string, value: any) {
		return (this.instance._Datas.set(key, value));
	}

}