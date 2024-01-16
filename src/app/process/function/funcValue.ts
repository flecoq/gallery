import { FormatUtils } from '../../process/utils/formatUtils';
import { Pivot } from '../../process/utils/pivot';
import { Point } from '../../process/utils/point';
import { Vector3 } from "@babylonjs/core/Maths/math";

export class FuncValue {
	
	public static TYPE_INTEGER: string = "integer";
	public static TYPE_FLOAT: string = "float";
	public static TYPE_POINT: string = "point";
	public static TYPE_VECTOR: string = "vector";
	public static TYPE_PIVOT: string = "pivot";
	public static TYPE_STRING: string = "string";
	
	public type:string;
	public integer: number;
	public float: number;
	public point: Point;
	public vector: Vector3;
	public pivot: Pivot;
	public value: string;
	
	public constructor(value: string) {
		if( value ) {
			this.vector = FormatUtils.toVector(value);
			if( this.vector ) {
				this.type = FuncValue.TYPE_VECTOR;
			} else {
				this.point = FormatUtils.toPoint(value);
				if( this.point ) {
					this.type = FuncValue.TYPE_POINT;
				} else {
					this.integer = FormatUtils.toStrictInt(value);
					if( !isNaN(this.integer) ) {
						this.type = FuncValue.TYPE_INTEGER;
					} else {
						this.float = FormatUtils.toStrictFloat(value);
						if( !isNaN(this.float) ) {
							this.type = FuncValue.TYPE_FLOAT;
						} else {
							this.value = value;
							this.type = FuncValue.TYPE_STRING;						
						}
					}
				}
			}
		}
	} 
	
	public isInteger(): boolean {
		return this.type === FuncValue.TYPE_INTEGER;
	}
	
	public isFloat(): boolean {
		return this.type === FuncValue.TYPE_FLOAT;
	}
	
	public getFloat(): number {
		return this.isInteger() ? this.integer : this.float;
	}
	
	public isIntegerOrFloat(): boolean {
		return this.type === FuncValue.TYPE_INTEGER || this.type === FuncValue.TYPE_FLOAT;
	}
	
	public isPoint(): boolean {
		return this.type === FuncValue.TYPE_POINT;
	}
	
	public isVector(): boolean {
		return this.type === FuncValue.TYPE_VECTOR;
	}
	
	public isPivot(): boolean {
		return this.type === FuncValue.TYPE_PIVOT;
	}

	public toString(): string {
		if (this.type == FuncValue.TYPE_FLOAT) {
			return this.float.toString();
		} else if (this.type == FuncValue.TYPE_INTEGER) {
			return this.integer.toString();
		//} else if (this.type == FuncValue. TYPE_BOOLEAN) {
		//	return bool.toString();
		} else if (this.type == FuncValue.TYPE_POINT) {
			return this.point.toString();
		} else if (this.type == FuncValue.TYPE_VECTOR) {
			return FormatUtils.vectorToString(this.vector);
		} else if (this.type == FuncValue.TYPE_PIVOT) {
			return this.pivot.toString();
		} else if (this.type == FuncValue.TYPE_STRING) {
			return this.value;
		}
		return null;
	}

	public static createFromInt(value: number): FuncValue {
		var result = new FuncValue(null);
		result.integer = value;
		result.type = FuncValue.TYPE_INTEGER;
		return result;
	}
	
	public static createFromFloat(value: number): FuncValue {
		var result = new FuncValue(null);
		result.float = value;
		result.type = FuncValue.TYPE_FLOAT;
		return result;
	}
	
	public static createFromVector(value: Vector3): FuncValue {
		var result = new FuncValue(null);
		result.vector = value;
		result.type = FuncValue.TYPE_VECTOR;
		return result;
	}
	
	public static createFromPivot(value: Pivot): FuncValue {
		var result = new FuncValue(null);
		result.pivot = value;
		result.type = FuncValue.TYPE_PIVOT;
		return result;
	}
	
	public static createFromPoint(value: Point): FuncValue {
		var result = new FuncValue(null);
		result.point = value;
		result.type = FuncValue.TYPE_POINT;
		return result;
	}
	
	public static createFromString(value: string): FuncValue {
		var result = new FuncValue(null);
		result.value = value;
		result.type = FuncValue.TYPE_STRING;
		return result;
	}
}