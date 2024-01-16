import { Scene } from "../../../../model/assembler/scene";
import { EngineService } from "../../../../engine/engine.service";
import { ActionAllow } from "../../../utils/actionAllow";
import { ChildObject } from "./childObject";
import { Logger } from "../../../utils/logger";

export class SphereChildObject extends ChildObject {
	
	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(false, false);
	}

	public write(engine: EngineService): void {
		Logger.info("SphereChildObject", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("SphereChildObject", this.Param);
		this.writeTransformAllParam(engine);
		if (!this.created) {
			this.writeCreate(engine);
		}
		this.mesh.position = this.position;
		this.mesh.rotation = this.rotation;
		this.mesh.rotation.y = -this.mesh.rotation.y;
		this.mesh.scaling = this.scaling;
		this.writeMaterial(engine);
	}

	public writeCreate(engine: EngineService): void {
		this.mesh = this.mapper.createSphere(engine);
		super.writeCreate(engine);
	}
	
	public static create(): SphereChildObject {
		return new SphereChildObject(Scene.create("", "object", "sphere"));
	}

}