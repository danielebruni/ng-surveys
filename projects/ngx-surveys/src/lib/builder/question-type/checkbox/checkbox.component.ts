import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {select, Store} from '@ngrx/store';
import * as fromRoot from '../../../store/ngx-survey.reducer';
import {Subscription} from 'rxjs';
import {IOptionAnswersMap} from '../../../models/option-answers.model';
import {NgxSurveyState} from '../../../store/ngx-survey.state';
import {FormGroup, FormBuilder, FormControl, FormArray, ValidatorFn} from '@angular/forms';
import * as elements from '../../../store/elements/elements.actions';

@Component({
  selector: 'ngxs-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent implements OnInit, OnDestroy {
  @Input() data: any;
  optionAnswers: IOptionAnswersMap;
  optionAnswersSub: Subscription;

  form: FormGroup;

  constructor(
    private store: Store<NgxSurveyState>,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.optionAnswersSub = this.store.pipe(select(fromRoot.getOptionAnswersByElementId, { elementId: this.data.element.id })).subscribe(res => {
      this.optionAnswers = res;
    });
    const answer = this.data.element.question.answer;
    const controls = Array.from(this.optionAnswers).map(c => {
      if (answer.indexOf(c[1].value) >= 0) {
        return new FormControl(true);
      } else {
        return new FormControl(false);
      }
    });

    this.form = this.formBuilder.group({
      optionAnswers: new FormArray(controls, this.minSelectedCheckboxes(1))
    });
  }
  ngOnDestroy() {
    this.optionAnswersSub.unsubscribe();
  }

  private minSelectedCheckboxes(min = 1) {
    const validator: ValidatorFn = (formArray: FormArray) => {
      const totalSelected = formArray.controls
        .map(control => control.value)
        .reduce((prev, next) => next ? prev + next : prev, 0);

      return totalSelected >= min ? null : { required: true };
    };

    return validator;
  }

  handleChange(pageFlow) {
    const selectedOrderIds = this.form.value.optionAnswers
      .map((v, i) => v ? Array.from(this.optionAnswers)[i][1].value : null)
      .filter(v => v !== null);

    const answer = selectedOrderIds.toString();

    this.store.dispatch(new elements.UpdateQuestionAnswerAction({
      pageId: this.data.element.pageId,
      elementId: this.data.element.id,
      answer,
      pageFlowModifier: this.data.element.question.pageFlowModifier,
      pageFlow,
    }));
  }

  trackElement(index: number, item: any) {
    return item ? item.key : null;
  }
}
