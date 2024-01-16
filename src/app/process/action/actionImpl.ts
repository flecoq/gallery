import { Action } from '../../model/assembler/action';
import { Logger } from '../../process/utils/logger';

export class ActionImpl extends Action {

	public updateBehavior: string = null;	// used to update th parent behavior value (if null, no updating)

	public constructor(action: Action) {
		super();
		action.copy(this);
	}

	public run(parentBehavior: string): void {
		Logger.info("ActionImpl", "run(id: )" + this.id + ", type: " + this.type + ")");
		this.updateBehavior = null;
		if (!this.behavior || (parentBehavior === this.behavior)) {
			this.runRoot();
			this.runChildren(parentBehavior);
		}
	}

	public runRoot(): void {
		this.getUpdateBehavior();
	}

	public runChildren(parentBehavior: string): void {
		for (let child of this.Action) {
			var childImpl: ActionImpl = child as ActionImpl;
			childImpl.run(parentBehavior);
			this.updateBehavior = childImpl.updateBehavior ? childImpl.updateBehavior : this.updateBehavior;
		}
	}

	public getUpdateBehavior(): string {
		var updatBehavior: string = this.getParamValue("behavior");
		if (updatBehavior) {
			this.updateBehavior = updatBehavior;
			return updatBehavior;
		}
		for (let state of this.State) {
			updatBehavior = state.getParamValue("behavior");
			if (updatBehavior) {
				this.updateBehavior = updatBehavior;
				return updatBehavior;
			}
		}	
	}

	public getParentBehavior(): string {
		return null;
	}
	
	public setParentBehavior(value: string): void {}

	public resetParentBehavior(): void {}
}