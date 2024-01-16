import { Scene } from "../../../../../model/assembler/scene";
import { Param } from "../../../../../model/assembler/param";
import { EngineService } from "../../../../../engine/engine.service";
import { MergeChildObject } from "../mergeChildObject";
import { ParamUtils } from '../../../../../process/utils/paramUtils';
import { ActionAllow } from "../../../../../process/utils/actionAllow";

export class BorderMergeChildObject extends MergeChildObject {
	
	public constructor(scene: Scene) {
		super(scene);
		this.actionAlow = new ActionAllow(false, false);
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
			var mergeChildObjectBottom: MergeChildObject = this.addMergeChild(paramList, expressionParamList);
			mergeChildObjectBottom.setScale("vector($border, $border, $corner+$scaleZ-2*$margin)");
			mergeChildObjectBottom.setPos("vector(0, $margin-$scaleY/2, -$scaleZ/2+$margin-$corner/2)");
		}

		if( !this.isExculde("top") ) {
			var mergeChildObjectTop: MergeChildObject = this.addMergeChild(paramList, expressionParamList);
			mergeChildObjectTop.setScale("vector($border, $border, $corner+$scaleZ-2*$margin)");
			mergeChildObjectTop.setPos("vector(0, $scaleY/2-$margin, $scaleZ/2-$margin+$corner/2)");
			mergeChildObjectTop.setUW("x;-z");
		}
		
		if( !this.isExculde("left") ) {
			var mergeChildObjectLeft: MergeChildObject = this.addMergeChild(paramList, expressionParamList);
			mergeChildObjectLeft.setScale("vector($border, $border, $corner+$scaleY-2*$margin)");
			mergeChildObjectLeft.setPos("vector(0, $scaleY/2-$margin+$corner/2, $margin-$scaleZ/2)");
			mergeChildObjectLeft.setUW("x;-y");
		}

		if( !this.isExculde("right") ) {
			var mergeChildObjectRight: MergeChildObject = this.addMergeChild(paramList, expressionParamList);
			mergeChildObjectRight.setScale("vector($border, $border, $corner+$scaleY-2*$margin)");
			mergeChildObjectRight.setPos("vector(0, $margin-$scaleY/2-$corner/2, $scaleZ/2-$margin)");
			mergeChildObjectRight.setUW("x;y");
		}
		
		this.writeChildren(engine);
	}

	public writeAllParam(engine: EngineService): void {
		this.writeChildren(engine);
	}

}