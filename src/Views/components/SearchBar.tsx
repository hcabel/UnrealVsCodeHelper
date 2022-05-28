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

import "./SearchBar.css";

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
	const [_Focus, set_Focus] = React.useState<boolean>(false);
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
		set_Focus(false);
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
		set_Focus(true);
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
		<div className="SearchBar">
			<div className="SearchBarContent">
				{/* Search bar icon, look like: > */}
				<svg className="SearchBarIcon" onClick={() => set_BlurType("OnIconClicked")} viewBox="0 0 16 16">
					<path fill="#c5c5c5" fill-rule="evenodd" d="M10.072 8.024L5.715 3.667l.618-.62L11 7.716v.618L6.333 13l-.618-.619l4.357-4.357z" clip-rule="evenodd"></path>
				</svg>
				<div className={`SearchBarInputWrapper ${_Focus && "focused"}`}>
					<input
						id="searchBar"
						className={`SearchBarInput ${props.className}`}
						placeholder={props.placeholder || "Search..."}
						type="text"
						value={_Value}
						onBlur={OnBlur}
						onChange={OnChange}
						onFocus={OnFocus}
					/>
					{/* Clear bar icon, look like: X */}
					{_Value !== "" &&
						<svg className="SearchBarClearIcon" onClick={() => set_Value("")} viewBox="0 0 16 16">
							<path fill="#c5c5c5" fill-rule="evenodd" d="m7.116 8l-4.558 4.558l.884.884L8 8.884l4.558 4.558l.884-.884L8.884 8l4.558-4.558l-.884-.884L8 7.116L3.442 2.558l-.884.884L7.116 8z" clip-rule="evenodd"/>
						</svg>
					}
				</div>
			</div>
		</div>
	);
}