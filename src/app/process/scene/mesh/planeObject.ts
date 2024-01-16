import { Scene } from "../../../model/assembler/scene";
import { Param } from "../../../model/assembler/param";
import { SupportObject } from "../../../process/scene/mesh/supportObject";
import { EngineService } from "../../../engine/engine.service";
import { Mesh, Vector3 } from '@babylonjs/core';
import { Pivot } from '../../../process/utils/pivot';
import { CameraUtils } from '../../../process/utils/cameraUtils';
import { FormatUtils } from '../../../process/utils/formatUtils';
import { Placeholder } from "../../../process/scene/placeholder/placeholder";
import { Logger } from '../../../process/utils/logger';
import { ActionAllow } from "../../utils/actionAllow";

export class PlaneObject extends SupportObject {

	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(true, false);
	}

	public writeCreate(engine: EngineService): void {
		this.mesh = Mesh.CreatePlane(this.name, 1, engine.scene);
		super.writeCreate(engine);
		var creationId = this.getParamValue("asset");
		if (creationId) {
			this.addOrUpdateParam("material.diffuseMap.creation", creationId);
		}
	}

	public widthToHeight(width: number, engine: EngineService): void {
		this.getScale().x = width;
		this.getScale().y = this.getCreation(engine).widthToHeight(width);
		this.updateScale();
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

	public fromPlaceholder(placeholder: Placeholder, engine: EngineService): void {
		Logger.info("PlaneObject", "fromPlaceholder()");
		if (placeholder.width) {
			this.widthToHeight(placeholder.width, engine);
		}
		var pivot: Pivot = placeholder.pivot;
		this.addOrUpdateParam("pos", FormatUtils.vectorToString(pivot.localToGlobal(new Vector3(0.05, 0, 0))));
		var rotation: Vector3 = pivot.getEulerAnglesDeg();
		rotation.y += -90;
		this.addOrUpdateParam("rot", FormatUtils.vectorToString(rotation));
	}

	public focusCamera(fov: number): CameraUtils {
		var result: CameraUtils = new CameraUtils();
		var pivot: Pivot = Pivot.createFromMesh(this.mesh);
		var fovToAtan: number = 1 / Math.tan(fov / 2);
		var scale: Vector3 = this.getParamValueVector("scale");
		result.position = pivot.localToGlobal(new Vector3(0, 0, -1.25 * (scale.z / 2 + scale.y * fovToAtan / 2)));
		result.target = pivot.o;
		return result;
	}

}