import { Component, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { EngineService } from '../../engine/engine.service';
import { ModelService } from '../../service/model.service';
import { EngineComponent } from '../../engine/engine.component';
import { SystemExplorerObject } from '../../process/scene/mesh/systemExplorerObject';
import { TransformNode, Vector3, ArcRotateCamera } from "@babylonjs/core";
import { HemisphericLightObject } from '../../process/scene/light/hemisphericLightObject';
import { Logger } from '../../process/utils/logger';
import { MeshNode } from './tree/MeshNode';
import { TreeComponent, ITreeOptions } from '@circlon/angular-tree-component';
import { ToolComponent } from '../../component/toolComponent';
import { CommandComponent } from '../command/command.component';
import { SystemExplorerConfig } from './systemExplorerConfig';
import { Spreedsheat } from '../../model/spreedsheat/spreedsheat';
import { SceneImpl } from "../../process/scene/sceneImpl";
import { Process } from "../../model/assembler/process";
import { Scene } from "../../model/assembler/scene";
import { Creation } from "../../model/assembler/creation";
import { SceneUtils } from "../../process/utils/sceneUtils";
import { CompositeObject } from "../../process/scene/mesh/composite/compositeObject";
import { Placeholder } from "../../process/scene/placeholder/placeholder";
import { Point } from "../../process/utils/point";
import { MeshObject } from "../../process/scene/mesh/meshObject";

@Component({
	selector: 'app-system-explorer',
	templateUrl: './system-explorer.component.html',
	styleUrls: ['./system-explorer.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class SystemExplorerComponent extends ToolComponent implements OnInit {

	@ViewChild(EngineComponent)
	public engineComponent: EngineComponent;
	@ViewChild('tree')
	public treeComponent: TreeComponent;
	@ViewChild(CommandComponent)
	public commandComponent: CommandComponent;

	// explorer too
	public treeExplorerStyle: string;
	public treeExplorerToolStyle: string;

	// scene viewer
	public system: SystemExplorerObject;
	public camera: ArcRotateCamera;

	public isModelServiceEventHandler: boolean = true;
	public isEngineComponentEventHandler: boolean = false;
	public isMergeEventHandler: boolean = false;

	// TransformNode properties
	public name: string;
	public position: Vector3;
	public rotation: Vector3;
	public scaling: Vector3;
	public local: Vector3;
	public global: Vector3;
	public minLocal: Vector3;
	public minGlobal: Vector3;
	public maxLocal: Vector3;
	public maxGlobal: Vector3;

	private isSpreedsheat: boolean = false;
	private spreedsheatProcess:Process;

	constructor(public engine: EngineService, public modelService: ModelService) {
		super(modelService);
	}

	public nodes = [];

	public options: ITreeOptions = {
	}

	public ngOnInit(): void {
		Logger.info("SystemExplorerComponent", "ngOnInit()");
		this.modelService.event.subscribe(item => this.modelServiceEventHandler(item));
		this.engine.edit = false;
		this.updateTreeExplorerStyle(false);
	}

	public modelServiceEventHandler(item) {
		if (item === "getSpreedsheat") {
			Logger.info("SystemExplorerComponent", "modelServiceEventHandler() -> spreedsheat loaded");
			this.isSpreedsheat = true;
		}
	}

	public updateTreeExplorerStyle(visible: boolean): void {
		this.treeExplorerStyle = "visibility: " + (visible ? "visible" : "hidden") + "; height: 50%; overflow: auto;";
		this.treeExplorerToolStyle = "visibility: " + (visible ? "visible" : "hidden");
	}

	public showEdit(): void {
		this.visible();
	}

	public engineComponentEventHandler(item) {
		Logger.info("SystemExplorerComponent", "engineComponentEventHandler(" + item + ")")

		if ("initialized" === item) {
			//this.modelService.getVisitRoom(2);
		} else if ("getRoom" === item) {
			this.commandComponent.context.addRoom(this.modelService.room);
			if (this.isSpreedsheat) {
				this.executeSpreedsheat(this.modelService.spreedsheat);
			}
		}
		//this.createSystemExplorer();

		this.isEngineComponentEventHandler = true;
	}

	public executeSpreedsheat(spreedsheat: Spreedsheat): void {
		this.spreedsheatProcess = this.modelService.room.ProcessGroup.getProcess(this.modelService.spreedsheadProcessId);
		for (let u: number = 1; u < spreedsheat.lines.length; u++) {
			let type: string = spreedsheat.getLineType(u);
			if (type === "CR") {
				// creation
				let accountId: number = this.modelService.room.parent;
				let creation: Creation = this.modelService.getCreation(spreedsheat.getValue("id", u));
				let filename:string = "account/account_" + accountId + "/" + spreedsheat.getValue("type", u) + "/" + spreedsheat.getValue("file", u);
					if( creation ) {
					creation.filename = filename;
					creation.addOrUpdateInfo("size", spreedsheat.getValue("size", u).replace("x", ";"));
					creation.addOrUpdateInfo("type", spreedsheat.getValue("type", u));
				} else {
					creation = Creation.createCreation(spreedsheat.getValue("id", u), filename
						, spreedsheat.getValue("size", u).replace("x", ";"), spreedsheat.getValue("type", u));
					this.modelService.room.CreationGroup.Creation.push(creation);
				}
				creation.addOrUpdateInfo("hd", spreedsheat.getValue("hd", u));
				creation.addOrUpdateInfo("title", spreedsheat.getValue("title", u));
				creation.addOrUpdateInfo("description", spreedsheat.getValue("description", u));
				creation.addOrUpdateInfo("magnify", spreedsheat.getValue("magnify", u));

				// frame
				let scene: Scene = this.modelService.templateGroup.getTemplate(spreedsheat.getValue("template", u));
				let sceneImpl:SceneImpl = SceneUtils.createSceneImplFromScene(scene.clone(), this.engine);
				sceneImpl.name = spreedsheat.getValue("id", u);
				(sceneImpl as CompositeObject).widthToHeight(spreedsheat.getValueInt("width", u), this.engine);
				let assetChild: Scene = (sceneImpl as CompositeObject).getAssetChildObject();
				if (assetChild) {
					assetChild.addOrUpdateParam("asset", spreedsheat.getValue("id", u));
				}

				// placement
				let wall: SceneImpl = this.engine.getSceneImpl(spreedsheat.getValue("wall", u));
				let placement:string = spreedsheat.getValue("placement", u);		
				var placeholder: Placeholder;
				if ( placement === "center") {
					placeholder = new Placeholder((wall as MeshObject).localToGlobalPivot(0, 0.5, 0.5), 0, null, this.engine);
				} else {
					var local: Point = spreedsheat.getValuePoint("placement", u);
					placeholder = new Placeholder((wall as MeshObject).localToGlobalPivot(0, local.y, local.x), 0, null, this.engine);
				}
				sceneImpl.fromPlaceholder(placeholder, this.engine);

				// commit
				this.commitScene(sceneImpl);
			} else if (type === "PN") {
				let scene: SceneImpl = SceneUtils.createSceneImpl(spreedsheat.getValue("name", u), "composite", "object", this.engine);
				scene.addParam("pos", spreedsheat.getValue("x", u) + ";0;" + spreedsheat.getValue("z", u), "true");
				scene.addParam("local.scale", "0;" + spreedsheat.getValue("height", u) + ";" + spreedsheat.getValue("width", u), "true");
				scene.addParam("rot.y", spreedsheat.getValue("roty", u), "true");
				scene.addParam("reference", spreedsheat.getValue("reference", u), "true");
				this.commitScene(scene);
			}
		}
	}
	
	public commitScene(scene: SceneImpl): void {
		if (!scene.isMaterialParam()) {
			scene.addParam("material.type", "standard", null);
		}
		scene.write(this.engine);
		this.spreedsheatProcess.addSceneImpl(scene, this.engine);
	}

	public commandComponentEventHandler(item) {
		Logger.info("SystemExplorerComponent", "commandComponentEventHandler(" + item + ")")
		if (item instanceof SystemExplorerConfig) {
			this.updateTreeExplorerStyle(true);
			this.createSystemExplorer(item as SystemExplorerConfig);
		}
	}

	public createSystemExplorer(config: SystemExplorerConfig) {
		Logger.info("SystemExplorerComponent", "createSystemExplorer")

		//var config: SystemExplorerConfig = new SystemExplorerConfig(30, 1, "clock");
		//var config: SystemExplorerConfig = new SystemExplorerConfig(3000, 200, "station");
		//var config: SystemExplorerConfig = new SystemExplorerConfig(1500, 100, "flat-roof");

		// camera
		this.camera = new ArcRotateCamera("viewer", Math.PI / 3, Math.PI / 3, config.distance, new Vector3(), this.engine.scene);
		this.camera.speed = 0.15;
		this.camera.inertia = 0.9;
		this.engine.scene.activeCamera = this.camera;
		this.camera.attachControl(this.engine.canvas, false);

		// light
		var light: HemisphericLightObject = HemisphericLightObject.create("light");
		light.write(this.engine);

		// system
		//this.system = SystemExplorerObject.createSystemExplorer("station", "scene.gltf", "account/account_1/object/station/", 200, this.engine);
		this.system = SystemExplorerObject.createSystemExplorer(config.scene, config.filename ? config.filename : "scene.gltf", config.url ? config.url : "account/account_1/object/" + config.scene + "/", config.size ? config.size : 100, this.engine);
		this.system.write(this.engine);
		this.system.event.subscribe(item => this.systemEventHandler(item));
	}

	public systemEventHandler(item): void {
		this.nodes = [];
		this.nodes.push(this.system.rootNode);
		if (this.isModelServiceEventHandler && this.isEngineComponentEventHandler) {
			// TODO
		}
		this.isMergeEventHandler = true;
	}

	public treeInitializedEventHandler($event): void {
		if (this.system != null) {
			this.system.setTreeModel(this.treeComponent.treeModel);
		}
	}

	public formatVector(v: Vector3): string {
		return v == null ? "-" : "X: " + v.x.toFixed(3) + "  Y: " + v.y.toFixed(3) + "  Z: " + v.z.toFixed(3);
	}

	public treeFocusEventHandler($event): void {
		var meshNode: MeshNode = $event.node.data;
		var transformNode: TransformNode = this.system.select(meshNode);
		this.commandComponent.logMonitor.printMeshNode(transformNode, meshNode);
		this.name = transformNode.name;
		this.position = transformNode.position;
		this.rotation = transformNode.rotation;
		this.scaling = transformNode.scaling;
		this.local = meshNode.local.o;
		this.global = meshNode.global.o;
		this.minGlobal = meshNode.minGlobal;
		this.minLocal = meshNode.minLocal;
		this.maxGlobal = meshNode.maxGlobal;
		this.maxLocal = meshNode.maxLocal;
	}
}
