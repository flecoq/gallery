import { Component } from '@angular/core';
import { ModelService } from '../service/model.service';

@Component({
	template: ''
})
export class ToolComponent {

	public style: string;
	public closed: boolean = true;

	constructor(public modelService: ModelService) {
	}

	public visible(): void {
		this.style = "visibility: visible";
		this.closed = false;
	}

	public hide(): void {
		this.style = "visibility: hidden";
		this.closed = true;
	}

	public visibleStyle(): string {
		//return "visibility: visible; width: 100%; height: 100%";
		return "visibility: visible";
	}

	public hideStyle(): string {
		//return "visibility: hidden; width: 0px; height: 0px";
		return "visibility: hidden";
	}

	public dragHide(value: boolean): void {
		if (value) {
			this.style = "visibility: hidden";
		} else if (!this.closed) {
			this.style = "visibility: visible";
		}
	}
	public updateCurrent(): void {
		// Update current element
		// call: init tool / prev / next
		// ex: creation (object-detail) / support (support-detail)
	}

	public updateModel(refresh: boolean): void {
		// Update current element model
		// refresh -> refresh objectView (meshObject.write())
	}

	public prev(): void {
		// select prev element
	}

	public refreshRoom(): void {
		// refresh room meshObjects
		// ex: support-detail -> refresh sceneImpl with refreshed support reference
	}
}