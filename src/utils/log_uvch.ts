/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   log_uvch.ts                                        :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/22 08:37:52 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/22 08:37:52 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

import * as vscode from 'vscode';

// eslint-disable-next-line @typescript-eslint/naming-convention
const log_uvch = vscode.window.createOutputChannel("UVCH");

export default {
	natif: log_uvch,
	log: log_uvch.appendLine
};