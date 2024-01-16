import { Scene } from "../../model/assembler/scene";
import { SceneImpl } from "../../process/scene/sceneImpl";
import { VarManager } from '../../process/var/varManager';
import { EngineService } from "../../engine/engine.service";
import { Logger } from '../../process/utils/logger';

export class InstanceObject extends SceneImpl {

	public varManager: VarManager;

	public constructor(scene: Scene) {
		super(scene);
		scene.copy(this);
	}

	public writeCreate(engine: EngineService): void {
		this.created = true;
		if (this.Scene.length == 0 || this.getParamValueBool("generate")) {
			this.process.doUpdate = true;
			this.Scene = [];
			this.varManager = new VarManager(this.Variable);
			for (let param of this.Param) {
				if (param.name === "source") {
					this.Scene = this.Scene.concat(this.createInstanceList(param.value, engine));
				}
			}
		}
	}

	public createInstanceList(value: string, engine: EngineService): Scene[] {
		var result: Scene[] = [];
		var source: Scene;
		if (value.indexOf(";") > 0) {
			source = engine.modelService.getReference(value);
		} else {
			source = this.process.getScene(value);
		}
		var stream: string = JSON.stringify(source);
		if (stream.indexOf("$") > 0) {
			var u: number = 0;
			for (let valueCollection of this.varManager.valueCollectionList) {
				var replaced: string = valueCollection.replace(stream);
				var instance: Scene = new Scene();
				instance.createFromJson(JSON.parse(replaced));
				instance.name = "instance" + (u++);
				result.push(instance);
			}
		} else {
			result.push(source);
		}
		return result;
	}

	public write(engine: EngineService): void {
		Logger.info("InstanceObject", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("InstanceObject", JSON.stringify(this.Param));
		for (let scene of this.Scene) {
			(scene as SceneImpl).process = this.process;
			(scene as SceneImpl).write(engine);
		}
	}
}