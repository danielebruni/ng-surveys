import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NgxSurveyState} from '../../../store/ngx-survey.state';
import {select, Store} from '@ngrx/store';
import * as fromRoot from '../../../store/ngx-survey.reducer';
import {IOptionAnswersMap} from '../../../models/option-answers.model';
import {IElements} from '../../../models/elements.model';
import {fromEvent, Observable, Subscription} from 'rxjs';
import * as optionAnswers from '../../../store/option-answers/option-answers.actions';
import * as elements from '../../../store/elements/elements.actions';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import {map} from 'rxjs/operators';

@Component({
  selector: 'ngxs-radio-checkbox-select',
  templateUrl: './radio-checkbox-select.component.html',
  styleUrls: ['./radio-checkbox-select.component.scss']
})
export class RadioCheckboxSelectComponent implements OnInit, OnDestroy {
  @Input() data: any;

  element: IElements;
  optionAnswers$: Observable<IOptionAnswersMap>;
  optionAnswers: IOptionAnswersMap;
  optionAnswersSize: number;
  elementSub: Subscription;
  pageId: string;
  surveyId: string;
  isPageNavChecked = false;
  isSaved = false;
  isNewOption = false;

  constructor(
    private store: Store<NgxSurveyState>,
  ) {}

  ngOnInit() {
    this.pageId = this.data.element.pageId;
    this.surveyId = this.data.surveyId;

    this.elementSub = this.store.pipe(
      select(fromRoot.getElementByPageIdAndElementId, { pageId: this.pageId, elementId: this.data.element.id }))
      .subscribe(res => this.element = res);

    this.optionAnswers$ = this.store.pipe(
      select(fromRoot.getOptionAnswersByElementId,
        { elementId: this.data.element.id }
        ));

    this.optionAnswers$.subscribe(res => {
      if (res) {
        this.optionAnswersSize = res.size;
      }
    });

    setTimeout(() => {
      this.onSaveQuestionClick();
    }, 300);
  }

  ngOnDestroy() {
    this.elementSub.unsubscribe();
  }

  togglePageNavChecked(e) {
    this.isPageNavChecked = e.target.checked;
    this.store.dispatch(new elements.UpdateQuestionPageFlowModifierAction({
        pageId: this.pageId,
        elementId: this.element.id,
        pageFlowModifier: this.isPageNavChecked
      }));
  }

  addOptionInput() {
    if (!this.element.isSaved) {
      this.store.dispatch(new optionAnswers.AddOptionAnswersAction({
        elementId: this.element.id
      }));
      this.isNewOption = true;
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    this.store.dispatch(new optionAnswers.DragOptionAnswerAction({
      elementId: this.element.id,
      startIndex: event.previousIndex,
      endIndex: event.currentIndex,
    }));
  }

  onSaveQuestionClick() {
    const $saveQuestionButton = document.getElementById(`save-question-button-${this.element.id}`);

    if ($saveQuestionButton) {
      fromEvent($saveQuestionButton, 'click').pipe(
        map(event => event)
      ).subscribe(res => {
        if (res) {
          this.isSaved = true;
          this.onEditQuestionClick();
        }
      });
    }
  }

  onEditQuestionClick() {
    const $editQuestionButton = document.getElementById(`edit-question-button-${this.element.id}`);

    fromEvent($editQuestionButton, 'click').pipe(
      map(event => event)
    ).subscribe(res => {
      if (res) {
        this.isSaved = false;
        this.onSaveQuestionClick();
      }
    });
  }

  trackElement(index: number, item: any) {
    return item ? item.key : null;
  }
}