import { MaterialImpl } from './materialImpl';
import { StandardMaterial, VideoTexture, Color3 } from '@babylonjs/core';
import { EngineService } from "../../../../engine/engine.service";
import { MeshObject } from '../meshObject';
import { Param } from "../../../../model/assembler/param";
import { Creation } from '../../../../model/assembler/creation'

export class VideoMaterial extends MaterialImpl {
	
	private creation:Creation;
	private texture:VideoTexture;
	
	constructor(meshObject: MeshObject) {
		super(meshObject);
	}

	public writeMaterial(params: Param[], engine: EngineService): void {
		this.material = new StandardMaterial("standard", engine.scene);
		var creationId:string = this.meshObject.getParamValue("asset");
		this.creation = engine.modelService.room.getCreation(creationId);
		this.texture = new VideoTexture("", this.creation.getUrl(), engine.scene);
		this.material.diffuseTexture = this.texture;
		this.material.roughness = 1;
		this.material.emissiveColor = Color3.White();
	}

	public play(): void {
		this.texture.video.play();
	}

	public pause(): void {
		this.texture.video.pause();
	}

	public stop(): void {
		this.texture.video.load();
	}
}