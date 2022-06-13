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

import ASubsystem from "./Subsystem";

// Prototype of the listener functions
export type DataListener<T> = (datas: T | undefined) => void;

/**
 * A Class storing data with listeners to those data
 */
export class DataPropertie<T>
{
	// All the function to call when the data is changed
	private _Listeners: DataListener<T>[] = [];
	// The data
	private _Data: T | undefined;

	constructor(data: T | undefined = undefined, listeners: DataListener<T>[] | undefined = undefined) {
		this._Data = data;
		if (listeners) {
			this._Listeners = listeners;
			for (const listener of this._Listeners) {
				listener(this._Data);
			}
		}
	}

	/**
	 * GET accessor (eg:  myDataPropertie.data)
	 * @return The data
	 */
	get data(): T | undefined {
		return (this._Data);
	}
	/**
	 * SET accessor to the data (eg:  myDataPropertie.data = newData)
	 * Set the data then call all the listener
	 * @param newData The new value of the data
	 */
	set data(newData: T | undefined) {
		this._Data = newData;
		this._Listeners.forEach((listener: DataListener<T>) => {
			listener(this._Data);
		});
	}

	/**
	 * Add a new listerner function
	 *
	 * @param listener The new function to add to the listeners array
	 */
	public Listen(listener: DataListener<T>) {
		this._Listeners = this._Listeners.concat([listener]);
	}

	/**
	 * Remove all the listerner functions
	 */
	public ClearListeners() {
		this._Listeners = [];
	}

	/**
	 * Remove a function from the listeners
	 *
	 * @param listenerToRemove The function that you want to remove from the listeners
	 * @returns If it has successully been removed
	 */
	public RemoveListener(listenerToRemove: DataListener<T>) {
		const oldLength = this._Listeners.length;
		this._Listeners = this._Listeners.filter((listener: DataListener<T>) => {
			return (listener !== listenerToRemove);
		});

		return (this._Listeners.length + 1 === oldLength);
	}
}

/**
 * This class will get store/manage all the data of UVCH
 */
export default class UVCHDataSubsystem extends ASubsystem
{
	private _Datas: Map<string, DataPropertie<any>> = new Map();

	public	Init()
	{
		this._Datas = new Map<string, DataPropertie<any>>();
	}

	/**
	 * Get data
	 *
	 * @param key The key how's referencing your data
	 * @returns The data or undefined if key not exist
	 */
	public static Get<T = any>(key: string): T | undefined {
		return (UVCHDataSubsystem.GetInstance<UVCHDataSubsystem>()!._Datas.get(key)?.data);
	}

	/**
	 * This add/update the data at a certain key
	 *
	 * @param key The key how's gonna reference your data (or already is if exist)
	 * @param value The value of the data that you want to add/update
	 */
	public static Set<T = any>(key: string, value: T | undefined) {
		const data = UVCHDataSubsystem.GetInstance<UVCHDataSubsystem>()!._Datas.get(key);

		if (!data) {
			// Not already exist, create new one
			UVCHDataSubsystem.GetInstance<UVCHDataSubsystem>()!._Datas.set(key, new DataPropertie<T>(value));
		}
		else {
			// Already exist, update value
			data.data = value;
		}
	}

	/**
	 * Allow you to add a listener function, that will be triggered every time the key value is change
	 *
	 * @param key The key how's referencing the data you want to listen
	 * @param listener Your function that you want to be called when data is changed
	 */
	public static Listen(key: string, listener: DataListener<any>) {
		const data = UVCHDataSubsystem.GetInstance<UVCHDataSubsystem>()!._Datas.get(key);

		if (!data) {
			// If key doesn't exist create one with the listener and a value of undefined
			UVCHDataSubsystem.GetInstance<UVCHDataSubsystem>()!._Datas.set(key, new DataPropertie<any>(undefined, [listener]));
		}
		else {
			// Add listener
			data.Listen(listener);
			listener(data.data);
		}
	}

	/**
	 * Remove function from the listening one
	 *
	 * @param key, The key how's referencing the data that you want to unlisten
	 * @param listenerToRemove, The listener function that you want to remove
	 * @returns true or false, depending on if the listener has been removed successfully
	 */
	public static RemoveListener(key: string, listenerToRemove: DataListener<any>): boolean {
		const data = UVCHDataSubsystem.GetInstance<UVCHDataSubsystem>()!._Datas.get(key);

		if (data) {
			return (data.RemoveListener(listenerToRemove));
		}
		return (false);
	}

}