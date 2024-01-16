import { Scene } from "../../../../../model/assembler/scene";
import { Param } from "../../../../../model/assembler/param";
import { EngineService } from "../../../../../engine/engine.service";
import { BoxChildObject } from "../boxChildObject";
import { ActionAllow } from "../../../../../process/utils/actionAllow";
import { Logger } from "../../../../../process/utils/logger";

export class FillBoxChildObject extends BoxChildObject {

	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(false, false);
	}

	public write(engine: EngineService): void {
		Logger.info("SceneImpl", "write(name: " + this.name + ", create: " + this.create + ")");
		Logger.debug("SceneImpl", this.Param);
		if (!this.created) {
			this.writeCreate(engine);
		}
		this.writeAllParam(engine);
	}

	public writeCreate(engine: EngineService): void {
		this.created = true;
		var paramList: Param[] = this.getPatternParam();
		var expressionParamList: Param[] = this.parent.getExpressionParamList();
		expressionParamList = expressionParamList.concat(paramList);
		var boxChildObject: BoxChildObject = this.addBoxChild(paramList, expressionParamList);
		boxChildObject.setScale("vector($scaleX, $scaleY, $scaleZ)");
		if( this.getParamValueInt("ori") == 1 ) {
			boxChildObject.setPos("vector($scaleX/2, 0, 0)");
		} else {
			boxChildObject.setPos("vector(-$scaleX/2, 0, 0)");
		}
	}
		
	public writeAllParam(engine: EngineService): void {
		this.writeChildren(engine) ;
	}

}