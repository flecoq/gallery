import { Component, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EngineService } from '../../engine/engine.service';
import { EngineComponent } from '../../engine/engine.component';
import { AssetInfoComponent } from '../../visit/asset-info/asset-info.component';
import { ModelService } from '../../service/model.service';
import { Logger } from '../../process/utils/logger';
import { SceneAction } from '../../process/action/sceneAction';
import { Room } from '../../model/room';

@Component({
	selector: 'app-visit',
	templateUrl: './visit.component.html',
	styleUrls: ['./visit.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class VisitComponent implements OnInit {

	@ViewChild(EngineComponent)
	public engineComponent: EngineComponent;

	@ViewChild(AssetInfoComponent)
	public assetInfoComponent: AssetInfoComponent;

	public roomId: number;

	constructor(public route: ActivatedRoute, public engine: EngineService, public modelService: ModelService) { }

	ngOnInit(): void {
		this.modelService.event.subscribe(item => this.modelServiceEventHandler(item));
		this.engine.event.subscribe(item => this.engineEventHandler(item));
		this.engine.edit = false;
		this.engine.visitComponent = this;
		this.route.paramMap.subscribe(params => {
			this.roomId = Number(params.get('roomId'));
			Logger.info("VisitComponent", "ngOnInit() -> roomId:" + this.roomId);
			var room: Room = this.modelService.getRoom(this.roomId);
			if( room == null ) {
				this.modelService.getVisitRoom(this.roomId);
			} else if (room.isProcessEmpty()) {
				this.modelService.getAccountRoom(room);
			} else {
				this.modelService.doRoomExecute = true;
			}
		});
	}

	public modelServiceEventHandler(item) {
		Logger.info("VisitComponent", "modelServiceEventHandler(" + item + ")")
	}

	public engineEventHandler(item) {
		Logger.info("VisitComponent", "engineEventHandler(" + item + ")")
		if( item === "focusVisitEnd") {
			this.assetInfoComponent.onAnimFocusEndHandler();
		}
	}

	public engineComponentEventHandler(item) {
		Logger.info("VisitComponent", "engineComponentEventHandler(" + item + ")")
	}

	public runAssetInfoAction(action: SceneAction): void {
		this.assetInfoComponent.runClickAction(action);
	}
	
	public assetInfoEventHandler(item) {
		Logger.info("VisitComponent", "assetInfoEventHandler(" + item + ")")
	}

	public prevCameraHisto(): void {
		this.engine.viewManager.prevCameraHisto();
		this.assetInfoComponent.visible(false);
	}

	public nextCameraHisto(): void {
		this.engine.viewManager.nextCameraHisto();
		this.assetInfoComponent.visible(false);
	}
}
