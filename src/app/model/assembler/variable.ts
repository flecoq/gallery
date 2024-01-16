import { Vector3 } from "@babylonjs/core/Maths/math";
import { FormatUtils } from '../../process/utils/formatUtils';
import { ParamUtils } from '../../process/utils/paramUtils';
import { Param } from './param';

export class Variable {
	public name: string;
	public type: string;
	public main: string;
	public value: string;
	public Param: Param[] = [];

	constructor() { }

	public createFromJson(data: any): void {
		this.name = data.name;
		this.type = data.type;
		this.main = data.main;
		this.value = data.value;
		if (data.Param) {
			for (let paramData of data.Param) {
				this.Param.push(new Param(paramData.name, paramData.value, "true"));
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

	public getParamValueFloatList(name: string): number[] {
		return ParamUtils.getParamValueFloatList(this.Param, name);
	}

	public getParamValueVector(name: string): Vector3 {
		return ParamUtils.getParamValueVector(this.Param, name);
	}

	public getParamValueBool(name: string): boolean {
		return ParamUtils.getParamValueBool(this.Param, name);
	}

	public isMain(): boolean {
		return FormatUtils.toDefaultBool(this.main);
	}

	public copy(variable: Variable): void {
		variable.name = this.name;
		variable.type = this.type;
		variable.main = this.main;
		variable.value = this.value;
		variable.Param = this.Param;
	}

	public clone(): Variable {
		var result: Variable = new Variable();
		result.name = this.name;
		result.type = this.type;
		result.main = this.main;
		result.value = this.value;
		for (let param of this.Param) {
			result.Param.push(param.clone());
		}
		return result;
	}
	
	public static create(name: string) {
		var result: Variable = new Variable();
		result.name = name;
		result.main = "0";
		return result;
	}

}
