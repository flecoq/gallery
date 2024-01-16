import { Injectable, EventEmitter } from '@angular/core';
import { Http, } from '@angular/http';
import { timer } from 'rxjs';

import { CreationGroup } from '../model/assembler/creationGroup';
import { Creation } from '../model/assembler/creation';
import { ProcessGroup } from '../model/assembler/processGroup';
import { Room } from '../model/room';
import { Scene } from '../model/assembler/scene';
import { Process } from '../model/assembler/process';
import { Library } from '../model/library';
import { Account } from '../model/account';
import { FileHolder } from '../editor/uploader/file-holder';
import { SnapshotServer } from '../model/server/snapshotServer';
import { ParamUtils } from '../process/utils/paramUtils';
import { FormatUtils } from '../process/utils/formatUtils';
import { Logger } from '../process/utils/logger';
import { UploaderComponent } from '../editor/uploader/uploader.component';
import { Spreedsheat } from '../model/spreedsheat/spreedsheat';

@Injectable()
export class ModelService {

	public library: Library = null;
	public account: Account;
	public room: Room = new Room(); // current room

	public doPersistCreation: boolean = false;
	private doPersistProcessList: Process[] = [];
	public doRoomExecute: boolean;

	//private serverUrl: string = 'http://localhost:81/assembler/';
	private serverUrl: string = './assembler/';
	public event: EventEmitter<string> = new EventEmitter();
	
	public process: Process;	// from file, used for viewer
	public templateGroup: ProcessGroup = new ProcessGroup();	// from files, used for commands

	public spreedsheat:Spreedsheat;
	public spreedsheadProcessId:string = null;


	constructor(private _http: Http) {
		var source = timer(0, 3000);
		source.subscribe(val => this.timerHandler());
		ParamUtils.modelService = this;
	}

	private timerHandler() {
		if (this.doPersistCreation) {
			this.updateCreationGroup();
			this.doPersistCreation = false;
		}
		for (let process of this.doPersistProcessList) {
			this.updateProcess(process);
		}
		this.doPersistProcessList = [];
	}

	public addPersistProcess(process: Process): void {
		for (let existing of this.doPersistProcessList) {
			if (existing.id === process.id) {
				return;
			}
		}
		this.doPersistProcessList.push(process);
	}

	public getCreationGroup(): CreationGroup {
		// return this.room.CreationGroup; // DEPRECATED
		return this.account.CreationGroup;
	}

	public getCreation(id: string): Creation {
		var result: Creation = result = this.room.getCreation(id);
		if (result == null) {
			result = this.library.getCreation(id);
		}
		return result;
	}

	public getProcessGroup(): ProcessGroup {
		return this.room.ProcessGroup;
	}

	public getProcessFromFile(file: string): void {
		this._http.post(this.serverUrl + file, {})
			.subscribe(res => {
				Logger.info("ModelService", "getProcessFromFile() -> res");
				Logger.debug("getProcessFromFile", res);
				this.process = new Process();
				this.process.createFromJson(res.json());
				this.event.emit("getProcess");
			});
	}

	public getSpreedsheat(file: string): void {
		this._http.post(this.serverUrl + "spreedsheat/" + file, {})
			.subscribe(res => {
				Logger.info("ModelService", "getSpreedsheat() -> res");
				Logger.debug("getTemplateFromFile", res);
				this.spreedsheat= new Spreedsheat(res.text());
				this.event.emit("getSpreedsheat");
			});
	}

	public getTemplateFromFile(file: string): void {
		this._http.post(this.serverUrl + "template/" + file, {})
			.subscribe(res => {
				Logger.info("ModelService", "getTemplateFromFile() -> res");
				Logger.debug("getTemplateFromFile", res);
				var group = new ProcessGroup();
				group.createFromJson(res.json());
				for(let process of group.Process) {
					this.templateGroup.addProcess(process);
				}
				this.event.emit("getTemplate");
			});
	}

	public getLibrary(): void {
		this._http.post(this.serverUrl + "request/library/getLibrary.php", {})
			.subscribe(res => {
				Logger.info("ModelService", "getLibrary() -> res");
				Logger.debug("ModelService", res);
				this.library = new Library();
				this.library.createFromJson(res.json());
				this.event.emit("getRoom");
				Logger.info("ModelService", "getLibrary() -> emit 'getRoom'");
			});
	}

	public getAccount(id: number): void {
		this._http.post(this.serverUrl + "request/account/getAccount.php", { 'id': id })
			.subscribe(res => {
				Logger.info("ModelService", "getAccount() -> res");
				Logger.debug("ModelService", res);
				this.account = new Account();
				this.account.createFromJson(res.json());
				this.event.emit("getAccount");
				Logger.info("ModelService", "getLibrary() -> emit 'getAccount'");
			});
	}

	public login(login: string, password: string): void {
		// TODO		
	}

	public getRoom(id): Room {
		this.room = this.account ? this.account.getRoom(id) : null;
		return this.room;
	}

