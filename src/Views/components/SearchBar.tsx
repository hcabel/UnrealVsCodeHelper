/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   SearchBar.tsx                                      :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/27 15:38:37 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/27 15:38:37 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from "react";

export type triggerBlurEvents = "OnExit" | "Dynamicaly" | "OnEnter" | "OnEscape";

export interface ICSearchBarProps {
	className?: string;
	triggerBlurEvents?: triggerBlurEvents[],
	onBlur?: (value: string) => void
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
	onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void,
	placeholder?: string,
}

export default function	SearchBar(props: ICSearchBarProps)
{
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_Value, set_Value] = React.useState<string>("FString");
	// eslint-disable-next-line @typescript-eslint/naming-convention
	// const [_Timer, set_Timer] = React.useState<NodeJS.Timer | undefined>(undefined);

	function	OnBlur()
	{
		if (props.onBlur) {
			props.onBlur(_Value);
		}
	}

	function	OnChange(event: React.ChangeEvent<HTMLInputElement>)
	{
		set_Value(event.target.value);

		// if (props.dynamicSearch) {
		// 	if (_Timer) {
		// 		clearTimeout(_Timer);
		// 	}
		// 	set_Timer(setTimeout(() => {
		// 		OnBlur();
		// 	}));
		// }
	}

	return (
		<div style={{
			position: "relative",
			width: "100%",
			height:"30px"
		}}>
			<div style={{
				display: "flex",
				flexDirection: "row",
				backgroundColor: "#eee",
				height: "30px"
			}}>
				<svg viewBox="0 0 24 24"
					style={{
						height: "100%",
						padding: "5px",
						boxSizing: "border-box"
					}}
				>
					<path fill="#000" d="M15.25 0a8.25 8.25 0 0 0-6.18 13.72L1 22.88l1.12 1l8.05-9.12A8.251 8.251 0 1 0 15.25.01V0zm0 15a6.75 6.75 0 1 1 0-13.5a6.75 6.75 0 0 1 0 13.5z" />
				</svg>
				<input
					className={props.className}
					placeholder={props.placeholder || "Search..."}
					type="text"
					value={_Value}
					onBlur={OnBlur}
					onChange={OnChange}
					style={{
						width: "100%",
						padding: "5px",
						backgroundColor: "rgba(0, 0, 0, 0)",
						border: "none",
						outline: "none"
					}}
				/>
			</div>
		</div>
	);
}