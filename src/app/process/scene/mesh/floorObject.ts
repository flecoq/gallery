import { Scene } from "../../../model/assembler/scene";
import { MeshObject } from "../../../process/scene/mesh/meshObject";
import { EngineService } from "../../../engine/engine.service";
import { Pivot } from "../../utils/pivot";
import { Mesh, Vector3 } from '@babylonjs/core';
import { ActionAllow } from "../../utils/actionAllow";
import { Logger } from '../../utils/logger';

export class FloorObject extends MeshObject {

	private length: number;
	private width: number;
	private thickness: number;

	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(false, true);
	}

	public writeCreate(engine: EngineService): void {
		this.mesh = this.mapper.createBox(engine);
		super.writeCreate(engine);

		// by default, the floor receives shadow
		this.mesh.receiveShadows = true;
	}

	public write(engine: EngineService): void {
		Logger.info("FloorObject", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("FloorObject", this.Param);
		
		if (!this.created) {
			this.writeCreate(engine);
		}

		this.pivot = Pivot.createFromParams(this.Param);
		this.position = this.pivot.o;
		this.rotation = this.pivot.getEulerAnglesRad();

		var dimension: Vector3 = this.getParamValueVector("dimension");
		if (dimension != null) {
			this.width = dimension.x;
			this.length = dimension.z;
			this.thickness = dimension.y;
		}
		else {
			this.width = this.getParamValueFloat("width");
			this.length = this.getParamValueFloat("length");
			this.thickness = this.getParamValueFloat("thickness");
		}
		var local: Pivot = Pivot.createFromOrigin(new Vector3(this.width / 2, -this.thickness / 2, this.length / 2));
		var global: Pivot = this.pivot.localToGlobalPivot(local);		

		this.mesh.scaling = new Vector3(this.width, this.thickness, this.length);
		this.mesh.rotation = global.getEulerAnglesRad();
		this.mesh.rotation.y = -this.mesh.rotation.y;
		this.mesh.position = global.o;

		this.writeAllParam(engine);
	}

	public inCollisionBoundingBox(point: Vector3, distance: number): boolean {
		var local: Vector3 = this.pivot.globalToLocal(point);
		return local.y < distance;
	}

}