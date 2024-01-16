import { Component, ViewChild, OnInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { DetailComponent } from '../../component/detailComponent';
import { MaterialEditorComponent } from '../material-editor/material-editor.component';
import { ModelService } from '../../service/model.service';
import { EngineService } from '../../engine/engine.service';

@Component({
	selector: 'app-object-detail',
	templateUrl: './object-detail.component.html',
	styleUrls: ['./object-detail.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ObjectDetailComponent extends DetailComponent implements OnInit {

	@Output() public event: EventEmitter<string> = new EventEmitter();

	@ViewChild(MaterialEditorComponent)
	public materialEditor: MaterialEditorComponent;

	constructor(public engine: EngineService, public modelService: ModelService) {
		super(modelService);
	}

	ngOnInit(): void {
		this.hide();
	}

	public close(): void {
		this.hide();
		this.event.emit("close");
	}

	public updateCurrent(): void {
		super.updateCurrent();
		this.engine.viewManager.objectViewer.viewCreation(this.assetManager.current.id);
	}

	public materialEditorEventHandler(event: string): void {
		this.event.emit(event);
	}

}
