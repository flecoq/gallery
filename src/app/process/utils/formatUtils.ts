import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { Point } from './point';

export class FormatUtils {

	public static degToRad(value: number): number {
		return value * Math.PI / 180;
	}

	public static degToRadVector(value: Vector3): Vector3 {
		return new Vector3(this.degToRad(value.x), this.degToRad(value.y), this.degToRad(value.z));
	}

	public static radToDeg(value: number): number {
		return value * 180 / Math.PI;
	}

	public static radToDegVector(value: Vector3): Vector3 {
		return new Vector3(this.radToDeg(value.x), this.radToDeg(value.y), this.radToDeg(value.z));
	}

	public static isInt(value: string) : boolean {
		var reg = new RegExp('^[0-9]+$');
		return reg.test(value.replace("-", ""));
	}

	public static toInt(value: string) : number {
		var result:number = parseInt(value);
		return isNaN(result) ? null : result;
	}

	public static toStrictInt(value: string) : number {
		return FormatUtils.isInt(value) ? parseInt(value) : NaN;
	}

	public static isFloat(value: string) : boolean {
		var reg = new RegExp('^[0-9]*[.][0-9]+$');
		return reg.test(value.replace("-", ""));
	}

	public static isIntOrFloat(value: string) : boolean {
		return FormatUtils.isInt(value) || FormatUtils.isFloat(value);
	}

	public static toFloat(value: string) : number {
		return parseFloat(value);
	}
	
	public static toStrictFloat(value: string) : number {
		return FormatUtils.isFloat(value) ? parseFloat(value) : NaN;
	}
	
	public static toVector(value: string) : Vector3 {
		var values = value.split(';');
		return values.length == 3 ? new Vector3(FormatUtils.toFloat(values[0]), FormatUtils.toFloat(values[1]), FormatUtils.toFloat(values[2])) : null;
	}
	
	public static isVector(value: string) : boolean {
		var values = value.split(';');
		if( values.length == 3 ) {
			return FormatUtils.isIntOrFloat(values[0]) && FormatUtils.isIntOrFloat(values[1]) && FormatUtils.isIntOrFloat(values[2]);
		} 
		return false;
	}

	public static isVector4(value: string) : boolean {
		var values = value.split(';');
		if( values.length == 4 ) {
			return FormatUtils.isIntOrFloat(values[0]) && FormatUtils.isIntOrFloat(values[1]) 
				&& FormatUtils.isIntOrFloat(values[2]) && FormatUtils.isIntOrFloat(values[4]);
		} 
		return false;
	}

	public static toPoint(value: string) : Point {
		var values = value.split(';');
		return values.length == 2 ? new Point(FormatUtils.toFloat(values[0]), FormatUtils.toFloat(values[1])) : null;
	}

	public static isPoint(value: string) : boolean {
		var values = value.split(';');
		if( values.length == 2 ) {
			return FormatUtils.isIntOrFloat(values[0]) && FormatUtils.isIntOrFloat(values[1]);
		} 
		return false;
	}

	public static toColor3(value: string) : Color3 {
		var values = value.split(';');
		return values.length == 3 ? new Color3(FormatUtils.toFloat(values[0]), FormatUtils.toFloat(values[1]), FormatUtils.toFloat(values[2])) : null;
	}

	public static toColor4(value: string) : Color4 {
		var values = value.split(';');
		return values.length == 4 ?  new Color4(FormatUtils.toFloat(values[0]), FormatUtils.toFloat(values[1]), FormatUtils.toFloat(values[2]), values.length == 4 ? FormatUtils.toFloat(values[3]) : 1) : null;
	}

	public static toBool(value: string) : boolean {
		return "true" === value || "1" === value;
	}

	public static isBool(value: string) : boolean {
		return "true" === value || "1" === value || "false" === value || "0" === value;
	}

	public static toDefaultBool(value: string) : boolean {
		return value == null || "true" === value || "1" === value;
	}

	public static vectorToString(value: Vector3) : string {
		return value.x + ";" + value.y + ";" + value.z;
	}

	public static vectorToLog(v: Vector3): string {
		return v == null ? "-" : "X: " + v.x.toFixed(3) + "  Y: " + v.y.toFixed(3) + "  Z: " + v.z.toFixed(3);
	}

}