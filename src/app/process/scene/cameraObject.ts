import { Scene } from "../../model/assembler/scene";
import { SceneImpl } from "../../process/scene/sceneImpl";
import { Param } from "../../model/assembler/param";
import { Vector3 } from "@babylonjs/core/Maths/math";
import { FormatUtils } from '../../process/utils/formatUtils';
import { CameraUtils } from '../../process/utils/cameraUtils';
import { Camera, UniversalCamera } from "@babylonjs/core";
import { EngineService } from "../../engine/engine.service";

export class CameraObject extends SceneImpl {

	public camera: UniversalCamera;
	public target: Vector3;

	public constructor(scene: Scene) {
		super(scene);
		scene.copy(this);
	}

	public write(engine: EngineService): void {
		super.write(engine);
		if( this.getParamValueBool("current") ) {
			engine.viewManager.selectMainCamera(this.camera);
		}
	}

	public writeCreate(engine: EngineService): void {
		this.camera = new UniversalCamera(this.name, new Vector3(), engine.scene);
		super.writeCreate(engine);
		this.camera.metadata = this;
		
		// default properties
		this.camera.minZ = 0.2;
		this.camera.fov = FormatUtils.degToRad(60);
		this.camera.speed = 0.15;
		this.camera.inertia = 0.9;
		this.camera.angularSensibility = 3000;
		
		/*this.camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
		this.camera.orthoTop = 10;
		this.camera.orthoBottom = -10;
		this.camera.orthoLeft = -10;
		this.camera.orthoRight = 10;*/
	}

	public writeParam(param: Param): void {
		this.writeTransformParam(param);
		if ("fov" === param.name) {
			this.camera.fov = FormatUtils.degToRad(param.getFloatValue());
		} else if ("speed" === param.name) {
			this.camera.speed = param.getFloatValue();
		} else if ("inertia" === param.name) {
			this.camera.inertia = param.getFloatValue();
		} else if ("angularSensibility" === param.name) {
			this.camera.angularSensibility = param.getFloatValue();
		} 
	}

	public writeTransformParam(param: Param): void {
		this.position = this.camera.position;
		this.rotation = this.camera.rotation;
		super.writeTransformParam(param);
		this.camera.position = this.position;
		this.camera.rotation = this.rotation;
		if ("target" === param.name) {
			this.target = param.getVectorValue();
			this.camera.setTarget(param.getVectorValue());
		}	
	}
	
	public readTransformParam(engine: EngineService): void {
		this.addOrUpdateParam("pos", FormatUtils.vectorToString(this.camera.position));
		this.addOrUpdateParam("target", FormatUtils.vectorToString(this.camera.getTarget()));
	}

	public detachControl(engine: EngineService): void {
		this.camera.detachControl(engine.canvas);
	}
	
	public toCameraUtils(): CameraUtils {
		var result: CameraUtils =  CameraUtils.createFromUniversalCamera(this.camera);
		result.target = this.target;
		return result;
	}
}