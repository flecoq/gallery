import { Func } from '../../model/assembler/func';
import { FuncValue } from '../../process/function/funcValue';
import { Point } from '../../process/utils/point';
import { Vector3, Animation, Camera } from "@babylonjs/core";
import { FormatUtils } from '../../process/utils/formatUtils';
import { CameraUtils } from '../../process/utils/cameraUtils';
import { Logger } from '../../process/utils/logger';
import { EngineService } from "../../engine/engine.service";

export class FuncImpl extends Func {
	
	public static frameRate: number = 25;

	public beginValue: FuncValue;
	public endValue: FuncValue;
	public start: number;
	public stop: number;
	public offset: number;
	public scale: number;
	public constant: number;
	public repeat: number;
	public mirror: boolean;

	public repeatRange: number;
	
	public parent: any;
	
	public constructor(func: Func) {
		super(func.type);
		func.copy(this);
		if( this.ref ) {
			// TODO
		} else {
			this.constant = this.getParamValueFloat("constant");
			var value: string = this.getParamValue("begin");
			this.beginValue = value ? new FuncValue(value) : FuncValue.createFromFloat(0);
			value = this.getParamValue("end");
			this.endValue = value ? new FuncValue(value) : FuncValue.createFromFloat(0);
			this.repeat = this.getParamValueInt("repeat");
			this.mirror = this.getParamValueBool("mirror");
			this.start = this.getParamValueFloat("start");
			this.start = this.start ? this.start : 0;
			this.stop = this.getParamValueFloat("stop");
			this.stop = this.stop ? this.stop : 1;
			this.offset = this.getParamValueFloat("offset");
			this.offset = this.offset ? this.offset : 0;
			this.scale = this.getParamValueFloat("scale");
			this.scale = this.scale ? this.scale : 1;
			this.count = isNaN(this.count) || this.count == null ? 11 : this.count;
		}
	}

	public getRatio(ratio: number): number {
		var result: number = ratio;
		if (this.repeat) {
			if (ratio > 1) {
				result = 1;
				this.repeatRange = this.repeat - 1;
			} else {
				result = result * this.repeat;
				this.repeatRange = Math.trunc(result);
				result = result - this.repeatRange;
			}
		}
		if (this.start && this.stop && this.stop > this.start) {
			if (result >= this.start && result <= this.stop) {
				result = (result - this.start) / (this.stop - this.start);
			} else {
				return 0;
			}
		}
		if (this.mirror) {
			result = this.repeat != null ? (result < 0.5 ? 2 * result : 2 * (1 - result)) : 1 - result;
		}
		return result;
	}

	public getTypeResult(ratio: number): number {
		var result: number = ratio;
		if ("square" === this.type) {
			result = 1 - (1 - result) * (1 - result);
		} else if ("sinus" === this.type) {
			var angle: number = Math.PI * (result - 0.5);
			result = (1 + Math.sin(angle)) * 0.5;
		} else if ("constant" === this.type) {
			return this.constant;
		}
		return result;
	}

	public getRootResult(ratio: number): FuncValue {
		if (ratio == null) {
			return null;
		}
		var result: number = this.getTypeResult(ratio);
		if (this.beginValue.isIntegerOrFloat()) {
			result = this.beginValue.float * (1 - result) + result * this.endValue.float;
			return FuncValue.createFromFloat(this.offset + this.scale * result);
		} else if (this.beginValue.isPoint()) {
			var beginPoint: Point = this.beginValue.point;
			var endPoint: Point = this.endValue.point;
			var point: Point = new Point(Math.trunc(beginPoint.x * (1 - result) + result * endPoint.x),
				Math.trunc(beginPoint.y * (1 - result) + result * endPoint.y));
			point.x = Math.trunc(this.offset + this.scale * point.x);
			point.y = Math.trunc(this.offset + this.scale * point.y);
			return FuncValue.createFromPoint(point);
		} else if (this.beginValue.isVector()) {
			var beginVector: Vector3 = this.beginValue.vector;
			var endVector: Vector3 = this.endValue.vector;
			var vector: Vector3 = new Vector3(beginVector.x * (1 - result) + result * endVector.x,
				beginVector.y * (1 - result) + result * endVector.y,
				beginVector.z * (1 - result) + result * endVector.z);
			vector.x = this.offset + vector.x * this.scale;
			vector.y = this.offset + vector.y * this.scale;
			vector.z = this.offset + vector.z * this.scale;
			return FuncValue.createFromVector(vector);
		}
	}
	
	public getResult(value: number): FuncValue {
		var ratio: number = this.length ? value / this.length : value;
		var result: FuncValue = this.getRootResult(ratio);
		for(let func of this.Func) {
			var value: number = (func as FuncImpl).getResult(ratio).float;
			if( "product" === func.operator) {
				value = value ? value : 0;
				result.float = result.float * value;
			} else if( "sump" === func.operator) {
				value = value ? value : 0;
				result.float += value;
			}
		}
		return result;
	}

	public getKeyFrames() {
		var result = [];
		for(let u = 0; u < this.count; u++) {
			var frame: number = Math.trunc(u / (this.count - 1 ) * this.length);
			var value: FuncValue = this.getResult(frame);
			if( value.isFloat() ) {
				result.push({
					    frame: frame,
					    value: value.float
					});
			} else if( value.isVector() ) {
				result.push({
					    frame: frame,
					    value: value.vector
					});
			}
		}
		return result
	}
	
	private getAnimationType(): number {
		if( this.beginValue && this.beginValue.isVector()) {
			return Animation.ANIMATIONTYPE_VECTOR3;
		} else {
			return Animation.ANIMATIONTYPE_FLOAT;
		}
	}
	
	public run(engine: EngineService, onAnimationEnd?: () => void): void {
		var animation: Animation = new Animation(this.id ? this.id : "anim", this.name, FuncImpl.frameRate, this.getAnimationType(), Animation.ANIMATIONLOOPMODE_CONSTANT);
		animation.setKeys(this.getKeyFrames());
		this.parent.animations = [];
		this.parent.animations.push(animation);
		engine.scene.beginAnimation(this.parent, 0, this.length, false, 1, onAnimationEnd);
	}
	
	public static createVectorFunc(begin: Vector3, end: Vector3, duration: number, type: string): FuncImpl {
		var func: Func = new Func(type);
		func.length = duration * FuncImpl.frameRate;
		func.addParam("begin", FormatUtils.vectorToString(begin), "true");
		func.addParam("end", FormatUtils.vectorToString(end), "true");
		return new FuncImpl(func);
	}
	
	public static animCamera(engine: EngineService, parent: Camera, begin: CameraUtils, end: CameraUtils, duration: number, onAnimationEnd?: () => void): void {
		var funcPos: FuncImpl = FuncImpl.createVectorFunc(begin.position, end.position, duration, "square");
		var animPos: Animation = new Animation("animPos", "position", FuncImpl.frameRate, funcPos.getAnimationType(), Animation.ANIMATIONLOOPMODE_CONSTANT);
		animPos.setKeys(funcPos.getKeyFrames());
		var funcRot: FuncImpl = FuncImpl.createVectorFunc(begin.rotation, end.rotation, duration, "square");
		var animRot: Animation = new Animation("animRot", "rotation", FuncImpl.frameRate, funcRot.getAnimationType(), Animation.ANIMATIONLOOPMODE_CONSTANT);
		animRot.setKeys(funcRot.getKeyFrames());
		engine.scene.beginDirectAnimation(parent, [animPos, animRot], 0, funcPos.length, false, 1, onAnimationEnd);
	}
	
}