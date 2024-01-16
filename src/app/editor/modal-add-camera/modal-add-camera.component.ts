import { Component, OnInit, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
	selector: 'app-modal-add-camera',
	templateUrl: './modal-add-camera.component.html',
	styleUrls: ['./modal-add-camera.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ModalAddCameraComponent implements OnInit {

	@Output() public event: EventEmitter<string> = new EventEmitter();

	public name: string;
	
	constructor() { }

	ngOnInit(): void {
	}

	public close():void {
		this.event.emit("close");
	}

	public confirm():void {
		// TODO check name: void ? already exists ?
		if( this.name.length > 0 ) {
			this.event.emit("confirm");
		}
	}
	
}
