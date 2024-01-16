import { Content } from './content';
import { ProcessGroup } from './assembler/processGroup';
import { CreationGroup } from './assembler/creationGroup';
import { Creation } from './assembler/creation';
import { EngineService } from "../engine/engine.service";
import { Scene } from './assembler/scene';
import { Process } from './assembler/process';
import { Action } from './assembler/action';
import { ActionUtils } from '../process/action/actionUtils';
import { Support } from '../process/scene/mesh/support/support';
import { ModelService } from '../service/model.service';
import { CameraMarkTexture } from "../process/scene/info/cameraMarkTexture";
import { RoomServer } from './server/roomServer';

export class Room {
	public id: number;
	public parent: number;
	public status: number;
	public accessing: number;
	public content: Content = new Content();
	public ProcessGroup: ProcessGroup = new ProcessGroup();
	public CreationGroup: CreationGroup = new CreationGroup();
	public supportList: Support[] = null;

	constructor() { }

	public createFromJson(data) {
		this.id = data.id;
		this.parent = data.parent;
		this.status = data.status;
		this.accessing = data.accessing;
		if (data.content) {
			this.content.createFromJson(data.content);
		}
		if (data.ProcessGroup) {
			this.ProcessGroup = new ProcessGroup();
			this.ProcessGroup.createFromJson(data.ProcessGroup);
		}
		if (data.CreationGroup) {
			this.CreationGroup = new CreationGroup();
			this.CreationGroup.createFromJson(data.CreationGroup);
		}
	}

	public createProcessGroupFromJson(data) {
		this.ProcessGroup = new ProcessGroup();
		this.ProcessGroup.createFromJson(data.ProcessGroup);
	}

	public isProcessEmpty(): boolean {
		return this.ProcessGroup == null || this.ProcessGroup.Process.length == 0;
	}

	public getTitle(): string {
		return this.content.getInfoValue('title');
	}

	public getThumbUrl(): string {
		return this.content.getInfoValue('thumb');
	}

	public getCreation(id: string): Creation {
		return this.CreationGroup.getCreation(id);
	}

	public execute(engine: EngineService): void {
		for (let process of this.ProcessGroup.Process) {
			if (this.isProcessExecute(process) ) {
				if( process.id === engine.modelService.spreedsheadProcessId ) {
					process.clear();
				} else {
					process.execute(engine);
				}
			}
		}
		this.checkAction(engine);
		engine.viewManager.cameraMarkTexture = new CameraMarkTexture(12, 1200, engine);
		engine.viewManager.cameraMarkTexture.refresh();
	}
	
	
	private isProcessExecute(process:Process):boolean {
		return !(process.type === "support") 
				&& !(process.type === "reference") 
				&& !(process.type === "material");
	}

	public checkAction(engine: EngineService): void {
		var actionList: Action[] = [];	// to avoid n2 calculation
		for (let sceneImpl of engine.sceneImplList) {
			var found: boolean = false;
			for (let action of actionList) {
				if (action.parent === "create." + sceneImpl.create) {
					sceneImpl.addAction(ActionUtils.getActionImpl(action.clone()));
					found = true;
				}
			}
			if (!found) {
				var action: Action = sceneImpl.checkAction(this);
				if (action) {
					actionList.push(action);
				}
			}
		}
	}

	public getProcess(id: string): Process {
		for (let process of this.ProcessGroup.Process) {
			if (process.id === id) {
				return process;
			}
		}
		return null;
	}

	public getProcessByType(type: string): Process {
		for (let process of this.ProcessGroup.Process) {
			if (process.type === type) {
				return process;
			}
		}
		return null;
	}

	public getSupportList(modelService: ModelService): Support[] {
		if (this.supportList == null) {
			this.supportList = [];
			var range: number = 0;
			var process: Process = this.getProcessByType("support");
			for (let scene of process.Scene) {
				this.supportList.push(new Support(scene, process, range++, modelService));
			}
		}
		return this.supportList;
	}

	public getSupport(name: string, modelService: ModelService): Support {
		for (let support of this.getSupportList(modelService)) {
			if (support.name === name) {
				return support;
			}
		}
		return null;
	}

	public getReference(value: string): Scene {
		return this.ProcessGroup.getReference(value);
	}

	public getActionByCriteria(value: string, criteria: string): Action {
		return this.ProcessGroup.getActionByCriteria(value, criteria);
	}
	
	public toRoomServer(): RoomServer {
		return new RoomServer(this.id ? this.id.toString() : null, this.parent.toString(), JSON.stringify(this.content));
	}

	public appendProcess(): Process {
		var process : Process = new Process();
		process.parent = this.id.toString();
		process.type = "3d";
		this.ProcessGroup.addProcess(process);
		return process;
	}

}
