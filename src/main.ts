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
    await this.loadSettings();

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
    console.log(this.settings);
    // Obsidian fires off an initial "layout-change" before "onLayoutReady", so settings haven't loaded yet.
    // I don't want to load settings on every "layout-change", though...
    if(!this.settings){
      return;
    }

    console.log("[ RENDER ]");
    
    // Remove existing classes as we'll reapply them.
    Array.from(document.querySelectorAll('.hidden-workspace-folder')).forEach(
      (el) => el.classList.remove('hidden-workspace-folder')
    );

    const activeWorkspace = this.settings.active;
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

