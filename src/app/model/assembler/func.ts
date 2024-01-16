import { Param } from './param';
import { State } from './state';
import { ParamUtils } from '../../process/utils/paramUtils';
import { FormatUtils } from '../../process/utils/formatUtils';
import { Point } from '../../process/utils/point';
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";

export class Func {
	public id: string;
	public name: string;
	public parent: string
	public type: string;
	public ref: string;
	public length: number;
	public count: number;
	public operator: string;
	public active: string;
	public Param: Param[] = [];
	public Func: Func[] = [];
	
	constructor(type: string) {
		this.type = type;
	 }

	createFromJson(data) {
		this.id = data.id;
		this.name = data.name;
		this.parent = data.parent;
		this.type = data.type;
		this.ref = data.create;
		this.length = FormatUtils.toInt(data.length);
		this.length = isNaN(this.length) ? 0 : this.length;
		this.count = FormatUtils.toInt(data.count);
		this.count = isNaN(this.count) ? 10 : this.count;
		this.operator = data.operator;
		this.active = data.active;
		if (data.Param) {
			for (let paramData of data.Param) {
				this.addParam(paramData.name, paramData.value, paramData.active);
			}
		}
		if( data.Func ) {
			for(let funcData of data.Func) {
				var func: Func = new Func("");
				func.createFromJson(funcData);
				this.Func.push(func);
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

	public copy(action: Func) {
		action.id = this.id;
		action.name = this.name;
		action.parent = this.parent;
		action.type = this.type;
		action.ref = this.ref;
		action.length = this.length;
		action.operator = this.operator;
		action.active = this.active;
		action.Param = this.Param;
		action.Func = this.Func;
	}

	public setParam(params: Param[]): void {
		this.Param = params;
	}

	public clone(): Func {
		var result = new Func(this.type);
		result.id = this.id;
		result.name = this.name;
		result.parent = this.parent;
		result.type = this.type;
		result.ref = this.ref;
		result.length = this.length;
		result.operator = this.operator;
		result.active = this.active;
		for (let param of this.Param) {
			result.Param.push(param.clone());
		}
		for(let action of this.Func) {
			result.Func.push(action.clone());
		}
		return result;
	}

	public static create(id: string, type: string): Func {
		var result: Func = new Func(type);
		result.id = id;
		return result;
	}
}
