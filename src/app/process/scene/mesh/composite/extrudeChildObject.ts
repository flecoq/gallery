import { Scene } from "../../../../model/assembler/scene";
import { EngineService } from "../../../../engine/engine.service";
import { ActionAllow } from "../../../utils/actionAllow";
import { ChildObject } from "./childObject";
import { Logger } from "../../../utils/logger";
import { Pivot } from '../../../../process/utils/pivot';

export class ExtrudeChildObject extends ChildObject {
	
	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(false, false);
	}

	public write(engine: EngineService): void {
		Logger.info("ExtrudeChildObject", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("ExtrudeChildObject", this.Param);
		this.writeTransformAllParam(engine);
		if (!this.created) {
			this.writeCreate(engine);
		}
		this.mesh.position = this.position;
		this.mesh.rotation = this.rotation;
		this.mesh.scaling = this.scaling;
		this.writeMaterial(engine);
	}


	public writeTransformAllParam(engine: EngineService): void {
		this.pivot = Pivot.createFromResultParams("", this.Param, this.expressionParamList.length == 0 ? this.parent.getExpressionParamList() : this.expressionParamList);
		this.pivot = this.pivot.localToGlobalPivot(Pivot.createFromUW("-z;-y"));
		this.global = this.parent.global.localToGlobalPivot(this.pivot);
		this.rotation = this.global.getEulerAnglesRad();
		this.position = this.global.o;
		if (this.Param != null) {
			this.writeParamList(this.Param, engine);
		}
	}

	public writeCreate(engine: EngineService): void {
		this.mesh = this.mapper.createExtrudePolygon(engine);
		super.writeCreate(engine);
	}

}