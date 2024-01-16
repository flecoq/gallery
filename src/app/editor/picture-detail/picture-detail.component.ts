import { Component, OnInit, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { DetailComponent } from '../../component/detailComponent';
import { ModelService } from '../../service/model.service';

@Component({
  selector: 'app-picture-detail',
  templateUrl: './picture-detail.component.html',
  styleUrls: ['./picture-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PictureDetailComponent extends DetailComponent implements OnInit {

	@Output() public event: EventEmitter<string> = new EventEmitter();

	public pictureUrl: string
	
	constructor(public modelService: ModelService) {
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
		this.pictureUrl = this.assetManager.current.getUrl();
		super.updateCurrent();
	}

}
