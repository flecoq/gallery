import { Param } from './param';
import { Path } from './path';
import { Action } from './action';
import { Variable } from './variable';
import { ParamUtils } from '../../process/utils/paramUtils';
import { FormatUtils } from '../../process/utils/formatUtils';
import { ActionUtils } from '../../process/action/actionUtils';
import { Expression } from '../../process/expression/expression';
import { Point } from '../../process/utils/point';
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";

export class Scene {
	public name: string;
	public type: string;
	public create: string;
	public active: string;
	public Param: Param[] = [];
	public Action: Action[] = [];
	public Scene: Scene[] = [];
	public Path: Path[] = [];
	public Variable: Variable[] = [];

	constructor() { }

	createFromJson(data) {
		this.name = data.name;
		this.type = data.type;
		this.create = data.create;
		this.active = data.active;
		if (data.Param) {
			for (let paramData of data.Param) {
				this.addParam(paramData.name, paramData.value, paramData.active);
			}
		}
		if (data.Action) {
			for (let actionData of data.Action) {
				var action: Action = new Action();
				action.createFromJson(actionData);
				for (var u = 0; u < action.Action.length; u++) {
					action.Action[u] = ActionUtils.getActionImpl(action.Action[u]);
				}
				this.Action.push(ActionUtils.getActionImpl(action));
			}
		}
		if (data.Scene) {
			for (let sceneData of data.Scene) {
				var scene: Scene = new Scene();
				scene.createFromJson(sceneData);
				this.Scene.push(scene);
			}
		}
		if (data.Path) {
			for (let pathData of data.Path) {
				var path: Path = new Path();
				path.createFromJson(pathData);
				this.Path.push(path);
			}
		}
		if (data.Var) {
			for (let varData of data.Var) {
				var variable: Variable = new Variable();
				variable.createFromJson(varData);
				this.Variable.push(variable);
			}
		}
		if (data.SimpleVar) {
			for (let varData of data.SimpleVar) {
				var variable: Variable = new Variable();
				variable.createFromJson(varData);
				this.Variable.push(variable);
			}
		}
		if (data.Variable) {
			for (let varData of data.Variable) {
				var variable: Variable = new Variable();
				variable.createFromJson(varData);
				this.Variable.push(variable);
			}
		}
	}

	public getScene(name: string): Scene {
		if (this.Scene) {
			var range: number = FormatUtils.toInt(name);
			if (range != null) {
				return this.Scene[range];
			} else {
				for (let scene of this.Scene) {
					if (scene.name === name) {
						return scene;
					}
				}
			}
		}
		return null;
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

	public getParamValueFloatList(name: string): number[] {
		return ParamUtils.getParamValueFloatList(this.Param, name);
	}

	public getParamValuePoint(name: string): Point {
		return ParamUtils.getParamValuePoint(this.Param, name);
	}

	public getParamValueVector(name: string): Vector3 {
		return ParamUtils.getParamValueVector(this.Param, name);
	}

	public getParamValueColor4(name: string): Color4 {
		return ParamUtils.getParamValueColor4(this.Param, name);
	}

	public getParamValueColor3(name: string): Color3 {
		return ParamUtils.getParamValueColor3(this.Param, name);
	}

	public getParamValueBool(name: string): boolean {
		return ParamUtils.getParamValueBool(this.Param, name);
	}

	public getIntResult(name: string, paramList: Param[]): number {
		return Expression.getParamIntResult(this.Param, name, paramList);
	}
	public getFloatResult(name: string, paramList: Param[]): number {
		return Expression.getParamFloatResult(this.Param, name, paramList);
	}
	public getVectorResult(name: string, paramList: Param[]): Vector3 {
		return Expression.getParamVectorResult(this.Param, name, paramList);
	}
	public addParam(name: string, value: string, active: string): void {
		this.Param.push(new Param(name, value, active));
	}

	public addOrUpdateParam(name: string, value: string): void {
		ParamUtils.addOrUpdateParam(this.Param, name, value);
	}

	public resetParamUsed(): void {
		for (let param of this.Param) {
			param.used = false;
		}
	}

	public isActive(): boolean {
		return FormatUtils.toDefaultBool(this.active);
	}

	public isMaterialParam(): boolean {
		for (let param of this.Param) {
			if (param.name.indexOf("material") == 0) {
				return true;
			}
		}
		return false;
	}

	public getActionByCriteria(value: string, criteria: string): Action {
		for (let action of this.Action) {
			var result: Action = action.getActionByCriteria(value, criteria);
			if (result) {
				return result;
			}
		}
		return null;
	}

	public copy(scene: Scene) {
		scene.type = this.type;
		scene.name = this.name;
		scene.create = this.create;
		scene.active = this.active;
		scene.Param = this.Param;
		scene.Scene = this.Scene;
		//scene.Action = this.Action;
		scene.Path = this.Path;
		scene.Variable = this.Variable;
	}

	public clone(): Scene {
		var result = new Scene();
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
		return result;
	}

	public toScene(): Scene {
		var result = new Scene();
		result.type = this.type;
		result.name = this.name;
		result.create = this.create;
		result.active = this.active;
		result.Param = this.Param;
		result.Action = this.Action;
		result.Path = this.Path;
		result.Variable = this.Variable;
		for (let scene of this.Scene) {
			result.Scene.push(scene.toScene());
		}
		return result;
	}

	public deleteParam(name: string): void {
		var index: number = -1;
		var u: number = 0;
		for(let param of this.Param) {
			if( param.name == name) {
				index = u;
			}
			u++
		}
		if( index >= 0 ){
			this.Param.splice(index, 1);
		}
	}
	
	public deleteScene(name: string): void {
		var index: number = -1;
		var u: number = 0;
		for(let scene of this.Scene) {
			if( scene.name == name) {
				index = u;
			}
			u++
		}
		if( index >= 0 ){
			this.Scene.splice(index, 1);
		}
	}
	
	public deletePrefixedParam(prefix: string): void {
		var indexes: number[] = [];
		var u: number = 0;
		for(let param of this.Param) {
			if( param.name.indexOf(prefix) == 0) {
				indexes.push(u);
			}
			u++;
		}
		for(let index of indexes){
			this.Param.splice(index, 1);
		}
	}
	
	public setParam(params: Param[]): void {
		this.Param = params;
	}
	
	public addScene(scene: Scene): void {
		this.Scene.push(scene)
	}
	
	public static create(name: string, type: string, create: string): Scene {
		var result: Scene = new Scene();
		result.name = name;
		result.type = type;
		result.create = create;
		return result;
	}
}
