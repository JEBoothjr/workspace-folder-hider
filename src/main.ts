import { Plugin } from 'obsidian';
import { WorkspaceFolderHiderSettingTab } from './WorkspaceFolderHiderSettingTab';
import { IWorkspaceFolderHiderSettings, IWorkspaceFolderHiderSetting } from './interfaces';
import { getInternalWorkspaces, getInternalActiveWorkspace } from './utils';


const DEFAULT_SETTINGS: IWorkspaceFolderHiderSettings = {
  active: "",
	workspaces: {}
}

export default class WorkspaceFolderHiderPlugin extends Plugin {
	settings: IWorkspaceFolderHiderSettings;

  static readonly REFRESH_RATE = 25;

  async onload() {
    await this.syncSettings();

    this.app.workspace.onLayoutReady(
      async () => {
        this.addSettingTab(new WorkspaceFolderHiderSettingTab(this.app, this));
      });

    this.registerEvent(this.app.workspace.on(
      "layout-change",
      async () => {
        this.settings.active = await getInternalActiveWorkspace(this.app);
        await this.saveData(this.settings);
        window.setTimeout(() => {
          this.renderFolders();
        }, this.REFRESH_RATE);
      }));
	}

  async renderFolders() {
    // Remove existing classes as we'll reapply them.
    Array.from(document.querySelectorAll('.hidden-workspace-folder')).forEach(
      (el) => el.classList.remove('hidden-workspace-folder')
    );

    const activeWorkspace = this.settings.active;
    const workspaceSettings = this.settings.workspaces[activeWorkspace];

    if(!workspaceSettings || !workspaceSettings.folders || !workspaceSettings.folders.length) return;

    workspaceSettings.folders.forEach((folder:any) => {
      const q = `[data-path="${folder}"]`;
      const folderEl = document.querySelectorAll(q)[0];

      if(!folderEl || !folderEl.parentElement) return;

      folderEl.parentElement.classList.add('hidden-workspace-folder');
    });
  }

  // Since we're tracking the workspaces.json file we need to sync it with our data.json on startup
	async syncSettings() {
    const internalWorkspaces = await getInternalWorkspaces(this.app);
    let pluginSettings = await this.loadData(); // load the data.json file

    // If we have a data.json file, use it. If not create one based on the default settings.
    pluginSettings = pluginSettings || Object.assign({}, DEFAULT_SETTINGS, pluginSettings);
		this.settings = this.repairSettings(internalWorkspaces, pluginSettings);
    await this.saveData(this.settings);
	}

  // Ugly...
  // Makes sure that the plugin settings workspaces match what Obsidian is using internally
  repairSettings(internalSettings, pluginSettings): IWorkspaceFolderHiderSettings{
    // Make sure that the pluginSettings has any new workspaces
    let internalWorkspaceNames = Object.keys(internalSettings.workspaces);
    for(let i=0; i<internalWorkspaceNames.length; i++){
      let name = internalWorkspaceNames[i];
      if(!pluginSettings.workspaces[name]){
        pluginSettings.workspaces[name] = internalSettings.workspaces[name];
      }
    }

    // Make sure that the pluginSettings removes any workspaces that have been deleted
    let pluginWorkspaceNames = Object.keys(pluginSettings.workspaces);
    for(let i=0; i<pluginWorkspaceNames.length; i++){
      let name = pluginWorkspaceNames[i];
      if(!internalSettings.workspaces[name]){
        delete pluginSettings.workspaces[name];
      }
    }
    return pluginSettings;
  }

	async saveSettings() {
		await this.saveData(this.settings);
    await this.renderFolders();
	}
}

