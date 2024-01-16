import { EngineService } from "../../engine/engine.service";
import { ModelService } from "../../service/model.service";
import { Process } from '../../model/assembler/process';
import { Creation } from '../../model/assembler/creation';
import { Param } from '../../model/assembler/param';
import { Room } from '../../model/room';
import { SceneImpl } from '../../process/scene/sceneImpl';
import { LayerImpl } from '../../process/scene/utils/layerImpl';
import { CameraObject } from "../../process/scene/cameraObject";
import { CommandComponent } from "./command.component";

export class CommandContext {

	public room: Room;
	public process: Process;
	public scene: SceneImpl;
	public child: SceneImpl;
	public parent: SceneImpl;
	public param: Param;
	public creation: Creation;
	public layer: LayerImpl;

	public uncommitted: boolean;
	public doCopyProcess: boolean;

	constructor(public component: CommandComponent, public engine: EngineService, public modelService: ModelService) {
	}

	public addRoom(room: Room): void {
		this.room = room;
		this.scene = this.engine.sceneImplList.length == 0 ? null : this.engine.sceneImplList[0];
		this.process = this.scene == null ? (room.ProcessGroup.Process.length == 0 ? null : room.ProcessGroup.Process[0]) : this.scene.process;
		this.param = this.scene == null || this.scene.Param.length == 0 ? null : this.scene.Param[0];
	}


	public getSceneImpl(processId: string, name: string): SceneImpl {
		for (let scene of this.engine.sceneImplList) {
			if ((scene.process.id === processId || processId == null)
				&& (scene.name === name || name == null)) {
				return scene;
			}
		}
		return null;
	}

	public getProcess(processId: string): Process {
		this.process = this.room.ProcessGroup.getProcess(processId);
		return this.process;
	}

	public getCurrentScene(): SceneImpl {
		return this.child ? this.child : this.scene;
	}
	
	public getCurrentCamera(): SceneImpl {
		return this.engine.viewManager.currentCamera.metadata;
	}

	public updateCurrentCamera(camera: CameraObject): void {
		(this.getCurrentCamera() as CameraObject).detachControl(this.engine);
		this.engine.viewManager.selectMainCamera(camera.camera);
	}

	public updateParam(): void {
		this.param = this.getCurrentScene() == null || this.getCurrentScene().Param.length == 0 ? null : this.getCurrentScene().Param[0];
	}

	public updateScene(): void {
		this.scene = this.process.Scene.length == 0 ? null : this.getSceneImpl(this.process.id, this.process.Scene[0].name);
		this.parent = this.scene;
		this.child = null;
		this.updateParam();
	}

	public insertProcess(process: Process): void {
		this.modelService.insertProcess(process);
		this.process = process;
		this.updateScene();
	}
	
	public persistProcess(): void {
		this.modelService.updateProcess(this.process);
	}

	public insertRoom(room: Room): void {
		this.modelService.insertRoom(room);
		this.room = room;
		this.process = null;
		this.scene = null;
		this.param = null;
		this.child = null;
		this.parent = null;
	}

	public persistRoom(): void {
		for(let process of this.room.ProcessGroup.Process ) {
			this.modelService.updateProcess(process);
		}
		this.modelService.updateCreationGroup();
	}

	public persistCreationGroup(): void {
		this.modelService.updateCreationGroup();
	}

	public copyProcess(): void {
		this.doCopyProcess = false;
		var process: Process = this.modelService.process;
		process.parent = this.room.id.toString();
		this.room.ProcessGroup.addProcess(process);
		this.insertProcess(process);
	}
	
	public rewriteScene(): void {
		if( !this.uncommitted ) {
			this.scene.write(this.engine);
		}
	}
	
	public addSceneImpl(scene: SceneImpl): void {
		this.process.addSceneImpl(scene, this.engine);
	}
	
	public addCreation(creation: Creation): void {
		this.room.CreationGroup.Creation.push(creation);
		this.creation = creation;
	}
	
	public emit(object): void {
		this.component.event.emit(object);
	}
}