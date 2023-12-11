import { App, FileSystemAdapter } from 'obsidian';
import { IWorkspaceFolderHiderSetting } from './interfaces';

/*
I await a formal API to obtain the workspace info.
*/

const getInternalWorkspaces = async (app:App): any => {
  let workspacesFile = await FileSystemAdapter.readLocalFile(`${app.vault.adapter.basePath}/.obsidian/workspaces.json`);
  let workspaces = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(workspacesFile)));
  
  let workspaceNames = Object.keys(workspaces.workspaces);
  let result:any = { workspaces: {} };
  for(let i=0; i<workspaceNames.length; i++){
    result.workspaces[workspaceNames[i]] = { folders: [] }; // this structure must match the settings structure
  }
  result.active = workspaces.active;
  return result;
}

const getInternalActiveWorkspace = async (app:App): string => {
  let workspacesFile = await FileSystemAdapter.readLocalFile(`${app.vault.adapter.basePath}/.obsidian/workspaces.json`);
  let workspaces = JSON.parse(String.fromCharCode.apply(null, new Uint8Array(workspacesFile)));

  return workspaces.active;
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