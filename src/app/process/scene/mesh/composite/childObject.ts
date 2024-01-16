import { Param } from "../../../../model/assembler/param";
import { Scene } from "../../../../model/assembler/scene";
import { Process } from "../../../../model/assembler/process";
import { MeshObject } from "../../../../process/scene/mesh/meshObject";
import { EngineService } from "../../../../engine/engine.service";
import { Vector3, ActionManager, ExecuteCodeAction } from '@babylonjs/core';
import { ActionAllow } from "../../../utils/actionAllow";
import { CompositeObject } from "./compositeObject";
import { Logger } from '../../../../process/utils/logger';
import { Pivot } from '../../../../process/utils/pivot';
import { Expression } from '../../../../process/expression/expression';
import { CompositeMaterial } from '../material/compositeMaterial';

export class ChildObject extends MeshObject {

	public parent: CompositeObject;
	public children: ChildObject[] = [];	// generated objects
	public global: Pivot;
	public exclude: string;

	public constructor(scene: Scene) {
		super(scene);
		// /!\ actionAllow args have to be updated (pickable)
		this.actionAlow = new ActionAllow(true, false);
		this.exclude = this.getParamValue("exclude");
	}

	public writeCreate(engine: EngineService): void {
		this.created = true;
		this.actionAlow.edit = engine.edit;
		this.transformGizmo = engine.transformGizmo;
		this.mesh.metadata = this;
		engine.viewManager.addMeshObject(this);
		if (this.actionAlow.isEdit()) {
			engine.monitor.addMesh(this.mesh);
		}
		if (this.parent.actionAlow.pickable()) {
			this.mesh.actionManager = new ActionManager(engine.scene);
			this.mesh.actionManager.registerAction(
				new ExecuteCodeAction(
					ActionManager.OnPickTrigger,
					function(event) {
						var childObject: ChildObject = event.meshUnderPointer.metadata;	// meshObject = parent
						engine.pickSceneImpl(childObject.parent);
						if (childObject.parent.actionAlow.isGizmo()) {
							Logger.info("ChildObject", "Gizmo on: " + childObject.parent.name);
							childObject.parent.transformGizmo.attachToMeshObject(childObject.parent);
						}
					}
				)
			);
		}
	}

	public writeTransformAllParam(engine: EngineService): void {
		this.pivot = Pivot.createFromResultParams("", this.Param, this.expressionParamList.length == 0 ? this.parent.getExpressionParamList() : this.expressionParamList);
		this.global = this.parent.global.localToGlobalPivot(this.pivot);
		this.rotation = this.global.getEulerAnglesRad();
		this.position = this.global.o;
		if (this.Param != null) {
			this.writeParamList(this.Param, engine);
		}
	}

	public writeAllParam(engine: EngineService): void {
		this.writeTransformOnly(engine);
		this.writeMaterial(engine);
	}

	public writeTransformOnly(engine: EngineService): void {
		this.writeTransformAllParam(engine);
		this.mesh.position = this.position;
		this.mesh.rotation = this.rotation;
		this.mesh.scaling = this.scaling;
	}

	public writeChildren(engine: EngineService): void {
		for (let child of this.children) {
			child.parent = this.parent;
			child.write(engine);
		}
	}

	public writeMaterial(engine: EngineService): void {
		var param: Param = this.getParam("material.ref");
		if (param) {
			// parent material
			this.mesh.material = (this.parent.material as CompositeMaterial).getMaterialById(param.value);
		} else {
			// own material
			this.material = MeshObject.getMaterialImpl(this, engine);
			if (this.material) {
				this.material.write(engine);
			} else if (this.parent.material) {
				// default parent material
				this.mesh.material = this.parent.material.material;
			}
		}
	}

	public writeTransformParam(param: Param): void {
		var name: string = param.name;

		if ("scale" === name) {
			this.scaling = Expression.getResult(param.value, this.expressionParamList).vector;
		}
		else if ("scale.x" === name) {
			this.scaling = new Vector3(Expression.getResult(param.value, this.expressionParamList).float, -1, -1);
		}
		else if ("scale.y" === name) {
			this.scaling = new Vector3(-1, Expression.getResult(param.value, this.expressionParamList).float, -1);
		}
		else if ("scale.z" === name) {
			this.scaling = new Vector3(-1, -1, Expression.getResult(param.value, this.expressionParamList).float);
		}

	}

	public getPatternParam(): Param[] {
		var result: Param[] = [];
		for (let param of this.Param) {
			if (param.name != "scale" && param.name != "pos" && param.name != "pattern") {
				result.push(param);
			}
		}
		return result;
	}

	public setPos(value: string): void {
		this.addOrUpdateParam("pos", value);
	}

	public setScale(value: string): void {
		this.addOrUpdateParam("scale", value);
	}

	public setUW(value: string): void {
		this.addOrUpdateParam("uw", value);
	}

	public isExculde(value: string): boolean {
		return this.exclude != null && this.exclude.indexOf(value) >= 0;
	}

	public getProcess(): Process {
		return this.parent.process;
	}
}