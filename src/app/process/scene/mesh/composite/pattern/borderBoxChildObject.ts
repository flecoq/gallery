import { Scene } from "../../../../../model/assembler/scene";
import { Param } from "../../../../../model/assembler/param";
import { EngineService } from "../../../../../engine/engine.service";
import { BoxChildObject } from "../boxChildObject";
import { ParamUtils } from '../../../../../process/utils/paramUtils';
import { ActionAllow } from "../../../../../process/utils/actionAllow";
import { Logger } from "../../../../../process/utils/logger";

export class BorderBoxChildObject extends BoxChildObject {
	
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
		if( ParamUtils.getParam(expressionParamList, "margin") == null ) {
			expressionParamList.push(new Param("margin", "0", "true"));
		}
		if( ParamUtils.getParam(expressionParamList, "corner") == null ) {
			expressionParamList.push(new Param("corner", "0", "true"));
		}

		if( !this.isExculde("bottom") ) {
			var boxChildObjectBottom: BoxChildObject = this.addBoxChild(paramList, expressionParamList);
			boxChildObjectBottom.setScale("vector($corner+$scaleZ-2*$margin, $border, $border)");
			boxChildObjectBottom.setPos("vector(0, $margin-$scaleY/2, 0)");
			boxChildObjectBottom.setUW("z;-x");
		}
		
		if( !this.isExculde("top") ) {
			var boxChildObjectTop: BoxChildObject = this.addBoxChild(paramList, expressionParamList);
			boxChildObjectTop.setScale("vector($corner+$scaleZ-2*$margin, $border, $border)");
			boxChildObjectTop.setPos("vector(0, $scaleY/2-$margin, 0)");
			boxChildObjectTop.setUW("z;-x");
		}
		
		if( !this.isExculde("left") ) {
			var boxChildObjectLeft: BoxChildObject = this.addBoxChild(paramList, expressionParamList);
			boxChildObjectLeft.setScale("vector($corner+$scaleY-2*$margin, $border, $border)");
			boxChildObjectLeft.setPos("vector(0, 0, $scaleZ/2-$margin)");
			boxChildObjectLeft.setUW("y;-z");
		}

		if( !this.isExculde("right") ) {
			var boxChildObjectRight: BoxChildObject = this.addBoxChild(paramList, expressionParamList);
			boxChildObjectRight.setScale("vector($corner+$scaleY-2*$margin, $border, $border)");
			boxChildObjectRight.setPos("vector(0, 0, $margin-$scaleZ/2)");
			boxChildObjectRight.setUW("y;-z");
		}
	}

	public writeAllParam(engine: EngineService): void {
		this.writeChildren(engine);
	}

}