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

import SwitchFileSubsystem from "../SubSystem/featureSubSystem/SwitchFileSubsystem";

export async function	SwitchHeaderCppFile_Implementation(): Promise<boolean>
{
	return (await SwitchFileSubsystem.SwitchFile());
}