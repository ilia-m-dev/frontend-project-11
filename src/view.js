import { subscribe } from 'valtio/vanilla';

export default (state, elements, i18n) => {
  const { input, submitButton, feedback } = elements;

  const render = () => {
    const { state: formState, error } = state.form;

    input.classList.remove('is-invalid', 'is-valid');
    feedback.textContent = '';
    feedback.classList.remove('text-danger', 'text-success');

    if (formState === 'failed') {
      input.classList.add('is-invalid');
      feedback.textContent = i18n.t(error ?? 'errors.unknown');
      feedback.classList.add('text-danger');
    }

    if (formState === 'success') {
      input.classList.add('is-valid');
      feedback.textContent = i18n.t('form.success');
      feedback.classList.add('text-success');
    }

    const isProcessing = formState === 'processing';
    input.disabled = isProcessing;
    submitButton.disabled = isProcessing;
  };

  render();
  subscribe(state, render);
};