import { Component, ViewChild, OnInit, ViewEncapsulation } from '@angular/core';
import { EngineService } from '../../engine/engine.service';
import { EngineComponent } from '../../engine/engine.component';
import { ModelService } from '../../service/model.service';
import { PointerEventTypes, Scene, Vector3, ArcRotateCamera, Mesh, StandardMaterial, VideoTexture, Color3, MeshBuilder } from "@babylonjs/core";
import { Logger } from '../../process/utils/logger';

@Component({
	selector: 'app-viewer',
	templateUrl: './viewer.component.html',
	styleUrls: ['./viewer.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class ViewerComponent implements OnInit {

	@ViewChild(EngineComponent)
	public engineComponent: EngineComponent;

	public camera: ArcRotateCamera;

	public isEngineComponentEventHandler: boolean = false;

	constructor(public engine: EngineService, public modelService: ModelService) { }

	ngOnInit(): void {
		this.engine.edit = false;
	}


	public engineComponentEventHandler(item) {
		Logger.info("ViewerComponent", "engineComponentEventHandler(" + item + ")")

		var scene: Scene = this.engine.scene;

		// camera
		this.camera = new ArcRotateCamera("viewer", -Math.PI / 2, Math.PI / 2, 10, new Vector3(), scene);
		this.engine.scene.activeCamera = this.camera;
		this.camera.attachControl(this.engine.canvas, false);

		var planeOpts = {
			height: 4.5,
			width: 8.0,
			sideOrientation: Mesh.DOUBLESIDE
		};
		var ANote0Video = MeshBuilder.CreatePlane("plane", planeOpts, scene);
		var vidPos = (new Vector3(0, 0, 0.1))
		ANote0Video.position = vidPos;
		var ANote0VideoMat = new StandardMaterial("m", scene);
		var ANote0VideoVidTex = new VideoTexture("vidtex", "assembler/account/account_1/video/galopin_11.mp4", scene);
		ANote0VideoMat.diffuseTexture = ANote0VideoVidTex;
		ANote0VideoMat.roughness = 1;
		ANote0VideoMat.emissiveColor = Color3.White();
		ANote0Video.material = ANote0VideoMat;
		scene.onPointerObservable.add(function(evt) {
			if (evt.pickInfo.pickedMesh === ANote0Video) {
				//console.log("picked");
				if (ANote0VideoVidTex.video.paused)
					ANote0VideoVidTex.video.play();
				else
					ANote0VideoVidTex.video.pause();
				console.log(ANote0VideoVidTex.video.paused ? "paused" : "playing");
			}
		}, PointerEventTypes.POINTERPICK);

		this.isEngineComponentEventHandler = true;
	}

}
