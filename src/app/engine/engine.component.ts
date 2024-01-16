import { Component, Output, EventEmitter, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ModelService } from '../service/model.service';
import { EngineService } from './engine.service';
import { CompositeObject } from "../process/scene/mesh/composite/compositeObject";
import { ChildObject } from "../process/scene/mesh/composite/childObject";
import { WallObject } from "../process/scene/mesh/wallObject";
import { FloorObject } from "../process/scene/mesh/floorObject";
import { Scene } from "../model/assembler/scene";
import { Creation } from "../model/assembler/creation";
import { Process } from "../model/assembler/process";
import { MeshObject } from "../process/scene/mesh/meshObject";
import { MergeObject } from "../process/scene/mesh/mergeObject";
import { PictureObject } from "../process/scene/mesh/pictureObject";
import { PlaneObject } from "../process/scene/mesh/planeObject";
import { Logger } from '../process/utils/logger';
import { FormatUtils } from '../process/utils/formatUtils';
import { Vector3 } from '@babylonjs/core';

@Component({
	selector: 'app-engine',
	templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {

	@Output() public event: EventEmitter<string> = new EventEmitter();

	@ViewChild('rendererCanvas', { static: true })
	public rendererCanvas: ElementRef<HTMLCanvasElement>;

	public doInit: boolean = true;
	public style: string = "";
	public support: Scene;
	public pickedMeshObject: MeshObject;
	public doDrag: boolean;
	
	public dragCreation: Creation;
	public dragMaterial: Scene;

	public constructor(public engine: EngineService, private modelService: ModelService) { }

	public ngOnInit(): void {
		Logger.info("EngineComponent", "ngOnInit()");
		this.modelService.event.subscribe(item => this.modelServiceEventHandler(item));
		this.engine.init(this.rendererCanvas, this.modelService);
		if( this.modelService.doRoomExecute ) {
			this.modelService.room.execute(this.engine);
			this.modelService.doRoomExecute = false;
		}
		this.event.emit("initialized");
	}

	public modelServiceEventHandler(item) {
		if (item === "getRoom") {
			Logger.info("EngineComponent", "modelServiceEventHandler() -> room loaded");
			this.modelService.room.execute(this.engine);
			this.event.emit("getRoom");
		}
	}

	public assetAllowDrop(evt): void {
		if (!this.doDrag) {
			this.event.emit("drag");
			this.doDrag = true;
		}
		evt.preventDefault();
		var meshObject: MeshObject = null;
		var wall: WallObject = null;
		var compositeObject: CompositeObject;
		var pickResult = this.engine.scene.pick(evt.offsetX, evt.offsetY);
		if (pickResult.hit && pickResult.pickedMesh.metadata != null ) {
			// a meshObject is picked
			meshObject = pickResult.pickedMesh.metadata as MeshObject;
			if( this.dragCreation && this.dragCreation.getType() === "picture" 
					&& pickResult.pickedMesh.metadata instanceof WallObject) {
				// picture asset + wall picked
				wall = meshObject as WallObject;
				if (!this.pickedMeshObject || this.pickedMeshObject.name != wall.name) {
					if( this.dragCreation ) {
						wall.placeholderGroup.visible(true);
					}
					if (this.pickedMeshObject) {
						this.pickedMeshObject.placeholderGroup.visible(false);
					}
					this.pickedMeshObject = wall;
				}
				wall.placeholderGroup.select(pickResult.pickedPoint);
			} else if( this.dragCreation && this.dragCreation.getType() === "picture" 
					&& pickResult.pickedMesh.metadata instanceof ChildObject) {
				// picture asset + compositeObject picked
				compositeObject = (meshObject as ChildObject).parent;
				if (!this.pickedMeshObject || this.pickedMeshObject.name != compositeObject.name) {
					if( this.dragCreation ) {
						compositeObject.placeholderGroup.visible(true);
					}
					if (this.pickedMeshObject) {
						this.pickedMeshObject.placeholderGroup.visible(false);
					}
					this.pickedMeshObject = compositeObject;
				}
				compositeObject.placeholderGroup.select(pickResult.pickedPoint);
			} else if( this.dragCreation && this.dragCreation.getType() === "texture" && (pickResult.pickedMesh.metadata instanceof WallObject || pickResult.pickedMesh.metadata instanceof FloorObject)) {
				// texture + wall || floor
				if( this.pickedMeshObject == null || this.pickedMeshObject.name != meshObject.name ) {
					meshObject.highlight(true);
					if( this.pickedMeshObject ) {
						this.pickedMeshObject.highlight(false);
					}
					this.pickedMeshObject = meshObject;
				}
			} else if( this.dragMaterial && (pickResult.pickedMesh.metadata instanceof WallObject || pickResult.pickedMesh.metadata instanceof FloorObject)) {
				// material + wall || floor
				if( this.pickedMeshObject == null || this.pickedMeshObject.name != meshObject.name ) {
					meshObject.highlight(true);
					if( this.pickedMeshObject ) {
						this.pickedMeshObject.highlight(false);
					}
					this.pickedMeshObject = meshObject;
				}
			}
		}
		if ( this.dragCreation && this.dragCreation.getType() === "picture" && this.pickedMeshObject 
				&& ((wall == null && this.pickedMeshObject instanceof WallObject) || (compositeObject == null && this.pickedMeshObject instanceof CompositeObject))  
				&& (pickResult.pickedMesh == null || pickResult.pickedMesh.name != "placeholder")) {
			this.pickedMeshObject.placeholderGroup.visible(false);
			this.pickedMeshObject = null;
		}
	}

	public assetDrop(evt): void {
		Logger.info("EngineComponent", "assetDrop()");
		this.event.emit("drop");
		this.doDrag = false;
		if (this.pickedMeshObject && this.pickedMeshObject.placeholderGroup) {
			this.pickedMeshObject.placeholderGroup.visible(false);
		}
		var meshObject: MeshObject = null;
		this.pickedMeshObject = null;
		evt.preventDefault();
		var pickResult = this.engine.scene.pick(evt.offsetX, evt.offsetY);
		if (pickResult.hit && pickResult.pickedMesh.metadata != null ) {
			// a meshObject is picked
			meshObject = pickResult.pickedMesh.metadata as MeshObject;
			var process: Process = meshObject.getProcess();
			if( this.dragCreation && this.dragCreation.getType() === "picture" && pickResult.pickedMesh.metadata instanceof WallObject) {
				// picture asset + wall picked
				Logger.info("EngineComponent", "assetDrop() -> add picture '" + this.dragCreation.id + "' on wall '" + meshObject.name + "''" );
				var wall: WallObject = meshObject as WallObject;
				var meshObject: MeshObject = this.createSupportFromWall(wall, this.dragCreation.id, this.dragCreation.id + evt.offsetX);
				meshObject.write(this.engine);
				process.addSceneImpl(meshObject, this.engine);
			} else if( this.dragCreation && this.dragCreation.getType() === "picture" && pickResult.pickedMesh.metadata instanceof ChildObject) {
				// picture asset + composite object picked
				Logger.info("EngineComponent", "assetDrop() -> add picture '" + this.dragCreation.id + "' on composite object '" + meshObject.name + "''" );
				var compositeObject: CompositeObject = (meshObject as ChildObject).parent;
				var meshObject: MeshObject = this.createSupportFromCompositeObject(compositeObject, this.dragCreation.id, this.dragCreation.id + evt.offsetX);
				meshObject.write(this.engine);
				process.addSceneImpl(meshObject, this.engine);
			
			} else if( this.dragCreation && this.dragCreation.getType() === "object" ) {
				// object asset
				Logger.info("EngineComponent", "assetDrop() -> add object " + this.dragCreation.id );
				var position: Vector3 = pickResult.pickedPoint;
				if( pickResult.pickedMesh.metadata instanceof WallObject || pickResult.pickedMesh.metadata instanceof PictureObject) {
					var origin: Vector3 = pickResult.ray.origin;
					position = new Vector3(0.5*position.x + 0.5*origin.x, 0, 0.5*position.z + 0.5*origin.z);
				}
				var mergeObject: MergeObject = this.createMergeObject(position, this.dragCreation.id, this.dragCreation.id + evt.offsetX);
				mergeObject.write(this.engine);
				process.addSceneImpl(mergeObject, this.engine);
			} else if( this.dragMaterial ) {
				// material assign to meshObject
				Logger.info("EngineComponent", "assetDrop() -> assign material '" + this.dragMaterial.name + "' to meshObject '" + meshObject.name + "''" );
				meshObject.material.assignModel(this.dragMaterial, this.engine);
			} else if( this.dragCreation && this.dragCreation.getType() === "texture" ) {
				// texture assign to meshObject
				Logger.info("EngineComponent", "assetDrop() -> assign texture '" + this.dragCreation.id + "' to meshObject '" + meshObject.name + "''" );
				meshObject.addOrUpdateParam("material.diffuseMap.creation", this.dragCreation.id);
				meshObject.write(this.engine);
			}
			this.modelService.updateProcess(process);
		}
	}

	public createSupportFromWall(wall: WallObject, creationId: string, name: string): MeshObject {
		Logger.info("EngineComponent", "createSupportFromWall(wall: " + wall.name + ", creationId: " + creationId + ", name: " + name);
		wall.placeholderGroup.selected.highlight(false);
		if (this.support.create === "picture") {
			var pictureObject: PictureObject = new PictureObject(Scene.create(name, "object", "picture"));
			pictureObject.process = wall.process;
			pictureObject.addOrUpdateParam("asset", creationId);
			pictureObject.addOrUpdateParam("reference", "support." + this.support.name);
			pictureObject.fromPlaceholder(wall.placeholderGroup.selected, this.engine);
			return pictureObject;
		} else if (this.support.create === "plane") {
			var planeObject: PlaneObject = new PlaneObject(Scene.create(name, "object", "plane"));
			planeObject.process = wall.process;
			planeObject.addOrUpdateParam("asset", creationId);
			planeObject.addOrUpdateParam("reference", "support." + this.support.name);
			planeObject.fromPlaceholder(wall.placeholderGroup.selected, this.engine);
			return planeObject;
		}
		return null;
	}

	public createSupportFromCompositeObject(compositeObject: CompositeObject, creationId: string, name: string): MeshObject {
		Logger.info("EngineComponent", "createSupportFromCompositeObject(wall: " + compositeObject.name + ", creationId: " + creationId + ", name: " + name);
		compositeObject.placeholderGroup.selected.highlight(false);
		if (this.support.create === "picture") {
			var pictureObject: PictureObject = new PictureObject(Scene.create(name, "object", "picture"));
			pictureObject.process = compositeObject.process;
			pictureObject.addOrUpdateParam("asset", creationId);
			pictureObject.addOrUpdateParam("reference", "support." + this.support.name);
			pictureObject.fromPlaceholder(compositeObject.placeholderGroup.selected, this.engine);
			return pictureObject;
		} else if (this.support.create === "plane") {
			var planeObject: PlaneObject = new PlaneObject(Scene.create(name, "object", "plane"));
			planeObject.process = compositeObject.process;
			planeObject.addOrUpdateParam("asset", creationId);
			planeObject.addOrUpdateParam("reference", "support." + this.support.name);
			planeObject.fromPlaceholder(compositeObject.placeholderGroup.selected, this.engine);
			return planeObject;
		}
		return null;
	}

	public createMergeObject(position: Vector3, creationId: string, name: string): MergeObject {
		Logger.info("EngineComponent", "createMergeObject(creationId: " + creationId + ", name: " + name + ")");
		var mergeObject: MergeObject = new MergeObject(Scene.create(name, "merge", ""));
		mergeObject.addOrUpdateParam("pos", FormatUtils.vectorToString(position));
		mergeObject.addOrUpdateParam("creationId", creationId);
		return mergeObject;
	}
	
	public setRightPadding(value: number): void {
		if (value) {
			this.style = "padding-right:" + value + "px";
		} else {
			this.style = "";
		}
	}
}
