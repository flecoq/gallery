import { ObjectViewer } from "../../process/scene/mesh/viewer/objectViewer";
import { MeshObject } from "../../process/scene/mesh/meshObject";
import { SnapshotServer } from '../../model/server/snapshotServer';
import { EngineService } from '../engine.service';
import { Point } from "../../process/utils/point";
import { Camera, UniversalCamera, Tools, DynamicTexture, StandardMaterial, Color3, Mesh, Vector3 } from '@babylonjs/core';
import { Logger } from '../../process/utils/logger';
import { CameraUtils } from "../../process/utils/cameraUtils";
import { CameraMarkTexture } from "../../process/scene/info/cameraMarkTexture";

export class ViewManager {

	public currentCamera: Camera;
	public mainCamera: Camera;
	public sceneRoot: MeshObject;
	public objectViewer: ObjectViewer;
	public isSceneRoot: boolean = true;

	public snapshotSize: Point;
	public snapshotFilename: string;
	public snapshotType: string;

	public cameraHisto: CameraUtils[] = [];
	public indexHisto: number = 0;
	
	public cameraMarkTexture: CameraMarkTexture;

	public constructor(public engine: EngineService) {
		this.sceneRoot = MeshObject.createMeshObject("root", engine);
		this.objectViewer = new ObjectViewer(engine);
		this.showWorldAxis(8);

		var camera = new UniversalCamera('camera', new Vector3(5, 15, -12), this.engine.scene);
		camera.setTarget(Vector3.Zero());
		this.selectCamera(camera);
	}

	public addMesh(mesh: Mesh) {
		if (this.isSceneRoot) {
			this.sceneRoot.mesh.addChild(mesh);
		} else {
			this.objectViewer.mesh.addChild(mesh);
		}
	}


	public addMeshObject(meshObject: MeshObject) {
		if (this.isSceneRoot) {
			this.sceneRoot.addChildMesh(meshObject);
			Logger.info("ViewManager", "addMeshObject(" + meshObject.name + ") in sceneRoot");
		} else {
			this.objectViewer.addChildMesh(meshObject);
			Logger.info("ViewManager", "addMeshObject(" + meshObject.name + ") in objectViewer");
		}
	}

	public selectCamera(camera: Camera): void {
		this.engine.scene.activeCamera = camera;
		camera.attachControl(this.engine.canvas, false);
		this.currentCamera = camera;
	}

	public selectMainCamera(camera: Camera): void {
		this.mainCamera = camera;
		this.selectCamera(this.mainCamera);
	}

	public switchCamera(newCamera: Camera, oldCamera: Camera): void {
		this.selectCamera(newCamera);
		oldCamera.detachControl(this.engine.canvas);
	}

	public enableObjectViewer(enable: boolean): void {
		this.sceneRoot.visibility(!enable);
		this.objectViewer.visibility(enable);
		this.switchCamera(enable ? this.objectViewer.camera : this.mainCamera,
			enable ? this.mainCamera : this.objectViewer.camera);
		this.engine.transformGizmo.dettach();
		this.isSceneRoot = !enable;
	}

	public createSnapshot(filename: string, type: string): void {
		this.snapshotFilename = filename;
		this.snapshotType = type;
		var wrapper = document.getElementById("engine-wrapper");
		this.snapshotSize = new Point(wrapper.offsetWidth, wrapper.offsetHeight);
		Logger.info("ViewManager", "createSnapshot:" + wrapper.offsetWidth + "x" + wrapper.offsetHeight);
		Tools.CreateScreenshot(this.engine.engine, this.currentCamera, { width: wrapper.offsetWidth, height: wrapper.offsetHeight },
			data => this.createSnapshotHandler(data));
	}

	public createSnapshotHandler(data): void {
		this.engine.modelService.createSnapshot(new SnapshotServer(this.snapshotFilename, this.snapshotSize, data), this.snapshotType);
	}

	public addCameraHisto(): void {
		var camera: UniversalCamera = this.mainCamera as UniversalCamera;
		this.cameraHisto.push(CameraUtils.createFromUniversalCamera(camera));
		this.indexHisto = this.cameraHisto.length - 1;
	}

	public getMainCamera(): CameraUtils {
		var camera: UniversalCamera = this.currentCamera as UniversalCamera;
		return CameraUtils.createFromUniversalCamera(camera);
	}

