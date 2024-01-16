import { WindowRefService } from './service/window-ref.service';
import { NgModule } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { EngineComponent } from './engine/engine.component';

import { HttpClientModule } from '@angular/common/http';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ImageUploadModule } from "angular2-image-upload";
import { BsModalModule } from 'ng2-bs3-modal';
1
import { ModelService } from './service/model.service';
import { AssetManagerComponent } from './editor/asset-manager/asset-manager.component';
import { BottomToolComponent } from './editor/bottom-tool/bottom-tool.component';
import { PictureDetailComponent } from './editor/picture-detail/picture-detail.component';
import { ObjectDetailComponent } from './editor/object-detail/object-detail.component';
import { MaterialEditorComponent } from './editor/material-editor/material-editor.component';
import { MaterialSelectorComponent } from './editor/material-selector/material-selector.component';
import { SupportListComponent } from './editor/support-list/support-list.component';
import { SupportDetailComponent } from './editor/support-detail/support-detail.component';
import { CameraToolComponent } from './editor/camera-tool/camera-tool.component';
import { ModalAddCameraComponent } from './editor/modal-add-camera/modal-add-camera.component';
import { EditorComponent } from './editor/editor/editor.component';
import { AuthorHomeComponent } from './account/author-home/author-home.component';
import { VisitComponent } from './visit/visit/visit.component';
import { HomeComponent } from './home/home.component';
import { AssetInfoComponent } from './visit/asset-info/asset-info.component';
import { UploaderComponent } from './editor/uploader/uploader.component';

import { FileDropDirective } from './editor/uploader/file-drop.directive';
import { ViewerComponent } from './utils/viewer/viewer.component';
import { SystemExplorerComponent } from './utils/system-explorer/system-explorer.component';

import { TreeModule } from '@circlon/angular-tree-component';
import { CommandComponent } from './utils/command/command.component';

@NgModule({
	declarations: [
		AppComponent,
		EngineComponent,
		AssetManagerComponent,
		BottomToolComponent,
		PictureDetailComponent,
		ObjectDetailComponent,
		MaterialEditorComponent,
		MaterialSelectorComponent,
		SupportListComponent,
		SupportDetailComponent,
		CameraToolComponent,
		ModalAddCameraComponent,
		EditorComponent,
		AuthorHomeComponent,
		VisitComponent,
		HomeComponent,
		AssetInfoComponent,
		UploaderComponent,
		FileDropDirective,
		ViewerComponent,
		SystemExplorerComponent,
		CommandComponent
	],
	imports: [
		HttpClientModule,
		HttpModule,
		BrowserModule,
		FormsModule,
		DragDropModule,
		ImageUploadModule.forRoot(),
		BsModalModule,
		TreeModule,
		RouterModule.forRoot([
			{ path: '', redirectTo: '/home', pathMatch: 'full' },
			{ path: 'home', component: HomeComponent },
			{ path: 'author/:accountId', component: AuthorHomeComponent },
			{ path: 'editor/:roomId', component: EditorComponent },
			{ path: 'visit/:roomId', component: VisitComponent },
			{ path: 'viewer', component: ViewerComponent },
			{ path: 'system', component: SystemExplorerComponent }
		],
			{ enableTracing: true })
	],
	providers: [
		WindowRefService,
		ModelService
	],
	bootstrap: [
		AppComponent
	]
})
export class AppModule { }
