import { App, PluginSettingTab, Setting } from 'obsidian';
import { WorkspaceFolderHiderPlugin } from 'main';
import { prepareSettingsForRendering, prepareSettingsForSaving } from './utils';

export class WorkspaceFolderHiderSettingTab extends PluginSettingTab {
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

    const workspaces = this.plugin.settings.workspaces;

    for(const workspace in workspaces){
      const settingsDisplay = prepareSettingsForRendering(this.plugin.settings.workspaces[workspace]);

      new Setting(containerEl)
        .setName(workspace)
        .setDesc('Input which folders are hidden in this workspace, one per line and case-sensitive.')
        .addTextArea(text => text
          .setValue(settingsDisplay)
          .onChange(async (txt) => {
            prepareSettingsForSaving(this.plugin.settings.workspaces[workspace], txt);
            await this.plugin.saveSettings();
          }));
    }

    new Setting(containerEl)
      .setName("Donate")
      .setDesc(
          "If you like this plugin, consider donating to support continued development."
      )
      .addButton((bt) => {
        bt.buttonEl.outerHTML =
          "<a href='https://ko-fi.com/JEBoothjr' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://cdn.ko-fi.com/cdn/kofi3.png?v=3' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>";
      });
	}
}
