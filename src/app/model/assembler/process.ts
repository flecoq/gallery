import { Param } from './param';
import { Action } from './action';
import { Scene } from './scene';
import { ParamUtils } from '../../process/utils/paramUtils';
import { ActionUtils } from '../../process/action/actionUtils';
import { SceneUtils } from '../../process/utils/sceneUtils';
import { SceneImpl } from '../../process/scene/sceneImpl';
import { InstanceObject } from '../../process/scene/instanceObject';
import { Logger } from '../../process/utils/logger';

import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { EngineService } from "../../engine/engine.service";
import { ProcessServer } from '../server/processServer';

export class Process {
	public id: string;
	public parent: string;
	public type: string;
	public Param: Param[] = [];
	public Scene: Scene[] = [];
	public Action: Action[] = [];
	
	public doUpdate: boolean = false;

	constructor() { }
	
	public clear(): void {
		this.Param = [];
		this.Scene = [];
		this.Action = [];
	}

	createFromJson(data) {
		this.id = data.id;
		this.parent = data.parent;
		this.type = data.type;
		if (data.Param) {
			for (let paramData of data.Param) {
				this.addParam(paramData.name, paramData.value);
			}
		}
		if (data.Scene) {
			for (let sceneData of data.Scene) {
				var scene: Scene = new Scene();
				scene.createFromJson(sceneData);
				this.addScene(scene);
			}
		}
		if( data.Action ) {
			for(let actionData of data.Action) {
				var action: Action = new Action();
				action.createFromJson(actionData);
				for(var u = 0; u < action.Action.length; u++) {
					action.Action[u] = ActionUtils.getActionImpl(action.Action[u]);
				}
				this.Action.push(ActionUtils.getActionImpl(action));
			}
		}
	}

	public getScene(name: string): Scene {
		for (let scene of this.Scene) {
			if (scene.name == name) {
				return scene
			}
		}
		return null;
	}

	public execute(engine: EngineService): void {
		Logger.info("Process", "execute(" + this.id +")");
		engine.viewManager.isSceneRoot = true;
		this.resetParamUsed();
		for (let scene of this.Scene) {
			if (scene.isActive()) {
				scene.resetParamUsed();
				var sceneImpl: SceneImpl = SceneUtils.getSceneImpl(scene, engine);
				sceneImpl.process = this;
				if( sceneImpl instanceof InstanceObject) {
					sceneImpl.writeCreate(engine);
					var instanceImplList: SceneImpl[] = [];
					scene.Scene = [];
					for(let instance of sceneImpl.Scene) {
						scene.Scene.push(instance);
						var instanceImpl: SceneImpl = SceneUtils.getSceneImpl(instance, engine);
						instanceImpl.instanceParent = sceneImpl;
						instanceImplList.push(instanceImpl);
					}
					sceneImpl.Scene = instanceImplList;
				}
				sceneImpl.write(engine);
			}
		}
		if( this.doUpdate ) {
			engine.modelService.updateProcess(this);
		} 
	}

	public getParam(name: string): Param {
		return ParamUtils.getParam(this.Param, name);
	}

	public getParamValue(name: string): string {
		return ParamUtils.getParamValue(this.Param, name);
	}

	public getParamValueInt(name: string): number {
		return ParamUtils.getParamValueInt(this.Param, name);
	}

	public getParamValueFloat(name: string): number {
		return ParamUtils.getParamValueFloat(this.Param, name);
	}

	public getParamValueVector(name: string): Vector3 {
		return ParamUtils.getParamValueVector(this.Param, name);
	}

	public getParamValueColor3(name: string): Color3 {
		return ParamUtils.getParamValueColor3(this.Param, name);
	}

	public getParamValueColor4(name: string): Color4 {
		return ParamUtils.getParamValueColor4(this.Param, name);
	}

	public getParamValueBool(name: string): boolean {
		return ParamUtils.getParamValueBool(this.Param, name);
	}

	public addParam(name: string, value: string): void {
		this.Param.push(new Param(name, value, null));
	}

	updateParam(name: string, value: string) {
		var param = this.getParam(name);
		if (param != null) {
			param.value = value
		}
	}

	public resetParamUsed(): void {
		for (let param of this.Param) {
			param.used = false;
		}
		for (let scene of this.Scene) {
			scene.resetParamUsed();
		}
	}

	public addScene(scene: Scene): void {
		this.Scene.push(scene);
	}

	public addSceneImpl(sceneImpl: SceneImpl, engine: EngineService): void {
		this.addScene(sceneImpl.toScene());
		sceneImpl.process = this;
		engine.addSceneImpl(sceneImpl);
	}

	public toProcessServer(): ProcessServer {
		return new ProcessServer(this.id, this.parent, JSON.stringify(this));
	}

	public getActionByCriteria(value: string, criteria: string): Action {
		for (let action of this.Action) {
			var result: Action = action.getActionByCriteria(value, criteria);
			if (result) {
				return result;
			}
		}
		for (let scene of this.Scene) {
			var result: Action = scene.getActionByCriteria(value, criteria);
			if (result) {
				return result;
			}
		}
		return null;
	}

}
