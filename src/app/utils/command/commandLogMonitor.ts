import { CommandLogMessage } from './commandLogMessage';
import { Room } from '../../model/room';
import { Process } from '../../model/assembler/process';
import { Creation } from '../../model/assembler/creation';
import { Scene } from '../../model/assembler/scene';
import { Param } from '../../model/assembler/param';
import { LayerImpl } from "../../process/scene/utils/layerImpl";
import { MeshNode } from '../system-explorer/tree/MeshNode';
import { TransformNode, Vector3 } from "@babylonjs/core";
import { FormatUtils } from '../../process/utils/formatUtils';

export class CommandLogMonitor {

	public logs: CommandLogMessage[] = [];

	public append(message: string, type: string): void {
		this.logs.push(new CommandLogMessage(message, type));
	}

	public info(message: string): void {
		this.append(message, "info");
	}

	public cmd(message: string): void {
		this.append(message, "cmd");
	}

	public alt(message: string): void {
		this.append(message, "alt");
	}

	public help(message: string): void {
		this.append(message, "help");
	}

	public error(message: string): void {
		this.append(message, "error");
	}

	public warn(message: string): void {
		this.append(message, "warn");
	}

	public clear(): void {
		this.logs = [];
	}

	public printRoom(room: Room, level: number): void {
		var message: string = "Room";
		message += " id='" + room.id + "'";
		this.info(message);
		if (level >= 2) {
			for (let info of room.content.Info) {
				this.info("- " + info.name + ": " + info.value);
			}
		}
	}

	public printProcess(process: Process, prefix: string, level: number): void {
		if (process) {
			var message: string = prefix + " Process";
			message += " id='" + process.id + "'";
			message += process.type == null ? "" : " type='" + process.type + "'";
			this.info(message);
			if (level >= 2) {
				for (let scene of process.Scene) {
					this.printScene(scene, prefix + "-", level - 1);
				}
			}
		} else {
			this.warn("no process");
		}
	}

	public printCreation(creation: Creation, prefix: string, level: number): void {
		var message: string = prefix + " Creation";
		message += " id='" + creation.id + "'";
		message += " filename='" + creation.filename + "'";
		this.info(message);
		if (level >= 2) {
			for (let info of creation.Info) {
				message = prefix + "- " + "Info";
				message += " name='" + info.name + "'";
				message += " value='" + info.value + "'";
				this.info(message);
			}
		}
	}

	public printScene(scene: Scene, prefix: string, level: number): void {
		if (scene) {
			var message: string = prefix + " " + scene.type.charAt(0).toUpperCase() + scene.type.slice(1);
			message += " name='" + (scene.name == null ? "" : scene.name) + "'";
			message += scene.create == null ? "" : " create='" + scene.create + "'";
			message += scene.active == null ? "" : " active='" + scene.active + "'";
			this.info(message);
			if (level >= 2) {
				for (let param of scene.Param) {
					this.printParam(param, prefix + "-");
				}
				for (let child of scene.Scene) {
					this.printScene(child, prefix + "-", level);
				}
			}
		} else {
			this.warn("no scene");
		}
	}

	public printParam(param: Param, prefix: string): void {
		if (param) {
			var message: string = prefix + " " + "Param";
			message += " name='" + param.name + "'";
			message += " value='" + param.value + "'";
			this.info(message);
		} else {
			this.warn("no param");
		}
	}

	public printLayer(layer: LayerImpl): void {
		this.info("Layer " + layer.name + ": " + (layer.param.value ? layer.param.value : "empty"));
	}
	
	public formatVector(v: Vector3): string {
		return v == null ? "-" : "X: " + v.x.toFixed(3) + "  Y: " + v.y.toFixed(3) + "  Z: " + v.z.toFixed(3);
	}


	public printMeshNode(transformNode: TransformNode, meshNode: MeshNode): void {
		this.alt("Select mesh '" + transformNode.name + "':");
		this.info("-Local: " + FormatUtils.vectorToLog(meshNode.local.o));
		this.info("-Global: " + FormatUtils.vectorToLog(meshNode.global.o));		
		this.info("-minGlobal: " + FormatUtils.vectorToLog(meshNode.minGlobal));		
		this.info("-maxGlobal: " + FormatUtils.vectorToLog(meshNode.maxGlobal));		
	}

}