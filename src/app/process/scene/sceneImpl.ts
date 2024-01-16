import { EventEmitter } from '@angular/core';
import { Scene } from "../../model/assembler/scene";
import { Param } from "../../model/assembler/param";
import { Process } from '../../model/assembler/process';
import { Action } from '../../model/assembler/action';
import { Room } from '../../model/room';
import { FormatUtils } from '../../process/utils/formatUtils';
import { ParamUtils } from '../../process/utils/paramUtils';
import { Vector3 } from "@babylonjs/core/Maths/math";
import { EngineService } from "../../engine/engine.service";
import { Pivot } from '../utils/pivot';
import { ActionAllow } from '../utils/actionAllow';
import { CameraUtils } from '../utils/cameraUtils';
import { ActionUtils } from '../../process/action/actionUtils';
import { SceneAction } from '../../process/action/sceneAction';
import { Placeholder } from "../../process/scene/placeholder/placeholder";
import { Logger } from '../utils/logger';

export class SceneImpl extends Scene {

	public created: boolean = false;
	public pivot: Pivot;
	public process: Process;
	public source: Scene;

	public position: Vector3 = new Vector3();
	public rotation: Vector3 = new Vector3();
	public scaling: Vector3 = new Vector3(1, 1, 1);

	public actionAlow: ActionAllow;
	public behavior: string;
	public isActionChecked: boolean = false;
	public event: EventEmitter<string> = new EventEmitter<string>();

	public expressionParamList: Param[] = [];
	public instanceParent: SceneImpl;

	public constructor(scene: Scene) {
		super();
		scene.copy(this);
		this.source = scene;
		this.actionAlow = new ActionAllow(false, false);
	}

	public setParam(params: Param[]): void {
		this.Param = params;
		this.source.setParam(params);
	}

	public setActive(value: boolean): void {
		this.active = value ? "true" : "false";
		this.source.active = this.active;
	}

