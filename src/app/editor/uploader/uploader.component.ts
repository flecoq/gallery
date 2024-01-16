import { HttpHeaders } from '@angular/common/http';
import { ViewEncapsulation, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FileHolder } from './file-holder';
import { ModelService } from '../../service/model.service';
import { UploadMetadata } from './upload-metadata';

@Component({
	selector: 'app-uploader',
	templateUrl: './uploader.component.html',
	styleUrls: ['./uploader.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class UploaderComponent implements OnInit {

	@Output() public event: EventEmitter<string> = new EventEmitter();

	public files: FileHolder[] = [];
	public fileCounter = 0;
	public showFileTooLargeMessage: boolean;

	public beforeUpload: (metadata: UploadMetadata) => UploadMetadata | Promise<UploadMetadata> = metadata => metadata;
	public fileTooLargeMessage: string;
	public max = 100;
	public maxFileSize: number = 10000000;
	public supportedExtensions: string[];
	public url: string;
	public uploadedFiles: string[] | Array<{ url: string, fileName: string, blob?: Blob }> = [];

	public confirmCss: string;
	public containerCss: string;
	public message: string;

	@ViewChild('input')
	public inputElement: ElementRef;
	public pendingFilesCounter = 0;

	constructor(public modelService: ModelService) {
		this.url = ".assembler/request/upload/upload.php";
		this.confirmCss = "btn btn-default";
		this.containerCss = "height:210px; overflow: auto;";
	}

	public ngOnInit() {
		this.message = "";
		this.showFileTooLargeMessage = false;
		this.supportedExtensions = ['image/*', 'application/json', 'text/xml', 'application/octet-stream'];
	}

	public close(): void {
		this.deleteAll();
		this.event.emit("close");
	}

	public confirm(): void {
		this.event.emit("confirm");
	}

	public deleteAll() {
		this.files = [];
		this.fileCounter = 0;
		if (this.inputElement) {
			this.inputElement.nativeElement.value = '';
		}
		this.confirmCss = "btn btn-default";
		this.message = "";
		this.showFileTooLargeMessage = false;
	}

	public deleteFile(file: FileHolder): void {
		const index = this.files.indexOf(file);
		this.files.splice(index, 1);
		this.fileCounter--;
		if (this.inputElement) {
			this.inputElement.nativeElement.value = '';
		}
	}

	public ngOnChanges(changes) {
		if (changes.uploadedFiles && changes.uploadedFiles.currentValue.length > 0) {
			this.processUploadedFiles();
		}
	}

	public onFileChange(files: FileList) {
		const remainingSlots = this.max - this.fileCounter;
		const filesToUploadNum = files.length > remainingSlots ? remainingSlots : files.length;
		this.fileCounter += filesToUploadNum;
		this.showFileTooLargeMessage = false;
		this.uploadFiles(files, filesToUploadNum);
	}

	public onResponse(response: any, fileHolder: FileHolder) {
		fileHolder.serverResponse = { status: response.status, response };
		fileHolder.pending = false;

		if (--this.pendingFilesCounter === 0) {
			this.confirmCss = "btn btn-primary";
			this.message = "Click on 'Add Asset' to create them."
		}
	}

	public processUploadedFiles() {
		for (let i = 0; i < this.uploadedFiles.length; i++) {
			const data: any = this.uploadedFiles[i];

			let fileBlob: Blob,
				file: File,
				fileUrl: string;

			if (data instanceof Object) {
				fileUrl = data.url;
				fileBlob = (data.blob) ? data.blob : new Blob([data]);
				file = new File([fileBlob], data.fileName);
			} else {
				fileUrl = data;
				fileBlob = new Blob([fileUrl]);
				file = new File([fileBlob], fileUrl);
			}

			this.files.push(new FileHolder(fileUrl, file));
		}
	}

	public async uploadFiles(files: FileList, filesToUploadNum: number) {
		this.confirmCss = "btn btn-default";
		this.showFileTooLargeMessage = false;
		this.message = "Upload in progress...";
		this.containerCss = "height:210px; overflow: auto;";
		for (let i = 0; i < filesToUploadNum; i++) {
			const file = files[i];

			if (this.maxFileSize && file && file.size > this.maxFileSize) {
				this.fileCounter--;
				//this.inputElement.nativeElement.value = '';
				this.showFileTooLargeMessage = true;
				this.fileTooLargeMessage = "The file " + file.name + " was too large to be uploaded (> 10 Mo)";
				this.containerCss = "height:180px; overflow: auto;";
				continue;
			}

			const beforeUploadResult: UploadMetadata = await this.beforeUpload({ file, url: this.url, abort: false });

			if (beforeUploadResult.abort) {
				this.fileCounter--;
				this.inputElement.nativeElement.value = '';
				continue;
			}

			const reader = new FileReader();
			reader.addEventListener('load', (event: any) => {
				const fileHolder: FileHolder = new FileHolder(event.target.result, beforeUploadResult.file);
				this.files.push(fileHolder);
				this.uploadSingleFile(fileHolder);
			}, false);
			reader.readAsDataURL(beforeUploadResult.file);
		}
	}

	public uploadSingleFile(fileHolder: FileHolder) {
		this.pendingFilesCounter++;
		fileHolder.pending = true;
		this.modelService.createAssetFile(fileHolder, this);
	}

}
