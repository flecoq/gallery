import { MaterialImpl } from './materialImpl';
import { PBRMetallicRoughnessMaterial } from '@babylonjs/core';
import { EngineService } from "../../../../engine/engine.service";
import { MeshObject } from '../meshObject';
import { Param } from "../../../../model/assembler/param";

export class PBRMetallicRoughnessMeshMaterial extends MaterialImpl {
	
	constructor(meshObject: MeshObject) {
		super(meshObject);
	}

	public writeMaterial(params: Param[], engine: EngineService): void {
		this.material = new PBRMetallicRoughnessMaterial("PBRMetallicRoughness", engine.scene);

		this.writeParamList(params, engine);

		this.material.baseTexture = this.getTexture("baseMap;basecolorMap");
		this.material.emissiveTexture = this.getTexture("emissiveMap");
		this.material.environmentTexture = this.getTexture("environmentMap");
		this.material.lightmapTexture = this.getTexture("lightMap");	
		this.material.metallicRoughnessTexture = this.getTexture("metallicRoughnessMap;roughnessMap");	
		this.material.normalTexture = this.getTexture("normalMap");	
		this.material.occlusionTexture = this.getTexture("occlusionMap");	
	}

	public writeParam(param: Param, engine: EngineService): void {
		this.writeParamMap(param, engine);

		var name: string = param.name;
		if ("material.baseColor" === name) {
			this.material.baseColor = param.getColor3ValueUsed();
		} else if ("material.emissiveColor" === name) {
			this.material.emissiveColor = param.getColor3ValueUsed();
		} else if ("material.bumpMap.inverse.normal" === name) {
			this.material.invertNormalMapX = param.getBoolValue();
			this.material.invertNormalMapY = param.getBoolValue();
		} else if ("material.metallic" === name) {
			this.material.metallic = param.getFloatValue();
		} else if ("material.roughness" === name) {
			this.material.roughness = param.getFloatValue();
		} else if ("material.sheen" === name) {
			this.material.sheen = param.getFloatValue();
		} else if ("material.alpha" === name) {
			this.material.alpha = param.getFloatValue();
		} else if ("material.clearCoat.isEnable" === name) {
			this.material.clearCoat.isEnable = param.getBoolValue();
		}
	}

}