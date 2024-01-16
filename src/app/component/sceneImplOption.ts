import { SceneImpl } from "../process/scene/sceneImpl";
import { SelectOption } from "../component/selectOption";

export class SceneImplOption extends SelectOption {
	public sceneImpl: SceneImpl
	
	constructor(value: string, label: string, sceneImpl: SceneImpl) {
		super(value, label);
		this.sceneImpl = sceneImpl;
	}

}