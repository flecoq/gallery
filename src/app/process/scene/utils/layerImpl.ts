import { Scene } from "../../../model/assembler/scene";
import { Param } from "../../../model/assembler/param";
import { SceneImpl } from "../sceneImpl";
import { EngineService } from "../../../engine/engine.service";
import { CommandLogMonitor } from '../../../utils/command/commandLogMonitor';

export class LayerImpl extends SceneImpl {

	public children: SceneImpl[];
	public param : Param;

	public constructor(scene: Scene) {
		super(scene);
		scene.copy(this);
		this.param = this.getParam("children"); 
	}

	public updateChildren(engine: EngineService, logger: CommandLogMonitor): void {
		this.children = [];
		if (this.getParam("children")) {
			for (let name of this.param.value.split(";")) {
				var scene: SceneImpl = engine.getSceneImpl(name);
				if (scene) {
					this.children.push(scene);
				} else {
					logger.error("scene '" + name + "' does not exist")
				}
			}
		}
		logger.printLayer(this);
	}

	public clear(): void {
		this.param.value = null;
	}
	
	public push(name: string): void {
		if( this.param.value && this.param.value.length > 0 
				&& this.param.value.indexOf(name) < 0) {
			this.param.value += ";" + name;
		} else {
			this.param.value = name;			
		}
	}

	public pull(name: string): void {
		this.param.value = this.param.value.replace(name + ";", ""); 
		this.param.value = this.param.value.replace(name, ""); 
	}
	
	public static createLayerImpl(name: string): LayerImpl {
		var scene : Scene = new Scene();
		scene.name = name;
		scene.type = "layer";
		scene.addParam("children", null, null);
		return new LayerImpl(scene);
	}

}
