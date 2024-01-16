import { Param } from "../../../model/assembler/param";
import { Scene } from "../../../model/assembler/scene";
import { LightImpl } from "./lightImpl";
import { PointLight, Vector3 } from "@babylonjs/core";
import { EngineService } from "../../../engine/engine.service";

export class PointLightObject extends LightImpl {

	public light: PointLight;

	public constructor(scene: Scene) {
		super(scene);
		scene.copy(this);
	}

	public write(engine: EngineService): void {
		super.write(engine);
		this.light.position = this.position;
		this.highlight(true);
	}

	public writeCreate(engine: EngineService): void {
		this.light = new PointLight(this.name, new Vector3(), engine.scene);
		this.shadowLight = this.light;
		super.writeCreate(engine);
		this.light.metadata = this;
	}

	public writeParam(param: Param): void {
		this.writeShadowGeneratorParam(param);
		this.writeTransformParam(param);
		if ("direction" === param.name) {
			//this.light.direction = param.getVectorValue();
		} else if ("intensity" === param.name) {
			this.light.intensity = param.getFloatValue();
		} else if ("diffuse" === param.name) {
			this.light.diffuse = param.getColor3Value();
		} else if ("specular" === param.name) {
			this.light.diffuse = param.getColor3Value();
		}
	}

}
