import { Scene } from "../../../model/assembler/scene";
import { MeshObject } from "../../../process/scene/mesh/meshObject";
import { EngineService } from "../../../engine/engine.service";
import { CollisionManager } from "../../../engine/collision/collisionManager";
import { Pivot } from "../../utils/pivot";
import { Point } from "../../utils/point";
import { Vector3 } from '@babylonjs/core';
import { PlaceholderGroup } from "../../../process/scene/placeholder/placeholderGroup";
import { ActionAllow } from "../../utils/actionAllow";
import { DynamicTexturePlane } from "../../../process/scene/info/dynamicTexturePlane";
import { CameraUtils } from '../../../process/utils/cameraUtils';
import { Logger } from '../../../process/utils/logger';

export class WallObject extends MeshObject {

	public length: number;
	public height: number;
	public thickness: number;

	public highlightTexture: DynamicTexturePlane;

	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(false, true);
	}

	public writeCreate(engine: EngineService): void {
		this.mesh = this.mapper.createBox(engine);
		super.writeCreate(engine);

		// by default, the wall receives shadow
		this.mesh.receiveShadows = true;

		if (this.actionAlow.isEdit()) {
			this.highlightTexture = new DynamicTexturePlane(new Point(this.length, this.height), 1000, this, engine);
			this.highlightTexture.drawBorder(15, "#ffff00");
			engine.viewManager.addMesh(this.highlightTexture.plane);
		}
	}

	public write(engine: EngineService): void {
		Logger.info("WallObject", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("WallObject", this.Param);
		
		if (!this.created) {
			this.writeCreate(engine);
		}

		this.pivot = Pivot.createFromParams(this.Param);
		this.position = this.pivot.o;
		this.rotation = this.pivot.getEulerAnglesRad();
		
		var dimension: Vector3 = this.getParamValueVector("dimension");
		if (dimension != null) {
			this.thickness = dimension.x;
			this.height = dimension.y;
			this.length = dimension.z;
		}
		else {
			this.height = this.getParamValueFloat("height");
			this.length = this.getParamValueFloat("length");
			this.thickness = this.getParamValueFloat("thickness");
		}

		var local: Pivot = Pivot.createFromOrigin(new Vector3(-this.thickness / 2, this.height / 2, this.length / 2));
		var global: Pivot = this.pivot.localToGlobalPivot(local);
		
		this.mesh.scaling = new Vector3(this.thickness, this.height, this.length);
		this.mesh.rotation = global.getEulerAnglesRad();
		this.mesh.rotation.y = -this.mesh.rotation.y;
		this.mesh.position = global.o;


		if (this.actionAlow.isEdit()) {
			var pivot: Pivot = this.localToGlobalPivot(0.1, 0.5, 0.5);
			this.highlightTexture.setPivot(pivot);
		}

		this.writeAllParam(engine);
	}

	public localToGlobalPivot(u: number, v: number, w: number): Pivot {
		var local: Pivot = Pivot.createFromOrigin(new Vector3(u * this.thickness, v * this.height, w * this.length));
		return this.pivot.localToGlobalPivot(local);
	}

	public writePlaceholder(engine: EngineService): void {
		if (this.placeholderGroup == null) {
			this.placeholderGroup = new PlaceholderGroup();
		}
		this.placeholderGroup.createFromWall(this, engine);
	}

	public highlight(value: boolean): void {
		if (this.actionAlow.isEdit()) {
			this.highlightTexture.visible(value);
			if (this.placeholderGroup && !value) {
				this.placeholderGroup.visible(false);
			}
		}
	}

	public inCollisionBoundingBox(point: Vector3, distance: number): boolean {
		var local: Vector3 = this.pivot.globalToLocal(point);
		return local.x > -distance - this.thickness && local.x < distance
			&& local.y > -distance && local.y < this.height + distance
			&& local.z > -distance && local.z < this.length + distance
	}

	public cameraCollision(camera: CameraUtils, collisionMgr: CollisionManager): boolean {
		var result: boolean = this.inCollisionBoundingBox(camera.position, collisionMgr.maxDistance);
		if (result) {
			//Logger.info("WallObject", "cameraCollision(wall: " + this.name + ") -> isWallCollision = true");
			if (collisionMgr.wall && collisionMgr.wall.name === this.name) {
				result = false;
				var a: Vector3 = this.pivot.u.scale(1.5 * (collisionMgr.maxDistance - collisionMgr.focusDistance));
				a = a.scale(1 - collisionMgr.wallCosinus(camera, this));
				camera.position = collisionMgr.focusPosition.add(a);
			} else if (collisionMgr.focus && collisionMgr.wallCosinus(camera, this) > 0.8) {
				Logger.info("WallObject", "cameraCollision(wall: " + this.name + ") -> wall focus");
				result = false;
				collisionMgr.focus = false;
				collisionMgr.wall = this;
				collisionMgr.focusPosition = camera.position;
				collisionMgr.focusDistance = collisionMgr.getWallDistance(camera.position, this);
			}
		} else if (collisionMgr.wall && collisionMgr.wall.name === this.name) {
			collisionMgr.wall = null;
		}
		return result;
	}

	public focusCamera(fov: number): CameraUtils {
		var result: CameraUtils = new CameraUtils();
		result.fov = fov;
		var pivot: Pivot = this.localToGlobalPivot(0.5, 0.5, 0.5);
		var fovToAtan: number = 1 / Math.tan(fov / 2);
		result.position = pivot.localToGlobal(new Vector3(1.25 * (this.thickness / 2 + this.height * fovToAtan / 2), 0, 0));
		result.target = pivot.o;
		return result;
	}

}