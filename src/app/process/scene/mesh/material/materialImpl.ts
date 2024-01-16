import { AbstractMesh, Texture } from '@babylonjs/core';
import { MeshObject } from '../meshObject';
import { Creation } from "../../../../model/assembler/creation";
import { CreationIndex } from "../../../../process/scene/mesh/material/mapping/creationIndex";
import { Param } from "../../../../model/assembler/param";
import { Scene } from "../../../../model/assembler/scene";
import { EngineService } from "../../../../engine/engine.service";
import { Point } from '../../../../process/utils/point';
import { Logger } from '../../../../process/utils/logger';

export class MaterialImpl {

	public meshObject: MeshObject;
	public textureList: Texture[] = [];
	public quality: string = null;
	public material: any;

	constructor(meshObject: MeshObject) {
		this.meshObject = meshObject;
	}
	
	public write(engine: EngineService): void {
		Logger.info("MaterialImpl", "write(name: " + this.meshObject.name + ", create: " + this.meshObject.create + ")");
		Logger.debug("MaterialImpl", this.meshObject.Param);
		this.writeMaterial(this.meshObject.Param, engine);
		this.assign(this.meshObject.mesh, this.material, this.meshObject.assignChildren);
	}

	public writeMaterial(params: Param[], engine: EngineService): void {
	}

	public writeParamList(params: Param[], engine: EngineService): void {
		for (let param of params) {
			if( param.isActive()) {
				if (param.name === "reference") {
					this.writeReferenceParam(param, engine);
				} else {
					this.writeParam(param, engine);
				}
			}
		}
	}

	public writeReferenceParam(param: Param, engine: EngineService): void {
		var scene: Scene = engine.modelService.getReference(param.value);
		this.writeParamList(scene.Param, engine);
	}

	public writeParam(param: Param, engine: EngineService): void {
	}

	public writeParamMap(param: Param, engine: EngineService): void {
		var name: string = param.name;
		var type: string = this.getTextureNameFromParam(param);
		var source: Texture = this.getTextureFromParam(param);
		if (":" === name) {
			var creation: Creation = engine.modelService.getCreation(param.value);
			this.writeCreationMap(creation, engine);
		} else if ("material." + type + ".creation" === name) {
			var creation: Creation = engine.modelService.getCreation(param.value);
			this.addTexture(new Texture(creation.getUrl(), engine.scene), type);
		} else if ("material." + type + ".url" === name) {
			this.addTexture(new Texture(param.value, engine.scene), type);
		} else if ("material." + type + ".level" === name) {
			source.level = param.getFloatValue();
		} else if ("material." + type + ".tile" === name) {
			var tile: Point = param.getPointValue();
			source.uScale = tile.x;
			source.vScale = tile.y;
		} else if ("material." + type + ".offset" === name) {
			var offset: Point = param.getPointValue();
			source.uOffset = offset.x;
			source.vOffset = offset.y;
		}
	}

	public writeCreationMap(creation: Creation, engine: EngineService): void {
		var size:string = creation.getSizebyQuality(this.getQuality());
		var variant: number = this.meshObject.getParamValueInt("material.variant");
		for(let layer of creation.getLayerList()) {
			var creationIndex: CreationIndex = new CreationIndex(variant, layer, size);
			this.addTexture(new Texture(creation.getUrlByIndex(creationIndex), engine.scene), layer + "Map");
		}
	}
	
	public getQuality(): string {
		var result: string = this.meshObject.getParamValue("material.quality");
		return result ? result : this.quality;
	}
	
	public assign(mesh: AbstractMesh, material: any, children: boolean): void {
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
	
	public clearTexture(): void {
		this.textureList = [];
	}

	public getTexture(names: string): Texture {
		for(let texture of this.textureList) {
			for(let name of names.split(";")) {
				if( texture.metadata === name) {
					return texture;
				}
			}
		}
		return null;
	}
	
	public getTextureNameFromParam(param: Param): string {
		var values: string[] = param.name.split(".");
		if( values.length > 1 ) {
			return values[1];
		} else {
			return null;
		}
	}

	public getTextureFromParam(param: Param): Texture {
		var name: string = this.getTextureNameFromParam(param);
		return name ? this.getTexture(name) : null;
	}
	
	public addTexture(texture:Texture, name: string): void {
		texture.metadata = name;
		this.textureList.push(texture);
	}

	public assignModel(scene: Scene, engine: EngineService): void {
		this.clear();
		for (let param of scene.Param) {
			this.meshObject.Param.push(param);
		}
		this.write(engine);
	}
}