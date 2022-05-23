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

export type DataListener<T> = (datas: T | undefined) => void;

export class DataPropertie<T>
{
	private _Listeners: DataListener<T>[] = [];
	private _Data: T | undefined;

	constructor(data: T | undefined = undefined, listeners: DataListener<T>[] | undefined = undefined) {
		this._Data = data;
		if (listeners) {
			this._Listeners = listeners;
		}
	}

	get data(): T | undefined {
		return (this._Data);
	}
	set data(newData: T | undefined) {
		this._Data = newData;
		this._Listeners.forEach((listener: DataListener<T>) => {
			listener(this._Data);
		});
	}

	public Listen(listener: DataListener<T>) {
		this._Listeners = this._Listeners.concat([listener]);
	}

	public ClearListeners() {
		this._Listeners = [];
	}

	public RemoveListener(listenerToRemove: DataListener<T>) {
		const oldLength = this._Listeners.length;
		console.log(5);
		this._Listeners = this._Listeners.filter((listener: DataListener<T>) => {
			return (listener !== listenerToRemove);
		});

		return (this._Listeners.length + 1 === oldLength);
	}

}

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

	private _Datas: Map<string, DataPropertie<any>> = new Map();

	public static Get(key: string) {
		return (this.instance._Datas.get(key)?.data);
	}

	public static Set(key: string, value: any) {
		const data = this.instance._Datas.get(key);

		if (!data) {
			this.instance._Datas.set(key, new DataPropertie<any>(value));
		}
		else {
			data.data = value;
		}
	}

	public static Listen(key: string, listener: DataListener<any>): boolean {
		const data = this.instance._Datas.get(key);

		if (!data) {
			this.instance._Datas.set(key, new DataPropertie<any>(undefined, [listener]));
		}
		else {
			data.Listen(listener);
			return (true);
		}
		return (false);
	}

	public static RemoveListener(key: string, listenerToRemove: DataListener<any>): boolean {
		const data = this.instance._Datas.get(key);

		if (data) {
			return (data.RemoveListener(listenerToRemove));
		}
		return (false);
	}

}