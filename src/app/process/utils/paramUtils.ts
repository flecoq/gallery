import { Param } from '../../model/assembler/param';
import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { Point } from './point';
import { ModelService } from '../../service/model.service';
import { Scene } from '../../model/assembler/scene';

export class ParamUtils {

	public static modelService: ModelService;
	
	public static getParam(params: Param[], name: string): Param {
		var reference: Param = null;
		if (params != null) {
			for (let param of params) {
				if (name === param.name && param.isActive()) {
					return param;
				} else if( "reference" === param.name && param.isActive()) {
					var scene: Scene = ParamUtils.modelService.getReference(param.value);
					var result = ParamUtils.getParam(scene.Param, name);
					if( result != null) {
						reference = result;
					}
				}
			}
		}
		return reference;
	}

	public static addOrUpdateParam(params: Param[], name: string, value: string) {
		var param: Param = null;
		for(let existing of params) {
			if( existing.name === name ) {
				param = existing;
			}
		}
		if (param == null) {
			params.push(new Param(name, value, null));
		} else {
			param.value = value;
		}
	}

	public static getParamValue(params: Param[], name: string): string {
		var param: Param = ParamUtils.getParam(params, name);
		if (param != null) {
			param.used = true;
			return param.value;
		}
		return null;
	}

	public static getParamValueInt(params: Param[], name: string): number {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getIntValue();
	}

	public static getParamValueIntUsed(params: Param[], name: string): number {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getIntValueUsed();
	}

	public static getParamValueFloat(params: Param[], name: string): number {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getFloatValue();
	}

	public static getParamValueFloatList(params: Param[], name: string): number[] {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getFloatListValue();
	}

	public static getParamValueFloatUsed(params: Param[], name: string): number {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getFloatValueUsed();
	}

	public static getParamValueVector(params: Param[], name: string): Vector3 {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getVectorValue();
	}

	public static getParamValueVectorUsed(params: Param[], name: string): Vector3 {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getVectorValueUsed();
	}

	public static getParamValuePoint(params: Param[], name: string): Point {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getPointValue();
	}

	public static getParamValuePointUsed(params: Param[], name: string): Point {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getPointValueUsed();
	}

	public static getParamValueColor3(params: Param[], name: string): Color3 {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getColor3Value();
	}

	public static getParamValueColor3Used(params: Param[], name: string): Color3 {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getColor3ValueUsed();
	}

	public static getParamValueColor4(params: Param[], name: string): Color4 {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getColor4Value();
	}

	public static getParamValueColor4Used(params: Param[], name: string): Color4 {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getColor4ValueUsed();
	}

	public static getParamValueBool(params: Param[], name: string): boolean {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getBoolValue();
	}

	public static getParamValueBoolUsed(params: Param[], name: string): boolean {
		var param: Param = ParamUtils.getParam(params, name);
		return param == null ? null : param.getBoolValueUsed();
	}

	public static exclude(params: Param[], value: string): Param[] {
		var result: Param[] = [];
		var values = value.split(";");
		for (let param of params) {
			if (!param.contains(values)) {
				result.push(param);
			}
		}
		return result;
	}
}