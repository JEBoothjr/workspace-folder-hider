import { App } from 'obsidian';
import { IWorkspaceFolderHiderSetting } from './interfaces';

/*
I await a formal API to obtain the workspace info.
*/

const getInternalWorkspaces = (app:App): any => {
  let workspaceNames = Object.keys(app.internalPlugins.plugins.workspaces.instance.workspaces);
  let result:any = { workspaces: {} };
  for(let i=0; i<workspaceNames.length; i++){
    result.workspaces[workspaceNames[i]] = { folders: [] }; // this structure must match the settings structure
  }
  return result;
}

const getInternalActiveWorkspace = (app:App): string => {
  return app.internalPlugins.plugins.workspaces.instance.activeWorkspace;
}

// Trims the folder path of any whitespace and removes any leading slashes
const cleanTreePath = (folder:String): string => {
  return folder.trim().replace(/^\/+/g, '');
}

// We need to take the list of folders from the text area and put them into an array.
const prepareSettingsForSaving = (setting:IWorkspaceFolderHiderSetting, txt): IWorkspaceFolderHiderSetting => {
  let folders:Array<String> = txt.split('\n').map(f => cleanTreePath(f)).filter((f) => f.length > 0);
  setting.folders = folders;
  return setting;
}

// We need to take the list of folders from the settings array and
// create a string of them for the text area in the settings.
const prepareSettingsForRendering = (setting:IWorkspaceFolderHiderSetting): string => {
  let folders:Array<String> = setting.folders || [];
  let result:string = folders.map(f => cleanTreePath(f)).filter((f) => f.length > 0).join('\n');
  return result;
}

export {
  getInternalWorkspaces,
  getInternalActiveWorkspace,
  prepareSettingsForSaving,
  prepareSettingsForRendering
}