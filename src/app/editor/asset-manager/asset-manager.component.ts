import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ToolComponent } from '../../component/toolComponent';
import { ModelService } from '../../service/model.service';
import { Creation } from '../../model/assembler/creation';
import { Scene } from '../../model/assembler/scene';
import { FileHolder } from '../uploader/file-holder';

@Component({
	selector: 'app-asset-manager',
	templateUrl: './asset-manager.component.html',
	styleUrls: ['./asset-manager.component.css']
})
export class AssetManagerComponent extends ToolComponent implements OnInit {

	public current: Creation = null;
	public material: Scene = null;

	public creationList: Creation[] = [];
	public visibleCreationList: Creation[] = [];
	public materialList: Scene[] = [];
	public visibleMaterialList: Scene[] = [];

	private typeFilter: string;

	public selected: number;
	public selectedMaterial: number;

	public isCreationVisible: boolean;

	@Output() public event: EventEmitter<string> = new EventEmitter();

	constructor(public modelService: ModelService) {
		super(modelService);
		this.closed = false;
	}

	ngOnInit() {
		this.updateTypeFilter("picture");
	}

	public creationVisible(value: boolean): void {
		this.isCreationVisible = value;
		if (value) {
			this.visibleCreationList = this.creationList;
			this.visibleMaterialList = [];
		} else {
			this.visibleCreationList = [];
			this.visibleMaterialList = this.materialList;
		}
	}

	public updateTypeFilter(value: string): void {
		this.typeFilter = value;
		this.selected = -1;
		if (value === "material") {
			this.materialList = this.modelService.library.getMaterialList();
		} else {
			this.updateCreationList();
		}
		this.creationVisible(!(value === "material"));
	}

	public updateCreationList(): void {
		this.creationList = [];
		if ( this.modelService.room && this.modelService.room.CreationGroup ) {
			for (let creation of this.modelService.room.CreationGroup.Creation) {
				if (this.typeFilter && this.typeFilter === creation.getType()) {
					this.creationList.push(creation);
				}
			}
		}
		this.creationVisible(this.isCreationVisible);
	}

	public updateCreationListFromCreation(source: Creation): void {
		this.creationList = [];
		this.typeFilter = source.getType();
		this.current = source;
		var range: number = 0;
		for (let creation of this.modelService.room.CreationGroup.Creation) {
			if (this.typeFilter && this.typeFilter === creation.getType()) {
				this.creationList.push(creation);
				if (source.id === creation.id) {
					this.selected = range;
				}
				range++;
			}
		}
	}

	public selectCurrent(creation: Creation, $index: number): void {
		this.current = creation;
		this.selected = $index;
		this.event.emit("select");
	}

	public creationDetail(creation: Creation, $index: number): void {
		this.current = creation;
		this.selected = $index;
		this.hide();
		this.event.emit(this.current.getType() + "Detail");
	}


	public getMaterialThumbUrl(scene: Scene): string {
		//return "./assets/thumb/slot.png";
		return "./assembler/library/material/" + scene.name + ".png";
	}

	public selectMaterial(scene: Scene, $index): void {
		this.material = scene;
		this.selectedMaterial = $index;
		this.event.emit("selectMaterial");
	}

	public close() {
		this.event.emit("close");
	}

	public assetDrag(event): void {
		event.dataTransfer.setData("source", this.isCreationVisible ? "creation" : "material");
	}
	
	public onUploader(): void {
		this.event.emit("uploader");
	}
	
	public addAsset(files: FileHolder[]): void {
		var creationList: Creation[] = [];
		for(let fileHolder of files) {
			if( fileHolder.isCreation() ) {
				var creation: Creation = fileHolder.toCreation(this.modelService.account.id);
				creationList.push(creation);
			}
		}
		this.modelService.addCreationList(creationList);
		this.updateCreationList();
		//this.modelService.updateCreationGroup();
	}
}
