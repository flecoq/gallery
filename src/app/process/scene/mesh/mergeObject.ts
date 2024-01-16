import { Scene } from "../../../model/assembler/scene";
import { Param } from "../../../model/assembler/param";
import { Creation } from "../../../model/assembler/creation";
import { MeshObject } from "../../../process/scene/mesh/meshObject";
import { EngineService } from "../../../engine/engine.service";
import { Vector3, Mesh, BoundingBox, ActionManager, ExecuteCodeAction, AbstractMesh, InstancedMesh } from '@babylonjs/core';
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Logger } from '../../../process/utils/logger';
import { ActionAllow } from "../../utils/actionAllow";

import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/OBJ";

export class MergeObject extends MeshObject {

	public creation: Creation;
	public instanceList: MergeObject[] = [];
	public imported: boolean = false;
	public forceImport: boolean = false;

	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(true, true);
	}


	public write(engine: EngineService): void {
		Logger.info("MergeObject", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("MergeObject", this.Param);
		if (!this.created) {
			this.writeCreate(engine);
		} else {
			this.writeAllParam(engine);
		}
	}

	public getCreation(engine: EngineService): Creation {
		if (this.creation == null) {
			var creationId = this.getParamValue("creationId");
			if (creationId) {
				this.creation = engine.modelService.getCreation(creationId);
			}
		}
		return this.creation;
	}

	public writeCreate(engine: EngineService): void {
		this.mesh = new Mesh(this.name, engine.scene);
		super.writeCreate(engine);
		if (this.getParam("scale") == null) {
			var scale: string = this.getCreation(engine).getInfoValue("scale");
			if (scale) {
				this.addParam("scale", scale, null);
			}
		}
		var source: MergeObject = this.duplicated(engine);
		if (!this.forceImport && source) {
			Logger.info("MergeObject", "duplicate source " + source.name + " to " + this.name);
			if (source.imported) {
				this.createInstance(source, engine);
			} else {
				source.appendInstance(this);
			}
		} else {
			this.import(engine);
		}
	}

	public writeTransformParam(param: Param): void {
		this.position = this.mesh.position;
		this.rotation = this.mesh.rotation;
		this.scaling = this.mesh.scaling;
		super.writeTransformParam(param);
		this.mesh.position = this.position;
		this.mesh.rotation = this.rotation;
		this.mesh.scaling = this.scaling;
	}

	public appendInstance(mergeObject: MergeObject): void {
		this.instanceList.push(mergeObject);
	}

	public createInstance(source: MergeObject, engine: EngineService): void {
		for (let mesh of source.mesh.getChildMeshes()) {
			var instance: InstancedMesh = (mesh as Mesh).createInstance(this.name + mesh.name);
			this.addMergeChild(instance, engine);
		}
		this.writeAllParam(engine);
		this.imported = true;
	}

	public import(engine: EngineService): void {
		var url: string;
		var filename: string;
		if (this.getCreation(engine)) {
			filename = this.creation.filename;
			url = "./assembler/" + this.creation.getInfoValue("url");
		} else {
			filename = this.getParamValue("filename");
			url = "./assembler/" + this.getParamValue("url");
		}
		Logger.info("MergeObject", "import(" + url + filename + ")");
		SceneLoader.ImportMesh(null, url, filename,
			engine.scene, meshes => this.onSuccessHandler(meshes, engine));
	}

	protected onSuccessHandler(meshes, engine: EngineService) {
		Logger.info("MergeObject", "onSuccessHandler()");
		for (var i = 0; i < meshes.length; i++) {
		//for (var i = 0; i < 1; i++) {
			var mesh: Mesh = meshes[i];
			this.addMergeChild(mesh, engine);
		}
		this.writeAllParam(engine);
		for (let instance of this.instanceList) {
			instance.createInstance(this, engine);
		}
		this.imported = true;
		this.getBoundingBox();
		this.event.emit("imported");
		Logger.info("MergeObject", "onSuccessHandler() emit 'imported'");
	}

	protected addMergeChild(mesh: AbstractMesh, engine: EngineService): void {
		this.mesh.addChild(mesh);
		Logger.debug("MergeObject", this.name + ": addChild(name: " + mesh.name + "; class: " + mesh.constructor.name + "; parent: " +  (mesh.parent ? mesh.parent.name + "; class: " + mesh.parent.constructor.name : "none") + ")");
		if (this.actionAlow.isEdit()) {
			engine.monitor.addMesh(mesh as Mesh);
		}
		if (this.actionAlow.pickable()) {
			mesh.actionManager = new ActionManager(engine.scene);
			mesh.actionManager.registerAction(
				new ExecuteCodeAction(
					ActionManager.OnPickTrigger,
					function(event) {
						var meshObject: MeshObject = event.meshUnderPointer.parent.metadata;
						engine.pickSceneImpl(meshObject);
						if (meshObject.actionAlow.gizmo) {
							Logger.info("MergeObject", "Gizmo on: " + meshObject.name);
							meshObject.transformGizmo.attachToMeshObject(meshObject);
						}
					}
				)
			);
		}
	}

	public getUrl(engine: EngineService): string {
		var url: string;
		var filename: string;
		if (this.getCreation(engine)) {
			filename = this.creation.filename;
			url = this.creation.getInfoValue("url");
		} else {
			filename = this.getParamValue("filename");
			url = this.getParamValue("url");
		}
		return url + filename;
	}

	public duplicated(engine: EngineService): MergeObject {
		var url: string = this.getUrl(engine);
		for (let sceneImpl of engine.sceneImplList) {
			if (sceneImpl instanceof MergeObject && sceneImpl.name != this.name
				&& (sceneImpl as MergeObject).getUrl(engine) === url) {
				return sceneImpl as MergeObject;
			}
		}
		return null;
	}

	public getBoundingBox(): BoundingBox {
		if (this.imported && !this.boundingBox) {
			var min: Vector3 = null;
			var max: Vector3 = null;
			for (let child of this.mesh.getChildMeshes()) {
				min = min ? Vector3.Minimize(min, child.getBoundingInfo().boundingBox.minimumWorld) : child.getBoundingInfo().boundingBox.minimumWorld;
				max = max ? Vector3.Maximize(max, child.getBoundingInfo().boundingBox.maximumWorld) : child.getBoundingInfo().boundingBox.maximumWorld;
			}
			var boundingBox: BoundingBox = this.scaleBoundingBox(new BoundingBox(min, max));
			this.boundingBox = new BoundingBox(boundingBox.minimumWorld.add(this.mesh.position), boundingBox.maximumWorld.add(this.mesh.position));
		} else {
			return null;
		}
	}

	public static create(name: string, filename: string, url: string): MergeObject {
		var result: MergeObject = new MergeObject(Scene.create(name, "merge", ""));
		result.addParam("filename", filename, "true");
		result.addParam("url", url, "true");
		result.addParam("scale", "1;1;1", "true");
		return result;
	}
}