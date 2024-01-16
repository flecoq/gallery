import { WindowRefService } from './../service/window-ref.service';
import { ElementRef, Injectable, NgZone, EventEmitter } from '@angular/core';
import { SceneImpl } from "../process/scene/sceneImpl";
import { MeshObject } from "../process/scene/mesh/meshObject";
import { WallObject } from "../process/scene/mesh/wallObject";
import { CompositeObject } from '../process/scene/mesh/composite/compositeObject';
import { MergeChildObject } from '../process/scene/mesh/composite/mergeChildObject';
import { FloorObject } from "../process/scene/mesh/floorObject";
import { PictureObject } from "../process/scene/mesh/pictureObject";
import { MergeObject } from "../process/scene/mesh/mergeObject";
import { LightImpl } from "../process/scene/light/lightImpl";
import { TransformGizmo } from "../process/utils/transformGizmo";
import { ModelService } from './../service/model.service';
import { ViewManager } from "./view/viewManager";
import { CollisionManager } from "./collision/collisionManager";
import { Engine, Scene, Color4, UniversalCamera, PickingInfo, KeyboardInfo, KeyboardEventTypes } from '@babylonjs/core';
import { Logger } from '../process/utils/logger';
import { EditorComponent } from '../editor/editor/editor.component';
import { VisitComponent } from '../visit/visit/visit.component';
import { Monitor } from '../component/monitoring/monitor'
import { SceneAction } from "../process/action/sceneAction";
import { CameraUtils } from "../process/utils/cameraUtils";
import { CameraMarkTexture } from "../process/scene/info/cameraMarkTexture";
import { LayerImpl } from "../process/scene/utils/layerImpl";

@Injectable({ providedIn: 'root' })
export class EngineService {

	public edit: boolean;
	public canvas: HTMLCanvasElement;
	public engine: Engine;
	public scene: Scene;
	public sceneImplList: SceneImpl[] = [];
	public transformGizmo: TransformGizmo;
	public modelService: ModelService;

	public pickedSceneImpl: SceneImpl = null;
	public editorComponent: EditorComponent;
	public visitComponent: VisitComponent;

	public viewManager: ViewManager;
	public collisionMgr: CollisionManager;

	public isPointerDown: boolean = false;
	public isCameraKeyboardDown: boolean = false;
	public cameraAfterRender: CameraUtils;
	public animInProgress: boolean;
	public event: EventEmitter<string> = new EventEmitter();

	public monitor: Monitor;

	public constructor(
		private ngZone: NgZone,
		private windowRef: WindowRefService
	) { }

	public init(canvas: ElementRef<HTMLCanvasElement>, modelService: ModelService): void {
		Logger.info("EnginService", "init(" + this.edit + ")");
		this.canvas = canvas.nativeElement;
		this.modelService = modelService;
		//this.clear();
		this.engine = new Engine(this.canvas, true, { preserveDrawingBuffer: true, stencil: true });
		this.scene = new Scene(this.engine);
		this.scene.clearColor = new Color4(0, 0, 0, 0);
		this.viewManager = new ViewManager(this);
		this.animate();
		//var light = new HemisphericLight("hemiLight", new Vector3(10, 10, 0), this.scene);
		
		if (this.edit) {
			this.monitor = new Monitor(this.engine, this.scene);
			this.transformGizmo = new TransformGizmo(this.scene, this.modelService, this);
		}

		this.collisionMgr = new CollisionManager(this);
		this.collisionMgr.maxDistance = 1.0;
		this.scene.registerBeforeRender(() => this.registerBeforeRenderHandler());
		this.scene.registerAfterRender(() => this.registerAfterRenderHandler());
		this.scene.onPointerDown = () => this.onPointerDownHandler();
		this.scene.onPointerUp = () => this.onPointerUpHandler();
		this.scene.onPointerMove = (evt: PointerEvent, pickInfo: PickingInfo) => this.onPointerMoveHandler(evt, pickInfo);
		this.scene.onKeyboardObservable.add((kbInfo) => this.onKeyboardHandler(kbInfo));

		MergeChildObject.clear();
	}

	private onPointerDownHandler(): void {
		this.isPointerDown = true;
	}

	private onPointerUpHandler(): void {
		this.isPointerDown = false;
	}

	private onKeyboardHandler(kbInfo: KeyboardInfo): void {
		switch (kbInfo.type) {
			case KeyboardEventTypes.KEYDOWN:
				Logger.info("engine.service", "onKeyboardHandler(key down: " + kbInfo.event.keyCode + ")");
				if (this.isCameraKeyboard(kbInfo.event.keyCode)) {
					this.isCameraKeyboardDown = true;
				}
				break;
			case KeyboardEventTypes.KEYUP:
				Logger.info("engine.service", "onKeyboardHandler(key up: " + kbInfo.event.keyCode + ")");
				if (this.isCameraKeyboard(kbInfo.event.keyCode)) {
					this.isCameraKeyboardDown = false;
				}
				break;
		}
	}

