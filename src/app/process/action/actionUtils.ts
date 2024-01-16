import { Action } from '../../model/assembler/action';
import { ActionImpl } from '../../process/action/actionImpl';
import { SceneAction } from '../../process/action/sceneAction';

export class ActionUtils {
	
	public static getActionImpl(action: Action): ActionImpl {
		if( "assetInfo" === action.type ) {
			return new SceneAction(action);
		} else {
			return new ActionImpl(action);
		}
	}
}