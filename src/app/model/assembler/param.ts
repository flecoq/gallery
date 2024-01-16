import { Vector3, Color3, Color4 } from "@babylonjs/core/Maths/math";
import { FormatUtils } from '../../process/utils/formatUtils';
import { Point } from '../../process/utils/point';

export class Param {
	public name: string;
	public value: string;
	public active: string;
	public used: boolean;

	constructor(name: string, value: string, active: string) {
		this.name = name;
		this.value = value;
		this.active = active;
	}

	public isActive(): boolean {
		return FormatUtils.toDefaultBool(this.active);
	}

	public setActive(value: boolean): void {
		this.active = value ? "true" : "false";
	}

	public getIntValue(): number {
		return FormatUtils.toInt(this.value);
	}

	public getIntValueUsed(): number {
		this.used = true;
		return FormatUtils.toInt(this.value);
	}

	public getFloatValue(): number {
		return FormatUtils.toFloat(this.value);
	}

	public getFloatListValue(): number[] {
		var result: number[] = [];
		for(let value of this.value.split(";") ) {
			result.push(FormatUtils.toFloat(value));
		}
		return result;
	}

	public getFloatValueUsed(): number {
		this.used = true;
		return FormatUtils.toFloat(this.value);
	}

	public getVectorValue(): Vector3 {
		return FormatUtils.toVector(this.value);
	}

	public getVectorValueUsed(): Vector3 {
		this.used = true;
		return FormatUtils.toVector(this.value);
	}

	public getPointValue(): Point {
		return FormatUtils.toPoint(this.value);
	}

	public getPointValueUsed(): Point {
		this.used = true;
		return FormatUtils.toPoint(this.value);
	}

	public getBoolValue(): boolean {
		return FormatUtils.toBool(this.value);
	}

	public getBoolValueUsed(): boolean {
		this.used = true;
		return FormatUtils.toBool(this.value);
	}

	public getColor3Value(): Color3 {
		return FormatUtils.toColor3(this.value);
	}

	public getColor3ValueUsed(): Color3 {
		this.used = true;
		return FormatUtils.toColor3(this.value);
	}

	public getColor4Value(): Color4 {
		return FormatUtils.toColor4(this.value);
	}

	public getColor4ValueUsed(): Color4 {
		this.used = true;
		return FormatUtils.toColor4(this.value);
	}

	public clone(): Param {
		return new Param(this.name, this.value, this.active);
	}

	public contains(names: string[]): boolean {
		for(let value of names) {
			if( value === this.name) {
				return true;
			}
		}
		return false;
	}

}
