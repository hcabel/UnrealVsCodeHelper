/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   UETypes.ts                                         :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: HugoCabel <coding@hugocabel.com>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2022/05/23 11:50:43 by HugoCabel         #+#    #+#             */
/*   Updated: 2022/05/23 11:50:43 by HugoCabel        ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

export const ModuleLoadingPhaseValue = [
	"EarliestPossible",
	"PostConfigInit",
	"PostSplashScreen",
	"PreEarlyLoadingScreen",
	"PreLoadingScreen",
	"PreDefault",
	"Default",
	"PostDefault",
	"PostEngineInit",
	"None",
	"Max"
];

export const ModuleHostTypeValue = [
	"Runtime",
	"RuntimeNoCommandlet",
	"RuntimeAndProgram",
	"CookedOnly",
	"UncookedOnly",
	"Developer",
	"DeveloperTool",
	"Editor",
	"EditorNoCommandlet",
	"EditorAndProgram",
	"Program",
	"ServerOnly",
	"ClientOnly",
	"ClientOnlyNoCommandlet",
	"Max"
];

export interface IUEModule {
	Name: string,
	type: number, // ModuleHostTypeValue
	LoadingPhase: number, // ModuleLoadingPhaseValue
	// @TODO: Add and used the other
}

export interface IUEPlugin {
	Name: string,
	bEnabled: boolean,
	bOptional?: boolean,
	Description?: string
	MarketplaceURL?: string
}

export const ProjectFileVersionValues = [
	"Invalid",
	"Initial",
	"NameHash",
	"ProjectPluginUnification"
];

export interface IUEProject {
	FileVersion: number, // ProjectFileVersionValues
	EngineAssociation: string,
	Category: string,
	Description?: string,
	Modules?: IUEModule[],
	Plugins?: IUEPlugin[],
	/* NOT USED */
	// TargetPlatforms?: string,
	// EpicSampleNameHash?: number,
	// bIsEnterpriseProject: boolean,
	// bDisableEnginePluginsByDefault: boolean,
};