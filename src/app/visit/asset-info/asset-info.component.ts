import { ElementRef, Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { VisitComponent } from '../../component/visitComponent';
import { ModelService } from '../../service/model.service';
import { EngineService } from '../../engine/engine.service';
import { SceneAction } from '../../process/action/sceneAction'
import { CameraUtils } from '../../process/utils/cameraUtils'
import { Creation } from '../../model/assembler/creation'
import { VideoMaterial } from '../../process/scene/mesh/material/videoMaterial';
import { CompositeObject } from '../../process/scene/mesh/composite/compositeObject';
import { AssetChildObject } from '../../process/scene/mesh/composite/assetChildObject';
import { Point } from '../../process/utils/point';
import { Logger } from '../../process/utils/logger';

@Component({
	selector: 'app-asset-info',
	templateUrl: './asset-info.component.html',
	styleUrls: ['./asset-info.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AssetInfoComponent extends VisitComponent implements OnInit {

	public action: SceneAction;
	public focusCamera: CameraUtils;
	public current: Creation;
	public animFocus: boolean;

	public title: string;
	public description: string;
	public tag: string;
	public linkLabel: string;
	public linkUrl: string;

	public frameContentStyle: string;
	public titleStyle: string;
	public moreInfoStyle: string;
	public videoStyle: string;
	public isInfoContent: boolean;
	public isComment: boolean;

	public videoPlayer: HTMLVideoElement;

	public isVideo: boolean = false;
	public assetObject: AssetChildObject;
	public videoMaterial: VideoMaterial;
	public videoUrl: string = null;
	public frameUrl: string = null;

	public creationSize: Point;
	public isMouseDown: boolean = false;
	public frameStyle: string;
	public magnify: number = 1.0;
	public magnifyClass: string[];
	public isMagnify: boolean = false;
	public startMagnifyMouse: Point;
	public startMagnifyFrame: Point;

	@Output() public event: EventEmitter<string> = new EventEmitter();

	constructor(public engine: EngineService, public modelService: ModelService) {
		super(modelService);
	}

	ngOnInit(): void {
		this.visible(false);
	}

	public visible(enable: boolean): void {
		super.visible(enable);
		this.titleStyle = this.visibleStyle(enable);
		this.frameContentStyle = this.visibleStyle(enable && !this.isVideo);
		this.videoStyle = this.visibleStyle(enable && this.isVideo);
		this.moreInfoStyle = this.visibleStyle(false);
		this.isInfoContent = false;
		this.isComment = false;
		if (!enable && this.videoPlayer) {
			this.videoPlayer.pause();
		}
		if (!enable) {
			this.focusCamera = null;
			if (this.action) {
				this.action.resetParentBehavior();
			}
		}
	}

	public showMoreInfo(): void {
		this.moreInfoStyle = this.visibleStyle(true);
		this.showContentInfo();
	}

	public hideMoreInfo(): void {
		this.moreInfoStyle = this.visibleStyle(false);
		this.isInfoContent = false;
		this.isComment = false;
		this.isInfoContent = false;
		this.isComment = false;
	}

	public showContentInfo(): void {
		this.isInfoContent = true;
		this.isComment = false;
	}

	public showComment(): void {
		this.isInfoContent = false;
		this.isComment = true;
	}

	public runClickAction(action: SceneAction): void {
		this.action = action;
		this.magnifyClass = ['fa', 'fa-search-plus'];
		this.magnify = 1.0;
		this.isMagnify = false;
		if (action.sceneImpl instanceof CompositeObject) {
			this.assetObject = (action.sceneImpl as CompositeObject).getAssetChildObject() as AssetChildObject;
			this.isVideo = this.assetObject && this.assetObject.checkVideo(this.engine);
			//this.videoMaterial = (action.sceneImpl as CompositeObject).getAssetVideoMaterial();
		}
		var creationId = action.sceneImpl.getAssetId();
		this.updateCurrent(creationId);
		var behavior: string = action.sceneImpl.behavior;
		if ("title" === behavior) {
			action.setParentBehavior("detail");
			this.visible(true);
		} else {
			this.titleStyle = this.visibleStyle(true);
			this.engine.viewManager.addCameraHisto();
			this.engine.sceneImplFocusVisit(action.sceneImpl, 2);
			this.focusCamera = this.engine.viewManager.getMainCamera();
			this.animFocus = true;
		}
	}

	public onAnimFocusEndHandler(): void {
		if (this.animFocus) {
			this.action.setParentBehavior("title");
			this.visible(true);
			this.animFocus = false;
		}
	}

	public onPlayingVideo(event) {
		event.preventDefault();
		// play the first video that is chosen by the user
		if (this.videoPlayer === undefined) {
			this.videoPlayer = event.target;
			this.videoPlayer.play();
		} else {
			// if the user plays a new video, pause the last 
			// one and play the new one
			if (event.target !== this.videoPlayer) {
				this.videoPlayer.pause();
				this.videoPlayer = event.target;
				this.videoPlayer.play();
			}
		}
	}

	public runOverkAction(action: SceneAction): void {
		// TODO
	}

	public checkVisible(): void {
		if (this.action && ("title" === this.action.getParentBehavior() ||
			"detail" === this.action.getParentBehavior())) {
			var camera: CameraUtils = this.engine.viewManager.getMainCamera();
			if (!this.focusCamera.equals(camera)) {
				this.visible(false);
			}
		}
	}

	public updateCurrent(creationId: string): void {
		// get creation
		this.current = this.modelService.room.getCreation(creationId);
		this.creationSize = this.current.getSize();
		this.frameStyle = this.getFrameStyle();

		// asset infos
		this.title = this.current.getInfoValue('title');
		this.description = this.current.getInfoValue('description');
		this.tag = this.current.getInfoValue('tag');
		this.linkLabel = this.current.getInfoValue('linkLabel');
		this.linkUrl = this.current.getInfoValue('linkUrl');

		// video player
		if (this.isVideo) {
			this.videoUrl = this.current.getUrl();
			this.videoPlayer = document.getElementById("video") as HTMLVideoElement;
			this.videoPlayer.load();
		} else {
			this.frameUrl = this.current.getUrl();
		}
	}

	public getFrameStyle(): string {
		var container: HTMLElement = document.getElementById("frameContainer") as HTMLElement;
		var containerSize: Point = new Point(container.offsetWidth, container.offsetHeight);
		Logger.info("AssetInfoComponent", "getFrameStyle(), containerSize:" + containerSize.toString());
		var creationRatio: number = this.creationSize.y / this.creationSize.x;
		var containerRatio: number = containerSize.y / containerSize.x;
		var frameSize: Point;
		if (creationRatio > containerRatio) {
			frameSize = new Point(containerSize.y / creationRatio, containerSize.y);
		} else {
			frameSize = new Point(containerSize.x, containerSize.x * creationRatio);
		}
		Logger.info("AssetInfoComponent", "getFrameStyle(), frameSize:" + frameSize.toString());
		var framePosition: Point = new Point((containerSize.x - frameSize.x * this.magnify) / 2, (containerSize.y - frameSize.y *  this.magnify) / 2);
		var result: string = "margin-left:" + Math.floor(framePosition.x) + "px";
		result += "; margin-top:" + Math.floor(framePosition.y) + "px";
		result += "; width:" + Math.floor(frameSize.x * this.magnify) + "px";
		result += "; height:" + Math.floor(frameSize.y * this.magnify) + "px";
		result += "; pointer-events: none";
		Logger.info("AssetInfoComponent", "getFrameStyle() -> " + result);
		return result;
	}

	public onContainerMouseDown(event): void {
		this.isMouseDown = true;
		if (this.isMagnify) {
			this.startMagnifyMouse = new Point(event.clientX, event.clientY);
			var frame: HTMLElement = document.getElementById("frameImage") as HTMLElement;
			this.startMagnifyFrame = new Point(frame.offsetLeft, frame.offsetTop);
		}
	}

	public onContainerMouseUp(event): void {
		this.isMouseDown = false;
	}

	public onContainerMouseMove(event): void {
		if (this.isMagnify && this.isMouseDown) {
			var offset: Point = new Point(event.clientX - this.startMagnifyMouse.x, event.clientY - this.startMagnifyMouse.y);
			var frame: HTMLElement = document.getElementById("frameImage") as HTMLElement;
			var style: string = "margin-left:" + (this.startMagnifyFrame.x + offset.x) + "px";
			style += "; margin-top:" + (this.startMagnifyFrame.y + offset.y) + "px";
			style += "; width:" + frame.offsetWidth + "px";
			style += "; height:" + frame.offsetHeight + "px";
			style += "; pointer-events: none";
			Logger.info("AssetInfoComponent", "onContainerMouseMove() -> " + style);
			this.frameStyle = style;
		} else if (this.isMouseDown) {
			this.visible(false);
			this.isMouseDown = false;
		}
	}

	public hide(): void {
		this.visible(false);
	}

	public onMagnify(): void {
		if (!this.animFocus) {
			if (this.isMagnify) {
				this.isMagnify = false;
				this.magnifyClass = ['fa', 'fa-search-plus'];
				this.magnify = 1.0;
			} else {
				this.isMagnify = true;
				this.magnifyClass = ['fa', 'fa-search-minus'];
				this.magnify = 2.0;
			}
			this.frameStyle = this.getFrameStyle();
		}
	}
}
