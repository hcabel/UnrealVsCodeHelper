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
	// The unique instance of the subsystem
	private static _Instance: ASubsystem | undefined = undefined;
	/**
	 * Get or create the instance of the subsystem casted has the given type
	 * @note I didn't find a way to dynamicly cast it has the current child class so I add a template
	 * @returns the unique instance of the subsystem
	 */
	public static GetInstance<T extends ASubsystem>(): T | undefined {
		if (!this._Instance) {
			this._Instance = new this();
		}
		return (this._Instance as T); // This is why it may be undefined
	}

	/**
	 * Initialise the subsystem
	 * @returns the unique instance of the subsystem
	 */
	public static	Init<T extends ASubsystem>(): T | undefined {
		// By asking for the instance, we are initalizing the class
		return (this.GetInstance<T>());
	}
	constructor() {
		// Called Assign before Init to allow the child class to assign its own properties
		this.Assign();
		this.Init();
	}

	// has to be overridden by the subclass

	protected	Assign() {}
	protected	Init() {}
};