	private isCameraKeyboard(code: number): boolean {
		return code <= 40 && code >= 36;
	}

	private registerBeforeRenderHandler(): void {
		// asset info check (visit)
		if (this.isCameraKeyboardDown && this.visitComponent
			&& this.visitComponent.assetInfoComponent) {
			this.visitComponent.assetInfoComponent.checkVisible();
		}

		// collision check
		if ( this.viewManager.isSceneRoot && !this.animInProgress && !this.collisionMgr.waitAfterRender &&
			this.viewManager && this.viewManager.mainCamera) {
			var camera: CameraUtils = this.viewManager.getMainRotCamera();
			var isFocusObject: boolean = false;
			for (let sceneImpl of this.sceneImplList) {
				if (sceneImpl instanceof MeshObject && !(sceneImpl instanceof PictureObject)
					&& (sceneImpl as MeshObject).inCollisionBoundingBox(camera.position, this.collisionMgr.getMaxDistance(sceneImpl))) {
					if (this.collisionMgr.focusObject && this.collisionMgr.focusObject.name === sceneImpl.name) {
						isFocusObject = true;
					} else {
						Logger.info("engine.service", "camera collision with " + sceneImpl.name);
						this.viewManager.setMainCamera(this.cameraAfterRender);
					}
				}
			}
			if (!isFocusObject) {
				this.collisionMgr.focusObject = null;
			}
		}

		// over object
		var pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
		if (pickResult.hit && pickResult.pickedMesh.metadata != null) {
			// display cameraMarkTexture
			if (this.viewManager.cameraMarkTexture) {
				if (pickResult.pickedMesh.metadata instanceof FloorObject) {
					this.viewManager.cameraMarkTexture.visible(true);
				} else if (!(pickResult.pickedMesh.metadata instanceof CameraMarkTexture)) {
					this.viewManager.cameraMarkTexture.visible(false);
				}
			}
		} else if ( pickResult.pickedMesh == null && this.viewManager.cameraMarkTexture) {
			this.viewManager.cameraMarkTexture.visible(false);
		}
	}

	private registerAfterRenderHandler(): void {
		if (this.viewManager && this.viewManager.mainCamera) {
			this.cameraAfterRender = this.viewManager.getMainCamera();
		}
		this.collisionMgr.waitAfterRender = false;
	}

	private onPointerMoveHandler(evt: PointerEvent, pickInfo: PickingInfo) {
		// asset info check (visit)
		if (this.visitComponent && this.visitComponent.assetInfoComponent
			&& this.isPointerDown) {
			this.visitComponent.assetInfoComponent.checkVisible();
		}
		if( this.transformGizmo && this.transformGizmo.dragging && this.transformGizmo.meshObject instanceof CompositeObject) {
			(this.transformGizmo.meshObject as CompositeObject).writeTransformOnly(this);
		}
	}

	public isEdit(): boolean {
		return this.edit;
	}

	public isVisit(): boolean {
		return !this.edit;
	}

	public clear(): void {
		this.scene.dispose();
		this.engine.dispose();
		this.scene = new Scene(this.engine);
		this.sceneImplList = [];
	}

	public addSceneImpl(sceneImpl: SceneImpl): void {
		this.sceneImplList.push(sceneImpl);
	}

	public getSceneImpl(name: string): SceneImpl {
		for (let scene of this.sceneImplList) {
			if (scene.name === name) {
				return scene;
			}
		}
		return null;
	}

	public getLightImpl(name: string): LightImpl {
		for (let scene of this.sceneImplList) {
			if (scene instanceof LightImpl && scene.getParamValueBool("shadow")
				&& (name == null || scene.name === name)) {
				return scene as LightImpl;
			}
		}
		return null;
	}

	public getLayerImpl(name: string): LayerImpl {
		for (let scene of this.sceneImplList) {
			if (scene instanceof LayerImpl && scene.name === name) {
				return scene as LayerImpl;
			}
		}
		return null;
	}

	public getAllLayerImpl(): LayerImpl[] {
		var result : LayerImpl[] = [];
		for (let scene of this.sceneImplList) {
			if (scene instanceof LayerImpl) {
				result.push(scene);
			}
		}
		return result;
	}

	public deleteSceneImpl(scene: SceneImpl): void {
		var sceneImplList: SceneImpl[] = [];
		for (let sceneImpl of this.sceneImplList) {
			if (!(sceneImpl.name === scene.name) || !(sceneImpl.type === scene.type)) {
				sceneImplList.push(sceneImpl);
			}
		}
		this.sceneImplList = sceneImplList;
	}

