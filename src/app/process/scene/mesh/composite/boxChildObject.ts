import { Scene } from "../../../../model/assembler/scene";
import { Param } from "../../../../model/assembler/param";
import { EngineService } from "../../../../engine/engine.service";
import { ActionAllow } from "../../../utils/actionAllow";
import { Point } from "../../../utils/point";
import { Pivot } from "../../../utils/pivot";
import { ChildObject } from "./childObject";
import { Vector3 } from '@babylonjs/core';
import { Logger } from "../../../utils/logger";
import { Expression } from '../../../../process/expression/expression';

export class BoxChildObject extends ChildObject {
	
	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(false, false);
	}

	public write(engine: EngineService): void {
		Logger.info("BoxChildObject", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("BoxChildObject", this.Param);
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
		this.mesh = this.mapper.createBox(engine);
		super.writeCreate(engine);
	}
		
	public static create(): BoxChildObject {
		return new BoxChildObject(Scene.create("", "object", "box"));
	}

	public addBoxChild(paramList: Param[], expressionParamList: Param[]): BoxChildObject {
		var result: BoxChildObject = BoxChildObject.create();
		result.Param = [...paramList];
		result.expressionParamList = expressionParamList;
		this.children.push(result);
		return result;
	}


	public writeTransformAllParam(engine: EngineService): void {
		var pattern: string = this.getParamValue("pattern");
		if( pattern === "bar" ) {
			var begin: Vector3 = Expression.getResult(this.getParamValue("begin"), this.expressionParamList).vector;
			var end: Vector3 = Expression.getResult(this.getParamValue("end"), this.expressionParamList).vector;
			var section: Point = this.getParamValuePoint("section");
			var segment: Vector3 = end.subtract(begin);
			var position: Vector3 = begin.add(end).multiplyByFloats(0.5, 0.5, 0.5);
			var pivot: Pivot = Pivot.createFromW(position, segment);
			pivot = this.parent.global.localToGlobalPivot(pivot);
			this.position = pivot.o;
			this.rotation = pivot.getEulerAnglesRad();
			this.scaling = new Vector3(section.x, section.y, segment.length());
		} else {
			super.writeTransformAllParam(engine);
		}
	}

}