import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {AppState} from '../../../store/app.state';
import {select, Store} from '@ngrx/store';
import * as fromRoot from '../../../store/app.reducer';
import {IOptionAnswersMap} from '../../../models/option-answers.model';
import {Subscription} from 'rxjs';
import * as elements from '../../../store/elements/elements.actions';

@Component({
  selector: 'sb-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit, OnDestroy {
  @Input() data: any;
  optionAnswers: IOptionAnswersMap;
  optionAnswersSub: Subscription;

  constructor(
    private store: Store<AppState>,
  ) { }

  ngOnInit() {
    this.optionAnswersSub = this.store.pipe(select(fromRoot.getOptionAnswers, { elementId: this.data.element.id })).subscribe(res => {
      this.optionAnswers = res;
    });
  }

  ngOnDestroy() {
    this.optionAnswersSub.unsubscribe();
  }

  handleSelect(answer, pageFlow) {
    this.store.dispatch(new elements.UpdateQuestionAnswerAction({
      pageId: this.data.element.pageId,
      elementId: this.data.element.id,
      answer,
      pageFlowModifier: this.data.element.question.pageFlowModifier,
      pageFlow,
      surveyId: this.data.surveyId,
    }));
  }

  trackElement(index: number, element: any) {
    return element ? element.key : null;
  }
}