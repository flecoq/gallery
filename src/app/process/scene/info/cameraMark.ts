import { CameraUtils } from "../../utils/cameraUtils";
import { Vector3 } from '@babylonjs/core';

export class CameraMark {
	
	public camera: CameraUtils;
	
	constructor(camera: CameraUtils) {
		this.camera = camera;
		this.camera.targetToRotation();
	}
	
	public isSelected(vector: Vector3, radius: number): boolean {
		var diff: Vector3 = vector.subtract(new Vector3(this.camera.position.x, 0, this.camera.position.z));
		return diff.length() < radius;
	}
}