import { EventEmitter } from '@angular/core';
import { Scene } from "../../../../model/assembler/scene";
import { MeshObject } from "../../../../process/scene/mesh/meshObject";
import { MergeObject } from "../../../../process/scene/mesh/mergeObject";
import { EngineService } from "../../../../engine/engine.service";
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Mesh, Vector3 } from '@babylonjs/core';
import { FormatUtils } from "../../../../process/utils/formatUtils";
import { Logger } from '../../../../process/utils/logger';

export class ObjectViewer extends MeshObject {

	public engine: EngineService;
	public camera: ArcRotateCamera;
	public meshObject: MeshObject;
	
	public event: EventEmitter<string> = new EventEmitter();
	
	public constructor(engine: EngineService) {
		super(new Scene());
		this.engine = engine;
		this.mesh = new Mesh(this.name, engine.scene);
		this.camera = new ArcRotateCamera("viewer", 0, 0, 0, new Vector3(), engine.scene);
	}
	
	public clear():void {
		for(let mesh of this.mesh.getChildMeshes()) {
			mesh.dispose();
		}
	}
	
	public refreshView(): void {
		this.clear();
		this.meshObject.write(this.engine);
		this.addChild(this.meshObject);
	}
	
	public viewMeshObject(meshObject: MeshObject): void {
		Logger.info("ObjectViewer", "viewMeshObject(" + meshObject.name + ")");
		this.meshObject = meshObject;
		this.refreshView();
		this.focusMeshObject();
	}
	
	public focusMeshObject(): void {
		this.meshObject.focusCamera(this.camera.fov).toArcRotateCamera(this.camera);
	}

	public viewCreation(creationId: string): void {
		Logger.info("ObjectViewer", "viewCreation(" + creationId + ")");
		var scene = new Scene();
		scene.type = "merge";
		scene.name = creationId;
		scene.addParam("creationId", creationId, null);
		var mergeObject: MergeObject = new MergeObject(scene);
		mergeObject.forceImport = true;
		//mergeObject.assignChildren = true;
		this.meshObject = mergeObject;
		mergeObject.event.subscribe(item => this.mergeObjectEventHandler(item));
		this.refreshView();
	}

	public mergeObjectEventHandler(item): void {
		Logger.info("ObjectViewer", "mergeObjectEventHandler()");
		this.meshObject.focusCamera(this.camera.fov).toArcRotateCamera(this.camera);
		this.camera.alpha += FormatUtils.degToRad(-30);
		this.camera.beta += FormatUtils.degToRad(-30);
		this.event.emit("refresh");
	}
}