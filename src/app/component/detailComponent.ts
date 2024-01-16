import { Component } from '@angular/core';
import { ToolComponent } from '../component/toolComponent';
import { ModelService } from '../service/model.service';
import { AssetManagerComponent } from '../editor/asset-manager/asset-manager.component';
import { Creation } from '../model/assembler/creation';
import { Logger } from '../process/utils/logger';

@Component({
  template: ''
})
export class DetailComponent extends ToolComponent {

	public assetManager: AssetManagerComponent;
	public indexLabel: string;
	
	public title: string;
	public description: string;
	public tag: string;	
	public linkLabel: string;
	public linkUrl: string;
	
	constructor(public modelService: ModelService) {
		super(modelService);
	}

	ngOnInit(): void {
		this.hide();
	}

	public setAssetManager(assetManager: AssetManagerComponent): void {
		this.assetManager = assetManager;
		this.updateCurrent();
	}
	
	public show(assetManager: AssetManagerComponent): void {
		this.setAssetManager(assetManager);		
		this.visible();
	}
	
	public updateCurrent(): void {
		Logger.info("DetailComponent", "updateCurrent()");
		var index = this.assetManager.selected + 1;
		this.indexLabel = index + " / " + this.assetManager.creationList.length;
		var current: Creation = this.assetManager.current;
		this.title = current.getInfoValue('title');
		this.description = current.getInfoValue('description');
		this.tag = current.getInfoValue('tag');
		this.linkLabel = current.getInfoValue('linkLabel');
		this.linkUrl = current.getInfoValue('linkUrl');
	}

	public updateModel(refresh: boolean): void {
		Logger.info("DetailComponent", "updateModel()");
		var current: Creation = this.assetManager.current;
		current.addOrUpdateInfo('title', this.title);
		current.addOrUpdateInfo('description', this.description);
		current.addOrUpdateInfo('tag', this.description);
		current.addOrUpdateInfo('linkLabel', this.linkLabel);
		current.addOrUpdateInfo('linkUrl', this.linkUrl);
		this.modelService.doPersistCreation = true;
	}

	public prev(): void {
		this.assetManager.selected--;
		if( this.assetManager.selected < 0) {
			this.assetManager.selected = this.assetManager.creationList.length - 1;
		}
		this.assetManager.current = this.assetManager.creationList[this.assetManager.selected];
		this.updateCurrent();
	}

	public next(): void {
		this.assetManager.selected++;
		if( this.assetManager.selected >= this.assetManager.creationList.length) {
			this.assetManager.selected = 0;
		}
		this.assetManager.current = this.assetManager.creationList[this.assetManager.selected];
		this.updateCurrent();
	}
}
