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
			this._Instance = new this();
		}
		return (this._Instance as T);
	}

	public static	Init<T extends ASubsystem>(): T | undefined {
		// By asking for the instance, we are initalizing the class
		return (this.GetInstance<T>());
	}
	constructor() {
		this.Init();
	}
	// has to be overridden by the subclass
	public Init(): void {}
};