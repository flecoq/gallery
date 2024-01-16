import { Vector3 } from "@babylonjs/core/Maths/math";
import { FormatUtils } from '../../process/utils/formatUtils';
import { Expression } from '../../process/expression/expression';
import { Param } from "../../model/assembler/param";

export class Point {
	public name: string;
	public value: string;

	constructor() {}

	public createFromJson(data: any): void {
		this.name = data.name;
		this.value = data.value === undefined ? data : data.value;
	}
	
	public getValueVector(): Vector3 {
		return FormatUtils.toVector(this.value);
	}
	
	public getResultVector(paramList: Param[]): Vector3 {
		console.log("point value: " + this.value);
		return Expression.getResult(this.value, paramList).vector;
	}
	
	public clone(): Point {
		var result: Point = new Point();
		result.name = this.name;
		result.value = this.value;
		return result;
	}
	
	public static create(value: string): Point {
		var point: Point = new Point();
		point.value = value;
		return point;		
	}
}
