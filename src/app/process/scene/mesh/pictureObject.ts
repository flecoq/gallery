import { Scene } from "../../../model/assembler/scene";
import { Param } from "../../../model/assembler/param";
import { SupportObject } from "../../../process/scene/mesh/supportObject";
import { PlaneObject } from "../../../process/scene/mesh/planeObject";
import { Placeholder } from "../../../process/scene/placeholder/placeholder";
import { EngineService } from "../../../engine/engine.service";
import { FormatUtils } from '../../../process/utils/formatUtils';
import { Pivot } from '../../../process/utils/pivot';
import { Vector3 } from '@babylonjs/core';
import { CameraUtils } from '../../../process/utils/cameraUtils';
import { Logger } from '../../../process/utils/logger';
import { ActionAllow } from "../../utils/actionAllow";

export class PictureObject extends SupportObject {

	protected child: PlaneObject;
	protected borderSize: number;

	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(true, true);
	}

	public writeCreate(engine: EngineService): void {
		this.mesh = this.mapper.createBox(engine);
		super.writeCreate(engine);
		this.child = new PlaneObject(Scene.create(this.name + "Child", "object", "plane"));
		this.child.addOrUpdateParam("material.diffuseMap.creation", this.getCreation(engine).id);
	}

	public write(engine: EngineService): void {
		Logger.info("PictureObject", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("PictureObject", JSON.stringify(this.Param));
		if (!this.created) {
			this.writeCreate(engine);
		}
		this.updateChildParam();
		this.child.write(engine);
		this.addChild(this.child);
		this.writeAllParam(engine);
	}

	public writeTransformParam(param: Param): void {
		this.position = this.mesh.position;
		this.rotation = this.mesh.rotation;
		this.scaling = this.mesh.scaling;
		super.writeTransformParam(param);
		this.mesh.position = this.position;
		this.mesh.rotation = this.rotation;
		this.mesh.scaling = this.scaling;
	}

	public getBorderSize(): number {
		if (this.borderSize == null) {
			this.borderSize = this.getParamValueFloat("border.size");
		}
		return this.borderSize;
	}

	private updateChildParam(): void {
		this.getScale();
		this.borderSize = this.getParamValueFloat("border.size");
		this.child.addOrUpdateParam("scale", FormatUtils.vectorToString(
			new Vector3(1 - 2 * this.borderSize / this.scaling.z, 1 - 2 * this.borderSize / this.scaling.y, 1)));
		this.child.addOrUpdateParam("pos", FormatUtils.vectorToString(
			new Vector3(0.55, 0, 0)));
		this.child.addOrUpdateParam("rot", FormatUtils.vectorToString(
			new Vector3(0, -90, 0)));
	}

	public widthToHeight(width: number, engine: EngineService): void {
		var assetWidth: number = width - 2 * this.getBorderSize();
		var assetHeight: number = this.getCreation(engine).widthToHeight(assetWidth);
		var height: number = assetHeight + 2 * this.getBorderSize();
		this.getScale().z = width;
		this.getScale().y = height;
		this.updateScale();
	}

	public fromPlaceholder(placeholder: Placeholder, engine: EngineService): void {
		Logger.info("PictureObject", "fromPlaceholder()");
		if (placeholder.width) {
			this.widthToHeight(placeholder.width, engine);
		}
		var pivot: Pivot = placeholder.pivot;
		this.addOrUpdateParam("pos", FormatUtils.vectorToString(pivot.o));
		var rotation: Vector3 = pivot.getEulerAnglesDeg();
		this.addOrUpdateParam("rot", FormatUtils.vectorToString(rotation));
	}

	public focusCamera(fov: number): CameraUtils {
		var result: CameraUtils = new CameraUtils();
		result.fov = fov;
		var pivot: Pivot = Pivot.createFromMesh(this.mesh);
		var fovToAtan: number = 1 / Math.tan(fov / 2);
		var scale: Vector3 = this.getParamValueVector("scale");
		result.position = pivot.localToGlobal(new Vector3(1.5 * (scale.x / 2 + scale.y * fovToAtan / 2), 0, 0));
		result.target = pivot.o;
		result.targetToRotation();
		return result;
	}

}