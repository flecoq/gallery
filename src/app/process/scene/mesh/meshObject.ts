import { Scene } from "../../../model/assembler/scene";
import { SceneImpl } from "../../../process/scene/sceneImpl";
import { LightImpl } from "../../../process/scene/light/lightImpl";
import { Param } from "../../../model/assembler/param";
import { Mesh, Vector3, BoundingBox, ActionManager, ExecuteCodeAction } from '@babylonjs/core';
import { EngineService } from "../../../engine/engine.service";
import { TransformGizmo } from "../../../process/utils/transformGizmo";
import { FormatUtils } from '../../../process/utils/formatUtils';
import { CameraUtils } from '../../../process/utils/cameraUtils';
import { StandardMeshMaterial } from './material/standardMeshMaterial';
import { VideoMaterial } from './material/videoMaterial';
import { PlaceholderGroup } from "../../../process/scene/placeholder/placeholderGroup";
import { Placeholder } from "../../../process/scene/placeholder/placeholder";
import { MaterialImpl } from "./material/materialImpl";
import { Mapper } from "./material/mapping/mapper";
import { PBRMetallicRoughnessMeshMaterial } from "./material/pbrMetallicRoughnessMeshMaterial";
import { PBRSpecularGlossinessMeshMaterial } from "./material/pbrSpecularGlossinessMeshMaterial";
import { PBRMeshMaterial } from "./material/pbrMeshMaterial";
import { Logger } from '../../../process/utils/logger';
import { Pivot } from '../../../process/utils/pivot';

export class MeshObject extends SceneImpl {

	public mesh: Mesh;
	public material: MaterialImpl;
	public mapper: Mapper;
	public transformGizmo: TransformGizmo;
	public boundingBox: BoundingBox;
	public placeholderGroup: PlaceholderGroup;

	public assignChildren: boolean = false;

	public constructor(scene: Scene) {
		super(scene);
		scene.copy(this);
		this.mapper = new Mapper(this);
	}
	
	public writeCreate(engine: EngineService): void {
		super.writeCreate(engine);
		this.material = MeshObject.getMaterialImpl(this, engine);
		this.transformGizmo = engine.transformGizmo;
		this.mesh.metadata = this;
		engine.viewManager.addMeshObject(this);
		if( this.actionAlow.isEdit()) {
			engine.monitor.addMesh(this.mesh);
		}
		if (this.actionAlow.pickable()) {
			this.mesh.actionManager = new ActionManager(engine.scene);
			this.mesh.actionManager.registerAction(
				new ExecuteCodeAction(
					ActionManager.OnPickTrigger,
					function(event) {
						var meshObject: MeshObject = event.meshUnderPointer.metadata;
						engine.pickSceneImpl(meshObject);
						if (meshObject.actionAlow.isGizmo()) {
							Logger.info("MeshObject", "Gizmo on: " + meshObject.name);
							meshObject.transformGizmo.attachToMeshObject(meshObject);
						}
					}
				)
			);
		}
	}


	public writeParam(param: Param, engine: EngineService): void {
		this.writeReferenceParam(param, engine);
		//this.writeShadowParam(param, engine);
		this.writeTransformParam(param);
	}

	public writeAllParam(engine: EngineService): void {
		super.writeAllParam(engine);
		if( this.material ) { 
			this.material.write(engine);
		}
		this.writePlaceholder(engine);
	}

	public readTransformParam(engine: EngineService): void {
		this.addOrUpdateParam("pos", FormatUtils.vectorToString(this.mesh.position));
		this.addOrUpdateParam("rot", FormatUtils.vectorToString(FormatUtils.radToDegVector(this.mesh.rotationQuaternion ? this.mesh.rotationQuaternion.toEulerAngles() : this.mesh.rotation)));
		this.addOrUpdateParam("scale", FormatUtils.vectorToString(this.mesh.scaling));
	}

	public writeShadowParam(param: Param, engine: EngineService): void {
		if( "shadow.light" === param.name) {
			var lightImpl: LightImpl = engine.getLightImpl(param.value);
			lightImpl.addShadowCaster(this.mesh, true);
		} else if( "shadow" === param.name && param.getBoolValue() ) {
			var lightImpl: LightImpl = engine.getLightImpl(null);
			lightImpl.addShadowCaster(this.mesh, true);
		} else if( "shadow.receive" === param.name ) {
			this.mesh.receiveShadows = param.getBoolValue();
		} 
	}
	
	public writePlaceholder(engine: EngineService): void {

	}

	public addChild(child: MeshObject): void {
		this.mesh.addChild(child.mesh);
		child.mesh.metadata = this;
	}

	public addChildMesh(child: MeshObject): void {
		this.mesh.addChild(child.mesh);
	}

