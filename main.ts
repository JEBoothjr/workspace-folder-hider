import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface WorkspaceFolderHiderSettings {
	workspaces: Array<any>;
}

const DEFAULT_SETTINGS: WorkspaceFolderHiderSettings = {
	workspaces: []
}

const cleanTreePath = (folder:String): string => {
  return folder.trim().replace(/^\/+/g, '');
}

const prepareSettingsForSaving = (folders:String): Array<String> => {
  return folders.split('\n').map(f => cleanTreePath(f)).filter((f) => f.length > 0);
}

const prepareSettingsForRendering = (folders:Array<String>): string => {
  return folders.map(f => cleanTreePath(f)).filter((f) => f.length > 0).join('\n');
}

const REFRESH_RATE = 25;

export default class WorkspaceFolderHiderPlugin extends Plugin {
	settings: WorkspaceFolderHiderSettings;

  async renderFolders() {
    const activeWorkspace = this.app.internalPlugins.plugins.workspaces.instance.activeWorkspace;
    const workspaceSettings = this.settings.workspaces[activeWorkspace];
    if(!workspaceSettings || !workspaceSettings.folders || !workspaceSettings.folders.length) return;

    workspaceSettings.folders.forEach((folder:any) => {
      const f = cleanTreePath(folder);
      const q = `[data-path="${f}"]`;
      const folderEl = document.querySelectorAll(q)[0];

      if(!folderEl || !folderEl.parentElement) return;

      folderEl.parentElement.classList.add('hidden-workspace-folder');
    });
  }

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new WorkspaceFolderHiderSettingTab(this.app, this));

    this.registerEvent(this.app.workspace.on(
      "layout-change",
      () => {
        window.setTimeout(() => {
          this.renderFolders();
        }, REFRESH_RATE);
      }));

    this.registerEvent(this.app.vault.on("rename", () => {
      // A small delay to ensure proper rendering
      window.setTimeout(() => {
        this.renderFolders();
      }, REFRESH_RATE);
    }));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
    await this.renderFolders();
	}
}

class WorkspaceFolderHiderSettingTab extends PluginSettingTab {
	plugin: WorkspaceFolderHiderPlugin;

	constructor(app: App, plugin: WorkspaceFolderHiderPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

  hide(): void {
    this.plugin.renderFolders();
  }

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

    const workspaces = this.app.internalPlugins.plugins.workspaces.instance.workspaces;

    for(const workspace in workspaces){
      const settingsDisplay = prepareSettingsForRendering(this.plugin.settings.workspaces[workspace].folders);
      new Setting(containerEl)
        .setName(workspace)
        .setDesc('Input which folders are hidden in this workspace, one per line and case-sensitive.')
        .addTextArea(text => text
          .setValue(settingsDisplay)
          .onChange(async (value) => {
            this.plugin.settings.workspaces[workspace].folders = prepareSettingsForSaving(value);
            await this.plugin.saveSettings();
          }));
    }

    new Setting(containerEl)
      .setName("Donate")
      .setDesc(
          "If you like this Plugin, consider donating to support continued development."
      )
      .addButton((bt) => {
        bt.buttonEl.outerHTML =
          "<a href='https://ko-fi.com/JEBoothjr' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>";
      });
	}
}
