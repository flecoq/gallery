import { Component, ViewChild, OnInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { ToolComponent } from '../../component/toolComponent';
import { MaterialEditorComponent } from '../material-editor/material-editor.component';
import { SupportListComponent } from '../support-list/support-list.component';
import { ModelService } from '../../service/model.service';
import { EngineService } from '../../engine/engine.service';
import { MeshObject } from "../../process/scene/mesh/meshObject";
import { Support } from "../../process/scene/mesh/support/support";
import { Process } from "../../model/assembler/process";
import { Scene } from '../../model/assembler/scene';
import { Logger } from '../../process/utils/logger';
import { SceneUtils } from '../../process/utils/sceneUtils';

@Component({
	selector: 'app-support-detail',
	templateUrl: './support-detail.component.html',
	styleUrls: ['./support-detail.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class SupportDetailComponent extends ToolComponent implements OnInit {

	public supportList: SupportListComponent;
	public indexLabel: string;
	public label: string;
	public meshObject: MeshObject;

	public title: string;
	public border: number = 50;

	public borderStyle: string = "";
	public materialStyle: string = "";

	@Output() public event: EventEmitter<string> = new EventEmitter();

	@ViewChild(MaterialEditorComponent)
	public materialEditor: MaterialEditorComponent;

	constructor(public engine: EngineService, public modelService: ModelService) {
		super(modelService);
	}

	ngOnInit(): void {
		this.hide();
	}

	public setSupportList(supportList: SupportListComponent): void {
		this.supportList = supportList;
		this.updateCurrent();
	}

	public close(): void {
		this.refreshThumb();
		this.refreshRoom();
		this.materialStyle = this.hideStyle();
		this.borderStyle = this.hideStyle();
		this.hide();
		this.event.emit("close");
	}

	public refreshRoom(): void {
		Logger.info("SupportDetailComponent", "refreshRoom()")
		for (let support of this.supportList.supportList) {
			if (support.refresh) {
				this.engine.refreshReference("support." + support.name);
			}
		}
	}

	public show(supportList: SupportListComponent): void {
		this.setSupportList(supportList);
		this.visible();
	}

	public updateCurrent(): void {
		Logger.info("SupportDetailComponent", "updateCurrent()")
		var index = this.supportList.selected + 1;
		this.indexLabel = index + " / " + this.supportList.supportList.length;
		var current: Support = this.supportList.current;
		this.meshObject = SceneUtils.getSceneImpl(current, this.engine) as MeshObject;
		this.engine.viewManager.objectViewer.viewMeshObject(this.meshObject);
		this.materialEditor.meshObject = this.meshObject;
		this.title = current.getParamValue("title");
		if (current.create === "plane") {
			this.label = "Flat Support (no border)";
			this.materialStyle = this.hideStyle();
			this.borderStyle = this.hideStyle();
		} else if (current.create === "picture") {
			this.label = "Border Support";
			this.materialStyle = this.visibleStyle();
			this.borderStyle = this.visibleStyle();
			this.border = current.getParamValueFloat("border.size") * 200;
		}
		this.event.emit("selected");
	}

	public updateModel(refresh: boolean): void {
		Logger.info("SupportDetailComponent", "updateModel()")
		var current: Support = this.supportList.current;
		current.addOrUpdateParam("title", this.title);
		if (current.create === "picture") {
			var border: number = this.border / 200;
			current.addOrUpdateParam("border.size", border.toString());
		}
		this.modelService.addPersistProcess(this.supportList.current.process);
		if (refresh) {
			this.meshObject.write(this.engine);
			current.refresh = true;
		}
	}

	public selectMaterialModel(scene: Scene): void {
		Logger.info("SupportDetailComponent", "selectMaterialModel(" + scene.name + ")")
		this.materialEditor.selectModel(scene);
		this.supportList.current.refresh = true;
		this.modelService.updateSupportProcess();
	}


	public prev(): void {
		this.supportList.selected--;
		if (this.supportList.selected < 0) {
			this.supportList.selected = this.supportList.supportList.length - 1;
		}
		this.supportList.current = this.supportList.supportList[this.supportList.selected];
		this.updateCurrent();
		this.refreshThumb();
	}

	public next(): void {
		this.supportList.selected++;
		if (this.supportList.selected >= this.supportList.supportList.length) {
			this.supportList.selected = 0;
		}
		this.supportList.current = this.supportList.supportList[this.supportList.selected];
		this.updateCurrent();
		this.refreshThumb();
	}

	public materialEditorEventHandler(event: string): void {
		this.event.emit(event);
	}

	public refreshThumb(): void {
		if ( this.supportList.current.refresh) {
			Logger.info("SupportDetailComponent", "refreshThumb()")
			this.engine.viewManager.objectViewer.focusMeshObject();
			this.supportList.current.incThumbIndex();
			this.engine.viewManager.createSnapshot(this.supportList.current.getThumbName(), "support");
		}
	}
}
