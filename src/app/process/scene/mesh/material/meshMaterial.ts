import { AbstractMesh, StandardMaterial, Texture } from '@babylonjs/core';
import { MeshObject } from '../meshObject';
import { Creation } from "../../../../model/assembler/creation";
import { Param } from "../../../../model/assembler/param";
import { Scene } from "../../../../model/assembler/scene";
import { EngineService } from "../../../../engine/engine.service";
import { Point } from '../../../../process/utils/point';
import { Logger } from '../../../../process/utils/logger';

export class MeshMaterial {

	public meshObject: MeshObject;
	public standard: StandardMaterial;

	public diffuseTexture: Texture;
	public ambientTexture: Texture;
	public bumpTexture: Texture;
	public specularTexture: Texture;

	public opacityTexture: Texture;
	public emissiveTexture: Texture;
	public reflectionTexture: Texture;
	public refractionTexture: Texture;

	constructor(meshObject: MeshObject) {
		this.meshObject = meshObject;
	}

	public write(engine: EngineService): void {
		Logger.info("MeshMaterial", "write(name: " + this.meshObject.name + ", create: " + this.meshObject.create + ")");
		Logger.debug("MeshMaterial", this.meshObject.Param);
		this.writeMaterial(this.meshObject.Param, engine);
		this.assign(this.meshObject.mesh, this.standard, this.meshObject.assignChildren);
	}

	public writeMaterial(params: Param[], engine: EngineService): void {
		this.clearTexture();
		this.standard = new StandardMaterial(this.meshObject.name, engine.scene);

		this.writeParamList(params, engine);

		this.standard.diffuseTexture = this.diffuseTexture;
		this.standard.specularTexture = this.specularTexture;
		this.standard.ambientTexture = this.ambientTexture;
		this.standard.bumpTexture = this.bumpTexture;
		this.standard.opacityTexture = this.opacityTexture;
		this.standard.emissiveTexture = this.emissiveTexture;
		this.standard.reflectionTexture = this.reflectionTexture;
		this.standard.refractionTexture = this.refractionTexture;	
	}

	public writeParamList(params: Param[], engine: EngineService): void {
		for (let param of params) {
			if (param.name === "reference") {
				this.writeReferenceParam(param, engine);
			} else {
				this.writeParam(param, engine);
			}
		}
	}


	public writeReferenceParam(param: Param, engine: EngineService): void {
		var scene: Scene = engine.modelService.getReference(param.value);
		this.writeParamList(scene.Param, engine);
	}

	public writeParam(param: Param, engine: EngineService): void {

		this.diffuseTexture = this.writeParamMap(param, engine, "diffuse", this.diffuseTexture);
		this.specularTexture = this.writeParamMap(param, engine, "specular", this.specularTexture);
		this.ambientTexture = this.writeParamMap(param, engine, "ambient", this.ambientTexture);
		this.bumpTexture = this.writeParamMap(param, engine, "bump", this.bumpTexture);
		this.opacityTexture = this.writeParamMap(param, engine, "opacity", this.opacityTexture);
		this.emissiveTexture = this.writeParamMap(param, engine, "emissive", this.emissiveTexture);
		this.reflectionTexture = this.writeParamMap(param, engine, "reflection", this.reflectionTexture);
		this.refractionTexture = this.writeParamMap(param, engine, "refraction", this.refractionTexture);

		var name: string = param.name;
		if ("material.diffuseColor" === name) {
			this.standard.diffuseColor = param.getColor3ValueUsed();
		} else if ("material.specularColor" === name) {
			this.standard.specularColor = param.getColor3ValueUsed();
		} else if ("material.ambientColor" === name) {
			this.standard.ambientColor = param.getColor3ValueUsed();
		} else if ("material.emissiveColor" === name) {
			this.standard.emissiveColor = param.getColor3ValueUsed();
		} else if ("material.bumpMap.inverse.normal" === name) {
			this.standard.invertNormalMapX = param.getBoolValue();
			this.standard.invertNormalMapY = param.getBoolValue();
		} else if ("material.alpha" === name) {
			this.standard.alpha = param.getFloatValue();
		} else if ("material.roughness" === name) {
			this.standard.roughness = param.getFloatValue();
		}
	}

	private writeParamMap(param: Param, engine: EngineService, type: string, source: Texture): Texture {
		var name: string = param.name;
		if ("material." + type + "Map.creation" === name) {
			var creation: Creation = engine.modelService.getCreation(param.value);
			return new Texture(creation.getUrl(), engine.scene);
		} else if ("material." + type + "Map.url" === name) {
			return new Texture(param.value, engine.scene);
		} else if ("material." + type + "Map.level" === name) {
			source.level = param.getFloatValue();
		} else if ("material." + type + "Map.tile" === name) {
			var tile: Point = param.getPointValue();
			source.uScale = tile.x;
			source.vScale = tile.y;
		} else if ("material." + type + "Map.offset" === name) {
			var offset: Point = param.getPointValue();
			source.uOffset = offset.x;
			source.vOffset = offset.y;
		}
		return source;
	}

	private assign(mesh: AbstractMesh, material: any, children: boolean): void {
		mesh.material = material;
		if (children) {
			for (let child of mesh.getChildMeshes()) {
				this.assign(child, material, children);
			}
		}
	}

	public clear(): void {
		var paramList: Param[] = [];
		for (let param of this.meshObject.Param) {
			if (param.name.indexOf("material") < 0) {
				paramList.push(param);
				paramList
			}
		}
		this.meshObject.setParam(paramList);
		this.clearTexture();
	}
	
	private clearTexture(): void {
		this.diffuseTexture = null;
		this.specularTexture = null;
		this.ambientTexture = null;
		this.bumpTexture = null;
		this.opacityTexture = null;
		this.emissiveTexture = null;
		this.reflectionTexture = null;
		this.refractionTexture = null;		
	}

	public assignModel(scene: Scene, engine: EngineService): void {
		this.clear();
		for (let param of scene.Param) {
			this.meshObject.Param.push(param);
		}
		this.write(engine);
	}
}