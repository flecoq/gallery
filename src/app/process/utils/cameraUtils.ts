import { Vector3, UniversalCamera, ArcRotateCamera } from "@babylonjs/core";
import { EngineService } from "../../engine/engine.service"
import { FuncImpl } from "../../process/function/funcImpl";

export class CameraUtils {

	public position: Vector3;
	public target: Vector3 = null;
	public rotation: Vector3 = null;
	public fov: number;
	
	constructor () {}
	
	public fromUniversalCamera(camera: UniversalCamera): void {
		this.position = camera.position.clone();
		this.target = camera.getTarget().clone();
		this.fov = camera.fov;
	}
	
	public fromRotUniversalCamera(camera: UniversalCamera): void {
		this.position = camera.position.clone();
		this.rotation = camera.rotation.clone();
		this.fov = camera.fov;
	}
	
	public toUniversalCamera(camera: UniversalCamera): void {
		camera.position = this.position;
		camera.fov = this.fov;
		if( this.rotation ) {
			camera.rotation = this.rotation;
		} else {
			camera.setTarget(this.target);
		}
	}

	public toUniversalCameraAnim(camera: UniversalCamera, engine: EngineService, duration: number, onAnimationEnd?: () => void): void {
		var begin: CameraUtils = CameraUtils.createFromRotUniversalCamera(camera);
		var distance: number = begin.position.subtract(this.position).length();
		duration = Math.max(1, duration * distance / 5);
		if( Math.abs(begin.rotation.y - this.rotation.y) > Math.PI ) {
			this.rotation.y += begin.rotation.y > 0 ? 2 * Math.PI : -2 * Math.PI;
		}
		FuncImpl.animCamera(engine, camera, begin, this, duration, onAnimationEnd);
	}
	
	public fromArcRotateCamera(camera: ArcRotateCamera): void {
		this.position = camera.position.clone();
		this.target = camera.getTarget().clone();
		this.fov = camera.fov;
	}
	
	public toArcRotateCamera(camera: ArcRotateCamera): void {
		camera.position = this.position;
		camera.fov = this.fov;
		if( this.rotation ) {
			camera.rotation = this.rotation;
		} else {
			camera.setTarget(this.target);
		}
	}
	
	public targetToRotation(): void {
		if( this.target ) {
			var v: Vector3 = Vector3.Normalize(this.target.subtract(this.position));
			this.rotation = new Vector3(-Math.asin(v.y), Math.atan2(v.x, v.z), 0);
			this.target = null;
		}
	}

	public getVector(): Vector3 {
		return this.target.subtract(this.position);
	}
	
	public equals(camera: CameraUtils): boolean {
		const delta: number = 0.2;
		var a: Vector3 = this.getVector();
		var b: Vector3 = camera.getVector();
		var length: number = a.length();
		return Math.abs((a.x - b.x) / length) < delta && Math.abs((a.y - b.y) / length) < delta 
				&& Math.abs((a.z - b.z) / length) < delta 
				&& Math.abs((this.position.x - camera.position.x) / length) < delta
				&& Math.abs((this.position.y - camera.position.y) / length) < delta
				&& Math.abs((this.position.z - camera.position.z) / length) < delta;
	}
	
	public static createFromUniversalCamera(camera: UniversalCamera): CameraUtils {
		var result: CameraUtils = new CameraUtils();
		result.fromUniversalCamera(camera);
		return result;
	}
	
	public static createFromRotUniversalCamera(camera: UniversalCamera): CameraUtils {
		var result: CameraUtils = new CameraUtils();
		result.fromRotUniversalCamera(camera);
		return result;
	}
	
	public static createFromArcRotateCamera(camera: ArcRotateCamera): CameraUtils {
		var result: CameraUtils = new CameraUtils();
		result.fromArcRotateCamera(camera);
		return result;
	}
	
}