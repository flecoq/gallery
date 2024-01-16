import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ToolComponent } from '../../component/toolComponent';
import { ModelService } from '../../service/model.service';
import { Scene } from '../../model/assembler/scene';

@Component({
	selector: 'app-material-selector',
	templateUrl: './material-selector.component.html',
	styleUrls: ['./material-selector.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class MaterialSelectorComponent extends ToolComponent implements OnInit {

	@Output() public event: EventEmitter<string> = new EventEmitter();

	public selected: number;
	public current: Scene;
	public sceneList: Scene[] = [];
	
	constructor(public modelService: ModelService) {
		super(modelService);
	}

	ngOnInit(): void {
		this.hide();
		if( this.modelService.library ) {
			this.sceneList = this.modelService.library.getMaterialList();
		}
	}

	public getThumbUrl(scene: Scene): string {
		//return "./assets/thumb/slot.png";
		return "./assembler/library/material/" + scene.name + ".png";
	}
	
	public select(scene: Scene, $index): void {
		this.current = scene;
		this.selected = $index;
		this.event.emit("selected");
	}
}
