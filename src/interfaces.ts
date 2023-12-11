/** Settings Structure
 * {
 *  workspaces: {
  *  "Workspace A": {
  *    folders: []
  *  },
  *  "Workspace B": {
  *    folders: []
  *   }
 *  }
 * }
 */

export interface IWorkspaceFolderHiderSetting {
	folders: Array<String>
}

export interface IWorkspaceFolderHiderSettings {
  active: string,
	workspaces: {
    [name: string]: IWorkspaceFolderHiderSetting
  };
}
