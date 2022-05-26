/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   FilesCommands.ts                                   :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/25 22:11:11 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/25 22:11:11 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import UVHCSwitchFileSubsystem from "../SubSystem/SwitchFileSubsystem";

export async function	SwitchHeaderCppFile_Implementation(): Promise<boolean>
{
	return (await UVHCSwitchFileSubsystem.SwitchFile());
}