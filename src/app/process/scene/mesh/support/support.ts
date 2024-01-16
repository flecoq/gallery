import { Scene } from "../../../../model/assembler/scene";
import { Process } from "../../../../model/assembler/process";
import { SceneImpl } from "../../../../process/scene/sceneImpl";
import { ModelService } from "../../../../service/model.service"
import { Logger } from '../../../../process/utils/logger';

export class Support extends SceneImpl {

	public refresh: boolean;
	public thumb: string;
	public process: Process
	public modelService: ModelService;
	public thumbIndex: number;
	public range: number;

	public constructor(scene: Scene, process: Process, range: number, modelService: ModelService) {
		super(scene);
		this.process = process;
		this.range = range;
		this.modelService = modelService;
		modelService.event.subscribe(event => this.eventHandler(event));
		this.thumbIndex = this.getParamValueInt("thumbIndex");
		this.updateThumb(false);
	}

	private eventHandler(event): void {
		if (event === "supportThumb" && this.refresh) {
			Logger.info("Support", "eventHandler() -> thumb is refreshed");
			this.updateThumb(false);
			this.refresh = false;
		}
	}

	public persist(): void {
		this.modelService.updateProcess(this.process);
	}

	public incThumbIndex(): void {
		this.thumbIndex++;
		this.addOrUpdateParam("thumbIndex", this.thumbIndex.toString());
		this.updateThumb(true);
		this.persist();
	}
	
	public getThumbName(): string {
		return this.name + "_" + this.thumbIndex;
	}

	public updateThumb(progress: boolean): void {
		if (progress) {
			this.thumb = "./assets/thumb/updating.png";
		} else {
			this.thumb = "./assembler/account/account_" + this.modelService.account.id + "/support/" + this.getThumbName() + ".png";
		}
	}
}