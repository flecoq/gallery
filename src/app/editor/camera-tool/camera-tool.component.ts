import { Component, OnInit, ViewChild, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ToolComponent } from '../../component/toolComponent';
import { SelectComponent } from '../../component/selectComponent';
import { SceneImplOption } from '../../component/sceneImplOption';
import { ModelService } from '../../service/model.service';
import { EngineService } from '../../engine/engine.service';
import { CameraObject } from "../../process/scene/cameraObject";
import { FormatUtils } from '../../process/utils/formatUtils';
import { ModalAddCameraComponent } from '../modal-add-camera/modal-add-camera.component';

@Component({
	selector: 'app-camera-tool',
	templateUrl: './camera-tool.component.html',
	styleUrls: ['./camera-tool.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class CameraToolComponent extends ToolComponent implements OnInit {

	@Output() public event: EventEmitter<string> = new EventEmitter();

	public cameraSelect: SelectComponent;
	public current: CameraObject;
	public fov: number;
	
	@ViewChild(ModalAddCameraComponent)
	private modalAddCamera: ModalAddCameraComponent;

	constructor(public engine: EngineService, public modelService: ModelService) {
		super(modelService);
	}

	ngOnInit(): void {
		this.hide();
		this.cameraSelect = new SelectComponent();
		this.refreshCameraSelect();
	}
	
	public refreshCameraSelect(): void {
		this.cameraSelect.clear();
		var selected: string = null;
		for(let sceneImpl of this.engine.sceneImplList) {
			if( sceneImpl.type === "camera" ) {
				this.cameraSelect.addOption(new SceneImplOption(sceneImpl.name, sceneImpl.name, sceneImpl));
				if( sceneImpl.getParamValueBool("current") ) {
					selected = sceneImpl.name;
				}
			}
		}
		this.cameraSelect.select(selected);
		this.current = this.engine.getSceneImpl(selected) as CameraObject;
		this.updateCurrent();
	}

	public updateCurrent(): void {
		if( this.current ) {
			this.fov = this.current.getParamValueFloat("fov");
			this.engine.viewManager.selectMainCamera(this.current.camera);
		}
	}

	public updateModel(): void {
		this.current.addOrUpdateParam("fov", this.fov.toString());
		this.current.readTransformParam(this.engine);
		this.engine.modelService.addPersistProcess(this.current.process);
	}

	public updateFov(): void {
		this.current.camera.fov = FormatUtils.degToRad(this.fov);
	}
		
	public updateModelCurrentParam(): void {
		for(let sceneImpl of this.engine.sceneImplList) {
			if( sceneImpl.type === "camera" ) {
				sceneImpl.addOrUpdateParam("current", this.current.name === sceneImpl.name ? "true" : "false");
			}
		}
		this.engine.modelService.addPersistProcess(this.current.process);
	}

	public cameraSelectChange(item: string): void {
		this.current.detachControl(this.engine);
		this.current = this.engine.getSceneImpl(item) as CameraObject;
		this.updateModelCurrentParam();
		this.updateCurrent();
	}

	public onReset(): void {
		this.current.write(this.engine);
		this.fov = this.current.getParamValueFloat("fov");
	}

	public onAdd(): void {
		this.event.emit("addCamera");
	}

	public onDelete(): void {
		if( this.cameraSelect.optionList.length > 1) {
			this.current.detachControl(this.engine);
			if( this.cameraSelect.optionList[0].value === this.current.name) {
				(this.cameraSelect.optionList[1] as SceneImplOption).sceneImpl.addOrUpdateParam("current", "true");
			} else {
				(this.cameraSelect.optionList[0] as SceneImplOption).sceneImpl.addOrUpdateParam("current", "true");
			}
			this.current.delete(this.engine);
			this.refreshCameraSelect();
			this.updateCurrent();
			this.engine.modelService.addPersistProcess(this.current.process);
		}
	}
	
	public modalAddCameraEventHandler(event: string): void {
		if( event === "close" ) {
			this.event.emit("closeAddCamera");
		} else if( event === "confirm" ) {
			this.event.emit("closeAddCamera");
			this.addCamera();
		}
	}
	
	public addCamera(): void {
		var cameraObject: CameraObject = new CameraObject(this.current.clone());
		cameraObject.name = this.modalAddCamera.name;
		cameraObject.process = this.current.process;
		cameraObject.addOrUpdateParam("fov", this.fov.toString());
		cameraObject.addOrUpdateParam("pos", FormatUtils.vectorToString(this.current.camera.position));
		cameraObject.addOrUpdateParam("target", FormatUtils.vectorToString(this.current.camera.getTarget()));
		cameraObject.addOrUpdateParam("current", "true");
		this.current.addOrUpdateParam("current", "false");
		this.current.detachControl(this.engine);
		cameraObject.write(this.engine);
		this.current.write(this.engine);
		this.current.process.addSceneImpl(cameraObject, this.engine);
		this.modelService.updateProcess(this.current.process);
		this.refreshCameraSelect();
	}
}
