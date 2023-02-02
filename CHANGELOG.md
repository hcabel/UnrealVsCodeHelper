# Change Log

All notable changes to the "UnrealVsCodeHelper" extension will be documented in this file.

## `[Unreleased]`
- Auto completions on unreal's enums
- define tools suggestions
- Infos details on specifique unreal defines/function/modules
- Rename project scripts
- package project scripts
- Clean project scripts

## `[1.1.1] - 2022/02/02`

### Fix
- `Global` Fix content policy issue

## `[1.1.0] - 2022/08/23`

### Added
- `Browser` Add new usefull link for Unreal meta tags
- `Global` Add gear icon on every view to access UVCH settings easily

### Change
- `Shortcut` QuickSearch triggerable when you focusing a terminal (Not from selection though)
- `Browser` Replace Search method from 'Google API' to the npm package 'GoogleThis' because free tu use

### Fix
- `Browser` Fix bug who was duplicating search versions
- `Global` Fix the reload logo on the project view who wasn't showing up

## `[1.0.2] - 2022/08/05`

### Changed
- `Readme` Add the "video readme" to the readme and some automated badges

## `[1.0.1] - 2022/06/25`
### Added
- `Browser:` You can now change the request format in the settings (eg: if you want to add 'C++' to all your requests or if you don't want the current unreal version to be added)
- `Browser:` New setting to set where you want the browser tab to be oppened

### Fix
- `ToolBar:` Now play commands/buttons are waiting for the build to finish before executing
- `SwitchFile:` Resolve crash when no public/private folder in path
- `Interfaces:` Resolve crash when moving any interface panel

### Changed
- `Browser:` Error message when the request show no result
- `SwitchFile:` Error message when switching from unsupported file

### Remove
- `SwitchFile:` Hide status bar when on unsupported file

## `[1.0.0] - 2022/06/13`
### Added
- `Features:` You can disable any of the feature in the settings INDIVIDUALLY
- `ToolBar:` New settings to add any additional flags to build/play(game)/play(editor) commands

### Changed
- `Browser:` Fix RestItems design

## `[0.3.3] - 2022/06/01`
### Changed
- `ToolBar:` Use vscode feature(task/debuger) to: launch editor, build and play game

## `[0.3.2] - 2022/05/31`
### Added
- `Browser:` Highlight very usefull website in the Unreal documentation explorer. (if you want a page to be added, please contact me)

### Changed
- `Browser:` Documentation pages ar now open directly in VS Code, instead of opening a new browser tab.


## `[0.3.1] - 2022/05/29`
### Added
- `Interfaces:` Color responsive to your current theme

### Changed
- `Browser:` design and code refactoring
- `Browser:` Search image is hidden when the panel is too small to give more space to the snippets

### Fixed
- `Browser:` Fix scroll Y axis
- `Browser:` Resove stuck in loading animation when searching for the same thing

## `[0.3.0] - 2022/05/28`
### Added
- `Browser:` New command ***UVCH.QuickSearch*** who's opening documentation page in your browser
- `Browser:` New shortcut ***alt+f1*** Triggering ***UVCH.QuickSearch*** with the current selection has keyword
- `Browser:` New interface panel ***UVCH Browser***, a small browser for unreal documention INSIDE VsCode
- `Browser:` New shortcut ***alt+shift+f1*** triggering ***UVCH.BrowserSearch*** Allowing you do to do a reseach from the current selection without opening the browser tab

## `[0.2.0] - 2022/05/27`
### Added
- `SwitchFile:` New command ***UVCH.SwitchHeaderCppFile*** Switching between header/cpp files, when on *.h, *.hpp and *.cpp file
- `SwitchFile:` New statusBar showing you which SwitchFile is correponding with the current file
- `SwitchFile:` New shortcut ***alt+o*** Triggering ***UVCH.SwitchHeaderCppFile*** commands

## `[0.1.1] - 2022/05/25`
### Added
- `Global:` Add new AWSOME logo !!!!

### fixed
- `Global:` Fix minor bug
- `Global:` Fix ***package.json*** unacurate informations

### remove
- `Global:` Remvoe unecessary popup

## `[0.1.0] - 2022/05/24`
### Added
- `ToolBar:` New command ***UVCH.PlayGame*** Start your project has a game
- `ToolBar:` New command ***UVCH.PlayEditor*** Start your project in the editor
- `ToolBar:` New command ***UVCH.BuildEditor*** Build your project for the editor
- `Global:` New ActionBar ***UVCH*** Open UnrealVsCodeHelper side panel
- `ToolBar:` New Panel ***UnrealProjectView*** Showing the ToolBar feature interface