	public getMainRotCamera(): CameraUtils {
		var camera: UniversalCamera = this.currentCamera as UniversalCamera;
		return CameraUtils.createFromRotUniversalCamera(camera);
	}

	public setMainCamera(camera: CameraUtils): void {
		camera.toUniversalCamera(this.mainCamera as UniversalCamera);
	}

	public prevCameraHisto(): void {
		var camera: CameraUtils = CameraUtils.createFromUniversalCamera(this.mainCamera as UniversalCamera);
		if (camera.equals(this.cameraHisto[this.indexHisto])) {
			if (this.indexHisto > 0) {
				this.indexHisto--;
			}
			this.cameraHisto[this.indexHisto].toUniversalCamera(this.mainCamera as UniversalCamera);
		} else {
			this.cameraHisto[this.indexHisto].toUniversalCamera(this.mainCamera as UniversalCamera);
			if (this.indexHisto > 0) {
				this.indexHisto--;
			}
		}
		Logger.info("ViewManager", "prevCameraHisto(index ->" + this.indexHisto + ")");
	}

	public nextCameraHisto(): void {
		var camera: CameraUtils = CameraUtils.createFromUniversalCamera(this.mainCamera as UniversalCamera);
		if (camera.equals(this.cameraHisto[this.indexHisto])) {
			if (this.indexHisto < this.cameraHisto.length - 1) {
				this.indexHisto++;
			}
			this.cameraHisto[this.indexHisto].toUniversalCamera(this.mainCamera as UniversalCamera);
		} else {
			this.cameraHisto[this.indexHisto].toUniversalCamera(this.mainCamera as UniversalCamera);
			if (this.indexHisto < this.cameraHisto.length - 1) {
				this.indexHisto++;
			}
		}
		Logger.info("ViewManager", "nextCameraHisto(index ->" + this.indexHisto + ")");
	}

	public showWorldAxis(size: number): void {

		const makeTextPlane = (text: string, color: string, textSize: number) => {
			const dynamicTexture = new DynamicTexture('DynamicTexture', 50, this.engine.scene, true);
			dynamicTexture.hasAlpha = true;
			dynamicTexture.drawText(text, 5, 40, 'bold 36px Arial', color, 'transparent', true);
			const plane = Mesh.CreatePlane('TextPlane', textSize, this.engine.scene, true);
			const material = new StandardMaterial('TextPlaneMaterial', this.engine.scene);
			material.backFaceCulling = false;
			material.specularColor = new Color3(0, 0, 0);
			material.diffuseTexture = dynamicTexture;
			plane.material = material;

			return plane;
		};

		const axisX = Mesh.CreateLines(
			'axisX',
			[
				Vector3.Zero(),
				new Vector3(size, 0, 0), new Vector3(size * 0.95, 0.05 * size, 0),
				new Vector3(size, 0, 0), new Vector3(size * 0.95, -0.05 * size, 0)
			],
			this.engine.scene
		);

		axisX.color = new Color3(1, 0, 0);
		const xChar = makeTextPlane('X', 'red', size / 10);
		xChar.position = new Vector3(0.9 * size, -0.05 * size, 0);

		const axisY = Mesh.CreateLines(
			'axisY',
			[
				Vector3.Zero(), new Vector3(0, size, 0), new Vector3(-0.05 * size, size * 0.95, 0),
				new Vector3(0, size, 0), new Vector3(0.05 * size, size * 0.95, 0)
			],
			this.engine.scene
		);

		axisY.color = new Color3(0, 1, 0);
		const yChar = makeTextPlane('Y', 'green', size / 10);
		yChar.position = new Vector3(0, 0.9 * size, -0.05 * size);

		const axisZ = Mesh.CreateLines(
			'axisZ',
			[
				Vector3.Zero(), new Vector3(0, 0, size), new Vector3(0, -0.05 * size, size * 0.95),
				new Vector3(0, 0, size), new Vector3(0, 0.05 * size, size * 0.95)
			],
			this.engine.scene
		);

		axisZ.color = new Color3(0, 0, 1);
		const zChar = makeTextPlane('Z', 'blue', size / 10);
		zChar.position = new Vector3(0, 0.05 * size, 0.9 * size);
	}
}
