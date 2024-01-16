import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ToolComponent } from '../../component/toolComponent';
import { ModelService } from '../../service/model.service';
import { Support } from '../../process/scene/mesh/support/support';

@Component({
  selector: 'app-support-list',
  templateUrl: './support-list.component.html',
  styleUrls: ['./support-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SupportListComponent extends ToolComponent implements OnInit {

	@Output() public event: EventEmitter<string> = new EventEmitter();

	public selected: number;
	public current: Support = null;
	public supportList: Support[] = null;
	
	constructor(public modelService: ModelService) {
		super(modelService);
	}

	ngOnInit(): void {
		this.hide();
	}
	
	public show(modelService: ModelService): void {
		super.visible();
		this.modelService = modelService;
		this.updateSupportList();
		if( this.current == null ) {
			this.select(this.supportList[0], 0);
		}
	}

	public updateSupportList(): void {
		this.supportList = this.modelService.room.getSupportList(this.modelService);
	}

	public select(support: Support, $index): void {
		this.current = support;
		this.selected = $index;
		this.event.emit("selected");
	}

	public supportDetail(support: Support, $index: number): void {
		this.current = support;
		this.selected = $index;
		this.hide();
		this.event.emit("detail");
	}

}
