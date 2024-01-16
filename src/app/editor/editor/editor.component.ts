import { Component, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModelService } from '../../service/model.service';
import { EngineService } from '../../engine/engine.service';
import { EngineComponent } from '../../engine/engine.component';
import { AssetManagerComponent } from '../../editor/asset-manager/asset-manager.component';
import { BottomToolComponent } from '../../editor/bottom-tool/bottom-tool.component';
import { CameraToolComponent } from '../../editor/camera-tool/camera-tool.component';
import { PictureDetailComponent } from '../../editor/picture-detail/picture-detail.component';
import { ObjectDetailComponent } from '../../editor/object-detail/object-detail.component';
import { MaterialSelectorComponent } from '../../editor/material-selector/material-selector.component';
import { SupportListComponent } from '../../editor/support-list/support-list.component';
import { SupportDetailComponent } from '../../editor/support-detail/support-detail.component';
import { UploaderComponent } from '../../editor/uploader/uploader.component';
import { Logger } from '../../process/utils/logger';
import { SceneImpl } from "../../process/scene/sceneImpl";
import { WallObject } from "../../process/scene/mesh/wallObject";
import { PictureObject } from "../../process/scene/mesh/pictureObject";
import { MergeObject } from "../../process/scene/mesh/mergeObject";
import { Room } from '../../model/room';

