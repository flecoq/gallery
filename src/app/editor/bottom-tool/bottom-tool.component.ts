import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ToolComponent } from '../../component/toolComponent';
import { SelectComponent } from '../../component/selectComponent';
import { SelectOption } from '../../component/selectOption';
import { SceneImplOption } from '../../component/sceneImplOption';
import { ModelService } from '../../service/model.service';
import { EngineService } from '../../engine/engine.service';
import { Creation } from '../../model/assembler/creation';
import { WallObject } from '../../process/scene/mesh/wallObject';
import { MeshObject } from '../../process/scene/mesh/meshObject';
import { MergeObject } from '../../process/scene/mesh/mergeObject';
import { SceneImpl } from '../../process/scene/sceneImpl';
import { Param } from '../../model/assembler/param';
import { Support } from '../../process/scene/mesh/support/support';

@Component({
	selector: 'app-bottom-tool',
	templateUrl: './bottom-tool.component.html',
	styleUrls: ['./bottom-tool.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class BottomToolComponent extends ToolComponent implements OnInit {

	public title: string;
	public creation: Creation = null;
	public wall: WallObject;
	public support: MeshObject;
	public supportRef: Support;
	public mergeObject: MergeObject;

	public pictureStyle: string;
	public objectStyle: string;
	public supportStyle: string;
	public wallStyle: string;
	public processStyle: string;

	public gridSelect: SelectComponent;
	public gridValue: string;

	public sceneSelect: SelectComponent;
	public paramSelect: SelectComponent;
	public sceneImplSelected: SceneImpl;
	public paramSelected: Param;
	public paramValue: string;
	public activeScene: boolean;
	public activeParam: boolean;

	@Output() public event: EventEmitter<string> = new EventEmitter();

	constructor(public engine: EngineService, public modelService: ModelService) {
		super(modelService);
	}

	ngOnInit(): void {
		this.hide();
		this.gridSelect = new SelectComponent();
		this.gridSelect.addOption(new SelectOption("0;0", "none"));
		this.gridSelect.addOption(new SelectOption("1;1", "1x1"));
		this.gridSelect.addOption(new SelectOption("2;1", "2x1"));
		this.gridSelect.addOption(new SelectOption("3;1", "3x1"));
		this.gridSelect.addOption(new SelectOption("4;1", "4x1"));
		this.gridSelect.addOption(new SelectOption("1;2", "1x2"));
		this.gridSelect.addOption(new SelectOption("2;2", "2x2"));
		this.gridSelect.addOption(new SelectOption("3;2", "3x2"));
		this.gridSelect.addOption(new SelectOption("4;2", "4x2"));
		this.sceneSelect = new SelectComponent();
		this.paramSelect = new SelectComponent();
	}

/*	public visibleStyle(): string {
		return "visibility: visible; width: 100%; height: 100%";
	}

	public hideStyle(): string {
		return "visibility: hidden; width: 0px; height: 0px";
	}
*/
	public hideDiv(): void {
		this.pictureStyle = this.hideStyle();
		this.objectStyle = this.hideStyle();
		this.supportStyle = this.hideStyle();
		this.wallStyle = this.hideStyle();
		this.processStyle = this.hideStyle();
	}

	public visible(): void {
		super.visible();
		this.hideDiv();
	}

	public hide(): void {
		super.hide();
		this.hideDiv();
	}

	public selectCreation(creation: Creation): void {
		if (!(creation.getType() === "texture")) {
			this.visible();
			this.mergeObject = null;
			if (creation.getType() === "picture") {
				this.pictureStyle = this.visibleStyle();
			} else if (creation.getType() === "object") {
				this.objectStyle = this.visibleStyle();
			}
			this.creation = creation;
			this.title = this.creation.getInfo('title').value;
			this.support = null;
		}
	}

	public updateModel(refresh: boolean): void {
		if (this.creation) {
			this.creation.addOrUpdateInfo('title', this.title);
			this.modelService.doPersistCreation = true;
		}
	}

	public onPictureDetail() {
		this.hide();
		this.event.emit("pictureDetail");
	}

	public onObjectDetail() {
		this.hide();
		this.event.emit(this.mergeObject ? "mergeObjectDetail" : "objectDetail");
	}

	public selectWall(wall: WallObject): void {
		this.visible();
		this.wallStyle = this.visibleStyle();
		this.wall = wall;
		var grid: string = wall.getParamValue("placeholder.grid");
		this.gridSelect.select(grid == null ? "0;0" : grid);
	}

	public gridSelectChange(value: string): void {
		this.wall.addOrUpdateParam("placeholder.grid", value);
		this.wall.writePlaceholder(this.engine);
		this.wall.placeholderGroup.visible(true);
		this.modelService.addPersistProcess(this.wall.process);
	}

	public showProcessTool(): void {
		this.visible();
		this.processStyle = this.visibleStyle();
		this.sceneSelect.clear();
		for (let sceneImpl of this.engine.sceneImplList) {
			this.sceneSelect.addOption(new SceneImplOption(sceneImpl.name, sceneImpl.name, sceneImpl));
		}
		this.sceneSelectChange(this.engine.sceneImplList[0].name);
	}

	public sceneSelectChange(value: string): void {
		this.sceneImplSelected = (this.sceneSelect.select(value) as SceneImplOption).sceneImpl;
		this.activeScene = this.sceneImplSelected.isActive();
		this.paramSelect.clear();
		for(let param of this.sceneImplSelected.Param) {
			this.paramSelect.addOption(new SelectOption(param.name, param.name));	
		}
		this.paramSelectChange(this.sceneImplSelected.Param[0].name);
	}

	public paramSelectChange(value: string): void {
		for(let param of this.sceneImplSelected.Param) {
			if( param.name === value ) {
				this.paramSelected = param;
			}
		}
		this.activeParam = this.paramSelected.isActive();
		this.paramValue = this.paramSelected.value;
	}

	public onWrite(): void {
		this.sceneImplSelected.setActive(this.activeScene);
		this.paramSelected.setActive(this.activeParam);
		this.paramSelected.value = this.paramValue;
		this.sceneImplSelected.write(this.engine);
	}

	public onPersist(): void {
		this.onWrite();
		this.modelService.updateProcess(this.sceneImplSelected.process);
	}
	
	public onWallFocus(): void {
		this.event.emit("focus");
	}

	public selectSupport(support: MeshObject): void {
		this.visible();
		this.supportStyle = this.visibleStyle();
		this.support = support;
		var reference: string = this.support.getParamValue("reference");
		reference = reference.replace("support.", "");
		this.supportRef = this.engine.modelService.room.getSupport(reference, this.engine.modelService);
		var creationId: string = this.support.getParamValue("asset");
		this.creation = this.engine.modelService.getCreation(creationId);
		this.title = this.creation.getInfo('title').value;
	}

	public selectMergeObject(mergeObject: MergeObject): void {
		this.mergeObject = mergeObject;
		var creationId: string = mergeObject.getParamValue("creationId");
		if (creationId) {
			this.visible();
			this.objectStyle = this.visibleStyle();
			this.creation = this.engine.modelService.getCreation(creationId);
			this.title = this.creation.getInfo('title').value;
		}
	}

	public onPictureSupportDetail(): void {
		this.event.emit("pictureSupportDetail");
	}

	public onSupportDetail(): void {
		this.event.emit("supportDetail");
	}

	public onSupportFocus(): void {
		this.event.emit("focus");
	}

}
