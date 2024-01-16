import { MaterialImpl } from './materialImpl';
import { PBRMaterial } from '@babylonjs/core';
import { EngineService } from "../../../../engine/engine.service";
import { MeshObject } from '../meshObject';
import { Param } from "../../../../model/assembler/param";

export class PBRMeshMaterial extends MaterialImpl {
	
	constructor(meshObject: MeshObject) {
		super(meshObject);
	}

	public writeMaterial(params: Param[], engine: EngineService): void {
		this.material = new PBRMaterial("PBR", engine.scene);

		this.writeParamList(params, engine);

		this.material.albedoTexture = this.getTexture("albedoMap");
		this.material.ambientTexture = this.getTexture("ambientMap");
		this.material.bumpTexture = this.getTexture("bumpMap");
		this.material.emissiveTexture = this.getTexture("emissiveMap");
		this.material.environmentBRDFTexture = this.getTexture("environmentMap");
		this.material.metallicReflectanceTexture = this.getTexture("metallicReflectanceMap");	
		this.material.metallicTexture = this.getTexture("metallicMap");	
		this.material.microSurfaceTexture = this.getTexture("microSurfaceMap");	
		this.material.opacityTexture = this.getTexture("opacityMap");	
		this.material.reflectionTexture = this.getTexture("reflectionMap");	
		this.material.reflectivityTexture = this.getTexture("reflectivityMap");	
	}

	public writeParam(param: Param, engine: EngineService): void {
		this.writeParamMap(param, engine);

		var name: string = param.name;
		if ("material.albedoColor" === name) {
			this.material.albedoColor = param.getColor3ValueUsed();
		} else if ("material.ambientColor" === name) {
			this.material.ambientColor = param.getColor3ValueUsed();
		} else if ("material.emissiveColor" === name) {
			this.material.emissiveColor = param.getColor3ValueUsed();
		} else if ("material.reflectionColor" === name) {
			this.material.reflectionColor = param.getColor3ValueUsed();
		} else if ("material.reflectivityColor" === name) {
			this.material.reflectivityColor = param.getColor3ValueUsed();
		} else if ("material.subSurface.tintColor" === name) {
			this.material.subSurface.tintColor = param.getColor3ValueUsed();
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
		} else if ("material.indexOfRefraction" === name) {
			this.material.indexOfRefraction = param.getFloatValue();
		} else if ("material.subSurface.indexOfRefraction" === name) {
			this.material.subSurface.indexOfRefraction = param.getFloatValue();
		} else if ("material.environmentIntensity" === name) {
			this.material.environmentIntensity = param.getFloatValue();
		} else if ("material.directIntensity" === name) {
			this.material.directIntensity = param.getFloatValue();
		} else if ("material.cameraExposure" === name) {
			this.material.cameraExposure = param.getFloatValue();
		} else if ("material.cameraContrast" === name) {
			this.material.cameraContrast = param.getFloatValue();
		} else if ("material.microSurface" === name) {
			this.material.microSurface = param.getFloatValue();
		} else if ("material.subSurface.isRefractionEnabled" === name) {
			this.material.subSurface.isRefractionEnabled = param.getBoolValue();
		} else if ("material.subSurface.isTranslucencyEnabled" === name) {
			this.material.subSurface.isTranslucencyEnabled = param.getBoolValue();
		}
	}

}