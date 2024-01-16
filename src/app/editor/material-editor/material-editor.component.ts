import { Component, OnInit, ViewEncapsulation, EventEmitter, Output } from '@angular/core';
import { EngineService } from '../../engine/engine.service';
import { MeshObject } from "../../process/scene/mesh/meshObject";
import { Scene } from "../../model/assembler/scene";
import { Logger } from '../../process/utils/logger';

@Component({
	selector: 'app-material-editor',
	templateUrl: './material-editor.component.html',
	styleUrls: ['./material-editor.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class MaterialEditorComponent implements OnInit {

	@Output() public event: EventEmitter<string> = new EventEmitter();

	public meshObject: MeshObject;
	public filename: string;
	
	constructor(public engine: EngineService) { 
	}

	ngOnInit(): void {
		this.engine.viewManager.objectViewer.event.subscribe(item => this.objectViewerEventHandler(item));		
	}

	private objectViewerEventHandler(event: string): void {
		if( event === "refresh") {
			this.meshObject = this.engine.viewManager.objectViewer.meshObject; 
			Logger.info("MaterialEditorComponent", "objectViewerEventHandler(" + this.meshObject.name + ")");
		}
	}

	public onChoiceModel(): void {
		Logger.info("MaterialEditorComponent", "onChoiceModel() emit 'materialSelector'");
		this.event.emit("materialSelector");
	}

	public onEdit(): void {
		// TODO
	}

	public snapshot(): void {
		this.engine.viewManager.createSnapshot(this.filename, "slot");
	}
	
	public selectModel(scene: Scene): void {
		Logger.info("MaterialEditorComponent", "selectModel(" + scene.name + ")");
		this.filename = scene.name;
		this.meshObject.material.assignModel(scene, this.engine);
	}

}
