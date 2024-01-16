import { Scene } from "../../../model/assembler/scene";
import { MeshObject } from "../../../process/scene/mesh/meshObject";
import { Placeholder } from "../../../process/scene/placeholder/placeholder";
import { EngineService } from "../../../engine/engine.service";
import { Creation } from '../../../model/assembler/creation';
import { Vector3 } from '@babylonjs/core';
import { FormatUtils } from "../../../process/utils/formatUtils";

export class SupportObject extends MeshObject {

	public creation: Creation;
	public scaling: Vector3;

	public constructor(scene: Scene) {
		super(scene);
	}
	
	public getScale(): Vector3 {
		if( this.scaling == null ) {
			this.scaling = this.getParamValueVector("scaling");
		}
		return this.scaling;
	}
	
	
	public updateScale(): void {
		this.addOrUpdateParam("scaling", FormatUtils.vectorToString(this.scaling));
	}

	public getCreation(engine: EngineService): Creation {
		if( this.creation == null ) {
			var creationId = this.getParamValue("asset");
			this.creation = engine.modelService.getCreation(creationId);
		}
		return this.creation;
	}

	public widthToHeight(width: number, engine: EngineService): void {
	}

	public fromPlaceholder(placeholder: Placeholder, engine: EngineService): void {
	}
}