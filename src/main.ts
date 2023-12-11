import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { WorkspaceFolderHiderSettingTab } from './WorkspaceFolderHiderSettingTab';
import { IWorkspaceFolderHiderSettings, IWorkspaceFolderHiderSetting } from './interfaces';
import { getInternalWorkspaces, getInternalActiveWorkspace } from './utils';


const DEFAULT_SETTINGS: IWorkspaceFolderHiderSettings = {
	workspaces: {}
}

export default class WorkspaceFolderHiderPlugin extends Plugin {
	settings: IWorkspaceFolderHiderSettings;

  static readonly REFRESH_RATE = 25;

  async onload() {
    this.app.workspace.onLayoutReady(
      async () => {
        await this.loadSettings();
        this.addSettingTab(new WorkspaceFolderHiderSettingTab(this.app, this));
        window.setTimeout(() => {
          this.renderFolders();
        }, this.REFRESH_RATE);
      });

    this.registerEvent(this.app.workspace.on(
      "layout-change",
      () => {
        window.setTimeout(() => {
          this.renderFolders();
        }, this.REFRESH_RATE);
      }));
	}

  async renderFolders() {
    // Obsidian fires off an initial "layout-change" before "onLayoutReady", so settings haven't loaded yet.
    // I don't want to load settings on every "layout-change", though...
    if(!this.settings){
      return;
    }
    const activeWorkspace = getInternalActiveWorkspace(this.app);
    const workspaceSettings = this.settings.workspaces[activeWorkspace];
    if(!workspaceSettings || !workspaceSettings.folders || !workspaceSettings.folders.length) return;

    workspaceSettings.folders.forEach((folder:any) => {
      // const f = cleanTreePath(folder);
      const q = `[data-path="${folder}"]`;
      const folderEl = document.querySelectorAll(q)[0];

      if(!folderEl || !folderEl.parentElement) return;

      folderEl.parentElement.classList.add('hidden-workspace-folder');
    });
  }

	async loadSettings() {
    const pluginSettings = await this.loadData();
    const internalWorkspaces = getInternalWorkspaces(this.app);
		this.settings = Object.assign({}, DEFAULT_SETTINGS, internalWorkspaces, pluginSettings);
	}

	async saveSettings() {
		await this.saveData(this.settings);
    await this.renderFolders();
	}
}

