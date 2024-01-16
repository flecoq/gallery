import { Param } from './param';
import { ParamUtils } from '../../process/utils/paramUtils';
import { FormatUtils } from '../../process/utils/formatUtils';
import { Point } from '../../process/utils/point';
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";

export class State {
	public type: string;
	public Param: Param[] = [];
	
	constructor() { }

	createFromJson(data) {
		this.type = data.type;
		if (data.Param) {
			for (let paramData of data.Param) {
				this.addParam(paramData.name, paramData.value, paramData.active);
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

	public copy(state: State) {
		state.type = this.type;
		state.Param = this.Param;
	}


	public clone(): State {
		var result = new State();
		result.type = this.type;
		for (let param of this.Param) {
			result.Param.push(param.clone());
		}
		return result;
	}

	public setParam(params: Param[]): void {
		this.Param = params;
	}

}
