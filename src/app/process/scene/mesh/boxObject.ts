import { Scene } from "../../../model/assembler/scene";
import { Param } from "../../../model/assembler/param";
import { MeshObject } from "../../../process/scene/mesh/meshObject";
import { EngineService } from "../../../engine/engine.service";
import { ActionAllow } from "../../utils/actionAllow";
import { Logger } from "../../utils/logger";

export class BoxObject extends MeshObject {

	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(true, false);
	}

	public write(engine: EngineService): void {
		Logger.info("SceneImpl", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("SceneImpl", this.Param);
		this.writeAllParam(engine);
		if (!this.created) {
			this.writeCreate(engine);
		}
		this.mesh.position = this.position;
		this.mesh.rotation = this.rotation;
		this.mesh.scaling = this.scaling;
		this.material.write(engine);
	}

	public writeCreate(engine: EngineService): void {
		this.mesh = this.mapper.createBox(engine);
		super.writeCreate(engine);
	}
	

	public writeParam(param: Param, engine: EngineService): void {
		this.writeReferenceParam(param, engine);
		this.writeTransformParam(param);
	}

	public writeAllParam(engine: EngineService): void {
		if (this.Param != null) {
			this.writeParamList(this.Param, engine);
		}
	}

	public static createBoxObject(scale: string, engine: EngineService): MeshObject {
		var scene = new Scene();
		scene.type = "object";
		scene.create = "box";
		scene.addOrUpdateParam("scale", scale);
		var result: BoxObject = new BoxObject(scene);
		return result;
	}

}