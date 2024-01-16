import { Scene } from "../../../../model/assembler/scene";
import { Vector3 } from '@babylonjs/core';
import { Creation } from "../../../../model/assembler/creation";
import { EngineService } from "../../../../engine/engine.service";
import { ActionAllow } from "../../../utils/actionAllow";
import { PlaneChildObject } from "./planeChildObject";
import { Logger } from "../../../utils/logger";
import { FormatUtils } from "../../../../process/utils/formatUtils";
import { VideoMaterial } from '../material/videoMaterial';

export class AssetChildObject extends PlaneChildObject {

	public creation: Creation = null;

	public isVideo:boolean;
	public videoUrl:string;
	
	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(false, false);
	}

	public write(engine: EngineService): void {
		Logger.info("AssetChildObject", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("AssetChildObject", this.Param);
		this.writeTransformAllParam(engine);
		if (!this.created) {
			this.writeCreate(engine);
		}
		var creation:Creation = this.getCreation(engine);
		var type:string = creation.getInfoValue("type");
		if( type === "video") {
			this.isVideo = true;
			this.videoUrl = creation.getUrl();
			this.addOrUpdateParam("material.diffuseMap.url", this.videoUrl.replace("mp4", "jpg"));
			//this.addOrUpdateParam("material.type", "video");
		} else {
			this.addOrUpdateParam("material.diffuseMap.creation", this.getCreation(engine).id);
		}
		this.mesh.position = this.position;
		this.mesh.rotation = this.rotation;
		this.mesh.scaling = this.scaling;
		this.writeMaterial(engine);
	}

	public checkVideo(engine: EngineService): boolean {
		var creation:Creation = this.getCreation(engine);
		var type:string = creation.getInfoValue("type");
		if( type === "video") {
			this.isVideo = true;
			this.videoUrl = creation.getUrl();
			return true;
		}
		return false;
	}
	
	public getCreation(engine: EngineService): Creation {
		if (this.creation == null) {
			var creationId = this.getParamValue("asset");
			this.creation = engine.modelService.getCreation(creationId);
		}
		return this.creation;
	}

	public getVideoMaterial(): VideoMaterial {
		return this.material instanceof VideoMaterial ? this.material : null; 
	}
	
	public getMargin(): number {
		return this.getParamValueFloat("margin");
	}

	public parentWidthToHeight(engine: EngineService): void {
		this.parent.scaling = this.parent.getParamValueVector("local.scale");
		var width: number = this.parent.scaling.z;
		var assetWidth: number = width - 2 * this.getMargin();
		var assetHeight: number = this.getCreation(engine).widthToHeight(assetWidth);
		this.addOrUpdateParam("scale", FormatUtils.vectorToString(new Vector3(assetWidth, assetHeight, 1)));
		var height: number = assetHeight + 2 * this.getMargin();
		this.parent.scaling.y = height;
		this.parent.addOrUpdateParam("local.scale", FormatUtils.vectorToString(this.parent.scaling));
	}

}