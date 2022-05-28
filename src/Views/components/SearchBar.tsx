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

export type blurType = "OnExit" | "Dynamicaly" | "OnEnter" | "OnEscape" | "OnIconClicked";

export interface ICSearchBarProps {
	value?: string,
	className?: string;
	blurType: blurType[],
	onBlur?: (value: string) => void
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void,
	onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void,
	placeholder?: string,
}

export default function	SearchBar(props: ICSearchBarProps)
{
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const	[_BlurType, set_BlurType] = React.useState<blurType>("OnExit");
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_Value, set_Value] = React.useState<string>("");
	// eslint-disable-next-line @typescript-eslint/naming-convention
	// const [_Timer, set_Timer] = React.useState<NodeJS.Timer | undefined>(undefined);

	function	OnBlur()
	{
		document.onkeydown = function() {};

		if (props.onBlur && props.blurType.includes(_BlurType)) {
			props.onBlur(_Value);
		}
		set_BlurType("OnExit");
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

	function	OnFocus()
	{
		document.onkeydown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				event.preventDefault();

				set_BlurType("OnEscape");
			}
			else if (event.key === "Enter") {
				event.preventDefault();

				set_BlurType("OnEnter");
			}
		};
	}

	React.useEffect(() => {
		if (_BlurType !== "OnExit") {
			if (_BlurType === "OnIconClicked") {
				OnBlur(); // Can't blur input if the input is not focused
			}
			else {
				document.getElementById("searchBar")?.blur();
			}
		}
	});

	React.useEffect(() => {
		if (props.value) {
			set_Value(props.value);
		}
	}, [ props.value ]);

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
						boxSizing: "border-box",
						cursor: "pointer"
					}}
					onClick={() => set_BlurType("OnIconClicked")}
				>
					<path fill="#000" d="M15.25 0a8.25 8.25 0 0 0-6.18 13.72L1 22.88l1.12 1l8.05-9.12A8.251 8.251 0 1 0 15.25.01V0zm0 15a6.75 6.75 0 1 1 0-13.5a6.75 6.75 0 0 1 0 13.5z" />
				</svg>
				<input
					id="searchBar"
					className={props.className}
					placeholder={props.placeholder || "Search..."}
					type="text"
					value={_Value}
					onBlur={OnBlur}
					onChange={OnChange}
					onFocus={OnFocus}
					style={{
						width: "100%",
						padding: "5px",
						backgroundColor: "rgba(0, 0, 0, 0)",
						border: "none",
						outline: "none"
					}}
				/>
				{_Value !== "" &&
					<svg viewBox="0 0 16 16"
						style={{
							height: "100%",
							padding: "5px",
							boxSizing: "border-box",
							cursor: "pointer"
						}}
						onClick={() => set_Value("")}
					>
						<path fill="#000" fill-rule="evenodd" d="m7.116 8l-4.558 4.558l.884.884L8 8.884l4.558 4.558l.884-.884L8.884 8l4.558-4.558l-.884-.884L8 7.116L3.442 2.558l-.884.884L7.116 8z" clip-rule="evenodd"/>
					</svg>
				}
			</div>
		</div>
	);
}