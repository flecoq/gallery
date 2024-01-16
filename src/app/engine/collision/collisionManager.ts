import { Camera, UniversalCamera, Tools, Vector3 } from '@babylonjs/core';
import { Logger } from '../../process/utils/logger';
import { SceneImpl } from '../../process/scene/sceneImpl';
import { MeshObject } from '../../process/scene/mesh/meshObject';
import { MergeObject } from '../../process/scene/mesh/mergeObject';
import { WallObject } from '../../process/scene/mesh/wallObject';
import { CompositeObject } from '../../process/scene/mesh/composite/compositeObject';
import { FloorObject } from '../../process/scene/mesh/floorObject';
import { CameraUtils } from "../../process/utils/cameraUtils";
import { EngineService } from '../engine.service';

export class CollisionManager {

	public focus: boolean;
	public waitAfterRender: boolean;
	public wall: WallObject;
	public focusDistance: number;
	public focusPosition: Vector3;
	public focusObject: SceneImpl;

	public maxDistance: number;
	
	public constructor(public engine: EngineService) {
	}

	public getMaxDistance(sceneImpl: MeshObject): number {
		if( sceneImpl instanceof MergeObject) {
			return this.maxDistance / 2;
		} else if( sceneImpl instanceof FloorObject) {
			return this.maxDistance / 2;
		} else {
			return this.maxDistance;
		}
	}
	
	public wallCosinus(camera: CameraUtils, wall: WallObject): number {
		var a: Vector3 = new Vector3(Math.sin(camera.rotation.y), 0, Math.cos(camera.rotation.y));
		var result: number = Math.abs(Vector3.Dot(a, wall.pivot.u));
		console.log("result:" + result);
		return result;
	}
	
	public getWallDistance(position: Vector3, wall: WallObject): number {
		return Math.abs(Vector3.Dot(position.subtract(wall.pivot.o), wall.pivot.u));
	}
	
	public focusWallCollision(camera: CameraUtils, wall: WallObject): void {
		if( wall.inCollisionBoundingBox(camera.position, this.maxDistance) ) {
			Logger.info("CollisionManager", "focusWallCollision(wall: " + wall.name + ")");
			var focusDistance: number = this.getWallDistance(camera.position, wall);
			var diff: Vector3 = wall.pivot.u.scale(1.1*(this.maxDistance - focusDistance));
			camera.position = camera.position.add(diff);
		}
	}
	
	public getCompositeObjectDistance(position: Vector3, compositeObject: CompositeObject): number {
		return Math.abs(Vector3.Dot(position.subtract(compositeObject.global.o), compositeObject.global.u));
	}
	
	public focusCompositeObjectCollision(camera: CameraUtils, compositeObject: CompositeObject): void {
		if( compositeObject.inCollisionBoundingBox(camera.position, this.maxDistance) ) {
			Logger.info("CollisionManager", "focusCompositeObjectCollision(wall: " + compositeObject.name + ")");
			var focusDistance: number = this.getCompositeObjectDistance(camera.position, compositeObject);
			var diff: Vector3 = compositeObject.global.u.scale(1.1*(this.maxDistance - focusDistance));
			camera.position = camera.position.add(diff);
		}
	}
}
