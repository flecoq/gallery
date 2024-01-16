import { Vector3, Mesh, MeshBuilder, TransformNode, Color3, StandardMaterial } from "@babylonjs/core";
import { FormatUtils } from '../../process/utils/formatUtils';
import { Param } from '../../model/assembler/param';
import { Expression } from '../../process/expression/expression';
import { EngineService } from '../../engine/engine.service';

export class Pivot {

	public epsilone: number = 0.05;

	public o: Vector3;
	public u: Vector3;
	public v: Vector3;
	public w: Vector3;

	public constructor() {
		this.u = new Vector3(1, 0, 0);
		this.v = new Vector3(0, 1, 0);
		this.w = new Vector3(0, 0, 1);
		this.o = new Vector3();
	}

	public static createFromOrigin(o: Vector3): Pivot {
		var result = new Pivot();
		result.o = o;
		result.u = new Vector3(1, 0, 0);
		result.v = new Vector3(0, 1, 0);
		result.w = new Vector3(0, 0, 1);
		return result;
	}

	public static createFromVectors(o: Vector3, u: Vector3, v: Vector3, w: Vector3): Pivot {
		var result = new Pivot();
		result.o = o;
		result.u = u;
		result.v = v;
		result.w = w;
		return result;
	}

	public static createFromParams(params: Param[]): Pivot {
		return Pivot.createFromPrefixedParams(null, params);
	}

	public static createFromPrefixedParams(prefix: string, params: Param[]): Pivot {
		var o: Vector3 = new Vector3();
		var target: Vector3 = null;
		var rotate: Vector3 = null;
		prefix = prefix ? prefix + "." : "";
		var result = new Pivot();
		for (let param of params) {
			var name: string = param.name;
			if (prefix + "pos" === name) {
				o = param.getVectorValueUsed();
			} else if (prefix + "pos.x" === name) {
				o.x = param.getFloatValueUsed();
			} else if (prefix + "pos.y" === name) {
				o.y = param.getFloatValueUsed();
			} else if (prefix + "pos.z" === name) {
				o.z = param.getFloatValueUsed();
			} else if (prefix + "target" === name) {
				target = param.getVectorValueUsed();
			} else if (prefix + "target.x" === name) {
				if (target == null) {
					target = new Vector3(param.getFloatValueUsed(), 0, 0);
				}
			} else if (prefix + "target.y" === name) {
				if (target == null) {
					target = new Vector3(0, param.getFloatValueUsed(), 0);
				}
			}
			else if (prefix + "target.z" === name) {
				if (target == null) {
					target = new Vector3(0, 0, param.getFloatValueUsed());
				}
			} else if ((prefix + "rotation" === name) || (prefix + "rot" === name)) {
				rotate = param.getVectorValueUsed();
			} else if ((prefix + "rotation.x" === name) || (prefix + "rot.x" === name)) {
				if (rotate == null) {
					rotate = new Vector3(param.getFloatValueUsed(), 0, 0);
				}
			} else if ((prefix + "rotation.y" === name) || (prefix + "rot.y" === name)) {
				if (rotate == null) {
					rotate = new Vector3(0, param.getFloatValueUsed(), 0);
				}
			} else if ((prefix + "rotation.z" === name) || (prefix + "rot.z" === name)) {
				if (rotate == null) {
					rotate = new Vector3(0, 0, param.getFloatValueUsed());
				}
			} else if (prefix + "uw" === name) {
				var values: string[] = param.value.split(";");
				result.u = Pivot.getPivotVector(values[0]);
				result.w = Pivot.getPivotVector(values[1]);
				result.v = Vector3.Cross(result.w, result.u);
			}
		}
		if (target != null) {
			result = Pivot.createFromTangent(o, target.subtract(o));
		} else if (rotate != null) {
			result = Pivot.createFromAngle(o, rotate.x, rotate.y, rotate.z);
		} else {
			result.o = o;
			result.u = result.u ? result.u : new Vector3(1, 0, 0);
			result.v = result.v ? result.v : new Vector3(0, 1, 0);
			result.w = result.w ? result.w : new Vector3(0, 0, 1);
		}
		return result;
	}

