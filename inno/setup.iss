; SEE THE DOCUMENTATION FOR DETAILS ON CREATING INNO SETUP SCRIPT FILES!

#define MyAppVersion GetEnv("VERSION")
#define MyAppPublisher "Gephyra OÜ"
#define MyAppURL "https://geph.io/"
#define MyAppExeName "gephgui.exe"

[Setup]
; NOTE: The value of AppId uniquely identifies this application.
; Do not use the same AppId value in installers for other applications.
; (To generate a new GUID, click Tools | Generate GUID inside the IDE.)
AppId={{09220679-1AE0-43B6-A263-AAE2CC36B9E3}
AppName={cm:MyAppName}
AppVersion={#MyAppVersion}
;AppVerName={#MyAppName} {#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={pf}\{cm:MyAppName}
DefaultGroupName={cm:MyAppName}
OutputBaseFilename=geph-windows-setup
Compression=bzip
SolidCompression=yes

[Languages]
Name: "en"; MessagesFile: "compiler:Default.isl"
Name: "zht"; MessagesFile: "ChineseTraditional.isl"
Name: "zhs"; MessagesFile: "ChineseSimplified.isl"

[CustomMessages]
en.MyAppName=Geph
zht.MyAppName=迷霧通
zhs.MyAppName=迷雾通

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[InstallDelete]
Type: filesandordirs; Name: "{app}\*"

[Files]
;Source: "E:\geph-electron-win32-ia32\geph-electron.exe"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\dist\win-ia32-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
; NOTE: Don't use "Flags: ignoreversion" on any shared system files

[Icons]
Name: "{group}\{cm:MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{cm:MyAppName}}"; Filename: "{uninstallexe}"
Name: "{commondesktop}\{cm:MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{cm:MyAppName}}"; Flags: nowait postinstall skipifsilent
