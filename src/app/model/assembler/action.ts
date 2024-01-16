import { Param } from './param';
import { State } from './state';
import { ParamUtils } from '../../process/utils/paramUtils';
import { FormatUtils } from '../../process/utils/formatUtils';
import { Point } from '../../process/utils/point';
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";

export class Action {
	public id: string;
	public type: string;
	public ref: string;
	public behavior: string;
	public trigger: string;
	public parent: string;
	public active: string;
	public Param: Param[] = [];
	public State: State[] = [];
	public Action: Action[] = [];
	
	constructor() { }

	createFromJson(data) {
		this.id = data.id;
		this.type = data.type;
		this.ref = data.create;
		this.behavior = data.behavior;
		this.trigger = data.trigger;
		this.parent = data.parent;
		this.active = data.active;
		if (data.Param) {
			for (let paramData of data.Param) {
				this.addParam(paramData.name, paramData.value, paramData.active);
			}
		}
		if( data.Action ) {
			for(let actionData of data.Action) {
				var action: Action = new Action();
				action.createFromJson(actionData);
				this.Action.push(action);
			}
		}
		if( data.State ) {
			for(let stateData of data.State) {
				var state: State = new State();
				state.createFromJson(stateData);
				this.State.push(state);
			}
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

	public compare(value: string, criteria: string): boolean { 
		if( "name" === criteria ) {
			return value === this.id;
		} else if( "parent" === criteria ) {
			return value === this.parent;
		}
	}
				
	public getActionByCriteria(value: string, criteria: string): Action {
		if( this.compare(value, criteria) ) {
			return this;
		}
		for(let action of this.Action) {
			if( action.compare(value, criteria)) {
				return action;
			} else {
				var result: Action = action.getActionByCriteria(value, criteria);
				if( result ) {
					return result;
				}
			}
		}
		return null;
	}

	public copy(action: Action) {
		action.id = this.id;
		action.type = this.type;
		action.ref = this.ref;
		action.behavior = this.behavior;
		action.trigger = this.trigger;
		action.parent = this.parent;
		action.active = this.active;
		action.Param = this.Param;
		action.State = this.State;
		action.Action = this.Action;
	}

	public setParam(params: Param[]): void {
		this.Param = params;
	}

	public clone(): Action {
		var result = new Action();
		result.type = this.type;
		result.ref = this.ref;
		result.behavior = this.behavior;
		result.trigger = this.trigger;
		result.parent = this.parent;
		result.active = this.active;
		for (let param of this.Param) {
			result.Param.push(param.clone());
		}
		for(let state of this.State) {
			result.State.push(state.clone());
		}
		for(let action of this.Action) {
			result.Action.push(action.clone());
		}
		return result;
	}

	public static create(id: string, type: string): Action {
		var result: Action = new Action();
		result.id = id;
		result.type = type;
		return result;
	}
}
