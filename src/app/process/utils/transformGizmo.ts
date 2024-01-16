import { Scene, GizmoManager, Vector3 } from '@babylonjs/core';
import { ModelService } from '../../service/model.service';
import { EngineService } from '../../engine/engine.service';
import { MeshObject } from "../../process/scene/mesh/meshObject";
import { PictureObject } from "../../process/scene/mesh/pictureObject";
import { PlaneObject } from "../../process/scene/mesh/planeObject";
import { MergeObject } from "../../process/scene/mesh/mergeObject";
import { CompositeObject } from '../../process/scene/mesh/composite/compositeObject';
import { Logger } from '../../process/utils/logger';

export class TransformGizmo extends GizmoManager {

	public meshObject: MeshObject;
	public dragging: boolean;

	private initPosition: boolean;
	private initRotation: boolean;
	private initScaling: boolean;
	
	private sensitivity: number = 3;
	
	public constructor(scene: Scene, public modelService: ModelService, public engine: EngineService) {
		super(scene);
		this.engine = engine;
		this.modelService = modelService;
		this.boundingBoxGizmoEnabled = false;
		this.usePointerToAttachGizmos = false;
		this.setMode(true, false, false);
	}

	public attachToMeshObject(meshObject: MeshObject): void {
		this.meshObject = meshObject;
		this.attachToMesh(meshObject.mesh);
		this.meshObject.getBoundingBox();
		this.sensitivity = 3;
		var scale: Vector3 = meshObject.getParamValueVector("scale");
		if( scale ) {
			var factor: number = meshObject instanceof MergeObject ? 10 : 30;
			this.sensitivity = factor * scale.x;
		}
		if( this.gizmos.scaleGizmo ) {
			this.gizmos.scaleGizmo.sensitivity = this.sensitivity;
		}
	}

	public dettach(): void {
		this.attachToMesh(null);
	}
	
	public setMode(position: boolean, rotation: boolean, scaling: boolean): void {
		this.positionGizmoEnabled = position;
		this.rotationGizmoEnabled = rotation;
		this.scaleGizmoEnabled = scaling;
		if (position && !this.initPosition) {
			this.gizmos.positionGizmo.planarGizmoEnabled = true;
			this.gizmos.positionGizmo.onDragStartObservable.add(() => {
				this.dragging = true;
			});
			this.gizmos.positionGizmo.onDragEndObservable.add(() => {
				this.dragging = false;
				this.meshObject.readTransformParam(this.engine);
				this.modelService.updateProcess(this.meshObject.process);
			});
			this.initPosition = true;
		}
		if (rotation && !this.initRotation) {
			this.gizmos.rotationGizmo.onDragStartObservable.add(() => {
				this.dragging = true;
			});
			this.gizmos.rotationGizmo.onDragEndObservable.add(() => {
				this.dragging = false;
				this.meshObject.readTransformParam(this.engine);
				this.modelService.updateProcess(this.meshObject.process);
			});
			this.initRotation = true;
		}
		if (scaling && !this.initScaling) {
			this.gizmos.scaleGizmo.onDragStartObservable.add(() => {
				this.dragging = true;
			});
			this.gizmos.scaleGizmo.onDragEndObservable.add(() => {
				this.dragging = false;
				this.meshObject.readTransformParam(this.engine);
				this.modelService.updateProcess(this.meshObject.process);
			});
			this.initScaling = true;
			this.gizmos.scaleGizmo.sensitivity = this.sensitivity;
		}

	}

	public delete() {
		if ( this.meshObject instanceof PictureObject || this.meshObject instanceof PlaneObject 
				|| this.meshObject instanceof MergeObject || this.meshObject instanceof CompositeObject) {
			Logger.info("TransformGizmo", "delete(" + this.meshObject.name + ")");
			this.attachToMesh(null);
			this.meshObject.delete(this.engine);
			this.modelService.updateProcess(this.meshObject.process);
			this.meshObject = null;
		}
	}
}