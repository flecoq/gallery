import { Scene } from "../../../model/assembler/scene";
import { SceneImpl } from "../../../process/scene/sceneImpl";
import { Param } from "../../../model/assembler/param";
import { Vector3, HemisphericLight } from "@babylonjs/core";
import { EngineService } from "../../../engine/engine.service";

export class HemisphericLightObject extends SceneImpl {

	protected light: HemisphericLight;	

	public constructor(scene: Scene) {
		super(scene);
		scene.copy(this);
	}

	public writeCreate(engine: EngineService): void {
		this.light = new HemisphericLight(this.name, new Vector3(), engine.scene);
		super.writeCreate(engine);
		this.light.metadata = this;
	}

	public writeParam(param: Param): void {
		this.writeTransformParam(param);
		if ("direction" === param.name) {
			this.light.direction = param.getVectorValue();
		} else if ("intensity" === param.name) {
			this.light.intensity = param.getFloatValue();
		} else if ("diffuse" === param.name) {
			this.light.diffuse = param.getColor3Value();
		} else if ("specular" === param.name) {
			this.light.specular = param.getColor3Value();
		} else if ("groundColor" === param.name) {
			this.light.groundColor = param.getColor3Value();
		} 
	}
	
	public static create(name: string): HemisphericLightObject {
		var result: HemisphericLightObject = new HemisphericLightObject(Scene.create(name, "object", "light"));
		result.addParam("direction", "0;1;0", "true");
		//result.addParam("diffuse", "1;1;1", "true");
		result.addParam("intensity", "0.6", "true");
		return result;
	}

}