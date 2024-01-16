import { Scene } from "../../../../model/assembler/scene";
import { Param } from "../../../../model/assembler/param";
import { MeshObject } from "../../../../process/scene/mesh/meshObject";
import { EngineService } from "../../../../engine/engine.service";
import { Mesh, Vector3 } from '@babylonjs/core';
import { ActionAllow } from "../../../utils/actionAllow";
import { ChildObject } from "./childObject";
import { BoxChildObject } from "./boxChildObject";
import { MergeChildObject } from "./mergeChildObject";
import { CylinderChildObject } from "./cylinderChildObject";
import { SphereChildObject } from "./sphereChildObject";
import { ExtrudeChildObject } from "./extrudeChildObject";
import { PlaneChildObject } from "./planeChildObject";
import { AssetChildObject } from "./assetChildObject";
import { BorderBoxChildObject } from "./pattern/borderBoxChildObject";
import { BorderMergeChildObject } from "./pattern/borderMergeChildObject";
import { FillBoxChildObject } from "./pattern/fillBoxChildObject";
import { Pivot } from "../../../../process/utils/pivot";
import { Point } from "../../../utils/point";
import { CompositeMaterial } from '../material/compositeMaterial';
import { PlaceholderGroup } from "../../../../process/scene/placeholder/placeholderGroup";
import { DynamicTexturePlane } from "../../../../process/scene/info/dynamicTexturePlane";
import { Logger } from '../../../../process/utils/logger';
import { FormatUtils } from '../../../../process/utils/formatUtils';
import { CameraUtils } from '../../../../process/utils/cameraUtils';
import { Action } from '../../../../model/assembler/action';
import { Room } from '../../../../model/room';
import { ActionUtils } from '../../../../process/action/actionUtils';
import { VideoMaterial } from '../material/videoMaterial';
import { Expression } from '../../../../process/expression/expression';

export class CompositeObject extends MeshObject {

