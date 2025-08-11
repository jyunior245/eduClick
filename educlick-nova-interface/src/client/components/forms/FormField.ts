export interface FormFieldProps {
  label: string;
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'datetime-local' | 'textarea' | 'select';
  value?: string | number;
  required?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  step?: string;
  min?: string | number;
  max?: string | number;
  disabled?: boolean;
}

export class FormField {
  static render(props: FormFieldProps): string {
    const {
      label,
      name,
      type,
      value = '',
      required = false,
      placeholder = '',
      className = '',
      id = '',
      options = [],
      rows = 3,
      step,
      min,
      max,
      disabled = false
    } = props;

    const idAttr = id ? `id="${id}"` : '';
    const requiredAttr = required ? 'required' : '';
    const disabledAttr = disabled ? 'disabled' : '';
    const stepAttr = step ? `step="${step}"` : '';
    const minAttr = min ? `min="${min}"` : '';
    const maxAttr = max ? `max="${max}"` : '';

    let inputHtml = '';

    if (type === 'textarea') {
      inputHtml = `
        <textarea 
          class="form-control ${className}" 
          name="${name}" 
          ${idAttr}
          ${requiredAttr}
          ${disabledAttr}
          placeholder="${placeholder}"
          rows="${rows}"
        >${value}</textarea>
      `;
    } else if (type === 'select') {
      const optionsHtml = options.map(option => 
        `<option value="${option.value}" ${value === option.value ? 'selected' : ''}>${option.label}</option>`
      ).join('');
      
      inputHtml = `
        <select 
          class="form-control ${className}" 
          name="${name}" 
          ${idAttr}
          ${requiredAttr}
          ${disabledAttr}
        >
          ${optionsHtml}
        </select>
      `;
    } else {
      inputHtml = `
        <input 
          type="${type}" 
          class="form-control ${className}" 
          name="${name}" 
          value="${value}"
          ${idAttr}
          ${requiredAttr}
          ${disabledAttr}
          ${stepAttr}
          ${minAttr}
          ${maxAttr}
          placeholder="${placeholder}"
        >
      `;
    }

    return `
      <div class="mb-3">
        <label class="form-label">${label}</label>
        ${inputHtml}
      </div>
    `;
  }
} 