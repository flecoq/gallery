import { MaterialImpl } from './materialImpl';
import { StandardMaterial } from '@babylonjs/core';
import { EngineService } from "../../../../engine/engine.service";
import { MeshObject } from '../meshObject';
import { Param } from "../../../../model/assembler/param";

export class StandardMeshMaterial extends MaterialImpl {
	
	constructor(meshObject: MeshObject) {
		super(meshObject);
	}

	public writeMaterial(params: Param[], engine: EngineService): void {
		this.material = new StandardMaterial("standard", engine.scene);
		this.writeParamList(params, engine);

		this.material.diffuseTexture = this.getTexture("diffuseMap");
		this.material.specularTexture = this.getTexture("specularMap");
		this.material.ambientTexture = this.getTexture("ambientMap");
		this.material.bumpTexture = this.getTexture("bumpMap");
		this.material.opacityTexture = this.getTexture("opacityMap");
		this.material.emissiveTexture = this.getTexture("emissiveMap");
		this.material.reflectionTexture = this.getTexture("reflectionMap");
		this.material.refractionTexture = this.getTexture("refractionMap");	
	}

	public writeParam(param: Param, engine: EngineService): void {
		this.writeParamMap(param, engine);

		var name: string = param.name;
		if ("material.diffuseColor" === name) {
			this.material.diffuseColor = param.getColor3ValueUsed();
		} else if ("material.specularColor" === name) {
			this.material.specularColor = param.getColor3ValueUsed();
		} else if ("material.ambientColor" === name) {
			this.material.ambientColor = param.getColor3ValueUsed();
		} else if ("material.emissiveColor" === name) {
			this.material.emissiveColor = param.getColor3ValueUsed();
		} else if ("material.bumpMap.inverse.normal" === name) {
			this.material.invertNormalMapX = param.getBoolValue();
			this.material.invertNormalMapY = param.getBoolValue();
		} else if ("material.roughness" === name) {
			this.material.roughness = param.getFloatValue();
		} else if ("material.alpha" === name) {
			this.material.alpha = param.getFloatValue();
		}
	}

}