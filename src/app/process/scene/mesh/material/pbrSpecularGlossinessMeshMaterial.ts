import { MaterialImpl } from './materialImpl';
import { PBRSpecularGlossinessMaterial } from '@babylonjs/core';
import { EngineService } from "../../../../engine/engine.service";
import { MeshObject } from '../meshObject';
import { Param } from "../../../../model/assembler/param";

export class PBRSpecularGlossinessMeshMaterial extends MaterialImpl {
	
	constructor(meshObject: MeshObject) {
		super(meshObject);
	}

	public writeMaterial(params: Param[], engine: EngineService): void {
		this.material = new PBRSpecularGlossinessMaterial("PBRSpecularGlossiness", engine.scene);

		this.writeParamList(params, engine);

		this.material.baseTexture = this.getTexture("baseMap");
		this.material.emissiveTexture = this.getTexture("emissiveMap");
		this.material.environmentTexture = this.getTexture("environmentMap");
		this.material.lightmapTexture = this.getTexture("lightMap");	
		this.material.specularGlossinessTexture = this.getTexture("specularGlossinesssMap");	
		this.material.normalTexture = this.getTexture("normalMap");	
		this.material.occlusionTexture = this.getTexture("occlusionMap");	
	}

	public writeParam(param: Param, engine: EngineService): void {
		this.writeParamMap(param, engine);

		var name: string = param.name;
		if ("material.diffuseColor" === name) {
			this.material.diffuseColor = param.getColor3ValueUsed();
		} else if ("material.emissiveColor" === name) {
			this.material.emissiveColor = param.getColor3ValueUsed();
		} else if ("material.specularColor" === name) {
			this.material.specularColor = param.getColor3ValueUsed();
		} else if ("material.bumpMap.inverse.normal" === name) {
			this.material.invertNormalMapX = param.getBoolValue();
			this.material.invertNormalMapY = param.getBoolValue();
		} else if ("material.glossiness" === name) {
			this.material.glossiness = param.getFloatValue();
		} else if ("material.roughness" === name) {
			this.material.roughness = param.getFloatValue();
		} else if ("material.alpha" === name) {
			this.material.alpha = param.getFloatValue();
		} else if ("material.clearCoat.isEnable" === name) {
			this.material.clearCoat.isEnable = param.getBoolValue();
		}
	}

}