	public static createFromResultParams(prefix: string, params: Param[], paramList: Param[]): Pivot {
		var o: Vector3 = new Vector3();
		var target: Vector3 = null;
		var rotate: Vector3 = null;
		prefix = prefix ? prefix + "." : "";
		var result = new Pivot();
		for (let param of params) {
			var name: string = param.name;
			if (prefix + "pos" === name) {
				o = Expression.getResult(param.value, paramList).vector;
			} else if (prefix + "pos.x" === name) {
				o.x = Expression.getResult(param.value, paramList).getFloat();
			} else if (prefix + "pos.y" === name) {
				o.y = Expression.getResult(param.value, paramList).getFloat();
			} else if (prefix + "pos.z" === name) {
				o.z = Expression.getResult(param.value, paramList).getFloat();
			} else if (prefix + "target" === name) {
				target = Expression.getResult(param.value, paramList).vector;
			} else if (prefix + "target.x" === name) {
				if (target == null) {
					target = new Vector3(Expression.getResult(param.value, paramList).getFloat(), 0, 0);
				}
			} else if (prefix + "target.y" === name) {
				if (target == null) {
					target = new Vector3(0, Expression.getResult(param.value, paramList).getFloat(), 0);
				}
			}
			else if (prefix + "target.z" === name) {
				if (target == null) {
					target = new Vector3(0, 0, Expression.getResult(param.value, paramList).getFloat());
				}
			} else if ((prefix + "rotation" === name) || (prefix + "rot" === name)) {
				rotate = Expression.getResult(param.value, paramList).vector;
			} else if ((prefix + "rotation.x" === name) || (prefix + "rot.x" === name)) {
				if (rotate == null) {
					rotate = new Vector3(Expression.getResult(param.value, paramList).getFloat(), 0, 0);
				}
			} else if ((prefix + "rotation.y" === name) || (prefix + "rot.y" === name)) {
				if (rotate == null) {
					rotate = new Vector3(0, Expression.getResult(param.value, paramList).getFloat(), 0);
				}
			} else if ((prefix + "rotation.z" === name) || (prefix + "rot.z" === name)) {
				if (rotate == null) {
					rotate = new Vector3(0, 0, Expression.getResult(param.value, paramList).getFloat());
				}
			} else if (prefix + "uw" === name) {
				var values: string[] = param.value.split(";");
				result.u = Pivot.getPivotVector(values[0]);
				result.w = Pivot.getPivotVector(values[1]);
				result.v = Vector3.Cross(result.w, result.u);
			}
		}
		if (target != null) {
			result = Pivot.createFromTangent(o, target.subtract(o));
		} else if (rotate != null) {
			result = Pivot.createFromAngle(o, rotate.x, rotate.y, rotate.z);
		} else {
			result.o = o;
			result.u = result.u ? result.u : new Vector3(1, 0, 0);
			result.v = result.v ? result.v : new Vector3(0, 1, 0);
			result.w = result.w ? result.w : new Vector3(0, 0, 1);
		}
		return result;
	}

	public static getPivotVector(value: string): Vector3 {
		if (value === "x") {
			return new Vector3(1, 0, 0);
		} else if (value === "-x") {
			return new Vector3(-1, 0, 0);
		} else if (value === "y") {
			return new Vector3(0, 1, 0);
		} else if (value === "-y") {
			return new Vector3(0, -1, 0);
		} else if (value === "z") {
			return new Vector3(0, 0, 1);
		} else if (value === "-z") {
			return new Vector3(0, 0, -1);
		}
	}