	// get room for visit (creationGroup included)
	public getVisitRoom(id): void {
		this._http.post(this.serverUrl + "request/room/getVisitRoom.php", { 'id': id })
			.subscribe(res => {
				Logger.info("ModelService", "getRoom() -> res");
				this.room = new Room();
				this.room.createFromJson(res.json());
				if (this.library) {
					this.event.emit("getRoom");
					Logger.info("ModelService", "getVisitRoom() -> emit 'getRoom'");
				} else {
					this.getLibrary();
				}
			});
	}

	// get room from account:
	// the room is partialy loaded, creationGroup totaly loaded
	// get only process
	public getAccountRoom(room: Room): void {
		this._http.post(this.serverUrl + "request/room/getAccountRoom.php", { 'id': room.id })
			.subscribe(res => this.getAccountRoomEventHandler(res));
	}

	public getAccountRoomEventHandler(res: any): void {
		Logger.info("ModelService", "getAccountRoomEventHandler() -> res");
		this.room.createProcessGroupFromJson(res.json());
		if (this.library) {
			this.event.emit("getRoom");
			Logger.info("ModelService", "getAccountRoom() -> emit 'getRoom'");
		} else {
			this.getLibrary();
		}
	}

	public getReference(value: string): Scene {
		var result: Scene = this.room.getReference(value);
		if (result == null) {
			result = this.library.getReference(value)
		}
		return result;
	}

	public getProcess(id): void {
		this._http.post(this.serverUrl + "request/room/getProcess.php", { 'id': id })
			.subscribe(res => {
				Logger.info("ModelService", "getProcess() -> res");
				this.process = new Process();
				this.process.createFromJson(res.json());
				this.event.emit("getProcess");
			});
	}

	public updateProcess(process: Process): void {
		var value = process.toProcessServer();
		Logger.info("ModelService", "updateProcess(" + process.id + ")");
		Logger.debug("ModelService", process);
		this._http.post(this.serverUrl + "request/room/updateProcess.php", value)
			.subscribe(res => {
				Logger.info("ModelService", "updateProcess() res ->" + JSON.stringify(res));
				this.event.emit("updateProcess");
			});
	}

	public insertProcess(process: Process): void {
		var value = process.toProcessServer();
		Logger.info("ModelService", "insertProcess(" + process.id + ")");
		Logger.debug("ModelService", process);
		this._http.post(this.serverUrl + "request/room/insertProcess.php", value)
			.subscribe(res => {
				Logger.info("ModelService", "insertProcess() res ->" + res);
				process.id = res.text().toString();
				this.updateProcess(process);
			});
	}

	public updateRoom(room: Room): void {
		var value = room.toRoomServer();
		Logger.info("ModelService", "updateRoom(" + room.id + ")");
		Logger.debug("ModelService", room);
		this._http.post(this.serverUrl + "request/room/updateRoom.php", value)
			.subscribe(res => {
				Logger.info("ModelService", "updateRoom() res ->" + JSON.stringify(res));
			});
	}

	public insertRoom(room: Room): void {
		var value = room.toRoomServer();
		Logger.info("ModelService", "insertRoom(" + room.id + ")");
		Logger.debug("ModelService", room);
		this._http.post(this.serverUrl + "request/room/insertRoom.php", value)
			.subscribe(res => {
				Logger.info("ModelService", "insertRoom() res ->" + res);
				room.id = FormatUtils.toInt(res.text().toString());
			});
	}

	public updateSupportProcess(): void {
		var process: Process = this.room.getProcessByType("support");
		this.updateProcess(process);
	}

	public updateCreationGroup(): void {
		Logger.info("ModelService", "updateCreationGroup()");
		Logger.debug("ModelService", this.room.CreationGroup);
		var value = this.room.CreationGroup.toCreationGroupServer();
		this._http.post(this.serverUrl + "request/account/updateCreationGroup.php", value)
			.subscribe(res => {
				Logger.info("ModelService", "updateCreationGroup() res ->" + JSON.stringify(res));
			});
	}
	
	public addCreationList(creationList: Creation[]): void {
		for(let creation of this.room.CreationGroup.Creation) {
			creationList.push(creation);
		}
		this.room.CreationGroup.Creation = creationList;
	}

	public createSnapshot(value: SnapshotServer, type: string): void {
		var endpoint: string = "createSnapshot.php";
		if (type == "slot") {
			endpoint = "createSlotThumb.php";
		} else if (type == "support") {
			endpoint = "createSupportThumb.php";
		}
		Logger.info("ModelService", "createSnapshot(" + type + ")");
		this._http.post("assembler/request/snapshot/" + endpoint, value)
			.subscribe(res => this.createSnapshotHandler(res));
	}

	public createAssetFile(fileHolder: FileHolder, uploader: UploaderComponent) {
		Logger.info("ModelService", "createAssetFile(" + fileHolder.file.name + ")");
		return this._http.post("assembler/request/upload/createAssetFile.php", fileHolder.toFileServer(1))
			.subscribe(
				response => uploader.onResponse(response, fileHolder),
				error => {
					uploader.onResponse(error, fileHolder);
					uploader.deleteFile(fileHolder);
				});
	}

	private createSnapshotHandler(res): void {
		Logger.info("ModelService", "createSnapshot() res ->" + JSON.stringify(res));
		this.event.emit("supportThumb");
		Logger.info("ModelService", "createSnapshotHandler() -> emit 'supportThumb'");
	}
}
