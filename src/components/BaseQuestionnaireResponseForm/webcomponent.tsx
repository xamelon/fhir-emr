import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { Questionnaire } from 'fhir/r4b';
import { createRoot, Root } from 'react-dom/client';
import { toFirstClassExtension } from 'sdc-qrf';

import { ThemeProvider } from 'src/theme/ThemeProvider';

import { BaseQuestionnaireResponseForm, BaseQuestionnaireResponseFormProps } from './index';
import { S } from '../../containers/PatientDetails/PatientDocument/PatientDocument.styles';
import { PatientDocumentHeader } from '../../containers/PatientDetails/PatientDocument/PatientDocumentHeader';

class BaseQuestionnaireResponseFormWebComponent extends HTMLElement {
    private root: Root | null = null;
    private mountPoint: HTMLDivElement | null = null;

    connectedCallback() {    
        this.mountPoint = document.createElement('div');
        this.mountPoint.style = "margin: 0 auto; width: min-content; padding-top: 2rem;";
        this.appendChild(this.mountPoint);
        this.root = createRoot(this.mountPoint);
        this.render();
    }

    disconnectedCallback() {
        if (this.root) {
            this.root.unmount();
            this.root = null;
        }
    }

    attributeChangedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['questionnaire'];
    }

    private render() {
        if (!this.root) { 
            console.error("Root does not exist")
            return; 
        }

        const questionnaireAttr = this.getAttribute('questionnaire');
        if (!questionnaireAttr) {
            console.error('BaseQuestionnaireResponseFormWebComponent: questionnaire attribute is required');
            return;
        }

        let questionnaire: Questionnaire;
        try {
            questionnaire = JSON.parse(questionnaireAttr);
        } catch (error) {
            console.error('BaseQuestionnaireResponseFormWebComponent: Invalid JSON in questionnaire attribute', error);
            return;
        }

        const props: BaseQuestionnaireResponseFormProps = {
            formData: {
                formValues: {},
                context: {questionnaire: questionnaire,
                    fceQuestionnaire: toFirstClassExtension(questionnaire),
                    questionnaireResponse: {resourceType: "QuestionnaireResponse", status: "in-progress"},
                    launchContextParameters: []
                }
            }
        };

        i18n.activate('en')

        this.root.render(
            <ThemeProvider>
                <I18nProvider i18n={i18n}>
                    <S.Content>
                        <PatientDocumentHeader formData={props.formData} questionnaireId=''/>
                        <BaseQuestionnaireResponseForm
                            {...props}
                        >
                    </BaseQuestionnaireResponseForm>
                    </S.Content>
                </I18nProvider>
            </ThemeProvider>
        );
    }
}

customElements.define('base-questionnaire-response-form', BaseQuestionnaireResponseFormWebComponent);