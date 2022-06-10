/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   Subsystem.ts                                       :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/06/06 16:52:17 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/06/06 16:52:17 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export default class ASubsystem
{
	private static _Instance: ASubsystem | undefined;
	public static GetInstance<T extends ASubsystem>(): T | undefined {
		if (!this._Instance) {
			this._Instance = new ASubsystem();
		}
		return (this._Instance as T);
	}

	constructor() {
		this.Init();
	}
	public static	Init<T extends ASubsystem>(): T | undefined {
		return (this.GetInstance<T>());
	}
	// has to be overridden by the subclass
	public Init(): void {}
};