	public write(engine: EngineService): void {
		Logger.info("SceneImpl", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("SceneImpl", this.Param);
		if (!this.created) {
			this.writeCreate(engine);
		}
		this.writeAllParam(engine);
	}

	public writeCreate(engine: EngineService): void {
		this.created = true;
		this.actionAlow.edit = engine.edit;
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

	public writeParamList(params: Param[], engine: EngineService): void {
		for (let param of params) {
			if (!param.used && param.isActive()) {
				this.writeParam(param, engine);
			}
		}
	}

	public writeReferenceParam(param: Param, engine: EngineService): void {
		if (param.name === "reference") {
			var scene: Scene = engine.modelService.getReference(param.value);
			var params: Param[] = scene.create === "picture" ? ParamUtils.exclude(scene.Param, "asset;scale") : scene.Param;
			this.writeParamList(params, engine);
		}
	}

	public writeTransformParam(param: Param): void {
		var name: string = param.name;

		if ("pos" === name) {
			this.position = param.getVectorValue();
		}
		else if ("pos.x" === name) {
			this.position.x = param.getFloatValue();
		}
		else if ("pos.y" === name) {
			this.position.y = param.getFloatValue();
		}
		else if ("pos.z" === name) {
			this.position.z = param.getFloatValue();
		}
		else if ("target" === name) {
			var target: Vector3 = param.getVectorValue();
			var pivot: Pivot = Pivot.createFromTarget(this.position, target);
			this.rotation = pivot.getEulerAnglesRad();
		}
		else if ("rotation" === name || "rot" === name) {
			this.rotation = FormatUtils.degToRadVector(param.getVectorValue());
		}
		else if ("rotation.x" === name || "rot.x" === name) {
			this.rotation.x = FormatUtils.degToRad(param.getFloatValue());
		}
		else if ("rotation.y" === name || "rot.y" === name) {
			this.rotation.y = FormatUtils.degToRad(param.getFloatValue());
		}
		else if ("rotation.z" === name || "rot.z" === name) {
			this.rotation.z = FormatUtils.degToRad(param.getFloatValue());
		}
		if ("scale" === name) {
			this.scaling = param.getVectorValue();
		}
		else if ("scale.x" === name) {
			this.scaling = new Vector3(param.getFloatValue(), -1, -1);
		}
		else if ("scale.y" === name) {
			this.scaling = new Vector3(-1, param.getFloatValue(), -1);
		}
		else if ("scale.z" === name) {
			this.scaling = new Vector3(-1, -1, param.getFloatValue());
		}
	}

	public translate(v: Vector3): void {
		this.position = this.position.add(v);
		this.deletePrefixedParam("pos");
		this.addParam("pos", FormatUtils.vectorToString(this.position), null);
	}

	public rotate(v: Vector3): void {
		this.rotation = this.rotation.add(FormatUtils.degToRadVector(v));
		this.deletePrefixedParam("rot");
		this.addParam("rot", FormatUtils.vectorToString(FormatUtils.radToDegVector(this.rotation)), null);
	}

	public rotateCenter(v: Vector3): void {
		var diff: Vector3 = new Vector3(this.position.x - v.x, 0, this.position.z - v.z);
		var angle: number = Math.atan2(diff.z, diff.x);
		angle += FormatUtils.degToRad(v.y);
		var length: number = diff.length();
		this.position.x = v.x + length * Math.cos(angle);
		this.position.z = v.z + length * Math.sin(angle);
		this.deletePrefixedParam("pos");
		this.addParam("pos", FormatUtils.vectorToString(this.position), null);
		this.rotation.y += FormatUtils.degToRad(v.y);
		this.deletePrefixedParam("rot");
		this.addParam("rot", FormatUtils.vectorToString(FormatUtils.radToDegVector(this.rotation)), null);
	}

	public scale(v: Vector3): void {
		this.scaling = this.scaling.add(v);
		this.deletePrefixedParam("scale");
		this.addParam("scale", FormatUtils.vectorToString(this.scaling), null);
	}


	public highlight(value: boolean): void { }

	public focusCamera(fov: number): CameraUtils {
		return null;
	}

	public delete(engine: EngineService) {
		var scenes: Scene[] = [];
		if (this.instanceParent) {
			for (let scene of this.instanceParent.Scene) {
				if (!(scene.name === this.name)) {
					scenes.push(scene);
				}
			}
			this.instanceParent.Scene = scenes;
			scenes = [];
			for (let scene of this.instanceParent.source.Scene) {
				if (!(scene.name === this.name)) {
					scenes.push(scene);
				}
			}
			this.instanceParent.source.Scene = scenes;
		} else if (this.process) {
			for (let scene of this.process.Scene) {
				if (!(scene.name === this.name) || !(scene.type === this.type)) {
					scenes.push(scene);
				}
			}
			this.process.Scene = scenes;
			engine.deleteSceneImpl(this);
		}
	}
	
	public deleteScene(name: string): void {
		super.deleteScene(name);
		this.source.deleteScene(name);
	}

	public checkAction(room: Room): Action {
		var result: Action = null;
		if (!this.isActionChecked) {
			var action: Action = room.getActionByCriteria("create." + this.create, "parent");
			if (action) {
				var result: Action = ActionUtils.getActionImpl(action.clone());
				this.addAction(result);
			}
			this.isActionChecked = true;
		}
		return result;
	}

	public addAction(action: Action): void {
		Logger.info("SceneImpl", "addAction(id:" + action.id + ", type: " + action.type + ")");
		this.Action.push(action);
		if (action instanceof SceneAction) {
			(action as SceneAction).sceneImpl = this;
		}
	}

	
	public addScene(scene: Scene): void {
		this.Scene.push(scene)
		if( this.Scene.length > this.source.Scene.length){
			this.source.Scene.push(scene);
		}
	}

	public getActionByTrigger(value: string): Action {
		for (let action of this.Action) {
			if (action.trigger === value) {
				return action;
			}
		}
		return null;
	}

	public getProcess(): Process {
		return this.process;
	}

	public clone(): SceneImpl {
		var result = new SceneImpl(new Scene());
		result.type = this.type;
		result.name = this.name;
		result.create = this.create;
		result.active = this.active;
		for (let param of this.Param) {
			result.Param.push(new Param(param.name, param.value, param.active));
		}
		for (let scene of this.Scene) {
			result.Scene.push(scene.clone());
		}
		for (let path of this.Path) {
			result.Path.push(path.clone());
		}
		for (let variable of this.Variable) {
			result.Variable.push(variable.clone());
		}
		// TODO: Action
		result.position = this.position.clone();
		result.rotation = this.rotation.clone();
		result.scaling = this.scaling.clone();
		return result;
	}

	public fromPlaceholder(placeholder: Placeholder, engine: EngineService): void {
		Logger.info("SceneImpl", "fromPlaceholder()");
		var pivot: Pivot = placeholder.pivot;
		this.addOrUpdateParam("pos", FormatUtils.vectorToString(pivot.o));
		this.addOrUpdateParam("rot", FormatUtils.vectorToString(pivot.getEulerAnglesDeg()));
	}

	public getAssetId(): string {
		return this.getParamValue("asset");
	}

}