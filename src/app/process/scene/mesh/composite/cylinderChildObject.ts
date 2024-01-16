import { Scene } from "../../../../model/assembler/scene";
import { Param } from "../../../../model/assembler/param";
import { EngineService } from "../../../../engine/engine.service";
import { ActionAllow } from "../../../utils/actionAllow";
import { Pivot } from "../../../utils/pivot";
import { ChildObject } from "./childObject";
import { Vector3 } from '@babylonjs/core';
import { Logger } from "../../../utils/logger";
import { Expression } from '../../../../process/expression/expression';

export class CylinderChildObject extends ChildObject {
	
	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(false, false);
	}

	public write(engine: EngineService): void {
		Logger.info("CylinderChildObject", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("CylinderChildObject", this.Param);
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
		this.mesh = this.mapper.createCylinder(engine);
		super.writeCreate(engine);
	}
	
	public static create(): CylinderChildObject {
		return new CylinderChildObject(Scene.create("", "object", "cylinder"));
	}

	public writeTransformAllParam(engine: EngineService): void {
		var pattern: string = this.getParamValue("pattern");
		if( pattern === "bar" ) {
			var begin: Vector3 = Expression.getResult(this.getParamValue("begin"), this.expressionParamList).vector;
			var end: Vector3 = Expression.getResult(this.getParamValue("end"), this.expressionParamList).vector;
			var radius: number = this.getParamValueFloat("radius");
			var segment: Vector3 = end.subtract(begin);
			var position: Vector3 = begin.add(end).multiplyByFloats(0.5, 0.5, 0.5);
			var pivot: Pivot = Pivot.createFromV(position, segment);
			pivot = this.parent.global.localToGlobalPivot(pivot);
			this.position = pivot.o;
			this.rotation = pivot.getEulerAnglesRad();
			this.scaling = new Vector3(radius*2, segment.length(), radius*2);
		} else {
			super.writeTransformAllParam(engine);
		}
	}

}