	public local: Pivot;
	public global: Pivot;
	public highlightTexture: DynamicTexturePlane;
	public scales: number[];	// roof scales

	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(this.getParamValueBool("gizmo"), true);
		this.scales = this.getParamValueFloatList("roof.scale");
		if (this.getParam("local.pos") == null && this.getAssetChildObject() == null) {
			this.addParam("local.pos", "vector(0, $scaleY/2, $scaleZ/2)", "true");
		}
	}

	public writeCreate(engine: EngineService): void {
		this.mesh = new Mesh(this.name, engine.scene);
		super.writeCreate(engine);
		if (this.getParam("material.id")) {
			this.material = new CompositeMaterial(this);
		}
		if (this.actionAlow.isEdit()) {
			var scale: Vector3 = this.getLocalScaleValue();
			this.highlightTexture = new DynamicTexturePlane(new Point(scale.z, scale.y), 1000, this, engine);
			var pivot: Pivot = this.localToGlobalPivot(0.1, 0.5, 0.5);
			this.highlightTexture.setPivot(pivot);
			this.highlightTexture.drawBorder(15, "#ffff00");
			engine.viewManager.addMesh(this.highlightTexture.plane);
		}
	}

	public write(engine: EngineService): void {
		Logger.info("CompositeObject", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("CompositeObject", JSON.stringify(this.Param));
		this.writeAllTransformParam(engine);
		if (!this.created) {
			this.writeCreate(engine);
		}
		this.updateWidthToHeight(engine);
		this.writeAllParam(engine);
		this.updateRootMesh();
		var expressionParamList: Param[] = this.getExpressionParamList();
		for (let child of this.Scene) {
			var childObject: ChildObject = child instanceof ChildObject ? child as ChildObject : this.getChildObject(child);
			childObject.parent = this;
			childObject.expressionParamList = expressionParamList;
			childObject.write(engine);
		}
		this.writeChildReference(engine);
	}

	public writeChildReference(engine: EngineService): void {
		var reference: string = this.getParamValue("reference");
		if (reference) {
			var scene: Scene = engine.modelService.getReference(reference);
			if (scene.Scene) {
				var expressionParamList: Param[] = this.getExpressionParamList();
				for (let child of scene.Scene) {
					var childObject: ChildObject = this.getChildObject(child);
					childObject.parent = this;
					childObject.expressionParamList = expressionParamList;
					childObject.write(engine);
				}
			}
		}
	}

	public writeAllTransformParam(engine: EngineService): void {
		this.pivot = Pivot.createFromParams(this.Param);
		if (this.scales) {
			var scaleY: number = (new Vector3(this.scales[0], this.scales[2], 0)).length();
			this.addParam("local.scale", this.scales[1] + ";" + scaleY + ";" + this.scales[3], "true");
			this.pivot = this.pivot.localToGlobalPivot(Pivot.createFromTarget(new Vector3(), new Vector3(this.scales[2], -this.scales[0], 0)));
		}
		this.local = Pivot.createFromResultParams('local', this.Param, this.getExpressionParamList());
		this.global = this.pivot.localToGlobalPivot(this.local);
		this.position = this.pivot.o;
		this.rotation = this.pivot.getEulerAnglesRad();
		this.scaling = this.getLocalScaleValue();
	}

	private updateRootMesh(): void {
		this.mesh.position = this.position;
		this.mesh.rotation = this.rotation;
		this.mesh.scaling = this.scaling;
	}

	public writeTransformParam(param: Param): void {
		// not used, instead: writeAllTransformParam
	}

	public readTransformParam(engine: EngineService): void {
		this.writeTransformOnly(engine);
		this.updateRootMesh();
	}

	public writeTransformOnly(engine: EngineService): void {
		this.addOrUpdateParam("pos", FormatUtils.vectorToString(this.mesh.position));
		this.addOrUpdateParam("rot", FormatUtils.vectorToString(FormatUtils.radToDegVector(this.mesh.rotationQuaternion ? this.mesh.rotationQuaternion.toEulerAngles() : this.mesh.rotation)));
		this.addOrUpdateParam("local.scale", FormatUtils.vectorToString(this.mesh.scaling));
		this.writeAllTransformParam(engine);
		this.writeAllParam(engine);
		var expressionParamList: Param[] = this.getExpressionParamList();
		for (let child of this.Scene) {
			(child as ChildObject).expressionParamList = expressionParamList;
			(child as ChildObject).writeTransformOnly(engine);
		}
	}

	public getLocalScaleValue(): Vector3 {
		return Expression.getResult(this.getParamValue("local.scale"), this.expressionParamList).vector;
	}

	public getExpressionParamList(): Param[] {
		if (this.expressionParamList.length == 0) {
			for (let param of this.Param) {
				if ("local.scale" === param.name) {
					var scale: Vector3 = this.getLocalScaleValue();
					this.expressionParamList.push(new Param("scaleX", scale.x.toString(), "true"));
					this.expressionParamList.push(new Param("scaleY", scale.y.toString(), "true"));
					this.expressionParamList.push(new Param("scaleZ", scale.z.toString(), "true"));
				} else if ("local.pos" != param.name) {
					this.expressionParamList.push(param);
				}
			}
		} else {
			this.updateExpressionParamList();
		}
		return this.expressionParamList;
	}

	public updateExpressionParamList(): void {
		var scale: Vector3 = this.getLocalScaleValue();
		for (let param of this.expressionParamList) {
			if ("scaleX" === param.name) {
				param.value = scale.x.toString();
			} else if ("scaleY" === param.name) {
				param.value = scale.y.toString();
			} else if ("scaleZ" === param.name) {
				param.value = scale.z.toString();
			}
		}
	}

	public highlight(value: boolean): void {
		if (this.actionAlow.isEdit()) {
			this.highlightTexture.visible(value);
			if (this.placeholderGroup && !value) {
				this.placeholderGroup.visible(false);
			}
		}
	}

	public inCollisionBoundingBox(point: Vector3, distance: number): boolean {
		var local: Vector3 = this.global.globalToLocal(point);
		var scale: Vector3 = this.getLocalScaleValue();
		return local.x > -distance - scale.x && local.x < distance
			&& local.y > -distance - scale.y / 2 && local.y < scale.y / 2 + distance
			&& local.z > -distance - scale.z / 2 && local.z < scale.z / 2 + distance
	}

	public localToGlobalPivot(u: number, v: number, w: number): Pivot {
		var scale: Vector3 = this.getLocalScaleValue();
		var pivot: Pivot = Pivot.createFromOrigin(new Vector3(u * scale.x, (v - 0.5) * scale.y, (w - 0.5) * scale.z));
		return this.global.localToGlobalPivot(pivot);
	}

	public writePlaceholder(engine: EngineService): void {
		if (this.placeholderGroup == null) {
			this.placeholderGroup = new PlaceholderGroup();
		}
		this.placeholderGroup.createFromCompositeObject(this, engine);
	}

	public getAssetChildObject(): AssetChildObject {
		let child: Scene = this.getAssetScene();
		if (child) {
			var result: AssetChildObject = this.getChildObject(child) as AssetChildObject;
			result.parent = this;
			result.expressionParamList = this.getExpressionParamList();
			return result;
		}
		return null;
	}

	public getAssetScene(): Scene {
		for (let child of this.Scene) {
			if (child.create === "asset") {
				return child;
			}
		}
		return null;
	}

	public getAssetId(): string {
		var scene: Scene = this.getAssetChildObject();
		return scene == null ? null : scene.getParamValue("asset");
	}

	public getAssetVideoMaterial(): VideoMaterial {
		var scene: Scene = this.getAssetChildObject();
		return scene == null ? null : (scene as AssetChildObject).getVideoMaterial();
	}

	public checkAction(room: Room): Action {
		var result: Action = null;
		if (!this.isActionChecked && this.getAssetChildObject()) {
			var action: Action = room.getActionByCriteria("asset", "parent");
			if (action) {
				var result: Action = ActionUtils.getActionImpl(action.clone());
				this.addAction(result);
			}
			this.isActionChecked = true;
		}
		return result;
	}

	public widthToHeight(width: number, engine: EngineService): void {
		var scale: Vector3 = this.getLocalScaleValue();
		if (scale) {
			scale.z = width;
		}
		this.addOrUpdateParam("local.scale", FormatUtils.vectorToString(scale));
	}

	public updateWidthToHeight(engine: EngineService): void {
		var assetChild: AssetChildObject = this.getAssetChildObject() as AssetChildObject;
		if (assetChild) {
			assetChild = assetChild instanceof AssetChildObject ? assetChild : this.getChildObject(assetChild) as AssetChildObject;
			assetChild.parent = this;
			assetChild.expressionParamList = this.getExpressionParamList();
			assetChild.parentWidthToHeight(engine);
		}
	}

	public focusCamera(fov: number): CameraUtils {
		var result: CameraUtils = new CameraUtils();
		result.fov = fov;
		var fovToAtan: number = 1 / Math.tan(fov / 2);
		var scale: Vector3 = this.getLocalScaleValue();
		result.position = this.global.localToGlobal(new Vector3(1.5 * (scale.x / 2 + scale.y * fovToAtan / 2), 0, 0));
		result.target = this.global.o;
		result.targetToRotation();
		return result;
	}

	public getChildObject(scene: Scene): ChildObject {
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