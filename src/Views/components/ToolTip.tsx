/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   ToolTip.tsx                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/24 16:17:38 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/24 16:17:38 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as React from "react";
import "./Tooltip.css";

export interface ITooltip {
	msg: string,
	direction?: "top" | "down",
	children?: React.ReactNode
}

export default function	Tooltip(props: ITooltip) {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	const [_Active, set_Active] = React.useState(false);

	let timeout: NodeJS.Timeout;

	function	ShowTip()
	{
		timeout = setTimeout(() => {
			set_Active(true);
		}, 400);
	}

	function	HideTip()
	{
		clearInterval(timeout);
		set_Active(false);
	}

	return (
		<div
			className="Tooltip-Wrapper"
			onMouseEnter={ShowTip}
			onMouseLeave={HideTip}
		>
			{props.children}
			{_Active && (
				<div className={`Tooltip-Tip ${props.direction || "top"}`}>
					{props.msg}
				</div>
			)}
		</div>
	);
};