	public pickSceneImpl(sceneImpl: SceneImpl): void {
		if (this.edit) {
			this.pickSceneImplEdit(sceneImpl);
		} else {
			this.pickSceneImplVisit(sceneImpl);
		}
		this.pickedSceneImpl = sceneImpl;
	}

	public pickSceneImplEdit(sceneImpl: SceneImpl): void {
		Logger.info("EngineService", "pickSceneImplEdit(" + sceneImpl.name + ")");
		if (this.pickedSceneImpl && this.pickedSceneImpl.actionAlow.gizmo && !sceneImpl.actionAlow.gizmo) {
			this.transformGizmo.attachToMesh(null);
		}
		if (sceneImpl.actionAlow.bottomTool) {
			this.editorComponent.sceneImplBottomTool(sceneImpl);
		}
		if (this.pickedSceneImpl) {
			this.pickedSceneImpl.highlight(false);
		}
		sceneImpl.highlight(true);
	}

	public pickSceneImplVisit(sceneImpl: SceneImpl): void {
		Logger.info("EngineService", "pickSceneImplVisit(" + sceneImpl.name + ")");
		for (let action of sceneImpl.Action) {
			if ("assetInfo" === action.type) {
				this.visitComponent.runAssetInfoAction(action as SceneAction);
			}
		}
	}

	public sceneImplFocus(sceneImpl: SceneImpl): void {
		this.collisionMgr.focus = true;
		this.collisionMgr.waitAfterRender = true;
		var camera: CameraUtils = sceneImpl.focusCamera((this.viewManager.currentCamera as UniversalCamera).fov);
		for (let sceneImpl of this.sceneImplList) {
			if (sceneImpl instanceof WallObject) {
				this.collisionMgr.focusWallCollision(camera, sceneImpl as WallObject)
			} else if (sceneImpl instanceof CompositeObject) {
				this.collisionMgr.focusCompositeObjectCollision(camera, sceneImpl as CompositeObject)
			} else if (sceneImpl instanceof MergeObject
				&& (sceneImpl as MeshObject).inCollisionBoundingBox(camera.position, this.collisionMgr.getMaxDistance(sceneImpl))) {
				this.collisionMgr.focusObject = sceneImpl;
			}
		}
		camera.toUniversalCamera(this.viewManager.currentCamera as UniversalCamera);
	}

	public sceneImplFocusVisit(sceneImpl: SceneImpl, duration: number): void {
		this.viewManager.currentCamera.detachControl(this.canvas);
		this.collisionMgr.focus = true;
		this.collisionMgr.waitAfterRender = true;
		var camera: CameraUtils = sceneImpl.focusCamera((this.viewManager.currentCamera as UniversalCamera).fov);
		for (let sceneImpl of this.sceneImplList) {
			if (sceneImpl instanceof WallObject) {
				this.collisionMgr.focusWallCollision(camera, sceneImpl as WallObject)
			} else if (sceneImpl instanceof CompositeObject) {
				this.collisionMgr.focusCompositeObjectCollision(camera, sceneImpl as CompositeObject)
			} else if (sceneImpl instanceof MergeObject
				&& (sceneImpl as MeshObject).inCollisionBoundingBox(camera.position, this.collisionMgr.getMaxDistance(sceneImpl))) {
				this.collisionMgr.focusObject = sceneImpl;
			}
		}
		camera.toUniversalCameraAnim(this.viewManager.currentCamera as UniversalCamera, this, 2, () => {this.focusVisitEndHandler()});
		this.viewManager.currentCamera.attachControl(this.canvas, false);
		this.animInProgress = true;
	}

	public focusVisitEndHandler(): void {
		this.viewManager.currentCamera.attachControl(this.canvas, false);
		this.animInProgress = false;
		this.event.emit("focusVisitEnd");
	}

	public refreshReference(name: string): void {
		Logger.info("EnginService", "refreshReference(" + name + ")");
		for (let sceneImpl of this.sceneImplList) {
			if (sceneImpl.getParamValue("reference") === name) {
				sceneImpl.write(this);
			}
		}
	}

	public animate(): void {
		// We have to run this outside angular zones,
		// because it could trigger heavy changeDetection cycles.
		this.ngZone.runOutsideAngular(() => {
			const rendererLoopCallback = () => {
				this.scene.render();
			};

			if (this.windowRef.document.readyState !== 'loading') {
				this.engine.runRenderLoop(rendererLoopCallback);
			} else {
				this.windowRef.window.addEventListener('DOMContentLoaded', () => {
					this.engine.runRenderLoop(rendererLoopCallback);
				});
			}

			this.windowRef.window.addEventListener('resize', () => {
				this.engine.resize();
			});
		});
	}
}
