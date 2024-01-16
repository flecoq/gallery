import { DynamicTexturePlane } from "./dynamicTexturePlane"
import { CameraMark } from "./cameraMark"
import { EngineService } from '../../../engine/engine.service';
import { CameraObject } from "../../../process/scene/cameraObject";
import { Point } from "../../../process/utils/point";
import { UniversalCamera, ActionManager, ExecuteCodeAction } from '@babylonjs/core';

export class CameraMarkTexture extends DynamicTexturePlane {

	public static radius: number = 0.20;

	public markList: CameraMark[] = [];
	public engine: EngineService;

	constructor(size: number, resolution: number, engine: EngineService) {
		super(new Point(size, size), resolution, null, engine);
		this.engine = engine;
		this.plane.position.x = size / 2;
		this.plane.position.z = size / 2;
		this.plane.position.y = 0.05;
		this.plane.rotation.x = Math.PI / 2;
		for (let camera of this.engine.sceneImplList) {
			if (camera instanceof CameraObject) {
				this.markList.push(new CameraMark((camera as CameraObject).toCameraUtils()));
			}
		}
		//this.visible(true);
	}

	public refresh(): void {
		this.clear();
		//this.drawBorder(20, "#ffff00");
		for (let mark of this.markList) {
			this.drawCameraMark(mark, CameraMarkTexture.radius, "#ffff87");
		}
	}

	public drawCameraMark(mark: CameraMark, radius: number, color: string): void {
		var context = this.dynamicTexture.getContext();
		context.beginPath();
		context.arc(this.sizeToRes(mark.camera.position.x), this.sizeToRes(this.size.x - mark.camera.position.z), this.sizeToRes(radius), 0, 2 * Math.PI, false);
		context.lineWidth = this.sizeToRes(radius / 4);
		context.strokeStyle = color;
		context.stroke();

		var begin: number = -Math.PI/2 + mark.camera.rotation.y - mark.camera.fov / 2;
		var end: number = -Math.PI/2 + mark.camera.rotation.y + mark.camera.fov / 2;
		
		var viewRadius: number = radius * 2;
		context.beginPath();
		context.arc(this.sizeToRes(mark.camera.position.x), this.sizeToRes(this.size.x - mark.camera.position.z), this.sizeToRes(viewRadius), begin, end);
		context.fillStyle = color;
		context.fill();
		
		context.beginPath();
		context.moveTo(this.sizeToRes(mark.camera.position.x), this.sizeToRes(this.size.x - mark.camera.position.z));
		context.lineTo(this.sizeToRes(mark.camera.position.x + viewRadius * Math.cos(begin)), this.sizeToRes(this.size.x - mark.camera.position.z + viewRadius * Math.sin(begin)));
		context.lineTo(this.sizeToRes(mark.camera.position.x + viewRadius * Math.cos(end)), this.sizeToRes(this.size.x - mark.camera.position.z + viewRadius * Math.sin(end)));
		context.fillStyle = color;
		context.fill();
		
		this.dynamicTexture.update();
	}


	public onPickAction(): void {
		this.plane.actionManager = new ActionManager(this.engine.scene);
		this.plane.actionManager.registerAction(
			new ExecuteCodeAction(
				ActionManager.OnPickTrigger, (event) => this.onPickActionHandler(event))
		);
	}

	public onPickActionHandler(event): void {
		var pickResult = this.engine.scene.pick(event.pointerX, event.pointerY);
		for (let mark of this.markList) {
			if (mark.isSelected(pickResult.pickedPoint, CameraMarkTexture.radius*2)) {
				//this.engine.viewManager.setMainCamera(mark.camera);
				this.engine.viewManager.currentCamera.detachControl(this.engine.canvas);
				this.engine.animInProgress = true;
				mark.camera.toUniversalCameraAnim(this.engine.viewManager.currentCamera as UniversalCamera, this.engine, 2, () => this.onPickActioEndHandler());
			}
		}
	}

	public onPickActioEndHandler(): void {
		this.engine.viewManager.currentCamera.attachControl(this.engine.canvas, false);
		this.engine.animInProgress = false;
	}

}