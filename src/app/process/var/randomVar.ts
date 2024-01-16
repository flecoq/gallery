import { Variable } from "../../model/assembler/variable";
import { VarImpl } from "./varImpl";
import { KeyValue } from "./keyValue";
import { FuncValue } from "../../process/function/funcValue";
import { ValueCollection } from "./valueCollection";
import { FormatUtils } from "../../process/utils/formatUtils";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { Logger } from "../../process/utils/logger";

export class RandomVar extends VarImpl {

	public min: number[] = [];
	public max: number[] = [];
	public trunc: boolean;
	public distance: number;

	public constructor(variable: Variable) {
		super(variable);
		if (this.value) {
			var values = this.value.split(";");
			this.min.push(FormatUtils.toFloat(values[0]));
			this.max.push(FormatUtils.toFloat(values[1]));
		} else {
			this.min = this.getParamValueFloatList("min");
			this.max = this.getParamValueFloatList("max");
		}
		this.trunc = this.getParamValueBool("trunc");
		this.distance = this.getParamValueFloat("distance");
	}

	public getSndValue(valueCollection: ValueCollection): KeyValue {
		var result: string;
		if (this.distance) {
			var doCreate: boolean = false;
			var count: number = 0;
			while (!doCreate && count < 20) {
				count++;
				var result: string = this.getSndValueString();
				doCreate = !this.isDistanceIn(result);
			}
			if( count == 20 ) {
				Logger.warning("RandomVar", "count = 20 !")
			}
		} else {
			result = this.getSndValueString();
		}
		this.addResult(result);
		return new KeyValue(this, FuncValue.createFromString(result));
	}


	public getSndValueString(): string {
		var result: string = "";
		if (this.min.length > 0) {
			for (let u = 0; u < this.min.length; u++) {
				var ratio: number = Math.random();
				var value: number = this.min[u] * (1 - ratio) + (this.max[u] + (this.trunc ? 1 : 0)) * ratio;
				result += (this.trunc ? value.toFixed() : value.toFixed(2)) + ";";
			}
			result = result.substring(0, result.length - 1);
		} else {
			// random into the param list
			var u: number = Math.random() * this.Param.length;
			result = this.Param[u.toFixed()];
		}
		return result;
	}

	public isDistanceIn(value: string): boolean {
		var pos: Vector3 = FormatUtils.toVector(value);
		for (let result of this.resultList) {
			var segment: Vector3 = pos.subtract(result.vector);
			if (segment.length() < this.distance) {
				return true;
			}
		}
		return false;
	}

}