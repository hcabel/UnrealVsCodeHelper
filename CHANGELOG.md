# Change Log

All notable changes to the "UnrealVsCodeHelper" extension will be documented in this file.

## `[Unreleased]`
- Auto completions on unreal's enums
- define tools suggestions
- Infos details on specifique unreal defines/function/modules

## `[0.3.0] - 2022/05/28`
### Added
- **Command:** `UVCH.OpenUnrealDoc` Open unreal documentation in your browser
- **Shortcut:** `alt+f1` Trigger `UVCH.OpenUnrealDoc` with the current selection has keyword
- **Panel:** `UnrealDocView` Show all the search results INSIDE VsCode
- **Shortcut:** `alt+shift+f1` Allow you do to a reseach from the current selection

## `[0.2.0] - 2022/05/27`
### Added
- **Command:** `UVCH.SwitchHeaderCppFile` Switch between header/cpp files
- **StatusBar:** Show which SwitchFile is correponding with the current file
- **Shortcut:** `alt+o` Trigger the `UVCH.SwitchHeaderCppFile` command

## `[0.1.1] - 2022/05/25`
### Added
- **Extension Logo**

### fixed
- **Minor bugs**
- **Package json information** they were not accurate (eg: wrong name)

### remove
- **`Unnecessary popup`**

## `[0.1.0] - 2022/05/24`
### Added
- **Command:** `UVCH.PlayGame` Start your project has a game
- **Command:** `UVCH.PlayEditor` Start your project in the editor
- **Command:** `UVCH.BuildEditor` Build your project for the editor
- **ActionBar:** `UVCH` Open UnrealVsCodeHelper side panel
- **Panel:** `UnrealProjectView` Add variety of button triggerring some commands