	public delete(engine: EngineService) {
		if(  this.mesh ) {
			this.mesh.dispose();
		}
		for(let child of this.Scene) {
			if( child instanceof MeshObject ) {
				(child as MeshObject).delete(engine);
			}
		}
		super.delete(engine);
	}

	public visibility(value: boolean): void {
		this.mesh.setEnabled(value);
	}

	public getBoundingBox(): BoundingBox {
		if (this.boundingBox == null) {
			var min: Vector3 = this.mesh.getBoundingInfo().boundingBox.minimumWorld;
			var max: Vector3 = this.mesh.getBoundingInfo().boundingBox.maximumWorld;
			this.boundingBox = this.scaleBoundingBox(new BoundingBox(min, max));
		}
		return this.boundingBox;
	}

	public scaleBoundingBox(boundingBox: BoundingBox): BoundingBox {
		var scale: Vector3 = this.getParamValueVector("scale");
		if (scale) {
			var min: Vector3 = boundingBox.minimumWorld;
			var max: Vector3 = boundingBox.maximumWorld;
			min = new Vector3(min.x * scale.x, min.y * scale.y, min.z * scale.z);
			max = new Vector3(max.x * scale.x, max.y * scale.y, max.z * scale.z);
			return new BoundingBox(min, max);
		}
		return boundingBox
	}

	public getBoundingBoxSize(): Vector3 {
		this.getBoundingBox();
		return new Vector3(this.boundingBox.maximum.x - this.boundingBox.minimum.x,
			this.boundingBox.maximum.y - this.boundingBox.minimum.y, 
			this.boundingBox.maximum.z - this.boundingBox.minimum.z);
	}
	
	public inCollisionBoundingBox(point: Vector3, distance: number): boolean {
		this.getBoundingBox();
		return this.boundingBox && point.x > this.boundingBox.minimumWorld.x - distance && point.x < this.boundingBox.maximumWorld.x + distance
				&& point.y > this.boundingBox.minimumWorld.y - distance && point.y < this.boundingBox.maximumWorld.y + distance
				&& point.z > this.boundingBox.minimumWorld.z - distance && point.z < this.boundingBox.maximumWorld.z + distance;
	}

	public focusCamera(fov: number): CameraUtils {
		var result: CameraUtils = new CameraUtils();
		result.fov = fov;
		this.getBoundingBox();
		var size: Vector3 = this.getBoundingBoxSize();
		var fovToAtan: number = 1 / Math.tan(fov / 2);
		result.position = this.boundingBox.centerWorld.clone();
		result.position.z += 1.5 * (size.z / 2 + size.x * fovToAtan / 2);
		result.target = this.boundingBox.centerWorld;
		return result;
	}

	public static getMaterialImpl(scene: Scene, engine: EngineService): MaterialImpl {
		var param: Param = scene.getParam("material.type");
		var meshObject: MeshObject = scene instanceof MeshObject ? scene : null;
		if( param ) {
			if( scene instanceof MeshObject) {
				(scene as MeshObject).assignChildren = true;
			}
			if( param.value === "standard") {
				return new  StandardMeshMaterial(meshObject);
			} else if( param.value === "PBRMetallicRoughness") {
				return new  PBRMetallicRoughnessMeshMaterial(meshObject);
			} else if( param.value === "PBRSpecularGlossiness") {
				return new PBRSpecularGlossinessMeshMaterial(meshObject);
			} else if( param.value === "PBR") {
				return new PBRMeshMaterial(meshObject);
			} else if( param.value === "video") {
				return new VideoMaterial(meshObject);
			}
		} else if(scene.isMaterialParam()) {
			return new StandardMeshMaterial(meshObject);
		}
		return null;
	}

	public fromPlaceholder(placeholder: Placeholder, engine: EngineService): void {
		Logger.info("MeshObject", "fromPlaceholder()");
		if (placeholder.width) {
			this.widthToHeight(placeholder.width, engine);
		}
		var pivot: Pivot = placeholder.pivot;
		this.addOrUpdateParam("pos", FormatUtils.vectorToString(pivot.o));
		var rotation: Vector3 = pivot.getEulerAnglesDeg();
		this.addOrUpdateParam("rot", FormatUtils.vectorToString(rotation));
	}

	public static createMeshObject(name: string, engine: EngineService): MeshObject {
		var scene = new Scene();
		scene.type = "object";
		scene.name = name;
		var result: MeshObject = new MeshObject(scene);
		result.mesh = new Mesh(this.name, engine.scene);
		return result;
	}
	
	public widthToHeight(width: number, engine: EngineService): void {
	}

	public localToGlobalPivot(u: number, v: number, w: number): Pivot {
		return new Pivot();
	}


}