	public static createFromAngle(o: Vector3, alpha: number, beta: number, gamma: number): Pivot {
		var result = new Pivot();
		result.o = o;
		var a: number = FormatUtils.degToRad(alpha);
		var b: number = FormatUtils.degToRad(beta);
		var c: number = FormatUtils.degToRad(gamma);
		result.u = new Vector3(Math.cos(c) * Math.cos(b),
			Math.sin(c), Math.cos(c) * Math.sin(b));
		result.w = Math.abs(result.u.x) < result.epsilone && Math.abs(result.u.z) < result.epsilone ? new Vector3(0, 0, 1)
			: new Vector3(-result.u.z, 0, result.u.x);
		result.w = Vector3.Normalize(result.w);
		result.v = Vector3.Cross(result.w, result.u);
		if (Math.abs(a) > result.epsilone) {
			result.w = result.w.scale(Math.cos(a)).add(result.v.scale(Math.sin(a)));
			result.v = Vector3.Cross(result.w, result.u);
		}
		return result;
	}

	public static createFromMesh(mesh: TransformNode): Pivot {
		return Pivot.createFromAngle(mesh.position, FormatUtils.radToDeg(mesh.rotation.x), -FormatUtils.radToDeg(mesh.rotation.y), FormatUtils.radToDeg(mesh.rotation.z));
	}

	public static createFromTangent(o: Vector3, tangent: Vector3): Pivot {
		var result = new Pivot();
		result.o = o;
		if (tangent != null) {
			result.u = new Vector3(tangent.x, tangent.y, tangent.z);
			result.u = Vector3.Normalize(result.u);
			result.w = Math.abs(result.u.x) < result.epsilone && Math.abs(result.u.z) < result.epsilone ? new Vector3(0, 0, 1)
				: new Vector3(-result.u.z, 0, result.u.x);
			result.w = Vector3.Normalize(result.w);
			result.v = Vector3.Cross(result.w, result.u);
		} else {
			result.u = new Vector3(1, 0, 0);
			result.v = new Vector3(0, 1, 0);
			result.w = new Vector3(0, 0, 1);
		}
		return result;
	}

	public static createFromTarget(o: Vector3, tangent: Vector3): Pivot {
		return Pivot.createFromTangent(o, tangent.subtract(o));
	}

	public static createFromUW(uw: string): Pivot {
		var result: Pivot = new Pivot();
		var values: string[] = uw.split(";");
		result.u = Pivot.getPivotVector(values[0]);
		result.w = Pivot.getPivotVector(values[1]);
		result.v = Vector3.Cross(result.w, result.u);
		return result;
	}

	public static createFromW(o: Vector3, w: Vector3): Pivot {
		var result: Pivot = new Pivot();
		result.o = o;
		result.w = Vector3.Normalize(w);
		result.v = Vector3.Cross(result.w, result.u);
		return result;
	}

	public static createFromV(o: Vector3, v: Vector3): Pivot {
		var result: Pivot = new Pivot();
		result.o = o;
		result.v = Vector3.Normalize(v);
		result.w = Vector3.Cross(result.u, result.v);
		return result;
	}

	public isVertical(): boolean {
		return Math.abs(this.u.x) < this.epsilone && Math.abs(this.u.z) < this.epsilone;
	}

	public updateW(value: Vector3): void {
		this.w = value;
		this.v = Vector3.Cross(this.w, this.u);
	}

	public getEulerAnglesRad(): Vector3 {
		var result: Vector3 = new Vector3();
		if (this.isVertical()) {
			result.z = this.u.y > 0 ? Math.PI / 2 : -Math.PI / 2;
			result.y = -Math.atan2(-this.w.x, this.w.z);
		} else {
			result.y = Math.atan2(this.u.z, this.u.x);
			result.z = (Math.asin(this.u.y / this.u.length()));
			var pivot: Pivot = Pivot.createFromTangent(new Vector3(), this.u);
			var pz: number = Vector3.Dot(this.w, pivot.w);
			var py: number = Vector3.Dot(this.w, pivot.v);
			result.x = -Math.atan2(py, pz);
		}
		console.log("pivot.rotation.y= " + result.y);
		return result;
	}

	public getEulerAnglesDeg(): Vector3 {
		return FormatUtils.radToDegVector(this.getEulerAnglesRad());
	}

