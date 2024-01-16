import { Scene } from "../../../model/assembler/scene";
import { MeshObject } from "../../../process/scene/mesh/meshObject";
import { Pivot } from '../../../process/utils/pivot';
import { EngineService } from "../../../engine/engine.service";
import { TransformNode, Color3, StandardMaterial, Mesh, BoundingBox, ActionManager, ExecuteCodeAction, AbstractMesh, InstancedMesh } from '@babylonjs/core';
import { Logger } from '../../../process/utils/logger';
import { MergeObject } from "./mergeObject";
import { MeshNode } from '../../../utils/system-explorer/tree/MeshNode'
import { TreeModel } from '@circlon/angular-tree-component';

export class SystemExplorerObject extends MergeObject {

	public treeModel: TreeModel;
	public rootNode: MeshNode;
	public current: MeshNode;
	
	public selectMaterial: StandardMaterial;
	public axis: Mesh;

	public constructor(scene: Scene) {
		super(scene);
	}

	public writeCreate(engine: EngineService): void {
		this.selectMaterial = new StandardMaterial("selected", engine.scene);
		this.selectMaterial.emissiveColor = new Color3(1.0, 0.0, 0.0);
		this.mesh = new Mesh(this.name, engine.scene);
		//super.writeCreate(engine);
		if (this.getParam("scale") == null) {
			var scale: string = this.getCreation(engine).getInfoValue("scale");
			if (scale) {
				this.addParam("scale", scale, null);
			}
		}
		this.import(engine);
	}

	protected onSuccessHandler(meshes, engine: EngineService) {
		Logger.info("SystemExplorerObject", "onSuccessHandler()");
		for (var i = 0; i < 1; i++) {
			var mesh: Mesh = meshes[i];
			this.addMergeChild(mesh, engine);
		}
		this.writeAllParam(engine);
		this.imported = true;
		this.getBoundingBox();
		this.rootNode = new MeshNode(this.mesh, new Pivot());
		this.event.emit("imported");
		Logger.info("MergeObject", "onSuccessHandler() emit 'imported'");
	}

	protected addMergeChild(mesh: AbstractMesh, engine: EngineService): void {
		this.mesh.addChild(mesh);
		Logger.debug("MergeObject", this.name + ": addChild(name: " + mesh.name + "; class: " + mesh.constructor.name + "; parent: " + (mesh.parent ? mesh.parent.name + "; class: " + mesh.parent.constructor.name : "none") + ")");
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

	public setTreeModel(treeModel: TreeModel): void {
		this.treeModel = treeModel;
	}

	public select(meshNode : MeshNode): TransformNode {
		if( this.current != null ) {
			this.current.select(false, null);
		}
		meshNode.select(true, this.selectMaterial);
		this.current = meshNode;
		this.axis.position = meshNode.global.o;
		this.axis.rotation = meshNode.global.getEulerAnglesRad();
		return this.current.transformNode;
	}
	
	public visible(visibled: boolean, selected: boolean): void {
		this.rootNode.visible(visibled, selected);
	}
	
	public static createSystemExplorer(name: string, filename: string, url: string, size: number, engine: EngineService): SystemExplorerObject {
		var result: SystemExplorerObject = new SystemExplorerObject(Scene.create(name, "merge", ""));
		result.addParam("filename", filename, "true");
		result.addParam("url", url, "true");
		result.addParam("scale", "1;1;1", "true");
		result.axis = Pivot.createAxis(size, true, engine);
		Pivot.createAxis(size * 16, false, engine);
		return result;
	}
}