@Component({
	selector: 'app-editor',
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class EditorComponent implements OnInit {

	@ViewChild(EngineComponent)
	private engineComponent: EngineComponent;

	@ViewChild(AssetManagerComponent)
	private assetManager: AssetManagerComponent;

	@ViewChild(BottomToolComponent)
	private bottomTool: BottomToolComponent;

	@ViewChild(CameraToolComponent)
	private cameraTool: CameraToolComponent;

	@ViewChild(ObjectDetailComponent)
	private objectDetail: ObjectDetailComponent;

	@ViewChild(PictureDetailComponent)
	private pictureDetail: PictureDetailComponent;

	@ViewChild(MaterialSelectorComponent)
	private materialSelector: MaterialSelectorComponent;

	@ViewChild(SupportListComponent)
	private supportList: SupportListComponent;

	@ViewChild(UploaderComponent)
	private uploaderComponent: UploaderComponent;

	@ViewChild(SupportDetailComponent)
	private supportDetail: SupportDetailComponent;

	public roomId: number;

	public moveBtnCss: string;
	public rotateBtnCss: string;
	public scaleBtnCss: string;
	public toolStyle: string;
	public doMonitoring: boolean = false;

	constructor(public route: ActivatedRoute, public engine: EngineService, public modelService: ModelService) {
	}

	public ngOnInit(): void {
		this.setGizmoMode('move');
		this.modelService.event.subscribe(item => this.modelServiceEventHandler(item));
		this.engine.edit = true;
		this.engine.editorComponent = this;
		this.route.paramMap.subscribe(params => {
			this.roomId = Number(params.get('roomId'));
			Logger.info("EditorComponent", "ngOnInit() -> roomId:" + this.roomId);
			var room: Room = this.modelService.getRoom(this.roomId);
			if (room.isProcessEmpty()) {
				this.modelService.getAccountRoom(room);
			} else {
				this.modelService.doRoomExecute = true;
			}
		});
	}

	public modelServiceEventHandler(item) {
		Logger.info("EditorComponent", "modelServiceEventHandler(" + item + ")")
		if (item === "getRoom") {
			if( this.assetManager ) {
				this.assetManager.updateCreationList();
			}
			if( this.materialSelector ) {
				this.materialSelector.sceneList = this.modelService.library.getMaterialList();
			}
		}
	}

	public toolDragHide(value: boolean): void {
		this.assetManager.dragHide(value);
		this.supportList.dragHide(value);
		this.bottomTool.dragHide(value);
		this.cameraTool.dragHide(value);
	}

	public showSupportList(): void {
		this.supportList.show(this.modelService);
	}

	public sceneImplBottomTool(sceneImpl: SceneImpl) {
		Logger.info("EditorComponent", "sceneImplBottomTool(" + sceneImpl.name + ")")
		if (sceneImpl instanceof WallObject) {
			this.cameraTool.hide();
			this.bottomTool.selectWall(sceneImpl as WallObject);
		} else if (sceneImpl instanceof PictureObject) {
			this.cameraTool.hide();
			this.bottomTool.selectSupport(sceneImpl as PictureObject);
		} else if (sceneImpl instanceof MergeObject) {
			this.cameraTool.hide();
			this.bottomTool.selectMergeObject(sceneImpl as MergeObject);
		} else {
			this.bottomTool.hide();
		}
	}

	public engineComponentEventHandler(item) {
		Logger.info("EditorComponent", "engineComponentEventHandler(" + item + ")")
		if (item === "drag") {
			this.toolDragHide(true);
		} else if (item === "drop") {
			this.toolDragHide(false);
		} else if (item === "getRoom") {
			this.cameraTool.refreshCameraSelect();
		}
	}

	public setGizmoMode(mode: string): void {
		if (mode == 'move') {
			this.moveBtnCss = "btn btn-info";
			this.rotateBtnCss = "btn";
			this.scaleBtnCss = "btn";
			if (this.engine.transformGizmo != null) {
				this.engine.transformGizmo.setMode(true, false, false);
			}
		} else if (mode == 'rotate') {
			this.moveBtnCss = "btn";
			this.rotateBtnCss = "btn btn-info";
			this.scaleBtnCss = "btn";
			this.engine.transformGizmo.setMode(false, true, false);
		} else if (mode == 'scale') {
			this.moveBtnCss = "btn";
			this.rotateBtnCss = "btn";
			this.scaleBtnCss = "btn btn-info";
			this.engine.transformGizmo.setMode(false, false, true);
		}
	}

	public delete(): void {
		this.engine.transformGizmo.delete();
	}

	public assetManagerEventHandler(event: string): void {
		Logger.info("EditorComponent", "assetManagerEventHandler(" + event + ")")
		if (event === "select") {
			this.cameraTool.hide();
			this.engineComponent.dragCreation = this.assetManager.current;
			this.engineComponent.dragMaterial = null;
			this.bottomTool.selectCreation(this.assetManager.current);
			if (this.assetManager.current.getType() === "picture") {
				this.supportList.show(this.modelService);
			} else {
				this.supportList.hide();
			}
		} else if (event === "selectMaterial") {
			this.engineComponent.dragCreation = null;
			this.engineComponent.dragMaterial = this.assetManager.material;
		} else if (event === "pictureDetail") {
			this.bottomTool.hide();
			this.cameraTool.hide();
			this.supportList.hide();
			this.pictureDetail.show(this.assetManager);
		} else if (event === "objectDetail") {
			this.bottomTool.hide();
			this.cameraTool.hide();
			this.supportList.hide();
			this.objectDetail.show(this.assetManager);
			this.engineComponent.setRightPadding(500);
			this.engine.viewManager.enableObjectViewer(true);
		} else if (event === "close") {
			this.bottomTool.hide();
			this.supportList.hide();
			this.cameraTool.hide();
		} else if (event === "uploader") {
			this.assetManager.hide();
		}
	}

	public bottomToolEventHandler(event: string): void {
		Logger.info("EditorComponent", "bottomToolEventHandler(" + event + ")")
		if (event === "pictureDetail") {
			this.assetManager.hide();
			this.supportList.hide();
			this.cameraTool.hide();
			this.pictureDetail.visible();
			this.pictureDetail.setAssetManager(this.assetManager);
		} else if (event === "pictureSupportDetail") {
			this.assetManager.updateCreationListFromCreation(this.bottomTool.creation);
			this.assetManager.hide();
			this.supportList.hide();
			this.bottomTool.hide();
			this.cameraTool.hide();
			this.pictureDetail.visible();
			this.pictureDetail.setAssetManager(this.assetManager);
		} else if (event === "supportDetail") {
			this.supportList.updateSupportList();
			this.supportList.current = this.bottomTool.supportRef;
			this.supportList.selected = this.bottomTool.supportRef.range;
			this.assetManager.hide();
			this.bottomTool.hide();
			this.cameraTool.hide();
			this.supportList.hide();
			this.engineComponent.setRightPadding(500);
			this.engine.viewManager.enableObjectViewer(true);
			this.supportDetail.show(this.supportList);
		} else if (event === "objectDetail") {
			this.assetManager.hide();
			this.bottomTool.hide();
			this.cameraTool.hide();
			this.supportList.hide();
			this.objectDetail.show(this.assetManager);
			this.engineComponent.setRightPadding(500);
			this.engine.viewManager.enableObjectViewer(true);
		} else if (event === "mergeObjectDetail") {
			this.assetManager.updateCreationListFromCreation(this.bottomTool.creation);
			this.assetManager.hide();
			this.bottomTool.hide();
			this.cameraTool.hide();
			this.supportList.hide();
			this.objectDetail.show(this.assetManager);
			this.engineComponent.setRightPadding(500);
			this.engine.viewManager.enableObjectViewer(true);
		} else if (event === "focus") {
			this.focusObject();
		}
	}

	public showCameraTool(): void {
		this.bottomTool.hide();
		this.cameraTool.visible();
	}

	public focusObject(): void {
		this.engine.sceneImplFocus(this.engine.pickedSceneImpl);
	}

	public cameraToolEventHandler(event: string): void {
		Logger.info("EditorComponent", "cameraToolEventHandler(" + event + ")")
		if (event === "addCamera") {
			this.assetManager.hide();
		} else if (event === "closeAddCamera") {
			this.assetManager.visible();
		}
	}

	public objectDetailEventHandler(event: string): void {
		Logger.info("EditorComponent", "objectDetailEventHandler(" + event + ")")
		if (event === "close") {
			this.assetManager.visible();
			this.materialSelector.hide();
			this.bottomTool.selectCreation(this.assetManager.current);
			this.engineComponent.setRightPadding(null);
			this.engine.viewManager.enableObjectViewer(false);
		} else if (event === "materialSelector") {
			this.materialSelector.visible();
		}
	}

	public pictureDetailEventHandler(event: string): void {
		Logger.info("EditorComponent", "pictureDetailEventHandler(" + event + ")")
		if (event === "close") {
			this.assetManager.visible();
			this.supportList.visible();
			if (this.bottomTool.support == null) {
				this.bottomTool.selectCreation(this.assetManager.current);
			} else {
				this.bottomTool.visible();
				this.bottomTool.supportStyle = this.bottomTool.visibleStyle();
			}
		}
	}

	public materialSelectorEventHandler(event: string): void {
		Logger.info("EditorComponent", "materialSelectorEventHandler(" + event + ")")
		if (event === "selected") {
			if (!this.objectDetail.closed) {
				this.objectDetail.materialEditor.selectModel(this.materialSelector.current);
			} else if (!this.supportDetail.closed) {
				this.supportDetail.selectMaterialModel(this.materialSelector.current);
			}
		}
	}

	public supportListEventHandler(event: string): void {
		Logger.info("EditorComponent", "supportListEventHandler(" + event + ")")
		if (event === "selected") {
			this.engineComponent.support = this.supportList.current;
		} else if (event === "detail") {
			this.assetManager.hide();
			this.bottomTool.hide();
			this.cameraTool.hide();
			this.supportList.hide();
			this.engineComponent.setRightPadding(500);
			this.engine.viewManager.enableObjectViewer(true);
			this.supportDetail.show(this.supportList);
		}
	}

	public supportDetailEventHandler(event: string): void {
		Logger.info("EditorComponent", "supportDetailEventHandler(" + event + ")")
		if (event === "close") {
			this.assetManager.visible();
			this.supportList.visible();
			this.materialSelector.hide();
			this.engineComponent.setRightPadding(null);
			this.engine.viewManager.enableObjectViewer(false);
		} else if (event === "materialSelector") {
			this.materialSelector.visible();
		} else if (event === "selected") {
			this.engineComponent.support = this.supportList.current;
		}
	}

	public uploaderEventHandler(event: string): void {
		Logger.info("EditorComponent", "uploaderEventHandler(" + event + ")")
		if (event === "close") {
			this.assetManager.visible();
		} else if (event === "confirm") {
			this.assetManager.visible();
			this.assetManager.addAsset(this.uploaderComponent.files);
			this.uploaderComponent.deleteAll();
		}
	}

	public snapshot(): void {
		this.engine.viewManager.createSnapshot("snapshot.png", null);
	}

	public monitoring(): void {
		this.doMonitoring = true;
		this.engine.monitor.run();
	}

	public showProcessTool(): void {
		this.cameraTool.hide();
		this.bottomTool.showProcessTool();
	}

	public onEditRoom(): void {
		// TODO
	}

}
