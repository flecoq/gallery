import { Scene } from "../../../../model/assembler/scene";
import { Param } from "../../../../model/assembler/param";
import { ChildObject } from "../../../../process/scene/mesh/composite/childObject";
import { EngineService } from "../../../../engine/engine.service";
import { Vector3, Mesh, BoundingBox, AbstractMesh, ActionManager, ExecuteCodeAction} from '@babylonjs/core';
import { SceneLoader } from "@babylonjs/core/Loading/sceneLoader";
import { Pivot } from '../../../../process/utils/pivot';
import { Logger } from '../../../../process/utils/logger';
import { ActionAllow } from "../../../utils/actionAllow";

import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/OBJ";

export class MergeChildObject extends ChildObject {

	public static mergeChildObjectList: MergeChildObject[] = [];

	public instanceList: MergeChildObject[] = [];
	public imported: boolean = false;
	public forceImport: boolean = false;
	public merge: Pivot;

	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(true, true);
	}

	public write(engine: EngineService): void {
		Logger.info("MergeChildObject", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("MergeChildObject", this.Param);
		if (!this.created) {
			this.writeCreate(engine);
		} else {
			this.writeAllParam(engine);
		}
	}

	public writeCreate(engine: EngineService): void {
		this.created = true;
		this.actionAlow.edit = engine.edit;
		this.transformGizmo = engine.transformGizmo;
		this.merge = Pivot.createFromResultParams("merge", this.Param, this.parent.getExpressionParamList());
		var source: MergeChildObject = this.duplicated();
		if ( !this.forceImport && source) {
			Logger.info("MergeChildObject", "duplicate source " + source.name + " to " + this.name);
			if (source.imported) {
				this.createInstance(source, engine);
			} else {
				source.appendInstance(this);
			}
		} else {
			this.import(engine);
		}
	}

	public writeTransformAllParam(engine: EngineService): void {
		this.pivot = Pivot.createFromResultParams("", this.Param, this.expressionParamList.length == 0 ? this.parent.getExpressionParamList() : this.expressionParamList);
		this.global = this.parent.global.localToGlobalPivot(this.pivot.localToGlobalPivot(this.merge));
		this.rotation = this.global.getEulerAnglesRad();
		this.position = this.global.o;
		if (this.Param != null) {
			this.writeParamList(this.Param, engine);
		}
		var size: Vector3 = this.getBoundingBoxSize();
		var scaling: Vector3 = new Vector3(this.scaling.x / size.x, this.scaling.y / size.y, this.scaling.z / size.z);
		this.scaling.x = scaling.x > 0 ? scaling.x : Math.max(scaling.y, scaling.z);
		this.scaling.y = scaling.y > 0 ? scaling.y : Math.max(scaling.x, scaling.z);
		this.scaling.z = scaling.z > 0 ? scaling.z : Math.max(scaling.y, scaling.x);
	}

	public writeTransformOnly(engine: EngineService): void {
		this.writeTransformAllParam(engine);
		this.mesh.position = this.position;
		this.mesh.rotation = this.rotation;
		this.mesh.rotation.y = -this.mesh.rotation.y;
		this.mesh.scaling = this.scaling;
	}
	
	public writeAllParam(engine: EngineService): void {
		this.writeTransformOnly(engine);
		this.writeMaterial(engine);
	}

	public appendInstance(mergeChildObject: MergeChildObject): void {
		this.instanceList.push(mergeChildObject);
	}

	public createInstance(source: MergeChildObject, engine: EngineService): void {
		//this.setMesh(source.mesh.createInstance(this.name + source.mesh.name), engine);
		this.setMesh(source.mesh.clone(this.name + source.mesh.name), engine);
		this.writeAllParam(engine);
		this.imported = true;
	}

	public import(engine: EngineService): void {
		MergeChildObject.addMergeChildObject(this);
		var url: string = "./assembler/" + this.getParamValue("url");
		var filename: string = this.getParamValue("filename");
		Logger.info("MergeChildObject", "import(" + url + filename + ")");
		SceneLoader.ImportMesh(null, url, filename,
			engine.scene, meshes => this.onSuccessHandler(meshes, engine));
	}

	private onSuccessHandler(meshes, engine: EngineService) {
		Logger.info("MergeChildObject", "onSuccessHandler()");
		this.setMesh(meshes[1], engine);
		this.writeAllParam(engine);
		for (let instance of this.instanceList) {
			instance.createInstance(this, engine);
		}
		this.imported = true;
		this.event.emit("imported");
		Logger.info("MergeChildObject", "onSuccessHandler() emit 'imported'");
	}

	private setMesh(mesh: AbstractMesh, engine: EngineService): void {
		this.mesh = mesh as Mesh;
		this.mesh.metadata = this;
		engine.viewManager.addMeshObject(this);
		if( this.actionAlow.isEdit()) {
			engine.monitor.addMesh(mesh as Mesh);
		}
		if (this.parent.actionAlow.pickable()) {
			mesh.actionManager = new ActionManager(engine.scene);
			mesh.actionManager.registerAction(
				new ExecuteCodeAction(
					ActionManager.OnPickTrigger,
					function(event) {
						var childObject: ChildObject = event.meshUnderPointer.metadata;	// meshObject = parent
						engine.pickSceneImpl(childObject.parent);
						if (childObject.parent.actionAlow.isGizmo()) {
							Logger.info("ChildObject", "Gizmo on: " + childObject.parent.name);
							childObject.parent.transformGizmo.attachToMeshObject(childObject.parent);
						}
					}
				)
			);
		}
	}

	public getUrl(): string {
		return this.getParamValue("url") + this.getParamValue("filename");
	}

	public duplicated(): MergeChildObject {
		for(let existing of MergeChildObject.mergeChildObjectList ) {
			if( this.getUrl() === existing.getUrl()) {
				return existing;
			}
		}
		return null;
	}

	public getBoundingBox(): BoundingBox {
		if( this.boundingBox == null ) {	
			this.boundingBox =  this.mesh.getBoundingInfo().boundingBox;
		}
		return this.boundingBox;
	}

	public static addMergeChildObject(mergeChildObject: MergeChildObject): void {
		MergeChildObject.mergeChildObjectList.push(mergeChildObject);
	}

	public static clear(): void {
		MergeChildObject.mergeChildObjectList = [];
	}
	
	public static create(): MergeChildObject {
		return new MergeChildObject(Scene.create("", "object", "merge"));
	}

	public addMergeChild(paramList: Param[], expressionParamList: Param[]): MergeChildObject {
		var result: MergeChildObject = MergeChildObject.create();
		result.Param = [...paramList];
		result.expressionParamList = expressionParamList;
		this.children.push(result);
		return result;
	}

}