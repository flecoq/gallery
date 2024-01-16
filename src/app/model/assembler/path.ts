import { Vector3 } from "@babylonjs/core/Maths/math";
import { FormatUtils } from '../../process/utils/formatUtils';
import { ParamUtils } from '../../process/utils/paramUtils';
import { Point } from './point';
import { Param } from './param';

export class Path {
	public name: string;
	public type: string;
	public active: string;
	public closed: string;
	public Point: Point[] = [];
	public Param: Param[] = [];

	constructor() { }

	public createFromJson(data: any): void {
		this.name = data.name;
		this.type = data.type;
		this.active = data.active;
		this.closed = data.closed;
		if (data.Point) {
			for (let pointData of data.Point) {
				var point: Point = new Point();
				point.createFromJson(pointData);
				this.Point.push(point);
			}
		}
		if (data.Param) {
			for (let paramData of data.Param) {
				this.Param.push(new Param(paramData.name, paramData.value, "true"));
			}
		}
	}

	public getResultVectorList(paramList: Param[]): Vector3[] {
		var result: Vector3[] = [];
		if (this.type === "fill" && this.Point.length == 0) {
			this.addPoint("vector(-$scaleZ/2, -$scaleY/2, 0)");
			this.addPoint("vector(-$scaleZ/2, $scaleY/2, 0)");
			this.addPoint("vector($scaleZ/2, $scaleY/2, 0)");
			this.addPoint("vector($scaleZ/2, -$scaleY/2, 0)");
		}
		var transform: string = this.getParamValue("transform.value");
		for (let point of this.Point) {
			var vector: Vector3 = point.getResultVector(paramList);
			if (transform) {
				result.push(this.transformVector(vector, transform.split(";")));
			} else {
				result.push(new Vector3(vector.x, vector.z, -vector.y));
			}
		}
		if( this.getParamValueBool("inverse.point") ) {
			var inverse: Vector3[] = [];
			for(var u = result.length-1; u >=0; u--) {
				inverse.push(result[u]);
			}
			result = inverse;
		}
		return result;
	}

	private transformValue(value: number, transform: string, result: Vector3): void {
		if (transform === "x") {
			result.x = value;
		} else if (transform === "-x") {
			result.x = -value;
		} else if (transform === "y") {
			result.y = value;
		} else if (transform === "-y") {
			result.y = -value;
		} else if (transform === "z") {
			result.z = value;
		} else if (transform === "-z") {
			result.z = - value;
		}
	}

	private transformVector(source: Vector3, transforms: string[]): Vector3 {
		var result: Vector3 = new Vector3;
		this.transformValue(source.x, transforms[0], result);
		this.transformValue(source.y, transforms[1], result);
		this.transformValue(source.z, transforms[3], result);
		return result;
	}

	public addPoint(value: string): void {
		this.Point.push(Point.create(value));
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

	public isActive(): boolean {
		return FormatUtils.toDefaultBool(this.active);
	}

	public copy(path: Path): void {
		path.name = this.name;
		path.type = this.type;
		path.closed = this.closed;
		path.active = this.active;
		path.Point = this.Point;
	}

	public clone(): Path {
		var result: Path = new Path();
		result.name = this.name;
		result.type = this.type;
		result.active = this.active;
		result.closed = this.closed;
		for (let point of this.Point) {
			result.Point.push(point.clone());
		}
		return result;
	}

}
