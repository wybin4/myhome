import { RMQService } from 'nestjs-rmq';
import { GetSinglePaymentDocumentSagaState } from './get-single-payment-document.state';
import { GetSinglePaymentDocumentSagaStateCancelled, GetSinglePaymentDocumentSagaStateDebtAndPenaltiesCalculated, GetSinglePaymentDocumentSagaStateDetailsCalculated, GetSinglePaymentDocumentSagaStateStarted } from './get-single-payment-document.steps';
import { CalculationState } from '@myhome/interfaces';
import { SinglePaymentDocumentEntity } from '../single-payment-document.entity';

export class GetSinglePaymentDocumentSaga {
	private state: GetSinglePaymentDocumentSagaState;

	constructor(
		public singlePaymentDocument: SinglePaymentDocumentEntity,
		public rmqService: RMQService,
		public subscriberIds: number[], public managementCompanyId?: number, public houseId?: number
	) { }

	setState(state: CalculationState) {
		switch (state) {
			case CalculationState.Started:
				this.state = new GetSinglePaymentDocumentSagaStateStarted();
				break;
			case CalculationState.DetailsCalculated:
				this.state = new GetSinglePaymentDocumentSagaStateDetailsCalculated();
				break;
			case CalculationState.DebtAndPenaltiesCalculated:
				this.state = new GetSinglePaymentDocumentSagaStateDebtAndPenaltiesCalculated();
				break;
			case CalculationState.Cancelled:
				this.state = new GetSinglePaymentDocumentSagaStateCancelled();
				break;
		}
		this.state.setContext(this);
		this.singlePaymentDocument.setStatus(state);
	}

	getState() {
		return this.state;
	}
}