import { StandardMaterial } from '@babylonjs/core';
import { MeshObject } from '../meshObject';
import { Scene } from "../../../../model/assembler/scene";
import { Param } from "../../../../model/assembler/param";
import { EngineService } from "../../../../engine/engine.service";
import { Logger } from '../../../../process/utils/logger';
import { MaterialImpl } from './materialImpl';


export class CompositeMaterial extends MaterialImpl {

	public meshObject: MeshObject;
	public list: any[] = [];

	constructor(meshObject: MeshObject) {
		super(meshObject);
	}

	public write(engine: EngineService): void {
		Logger.info("CompositeMaterial", "write(name: " + this.meshObject.name + ", create: " + this.meshObject.create + ")");
		Logger.debug("CompositeMaterial", this.meshObject.Param);
		var paramList: Param[] = [];
		var begin: boolean = false;
		for (let param of this.meshObject.Param) {
			if (begin) {
				if (param.name === "material.id") {
					var scene: Scene = Scene.create("", "", "");
					scene.Param = paramList;
					var materialImpl: MaterialImpl = MeshObject.getMaterialImpl(scene, engine);
					materialImpl.writeMaterial(paramList, engine);
					materialImpl.material.metadata = paramList[0].value;
					this.list.push(materialImpl.material);
					paramList = [];
				}
				paramList.push(param);
			} else if (param.name === "material.id") {
				begin = true;
				paramList.push(param);
			}
		}
		if (paramList.length > 0) {
			var scene: Scene = Scene.create("", "", "");
			scene.Param = paramList;
			var materialImpl: MaterialImpl = MeshObject.getMaterialImpl(scene, engine);
			materialImpl.writeMaterial(paramList, engine);
			materialImpl.material.metadata = paramList[0].value;
			this.list.push(materialImpl.material);
		}
	}

	public getMaterialById(id: string): StandardMaterial {
		for (let material of this.list) {
			if (id === material.metadata) {
				return material;
			}
		}
		return null;
	}

	public getMaterialByRange(u: number): StandardMaterial {
		return this.list[u - 1];
	}

}