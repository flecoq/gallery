import { Vector3 } from "@babylonjs/core/Maths/math";
import { Component, OnInit, Output, EventEmitter, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { EngineService } from "../../engine/engine.service";
import { ModelService } from "../../service/model.service";
import { CommandContext } from './commandContext';
import { CommandArg } from './commandArg';
import { CommandInit } from './commandInit';
import { CommandParam } from './commandParam';
import { Command } from './command';
import { CommandLogMonitor } from './commandLogMonitor';
import { ProcessGroup } from '../../model/assembler/processGroup';
import { Process } from '../../model/assembler/process';
import { Creation } from '../../model/assembler/creation';
import { Room } from '../../model/room';
import { Param } from '../../model/assembler/param';
import { SceneImpl } from "../../process/scene/sceneImpl";
import { MergeObject } from "../../process/scene/mesh/mergeObject";
import { CompositeObject } from "../../process/scene/mesh/composite/compositeObject";
import { ChildObject } from "../../process/scene/mesh/composite/childObject";
import { Scene } from "../../model/assembler/scene";
import { CameraObject } from "../../process/scene/cameraObject";
import { LayerImpl } from "../../process/scene/utils/layerImpl";
import { SceneUtils } from "../../process/utils/sceneUtils";
import { Point } from '../../process/utils/point';
import { MeshObject } from "../../process/scene/mesh/meshObject";
import { Placeholder } from "../../process/scene/placeholder/placeholder";
import { SystemExplorerConfig } from '../system-explorer/systemExplorerConfig';
import { Logger } from '../../process/utils/logger';
//import { GLTF2Export } from "@babylonjs/serializers/glTF"

@Component({
	selector: 'app-command',
	templateUrl: './command.component.html',
	encapsulation: ViewEncapsulation.None
})
export class CommandComponent implements OnInit {

	@Output() public event: EventEmitter<string> = new EventEmitter();

	@ViewChild('logContainer') private logContainer: ElementRef;

	public logContainerStyle: string;

	public commandList: Command[] = [];
	public commandParamList: CommandParam[] = null;
	public commandRef: Command = new Command(null);
	public context: CommandContext;

	public cmdInput: string;
	public logMonitor: CommandLogMonitor = new CommandLogMonitor();
	public doBottomScroll: boolean = false;

	public histoList: string[] = [];
	public histoRange: number = -1;
	public paramRange: number = 0;
	
	constructor(public engine: EngineService, public modelService: ModelService) { }

	public updateLogContainerStyle(height: string): void {
		this.logContainerStyle = "height: " + height + "; background-color: #444; padding:4px; overflow: scroll";
	}

	public ngOnInit(): void {
		this.updateLogContainerStyle("760px");
		this.context = new CommandContext(this, this.engine, this.modelService);
		this.modelService.event.subscribe(item => this.modelServiceEventHandler(item));

		// load template
		this.modelService.getTemplateFromFile("template-room.json");
		this.modelService.getTemplateFromFile("material.json");
		//this.modelService.getTemplateFromFile("atelier.json");
		
		// command args
		this.commandRef = (new CommandInit()).getCommandRef();
		
		// command clear
		var cmd: Command = new Command("clear");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute clear");
			logger.clear();
			cmd.context.engine.clear();
			return true;
		};
		this.addCommand(cmd);

		// command watch
		cmd = new Command("w");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute watch");
			if (input.isOptionArg("ctx")) {
				logger.printRoom(cmd.context.room, 1);
				logger.printProcess(cmd.context.process, "-", 1);
				logger.alt("- scene:");
				logger.printScene(cmd.context.scene, "-", 2);
				if (cmd.context.child) {
					logger.alt("- child:");
					logger.printScene(cmd.context.child, "-", 2);
				}
				logger.alt("- param:");
				logger.printParam(cmd.context.param, "-");
			} else if (input.isOptionArg("cmd")) {
				for (let cmd of this.commandList) {
					logger.alt("- " + cmd.id);
					if (input.isOptionArg("all")) {
						cmd.help(logger);
					}
				}
			} else if (input.isOptionArg("r")) {
				logger.printRoom(cmd.context.room, 2);
			} else if (input.isOptionArg("pr")) {
				if (input.isOptionArg("list")) {
					var group: ProcessGroup = cmd.context.modelService.getProcessGroup();
					for (let process of group.Process) {
						logger.printProcess(process, "-", input.isOptionArg("all") ? 2 : 1);
					}
				} else {
					logger.printProcess(cmd.context.process, "-", input.isOptionArg("all") ? 3 : 2);
				}
			} else if (input.isOptionArg("c")) {
				if (input.isOptionArg("list")) {
					for (let cam of cmd.context.engine.sceneImplList) {
						if (cam.type === "camera") {
							logger.printScene(cam, "-", input.isOptionArg("all") ? 2 : 1);
						}
					}
				} else {
					logger.printScene(cmd.context.getCurrentCamera(), "-", 2);
				}
			} else if (input.isOptionArg("s")) {
				logger.printScene(cmd.context.scene, "-", 2);
			} else if (input.isOptionArg("ch")) {
				if (cmd.context.child) {
					logger.printScene(cmd.context.child, "-", 2);
				} else {
					logger.warn("no selected child");
				}
			} else if (input.isOptionArg("p")) {
				logger.printParam(cmd.context.param, "-");
			} else if (input.isOptionArg("histo")) {
				for (let cmd of this.histoList) {
					logger.info(cmd);
				}
			} else if (input.isOptionArg("db")) {
				var processId: string = input.getKeyArgValue("src");
				if (processId) {
					cmd.context.modelService.getProcess(processId);
				} else {
					logger.info("process id is required")
				}
			} else if (input.isOptionArg("t")) {
				for (let process of cmd.context.modelService.templateGroup.Process) {
					for (let scene of process.Scene) {
						logger.printScene(scene, "-", 1);
					}
				}
			} else if (input.isOptionArg("l") || input.getKeyArg("l")) {
				if (input.isOptionArg("list")) {
					for (let layer of cmd.context.engine.getAllLayerImpl()) {
						logger.printLayer(layer);
					}
				} else {
					if (cmd.context.layer) {
						logger.printLayer(cmd.context.layer);
					} else {
						logger.warn("no layer in context");
					}
				}
			} else if (input.isOptionArg("cr") || input.getKeyArg("cr")) {
				if (input.isOptionArg("list")) {
					for (let creation of cmd.context.room.CreationGroup.Creation) {
						logger.printCreation(creation, "-", 1);
					}
				} else {
					if (cmd.context.creation) {
						logger.printCreation(cmd.context.creation, "-", 2);
					} else {
						logger.warn("no creation in context");
					}
				}
			}
			var template: string = input.getKeyArgValue("t");
			if (template) {
				var scene: Scene = cmd.context.modelService.templateGroup.getTemplate(template);
				if (scene) {
					logger.printScene(scene, "-", 2);
				} else {
					logger.error("template '" + template + "' does not exist");
				}
			}
			return true;
		};
		cmd.appendHelpExample("-ctx", "show current process, scene, child & param");
		cmd.appendHelpExample("-histo", "show command histo");
		cmd.appendHelpExample("t:id", "show the template 'id'");
		cmd.appendHelpExample("-t", "show all templates (level 1)");
		cmd.appendHelpExample("-r", "show current room");
		cmd.appendHelpExample("-pr", "show current process (level 2)");
		cmd.appendHelpExample("-pr -all", "show current process (level 3)");
		cmd.appendHelpExample("-pr -list", "show all process (level 1)");
		cmd.appendHelpExample("-pr -list -all", "show all process (level 2)");
		cmd.appendHelpExample("-s", "show current scene (level 2)");
		cmd.appendHelpExample("-ch", "show current child (level 2)");
		cmd.appendHelpExample("-p", "show current param");
		cmd.appendHelpExample("-c", "show current cam");
		cmd.appendHelpExample("-c -list", "show all cams (level 1)");
		cmd.appendHelpExample("-c -list -all", "show all cams (level 2)");
		cmd.appendHelpExample("-db pr:id", "show process 'id' from database (level 3)");
		cmd.appendHelpExample("-l", "show current layer");
		cmd.appendHelpExample("l:name", "show layer 'name'");
		cmd.appendHelpExample("-l -list", "show all layers");
		cmd.appendHelpExample("cr:id", "show creation 'id'");
		cmd.appendHelpExample("-cr -list", "show all creations");
		this.addCommand(cmd);

		// command sel
		cmd = new Command("sel");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute sel");
			var sceneKey: CommandArg = input.getKeyArg("s");
			if (input.getKeyArg("pr") != null) {
				logger.printProcess(cmd.context.process, "-", sceneKey ? 1 : 2);
			}
			if (sceneKey != null) {
				logger.printScene(cmd.context.scene, "-", 2);
			}
			if (input.getKeyArg("ch") != null) {
				logger.printScene(cmd.context.child, "-", 2);
			}
			if (input.getKeyArg("p") != null) {
				logger.printParam(cmd.context.param, "-");
			}
			if (input.getKeyArg("l") != null) {
				logger.printLayer(cmd.context.layer);
			}
			var cam: string = input.getKeyArgValue("c");
			if (cam) {
				var cameraObject: CameraObject = cmd.context.getSceneImpl(null, cam) as CameraObject;
				cameraObject.write(cmd.context.engine);
				cmd.context.updateCurrentCamera(cameraObject);
			}
			return true;
		};
		cmd.appendHelpExample("pr:id", "select 'id' process");
		cmd.appendHelpExample("s:name", "select 'name' scene of current process");
		cmd.appendHelpExample("p:p1", "select 'p1' param of current scene or child");
		cmd.appendHelpExample("ch:ch1", "select 'ch1' child of current scene (ch1: child name or child range 0, 1, etc.)");
		cmd.appendHelpExample("pr:id s:name", "select 'name' scene of 'id' process");
		cmd.appendHelpExample("s:name p:p1", "select 'p1' param of 'name' scene of current process");
		cmd.appendHelpExample("s:name ch:ch1", "select 'ch1' child of 'name' scene of current process");
		cmd.appendHelpExample("pr:id s:name p:p1", "select 'p1' param of 'name' scene of 'id' process");
		cmd.appendHelpExample("c:name", "select 'name' camera");
		cmd.appendHelpExample("l:name", "select 'name' layer");
		this.addCommand(cmd);

		// command get
		cmd = new Command("get");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute get");
			var roomId: string = input.getKeyArgValue("r");
			if (roomId != null) {
				//cmd.context.engine.clear();
				cmd.context.modelService.getVisitRoom(roomId);
				if( input.getKeyArg("sp")) {
					cmd.context.modelService.spreedsheadProcessId = input.getKeyArgValue("sp");
					cmd.context.modelService.getSpreedsheat("gallery.csv");
				}
			}
			return true;
		};
		cmd.appendHelpExample("r:id", "load room 'id'");
		this.addCommand(cmd);

		// command set
		cmd = new Command("set");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute set");
			var value: string = input.getKeyArgValue("v");
			var name: string = input.getKeyArgValue("n");
			if (value != null) {
				cmd.context.param.value = value;
				cmd.context.param.used = false;
				logger.info("param " + cmd.context.param.name + " updated");
				logger.printScene(this.context.scene, "-", 2);
				cmd.context.scene.write(cmd.context.engine);
			} else if (input.isOptionArg("s") && name) {
				if (cmd.context.uncommitted) {
					cmd.context.scene.name = name;
					logger.printScene(this.context.scene, "-", 2);
				} else {
					logger.error("scene is already committed");
				}
			} else if (input.getKeyArg("asset")) {
				if (cmd.context.scene instanceof CompositeObject) {
					var assetChild: Scene = (cmd.context.scene as CompositeObject).getAssetChildObject();
					if (assetChild) {
						assetChild.addOrUpdateParam("asset", input.getKeyArgValue("asset"));
						cmd.context.rewriteScene();
						logger.printScene(this.context.scene, "-", 2);
					} else {
						logger.error("current scene has not asset object");
					}
				} else {
					logger.error("current scene is not a composite object");
				}
			}
			return true;
		};
		cmd.appendHelpExample("v:value", "update the current param value");
		cmd.appendHelpExample("pr:id s:name p:pname v:value", "update the param 'pname' value");
		cmd.appendHelpExample("-s n:name", "update the current scene name if uncommitted");
		cmd.appendHelpExample("asset:id", "update the asset of the current composite scene");
		this.addCommand(cmd);

		// command add
		cmd = new Command("add");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute add");
			if (input.isOptionArg("f")) {
				if (cmd.context.uncommitted) {
					logger.error("commit current scene is required");
					return true;
				}
				var name: string = input.getKeyArgValue("n");
				if (name) {
					var asset: string = input.getKeyArgValue("asset");
					if (asset) {
						if (cmd.context.room.getCreation(asset)) {
							var template: string = input.getKeyArgValue("t");
							if (template) {
								var width: number = input.getKeyArgFloat("width");
								if (width) {
									var scene: Scene = cmd.context.modelService.templateGroup.getTemplate(template);
									if (scene) {
										cmd.context.scene = SceneUtils.createSceneImplFromScene(scene.clone(), cmd.context.engine);
										cmd.context.scene.name = name;
										(cmd.context.scene as CompositeObject).widthToHeight(width, cmd.context.engine);
										var assetChild: Scene = (cmd.context.scene as CompositeObject).getAssetChildObject();
										if (assetChild) {
											assetChild.addOrUpdateParam("asset", asset);
											cmd.context.uncommitted = true;
											logger.warn("current scene is uncommitted");
											logger.printScene(this.context.scene, "-", 3);
										} else {
											logger.error("current scene has not asset object");
										}
									} else {
										logger.error("template '" + template + "' does not exist");
									}
								} else {
									logger.error("width is required");
								}
							} else {
								logger.error("template is required");
							}
						} else {
							logger.error("asset '" + asset + "' does not exist");
						}
					} else {
						logger.error("asset is required");
					}
				} else {
					logger.error("name is required");
				}
			} else if (input.isOptionArg("c")) {
				if (cmd.context.uncommitted) {
					logger.error("commit current scene is required");
					return true;
				}
				var name: string = input.getKeyArgValue("n");
				if (name) {
					cmd.context.scene = new CameraObject(cmd.context.getCurrentCamera().clone());
					cmd.context.scene.name = name;
					cmd.context.scene.process = cmd.context.process;
					cmd.context.uncommitted = true;
					logger.warn("current scene is uncommitted");
					logger.printScene(this.context.scene, "-", 2);
				} else {
					logger.error("name is required");
				}
			} else if (input.isOptionArg("s") || input.isOptionArg("ch")) {
				if (cmd.context.uncommitted) {
					logger.error("commit current scene is required");
					return true;
				}
				var name: string = input.getKeyArgValue("n");
				var create: string = input.getKeyArgValue("create");
				var type: string = input.getKeyArgValue("type");
				var template: string = input.getKeyArgValue("t");
				if (create != null) {
					cmd.context.scene = SceneUtils.createSceneImpl(name, create, type, cmd.context.engine);
					cmd.context.uncommitted = true;
					logger.warn("current scene is uncommitted");
					logger.printScene(this.context.scene, "-", 2);
				} else if (template) {
					var scene: Scene = cmd.context.modelService.templateGroup.getTemplate(template);
					if (scene) {
						cmd.context.scene = input.isOptionArg("ch") ? SceneUtils.getChildObject(scene.clone(), cmd.context.engine) : SceneUtils.createSceneImplFromScene(scene.clone(), cmd.context.engine);
						cmd.context.scene.name = name;
						cmd.context.uncommitted = true;
						logger.warn("current scene is uncommitted");
						//(cmd.context.scene as CompositeObject).widthToHeight(1.5, cmd.context.engine);
						logger.printScene(this.context.scene, "-", 3);
					} else {
						logger.error("template '" + template + "' does not exist");
					}
				} else {
					logger.error("create arg is required")
				}
			} else if (input.isOptionArg("r")) {
				var room: Room = new Room();
				room.parent = 1;
				room.content.addInfo("title", input.getKeyArgValue("title"));
				room.content.addInfo("description", input.getKeyArgValue("desc"));
				cmd.context.insertRoom(room);
			} else if (input.isOptionArg("pr")) {
				var process: Process = cmd.context.room.appendProcess();
				cmd.context.insertProcess(process);
			} else if (input.isOptionArg("l")) {
				var name: string = input.getKeyArgValue("n");
				if (name) {
					cmd.context.layer = LayerImpl.createLayerImpl(name);
					cmd.context.addSceneImpl(cmd.context.layer);
					logger.printLayer(cmd.context.layer);
				} else {
					logger.error("layer name is required");
				}
			} else if (input.isOptionArg("m")) {
				var name: string = input.getKeyArgValue("n");
				if (name) {
					var asset: string = input.getKeyArgValue("asset");
					var file: string = input.getKeyArgValue("file");
					var url: string = input.getKeyArgValue("url");
					cmd.context.scene = new MergeObject(Scene.create(name, "merge", ""));
					if (asset) {
						cmd.context.scene.addParam("creationId", asset, "true");
					} else if (file && url) {
						cmd.context.scene.addParam("filename", file, "true");
						cmd.context.scene.addParam("url", "account/account_1/object/" + url + "/", "true");
					} else {
						logger.error("asset or file & url required");
					}
					var scale: number = input.getKeyArgFloat("scale");
					if (scale) {
						cmd.context.scene.addParam("scale", scale + ";" + scale + ";" + scale, "true");
					} else {
						cmd.context.scene.addParam("scale", "1;1;1", "true");
					}
					cmd.context.uncommitted = true;
					logger.warn("current scene is uncommitted");
					logger.printScene(cmd.context.scene, "-", 2);
				} else {
					logger.error("scene name is required");
				}
			} else if (input.isOptionArg("cr")) {
				var id: string = input.getKeyArgValue("id");
				if (id) {
					var file: string = input.getKeyArgValue("file");
					if (file) {
						var size: Point = input.getKeyArgPoint("size");
						if (size) {
							var type:string = input.getKeyArgValue("type");
							type = type ? type : "picture";
							var creation: Creation = Creation.createCreation(id, "account/account_1/" + file, size.x + ";" + size.y, type);
							cmd.context.addCreation(creation);
							logger.printCreation(creation, "-", 2);
						} else {
							logger.error("size is required");
						}
					} else {
						logger.error("file is required");
					}
				} else {
					logger.error("id is required");
				}
			}
			return true;
		};
		cmd.appendHelpExample("-s n:name create:box", "add uncommitted scene");
		cmd.appendHelpExample("-s n:name create:box type:object|camera", "add uncommitted scene");
		cmd.appendHelpExample("-s n:name t:template", "add uncommitted scene from template");
		cmd.appendHelpExample("-ch n:name t:template", "add uncommitted child from template");
		cmd.appendHelpExample("-r", "add & persist a room");
		cmd.appendHelpExample("-pr", "add & persist a process");
		cmd.appendHelpExample("-l n:name", "add a layer with 'name'");
		cmd.appendHelpExample("-cr id:id file:filename size:1920;1080 type:video|picture", "add a creation");
		cmd.appendHelpExample("-f n:name asset:creation_id t:template_id width:1.5", "add a frame");
		cmd.appendHelpExample("-m n:name asset:creation_id scale:0.1", "add a merge object");
		cmd.appendHelpExample("-m n:name file:filename url:url scale:0.1", "add a merge object");
		this.addCommand(cmd);

		// command commit
		cmd = new Command("cmt");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute commit");
			if (input.isOptionArg("s")) {
				if (cmd.context.uncommitted) {
					var scene: SceneImpl = cmd.context.scene;
					cmd.context.uncommitted = false;
					if (!scene.isMaterialParam()) {
						scene.addParam("material.type", "standard", null);
					}
					scene.write(cmd.context.engine);
					cmd.context.addSceneImpl(scene);
					logger.printScene(scene, "-", 3);
				} else {
					logger.error("no scene to commit")
				}
			} else if (input.isOptionArg("ch")) {
				if (cmd.context.uncommitted) {
					var child: SceneImpl = cmd.context.scene;
					var scene: SceneImpl = cmd.context.parent;
					(child as ChildObject).parent = scene as CompositeObject;
					scene.addScene(child.toScene());
					cmd.context.uncommitted = false;
					scene.write(cmd.context.engine);
					logger.printScene(scene, "-", 3);
				} else {
					logger.error("no scene to commit")
				}
			} else if (input.isOptionArg("c")) {
				if (cmd.context.uncommitted) {
					var scene: SceneImpl = cmd.context.scene;
					cmd.context.uncommitted = false;
					scene.write(cmd.context.engine);
					cmd.context.addSceneImpl(scene);
					cmd.context.updateCurrentCamera(scene as CameraObject);
					logger.printScene(scene, "-", 2);
				} else {
					logger.error("no scene to commit")
				}
			} else if (input.isOptionArg("reset")) {
				cmd.context.uncommitted = false;
			}
			return true;
		};
		cmd.appendHelpExample("-s", "commit added scene");
		this.addCommand(cmd);

		// command cam
		cmd = new Command("cam");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute cam");
			if (input.isOptionArg("upt")) {
				(cmd.context.getCurrentCamera() as CameraObject).readTransformParam(this.engine);
				logger.printScene(cmd.context.getCurrentCamera(), "-", 2);
			} else if (input.getKeyArg("focus")) {
				var scene: SceneImpl = cmd.context.getSceneImpl(null, input.getKeyArgValue("focus"));
				if (scene) {
					cmd.context.engine.sceneImplFocus(scene);
				} else {
					logger.error("scene does not exist");
				}
			}
			return true;
		};
		cmd.appendHelpExample("-upt", "update current cam (pos & target)");
		this.addCommand(cmd);

		// command perist
		cmd = new Command("persist");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute perist");
			if (input.isOptionArg("pr")) {
				cmd.context.persistProcess();
			} else if (input.isOptionArg("r")) {
				cmd.context.persistRoom();
			} else if (input.isOptionArg("cr")) {
				cmd.context.persistCreationGroup();
			}
			return true;
		};
		cmd.appendHelpExample("-pr", "persist current process");
		cmd.appendHelpExample("-r", "persist current room (process group & creation group)");
		cmd.appendHelpExample("-cr", "persist current creation group");
		this.addCommand(cmd);

		// command copy
		cmd = new Command("cp");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute cp");
			if (input.isOptionArg("pr")) {
				var processId: string = input.getKeyArgValue("src");
				if (processId) {
					cmd.context.doCopyProcess = true;
					cmd.context.modelService.getProcess(processId);
				}
			} else if (input.isOptionArg("s") || input.getKeyArg("s")) {
				var name: string = input.getKeyArgValue("rn");
				if (name) {
					var scene: SceneImpl = SceneUtils.createSceneImplFromScene(this.context.scene.clone(), cmd.context.engine);
					scene.name = name;
					if (input.getKeyArg("tr")) {
						scene.translate(input.getKeyArgVector("tr"));
					}
					if (input.getKeyArg("rot")) {
						scene.rotate(input.getKeyArgVector("rot"));
					}
					if (input.getKeyArg("rct")) {
						scene.rotateCenter(input.getKeyArgVector("rct"));
					}
					if (input.getKeyArg("w")) {
						var wall: SceneImpl = cmd.context.engine.getSceneImpl(input.getKeyArgValue("w"));
						if (wall) {
							var placeholder: Placeholder;
							if (input.getOptionArg("center")) {
								placeholder = new Placeholder((wall as MeshObject).localToGlobalPivot(0, 0.5, 0.5), 0, null, cmd.context.engine);
							} else if (input.getKeyArg("local")) {
								var local: Point = input.getKeyArgPoint("local");
								placeholder = new Placeholder((wall as MeshObject).localToGlobalPivot(0, local.y, local.x), 0, null, cmd.context.engine);
							}
							scene.fromPlaceholder(placeholder, cmd.context.engine);
						} else {
							logger.error("wall does not exist");
						}
					}
					scene.write(cmd.context.engine);
					cmd.context.scene = scene;
					cmd.context.addSceneImpl(scene);
					logger.printScene(scene, "-", 2);
				} else {
					logger.error("rn argument is required")
				}
			} else if (input.isOptionArg("ch") || input.getKeyArg("ch")) {
				var name: string = input.getKeyArgValue("rn");
				if (name) {
					var child: SceneImpl = this.context.child.clone();
					child.name = name;
					var scene: SceneImpl = cmd.context.scene;
					scene.addScene(child.toScene());
					scene.write(cmd.context.engine);
					cmd.context.child = child;
					logger.printScene(scene, "-", 2);
				} else {
					logger.error("rn argument is required")
				}
			} else if (input.isOptionArg("l") || input.getKeyArg("l")) {
				if (cmd.context.layer == null) {
					logger.error("no context layer");
					return true;
				}
				var rename: string = input.getKeyArgValue("rn");
				var names: string[] = rename ? rename.split(";") : null;
				var prefix: string = input.getKeyArgValue("pf");
				var suffix: string = input.getKeyArgValue("sf");
				if (rename || prefix || suffix) {
					var u: number = 0;
					var layer: LayerImpl = LayerImpl.createLayerImpl(prefix ? prefix + cmd.context.layer.name : suffix ? cmd.context.layer.name + suffix : names[u++]);
					cmd.context.addSceneImpl(layer);
					for (let child of cmd.context.layer.children) {
						var scene: SceneImpl = SceneUtils.createSceneImplFromScene(child.clone(), cmd.context.engine);
						scene.name = prefix ? prefix + child.name : suffix ? child.name + suffix : names[u++];
						if (input.getKeyArg("tr")) {
							scene.translate(input.getKeyArgVector("tr"));
						}
						if (input.getKeyArg("rot")) {
							scene.rotate(input.getKeyArgVector("rot"));
						}
						if (input.getKeyArg("rct")) {
							scene.rotateCenter(input.getKeyArgVector("rct"));
						}
						scene.write(cmd.context.engine);
						cmd.context.scene = scene;
						cmd.context.addSceneImpl(scene);
						layer.push(scene.name);
						logger.printScene(scene, "-", 2);
					}
					cmd.context.layer = layer;
					logger.printLayer(cmd.context.layer);
				} else {
					logger.error("rn, pf or sf argument is required")
				}
			}
			return true;
		};
		cmd.appendHelpExample("-pr src:id", "copy & persist process 'id' into the current room");
		cmd.appendHelpExample("s:name rn:new", "copy & persist scene 'name' with rn as new name");
		cmd.appendHelpExample("-s rn:name", "copy & persist current scene with rn as new name");
		cmd.appendHelpExample("-s rn:name tr:1;0;0", "copy, translate & commit current scene with rn as new name");
		cmd.appendHelpExample("-s rn:name rot:0;45;0", "copy, rotate & commit current scene");
		cmd.appendHelpExample("-s rn:name rct:1;45;0", "copy, rotate arround center & commit current scene");
		cmd.appendHelpExample("-s rn:name w:wall1 -center", "copy, place & commit current scene");
		cmd.appendHelpExample("ch:name rn:new", "copy & persist child 'name' with rn as new name");
		cmd.appendHelpExample("-ch rn:new", "copy & persist current child with rn as new name");
		cmd.appendHelpExample("-l sf:top", "copy layer scenes with name suffixed");
		cmd.appendHelpExample("-l pf:top", "copy layer scenes with name prefixed");
		cmd.appendHelpExample("-l pf:top tr:1;0;0", "copy & translate layer scenes with name prefixed");
		cmd.appendHelpExample("-l pf:top rot:0;45;0", "copy & rotate layer scenes with name prefixed");
		cmd.appendHelpExample("-l pf:top rct:1;45;0", "copy & rotate around center layer scenes with name prefixed");
		this.addCommand(cmd);

		// command remove
		cmd = new Command("rm");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute rm");
			if (input.isOptionArg("s")) {
				if (cmd.context.uncommitted) {
					cmd.context.uncommitted = false;
				} else {
					cmd.context.scene.delete(cmd.context.engine);
				}
				cmd.context.updateScene();
				logger.printProcess(cmd.context.process, "- ", 2);
			} else if (input.getKeyArgValue("s")) {
				cmd.context.scene.delete(cmd.context.engine);
				cmd.context.updateScene();
				logger.printProcess(cmd.context.process, "- ", 2);
			} else if (input.isOptionArg("ch") || input.getKeyArgValue("ch")) {
				cmd.context.scene.deleteScene(input.getKeyArgValue("ch"));
				if (!cmd.context.uncommitted) {
					cmd.context.scene.write(cmd.context.engine);
				}
				logger.printScene(cmd.context.scene, "- ", 2);
			} else if (input.isOptionArg("p") || input.getKeyArgValue("p")) {
				cmd.context.getCurrentScene().deleteParam(input.getKeyArgValue("p"));
				if (!cmd.context.uncommitted) {
					cmd.context.scene.write(cmd.context.engine);
				}
				logger.printScene(cmd.context.scene, "- ", 2);
			} else if (input.isOptionArg("l") || input.getKeyArgValue("l")) {
				cmd.context.layer.delete(cmd.context.engine);
				cmd.context.layer = null;
			}
			return true;
		};
		cmd.appendHelpExample("-s", "remove current scene");
		cmd.appendHelpExample("s:name", "remove scene 'name'");
		cmd.appendHelpExample("-ch", "remove current child");
		cmd.appendHelpExample("ch:name", "remove child 'name'");
		cmd.appendHelpExample("-p", "remove current param");
		cmd.appendHelpExample("p:name", "remove param 'name'");
		this.addCommand(cmd);

		// command layer
		cmd = new Command("layer");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute layer");
			if (cmd.context.layer == null) {
				logger.error("no layer in context");
				return true
			}
			if (input.getKeyArg("push")) {
				for (let name of input.getKeyArgValue("push").split(";")) {
					if (cmd.context.getSceneImpl(null, name)) {
						cmd.context.layer.push(name);
					} else {
						logger.error("scene '" + name + "' does not exist");
					}
				}
				cmd.context.layer.updateChildren(cmd.context.engine, logger);
			}
			if (input.getKeyArg("pull")) {
				for (let name of input.getKeyArgValue("pull").split(";")) {
					cmd.context.layer.pull(name);
				}
				cmd.context.layer.updateChildren(cmd.context.engine, logger);
			}
			return true;
		};
		cmd.appendHelpExample("push:name1;name2", "push scenes");
		cmd.appendHelpExample("pull:name1;name2", "push scenes");
		cmd.appendHelpExample("-clear", "clear the layer");
		this.addCommand(cmd);

		// command translate
		cmd = new Command("tr");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute tr");
			var vector: Vector3 = null;
			if (input.getKeyArg("v")) {
				vector = input.getKeyArgVector("v");
				if (vector == null) {
					logger.error("vector bad format")
				}
			} else if (input.getKeyArg("x")) {
				var value: number = input.getKeyArgFloat("x");
				if (value) {
					vector = new Vector3(value, 0, 0);
				} else {
					logger.error("x bad format")
				}
			} else if (input.getKeyArg("y")) {
				var value: number = input.getKeyArgFloat("y");
				if (value) {
					vector = new Vector3(0, value, 0);
				} else {
					logger.error("y bad format")
				}
			} else if (input.getKeyArg("z")) {
				var value: number = input.getKeyArgFloat("z");
				if (value) {
					vector = new Vector3(0, 0, value);
				} else {
					logger.error("z bad format")
				}
			}
			if (input.isOptionArg("s") || input.getKeyArgValue("s")) {
				cmd.context.scene.translate(vector);
				cmd.context.rewriteScene();
				logger.printScene(cmd.context.scene, "- ", 2);
			}
			if (input.isOptionArg("l") || input.getKeyArgValue("l")) {
				if (cmd.context.layer == null) {
					logger.error("no context layer");
				} else {
					cmd.context.layer.updateChildren(cmd.context.engine, logger);
					for (let child of cmd.context.layer.children) {
						child.translate(vector);
						child.write(cmd.context.engine);
						logger.printScene(child, "- ", 2);
					}
				}
			}
			return true;
		};
		cmd.appendHelpExample("-s v:1;1.5;0", "translate current scene");
		cmd.appendHelpExample("s:name v:1;1.5;0", "translate scene 'name'");
		cmd.appendHelpExample("-s x:1.5", "x translate current scene (or y, z)");
		cmd.appendHelpExample("s:id x:1.5", "x translate scene 'id' (or y, z)");
		cmd.appendHelpExample("-l v:10;0;0", "translate current layer");
		cmd.appendHelpExample("l:name v:0;15;0", "translate layer 'name'");
		this.addCommand(cmd);

		// command rotate
		cmd = new Command("rot");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute rot");
			var vector: Vector3 = null;
			var isCenter: boolean = false;
			if (input.getKeyArg("v")) {
				vector = input.getKeyArgVector("v");
				if (vector == null) {
					logger.error("vector bad format")
				}
			} else if (input.getKeyArg("x")) {
				var value: number = input.getKeyArgFloat("x");
				if (value) {
					vector = new Vector3(value, 0, 0);
				} else {
					logger.error("x bad format")
				}
			} else if (input.getKeyArg("y")) {
				var value: number = input.getKeyArgFloat("y");
				if (value) {
					var center: Point = input.getKeyArgPoint("ct");
					if (center) {
						isCenter = true;
						vector = new Vector3(center.x, value, center.y);
					} else {
						vector = new Vector3(0, value, 0);
					}
				} else {
					logger.error("y bad format")
				}
			} else if (input.getKeyArg("z")) {
				var value: number = input.getKeyArgFloat("z");
				if (value) {
					vector = new Vector3(0, 0, value);
				} else {
					logger.error("z bad format")
				}
			}
			if (input.isOptionArg("s") || input.getKeyArgValue("s")) {
				if (isCenter) {
					cmd.context.scene.rotateCenter(vector);
				} else {
					cmd.context.scene.rotate(vector);
				}
				cmd.context.rewriteScene();
				logger.printScene(cmd.context.scene, "- ", 2);
			}
			if (input.isOptionArg("l") || input.getKeyArgValue("l")) {
				if (cmd.context.layer == null) {
					logger.error("no context layer");
				} else {
					cmd.context.layer.updateChildren(cmd.context.engine, logger);
					for (let child of cmd.context.layer.children) {
						if (isCenter) {
							child.rotateCenter(vector);
						} else {
							child.rotate(vector);
						}
						child.write(cmd.context.engine);
						logger.printScene(child, "- ", 2);
					}
				}
			}
			return true;
		};
		cmd.appendHelpExample("-s v:10;0;0", "rotate current scene");
		cmd.appendHelpExample("s:name v:0;15;0", "rotate scene 'name'");
		cmd.appendHelpExample("-s y:30", "y rotate current scene (or x, z)");
		cmd.appendHelpExample("-s y:30 ct:3;3", "y rotate current scene around center {x,z}");
		cmd.appendHelpExample("s:id y:30", "y rotate scene 'id' (or x, z)");
		cmd.appendHelpExample("-l v:10;0;0", "rotate current layer");
		cmd.appendHelpExample("l:name v:0;15;0", "rotate layer 'name'");
		this.addCommand(cmd);

		// command place
		cmd = new Command("place");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute place");
			if (cmd.context.scene) {
				var wall: SceneImpl = cmd.context.engine.getSceneImpl(input.getKeyArgValue("w"));
				if (wall) {
					var placeholder: Placeholder;
					if (input.getOptionArg("center")) {
						placeholder = new Placeholder((wall as MeshObject).localToGlobalPivot(0, 0.5, 0.5), 0, null, cmd.context.engine);
					} else if (input.getKeyArg("local")) {
						var local: Point = input.getKeyArgPoint("local");
						placeholder = new Placeholder((wall as MeshObject).localToGlobalPivot(0, local.y, local.x), 0, null, cmd.context.engine);
					}
					cmd.context.scene.fromPlaceholder(placeholder, cmd.context.engine);
					if (!cmd.context.uncommitted) {
						cmd.context.rewriteScene();
					}
					logger.printScene(cmd.context.scene, "- ", 2);
				} else {
					logger.error("wall does not exist");
				}
			}
			return true;
		};
		cmd.appendHelpExample("wall:name -center", "place the current scene on the center of the wall 'name'");
		cmd.appendHelpExample("wall:name local:0.3;0.5", "place locally the current scene on the wall 'name'");
		cmd.appendHelpExample("s:s1 wall:w1 -center", "place the scene 's1' on the center of the wall 'w1'");
		this.addCommand(cmd);

		// command explore
		cmd = new Command("exp");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute explore");
			if (input.getKeyArg("url")) {
				var config: SystemExplorerConfig = new SystemExplorerConfig(input.getKeyArg("dist") ? input.getKeyArgFloat("dist") : 1500, input.getKeyArgFloat("size"), null);
				config.url = "account/account_1/object/" + input.getKeyArgValue("url") + "/";
				config.filename = input.getKeyArgValue("file");
				cmd.context.emit(config);
				cmd.context.component.updateLogContainerStyle("400px");
			} else {
				// TODO				
			}
			return true;
		};
		cmd.appendHelpExample("s:name", "explore merge scene");
		cmd.appendHelpExample("asset:id", "explore creation object");
		cmd.appendHelpExample("url:url file:file dist:1500", "explore object");
		this.addCommand(cmd);

		// command export
		cmd = new Command("export");
		cmd.execution = (cmd: Command, input: Command, logger: CommandLogMonitor) => {
			console.log("execute export");
			/*GLTF2Export.GLBAsync(cmd.context.engine.scene, "fileName").then((glb) => {
				glb.downloadFiles();
			}); */
			return true;
		};
		cmd.appendHelpExample("", "gltf export");
		this.addCommand(cmd);

		this.event.emit("initialized");
	}

	private addCommand(cmd: Command): void {
		cmd.context = this.context;
		this.commandList.push(cmd);
	}

	public onCmdInputEnter(): void {
		this.histoList.push(this.cmdInput);
		this.histoRange = this.histoList.length;
		if (!this.context.room && this.cmdInput.indexOf("get r:") != 0
			&& this.cmdInput.indexOf("exp") != 0) {
			this.logMonitor.append("-> " + this.cmdInput, "cmd");
			this.logMonitor.error("no context room");
		} else if (!this.inputParamExecution(this.cmdInput)) {
			// execute command
			var input: Command = Command.parse(this.cmdInput, this.logMonitor);
			if (this.commandRef.checkArgList(input.argList, this.logMonitor)) {
				var noCmd: boolean = true;
				for (let cmd of this.commandList) {
					if (cmd.id === input.id) {
						noCmd = false;
						this.updateContext(input);
						if (input.isOptionArg("h")) {
							cmd.help(this.logMonitor);
						} else {
							cmd.execution(cmd, input, this.logMonitor);
						}
					}
				}
				if (noCmd) {
					this.logMonitor.error("'" + input.id + "' undefined command");
				}
			}
		}
		this.cmdInput = "";
		this.doBottomScroll = true;
	}

	public inputParamExecution(input: string): boolean {
		var args: string[] = input.split(":");
		if (args.length == 2 && args[0].indexOf(" ") < 0) {
			if (args[0] === "t") {
				var scene: Scene = this.context.modelService.templateGroup.getTemplate(args[1]);
				if (scene) {
					var paramAdded: string = "";
					var paramUpdated: string = "";
					for (let param of scene.Param) {
						var existing: Param = this.context.getCurrentScene().getParam(param.name);
						if (existing != null) {
							existing.value = param.value;
							paramUpdated += param.name + " ";
						} else {
							this.context.getCurrentScene().addParam(param.name, param.value, null);
							paramAdded += param.name + " ";
						}
					}
					this.logMonitor.append("-> params " + paramAdded + " added", "cmd");
					this.logMonitor.append("-> params " + paramUpdated + " updated", "cmd");
					this.logMonitor.printScene(this.context.getCurrentScene(), "-", 2);
				} else {
					this.logMonitor.error("template '" + args[1] + "' does not exist");
				}
			} else if (this.checkCommandParam(args[0], args[1])) {
				var param: Param = this.context.getCurrentScene().getParam(args[0]);
				if (param != null) {
					param.value = args[1];
					param.used = false;
					this.logMonitor.append("-> param " + input + " updated", "cmd");
				} else {
					this.context.getCurrentScene().addParam(args[0], args[1], null);
					this.logMonitor.append("-> param " + input + " added", "cmd");
				}
				this.logMonitor.printScene(this.context.getCurrentScene(), "-", 2);
			}
			if (!this.context.uncommitted) {
				this.context.scene.write(this.context.engine);
			}
			return true;
		}
		return false;
	}

	private updateContext(input: Command): void {
		var processId: string = input.getKeyArgValue("pr");
		var sceneName: string = input.getKeyArgValue("s");
		if (processId != null && sceneName == null) {
			this.context.getProcess(processId);
			this.context.updateScene();
			this.context.child = null;
			this.context.updateParam();
			this.paramRange = 0;
		} else if (processId != null || sceneName != null) {
			var sceneImpl: SceneImpl = this.context.getSceneImpl(processId == null ? this.context.process.id : processId, sceneName);
			if (sceneImpl == null) {
				this.logMonitor.error("Scene '" + sceneName + "' does not exist.")
			} else {
				this.context.scene = sceneImpl;
				this.context.parent = sceneImpl;
				this.context.process = sceneImpl.process;
				this.context.child = null;
				this.context.updateParam();
				this.paramRange = 0;
			}
		}
		var childName: string = input.getKeyArgValue("ch");
		if (childName != null) {
			var child: SceneImpl = this.context.scene.getScene(childName) as SceneImpl;
			if (child == null) {
				this.logMonitor.error("Child '" + childName + "' does not exist.")
			} else {
				this.context.child = child;
				this.context.updateParam();
			}
		}
		var paramName: string = input.getKeyArgValue("p");
		if (paramName != null) {
			var param: Param = this.context.getCurrentScene().getParam(paramName);
			if (param == null) {
				this.logMonitor.error("Param '" + paramName + "' does not exist.")
			} else {
				this.context.param = param;
			}
		}
		var layerName: string = input.getKeyArgValue("l");
		if (layerName) {
			var layer: LayerImpl = this.context.engine.getLayerImpl(layerName);
			if (layer) {
				this.context.layer = layer;
			} else {
				this.logMonitor.error("Layer '" + layerName + "' does not exist.")
			}
		}
		var creationId: string = input.getKeyArgValue("cr");
		if (creationId) {
			var creation: Creation = this.context.room.getCreation(creationId);
			if (creation) {
				this.context.creation = creation;
			} else {
				this.logMonitor.error("Creation '" + creationId + "' does not exist.")
			}
		}
	}

	public onKeydown(event): void {
		if (event.key === "ArrowUp" && this.histoRange > 0) {
			this.histoRange--;
			this.cmdInput = this.histoList[this.histoRange];
		} else if (event.key === "ArrowDown" && this.histoRange < this.histoList.length - 1) {
			this.histoRange++;
			this.cmdInput = this.histoList[this.histoRange];
		} else if (!(event.key === "ArrowUp") && !(event.key === "ArrowDown")) {
			this.histoRange = this.histoList.length;
		}
		if (event.key === "PageDown") {
			var scene: SceneImpl = this.context.getCurrentScene();
			if (scene.Param.length > 0) {
				var param: Param = scene.Param[this.paramRange];
				this.cmdInput = param.name + ":" + param.value;
				this.paramRange = this.paramRange == scene.Param.length - 1 ? 0 : this.paramRange + 1;
			}
		} else if (event.key === "PageUp") {
			var scene: SceneImpl = this.context.getCurrentScene();
			if (scene.Param.length > 0) {
				var param: Param = scene.Param[this.paramRange];
				this.cmdInput = param.name + ":" + param.value;
				this.paramRange = this.paramRange == 0 ? scene.Param.length - 1 : this.paramRange - 1;
			}
		}
	}

	private checkCommandParam(name: string, value: string): boolean {
		if (this.commandParamList == null) {
			this.commandParamList = (new CommandInit()).getCommandParamList();
		}
		for (let commandParam of this.commandParamList) {
			if (commandParam.name === name) {
				if (!commandParam.checkFormat(value)) {
					this.logMonitor.append("-> param " + name + ":" + value, "cmd");
					this.logMonitor.error("format '" + commandParam.format + "' is required for param '" + commandParam.name + "'");
					return false;
				} else {
					return true;
				}
			}
		}
		this.logMonitor.warn("param " + name + " is not referenced");
		return true;
	}

	public modelServiceEventHandler(item) {
		if (item === "getProcess") {
			Logger.info("CommandeComponent", "modelServiceEventHandler() -> process loaded");
			if (this.context.doCopyProcess) {
				this.context.copyProcess();
			} else {
				this.logMonitor.printProcess(this.context.modelService.process, "- ", 3);
			}
		} else if (item === "updateProcess") {
			Logger.info("CommandeComponent", "modelServiceEventHandler() -> process updated");
			this.logMonitor.printProcess(this.context.process, "- ", 2);
		}
	}

	public ngAfterViewChecked() {
		if (this.doBottomScroll) {
			this.logContainer.nativeElement.scrollTop = this.logContainer.nativeElement.scrollHeight;
			this.doBottomScroll = false;
		}
	}

}
