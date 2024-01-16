import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Logger } from '../../process/utils/logger';
import { ModelService } from '../../service/model.service'
import { Account } from '../../model/account'
import { Room } from '../../model/room'

@Component({
	selector: 'app-author-home',
	templateUrl: './author-home.component.html',
	styleUrls: ['./author-home.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class AuthorHomeComponent implements OnInit {

	public account: Account;
	public roomList: Room[] = [];

	constructor(private route: ActivatedRoute, private modelService: ModelService) { }

	ngOnInit(): void {
		this.modelService.event.subscribe(item => this.modelServiceEventHandler(item));
		this.route.paramMap.subscribe(params => {
			var accountId: number = Number(params.get('accountId'));
			Logger.info("AuthorHomeComponent", "ngOnInit() -> accountId:" + accountId);
			this.account = this.modelService.account;
			if (this.account == null || this.account.id != accountId) {
				this.modelService.getAccount(accountId);
			} else {
				this.account = this.modelService.account;
				this.roomList = this.account.roomList;
			}
		});
	}

	public modelServiceEventHandler(item) {
		Logger.info("AuthorHomeComponent", "modelServiceEventHandler(" + item + ")")
		if (item === "getAccount") {
			this.account = this.modelService.account;
			this.roomList = this.account.roomList;
		}
	}

}
