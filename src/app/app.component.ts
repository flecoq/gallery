import { Component } from '@angular/core';
import { EngineService } from './engine/engine.service';
import { ModelService } from './service/model.service';
import { Expression } from './process/expression/expression';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})
export class AppComponent {
	
	constructor(public engine: EngineService, public modelService: ModelService) {
	}

	public ngOnInit(): void {
		Expression.test();
	}

}
