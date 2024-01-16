import { Action } from '../../model/assembler/action';
import { ActionImpl } from '../../process/action/actionImpl';
import { SceneImpl } from '../../process/scene/sceneImpl';
import { Logger } from '../../process/utils/logger';

export class SceneAction extends ActionImpl {

	public sceneImpl: SceneImpl;
	
	public constructor(action: Action) {
		super(action);
		action.copy(this);
	}

	public run(parentBehavior: string): void {
		super.run(parentBehavior);
		this.sceneImpl.behavior = this.updateBehavior ? this.updateBehavior : this.sceneImpl.behavior;
	}

	public getParentBehavior(): string {
		return this.sceneImpl.behavior;
	}
	
	public setParentBehavior(value: string): void {
		this.sceneImpl.behavior = value;
	}
	
	public resetParentBehavior(): void {
		this.sceneImpl.behavior = null;
	}

}