	public localToGlobal(a: Vector3): Vector3 {
		var x: number = a.x * this.u.x + a.y * this.v.x + a.z * this.w.x + this.o.x;
		var y: number = a.x * this.u.y + a.y * this.v.y + a.z * this.w.y + this.o.y;
		var z: number = a.x * this.u.z + a.y * this.v.z + a.z * this.w.z + this.o.z;
		return new Vector3(x, y, z);
	}

	public globalToLocal(a: Vector3): Vector3 {
		var l: Vector3 = a.subtract(this.o);
		return new Vector3(Vector3.Dot(l, this.u), Vector3.Dot(l, this.v), Vector3.Dot(l, this.w));
	}

	public globalToLocalVector3(a: Vector3): Vector3 {
		return new Vector3(Vector3.Dot(a, this.u), Vector3.Dot(a, this.v), Vector3.Dot(a, this.w));
	}

	public rotateFromVector(a: Vector3): Vector3 {
		return this.globalToLocal(a.subtract(this.o));
	}

	public localToGlobalPivot(pivot: Pivot): Pivot {
		var o: Vector3 = this.localToGlobal(pivot.localToGlobal(new Vector3()));
		var u: Vector3 = this.localToGlobal(pivot.localToGlobal(new Vector3(1, 0, 0)));
		var v: Vector3 = this.localToGlobal(pivot.localToGlobal(new Vector3(0, 1, 0)));
		var w: Vector3 = this.localToGlobal(pivot.localToGlobal(new Vector3(0, 0, 1)));
		return Pivot.createFromVectors(o, u.subtract(o), v.subtract(o), w.subtract(o));
	}

	public globalToLocalPivot(pivot: Pivot): Pivot {
		var o: Vector3 = this.globalToLocal(pivot.localToGlobal(new Vector3()));
		var u: Vector3 = this.globalToLocal(pivot.localToGlobal(new Vector3(1, 0, 0)));
		var v: Vector3 = this.globalToLocal(pivot.localToGlobal(new Vector3(0, 1, 0)));
		var w: Vector3 = this.globalToLocal(pivot.localToGlobal(new Vector3(0, 0, 1)));
		return Pivot.createFromVectors(o, u.subtract(o), v.subtract(o), w.subtract(o));
	}

	public rotateFromAngle(alpha: number, beta: number, gamma: number): Pivot {
		var local: Pivot = Pivot.createFromAngle(new Vector3(), alpha, beta, gamma);
		return this.localToGlobalPivot(local);
	}

	public translate(a: Vector3): Pivot {
		var local: Pivot = Pivot.createFromOrigin(a);
		return this.localToGlobalPivot(local);
	}

	private toStringVector(v: Vector3): string {
		return v.x + "; " + v.y + "; " + v.z;
	}

	public toString(): string {
		return "o(" + this.toStringVector(this.o) + ")u(" + this.toStringVector(this.u) + ")v(" + this.toStringVector(this.v) +
			")w(" + this.toStringVector(this.w) + ")s(" + this.toStringVector(this.getEulerAnglesDeg()) + ")";
	}

	public static createAxis(size: number, isBox: boolean, engine: EngineService): Mesh {

		var root: Mesh = new Mesh("axis");
		if (isBox) {
			var box: Mesh = MeshBuilder.CreateBox("origin", { size: size / 8 }, engine.scene);
			var material: StandardMaterial = new StandardMaterial("", engine.scene);
			material.emissiveColor = new Color3(1.0, 1.0, 0.0);
			box.material = material;
			root.addChild(box);
		}

		var axisX = Mesh.CreateLines(
			'axisX',
			[
				Vector3.Zero(),
				new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
				new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
			],
			engine.scene
		);
		axisX.color = new Color3(1, 0, 0);
		root.addChild(axisX);

		var axisY = Mesh.CreateLines(
			'axisY',
			[
				Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
				new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0)
			],
			engine.scene
		);
		axisY.color = new Color3(0, 1, 0);
		root.addChild(axisY);

		var axisZ = Mesh.CreateLines(
			'axisZ',
			[
				Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
				new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95)
			],
			engine.scene
		);
		axisZ.color = new Color3(0, 0, 1);
		root.addChild(axisZ);

		return root;
	}


}