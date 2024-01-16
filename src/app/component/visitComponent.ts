import { Component } from '@angular/core';
import { ModelService } from '../service/model.service';

@Component({
	template: ''
})
export class VisitComponent {

	public style: string;
	public closed: boolean = true;

	constructor(public modelService: ModelService) {
	}

	public visible(enable: boolean): void {
		this.style = enable ? "visibility: visible" : "visibility: hidden";
		this.closed = enable;
	}
	public visibleStyle(enable: boolean): string {
		return enable ? "visibility: visible" : "visibility: hidden";
	}
}