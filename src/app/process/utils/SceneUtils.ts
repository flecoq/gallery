import { Scene } from '../../model/assembler/scene';
import { SceneImpl } from "../../process/scene/sceneImpl";
import { InstanceObject } from "../../process/scene/instanceObject";
import { WallObject } from "../../process/scene/mesh/wallObject";
import { FloorObject } from "../../process/scene/mesh/floorObject";
import { BoxObject } from "../../process/scene/mesh/boxObject";
import { PlaneObject } from "../../process/scene/mesh/planeObject";
import { MergeObject } from "../../process/scene/mesh/mergeObject";
import { MergeChildObject } from "../../process/scene/mesh/composite/mergeChildObject";
import { PictureObject } from "../../process/scene/mesh/pictureObject";
import { CompositeObject } from "../../process/scene/mesh/composite/compositeObject";
import { ChildObject } from "../../process/scene/mesh/composite/childObject";
import { BoxChildObject } from "../../process/scene/mesh/composite/boxChildObject";
import { CylinderChildObject } from "../../process/scene/mesh/composite/cylinderChildObject";
import { SphereChildObject } from "../../process/scene/mesh/composite/sphereChildObject";
import { ExtrudeChildObject } from "../../process/scene/mesh/composite/extrudeChildObject";
import { PlaneChildObject } from "../../process/scene/mesh/composite/planeChildObject";
import { AssetChildObject } from "../../process/scene/mesh/composite/assetChildObject";
import { BorderBoxChildObject } from "../../process/scene/mesh/composite/pattern/borderBoxChildObject";
import { BorderMergeChildObject } from "../../process/scene/mesh/composite/pattern/borderMergeChildObject";
import { FillBoxChildObject } from "../../process/scene/mesh/composite/pattern/fillBoxChildObject";
import { CameraObject } from "../../process/scene/cameraObject";
import { LayerImpl } from "../../process/scene/utils/layerImpl";
import { HemisphericLightObject } from "../../process/scene/light/hemisphericLightObject";
import { PointLightObject } from "../../process/scene/light/pointLightObject";
import { DefaultRenderer } from "../../process/scene/renderer/defaultRenderer";
import { Skybox } from "../../process/scene/environment/skybox";

import { EngineService } from "../../engine/engine.service";

export class SceneUtils {

	public static createSceneImpl(name: string, create: string, type: string, engine: EngineService): SceneImpl {
		var scene: Scene = new Scene();
		scene.name = name;
		scene.create = create;
		scene.type = type == null ? "object" : type;
		return SceneUtils.createSceneImplFromScene(scene, engine);
	}

	public static createSceneImplFromScene(scene: Scene, engine: EngineService): SceneImpl {
		var result : SceneImpl = null;
		if ("wall" === scene.create) {
			result = new WallObject(scene);
		} else if ("floor" === scene.create) {
			result = new FloorObject(scene);
		} else if ("box" === scene.create) {
			result = new BoxObject(scene);
		} else if ("plane" === scene.create) {
			result = new PlaneObject(scene);
		} else if ("merge" === scene.type) {
			result = new MergeObject(scene);
		} else if ("camera" === scene.type) {
			result = new CameraObject(scene);
		} else if ("hemisphericLight" === scene.create) {
			result = new HemisphericLightObject(scene);
		} else if ("pointLight" === scene.create) {
			result = new PointLightObject(scene);
		} else if ("picture" === scene.create) {
			result = new PictureObject(scene);
		} else if ("render" === scene.type) {
			result = new DefaultRenderer(scene);
		} else if ("skybox" === scene.create) {
			result = new Skybox(scene);
		} else if ("composite" === scene.create) {
			result = new CompositeObject(scene);
		} else if ("instance" === scene.create) {
			result = new InstanceObject(scene);
		} else if ("layer" === scene.type) {
			result = new LayerImpl(scene);
		} else {
			result = new SceneImpl(scene);
		}
		/*if (result.Scene && result.Scene.length > 0) {
			var children: SceneImpl[] = [];
			for (let child of result.Scene) {
				if (result instanceof InstanceObject) {
					// DO NOTHING
				} 
				if (child.isActive()) {
					var childObject: ChildObject = SceneUtils.getChildObject(child, engine);
					childObject.parent = result as CompositeObject;
					children.push(childObject);
				}
			}
			result.Scene = children;
		}*/
		if( scene instanceof SceneImpl ) {
			result.position = scene.position.clone();
			result.rotation = scene.rotation.clone();
			result.scaling = scene.scaling.clone();
		}
		return result;
	}

	public static getSceneImpl(scene: Scene, engine: EngineService): SceneImpl {
		var result = engine.viewManager.isSceneRoot ? engine.getSceneImpl(scene.name) : null;
		if (result == null) {
			result = SceneUtils.createSceneImplFromScene(scene, engine);
			if (result.isActive() && engine.viewManager.isSceneRoot) {
				engine.addSceneImpl(result);
			}
		} else {
			result.Param = scene.Param;
		}
		return result;
	}

	public static getChildObject(scene: Scene, engine: EngineService): ChildObject {
		var result: ChildObject = null;
		if ("box" === scene.create) {
			if (scene.getParamValue("pattern") === "border") {
				result = new BorderBoxChildObject(scene);
			} else if (scene.getParamValue("pattern") === "fill") {
				result = new FillBoxChildObject(scene);
			} else {
				result = new BoxChildObject(scene);
			}
		} else if ("merge" === scene.create) {
			if (scene.getParamValue("pattern") === "border") {
				result = new BorderMergeChildObject(scene);
			} else {
				result = new MergeChildObject(scene);
			}
		} else if ("extrude" === scene.create) {
			result = new ExtrudeChildObject(scene);
		} else if ("cylinder" === scene.create) {
			result = new CylinderChildObject(scene);
		} else if ("sphere" === scene.create) {
			result = new SphereChildObject(scene);
		} else if ("plane" === scene.create) {
			result = new PlaneChildObject(scene);
		} else if ("asset" === scene.create) {
			result = new AssetChildObject(scene);
		}
		return result;
	}

}
