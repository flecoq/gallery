import { SceneImpl } from "../sceneImpl";
import { Scene } from "../../../model/assembler/scene";
import { Creation } from "../../../model/assembler/creation";
import { Param } from "../../../model/assembler/param";
import { EngineService } from "../../../engine/engine.service";
import { Mesh, CubeTexture } from "@babylonjs/core";

export class Skybox extends SceneImpl {

	public constructor(scene: Scene) {
		super(scene);
		scene.copy(this);
	}

	public writeParam(param: Param, engine: EngineService): void {
		if ("texture.creation" === param.name) {
			var creation: Creation = engine.modelService.getCreation(param.value);
			var hdrTexture: CubeTexture = CubeTexture.CreateFromPrefilteredData(creation.getUrl(), engine.scene);
			engine.scene.createDefaultSkybox(hdrTexture, true, 10000);
		} else if ( "texture.url" === param.name) {
			var hdrTexture: CubeTexture = CubeTexture.CreateFromPrefilteredData(param.value , engine.scene);
			engine.scene.createDefaultSkybox(hdrTexture, true, 10000);
		}	
	}
	
	public static createSkybox(url: string, engine: EngineService): Skybox {
		var result: Skybox = new Skybox(Scene.create("", "", ""));
		result.addParam("texture.url", url, "true");
		return result;
	}

}