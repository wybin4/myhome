import { RMQService } from 'nestjs-rmq';
import { GetSinglePaymentDocumentSagaState } from './get-single-payment-document.state';
import { GetSinglePaymentDocumentSagaStateCancelled, GetSinglePaymentDocumentSagaStateCorrectionsCalculated, GetSinglePaymentDocumentSagaStateDetailsCalculated, GetSinglePaymentDocumentSagaStateStarted } from './get-single-payment-document.steps';
import { CalculationState } from '@myhome/interfaces';
import { SinglePaymentDocumentEntity } from '../entities/single-payment-document.entity';

export class GetSinglePaymentDocumentSaga {
	private state: GetSinglePaymentDocumentSagaState;

	constructor(
		public singlePaymentDocuments: SinglePaymentDocumentEntity[],
		public rmqService: RMQService,
		public subscriberIds: number[], public managementCompanyId?: number, public houseId?: number
	) {
		this.setState(CalculationState.Started);
	}

	setState(state: CalculationState) {
		switch (state) {
			case CalculationState.Started:
				this.state = new GetSinglePaymentDocumentSagaStateStarted();
				break;
			case CalculationState.DetailsCalculated:
				this.state = new GetSinglePaymentDocumentSagaStateDetailsCalculated();
				break;
			case CalculationState.CorrectionsCalculated:
				this.state = new GetSinglePaymentDocumentSagaStateCorrectionsCalculated();
				break;
			case CalculationState.Cancelled:
				this.state = new GetSinglePaymentDocumentSagaStateCancelled();
				break;
		}
		this.state.setContext(this);
		this.singlePaymentDocuments.map(obj => obj.setStatus(state));
	}

	getState() {
		return this.state;
	}
}