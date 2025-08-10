import { Modal } from './Modal';
import { FormField } from '../forms/FormField';
import { Button } from '../ui/Button';

export interface AulaModalData {
  titulo?: string;
  conteudo?: string;
  valor?: number;
  duracao?: number;
  maxAlunos?: number;
  dataHora?: string;
  status?: string;
  observacoes?: string;
}

export class AulaModal {
  static renderNovaAula(): string {
    const content = `
      <input type="hidden" name="aulaId">
      <div class="row">
        <div class="col-md-6">
          ${FormField.render({
            label: 'Título',
            name: 'titulo',
            type: 'text',
            required: true
          })}
        </div>
        <div class="col-md-6">
          ${FormField.render({
            label: 'Conteúdo',
            name: 'conteudo',
            type: 'text',
            required: true
          })}
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          ${FormField.render({
            label: 'Valor (R$)',
            name: 'valor',
            type: 'number',
            step: '0.01',
            required: true
          })}
        </div>
        <div class="col-md-4">
          ${FormField.render({
            label: 'Duração (minutos)',
            name: 'duracao',
            type: 'number',
            required: true
          })}
        </div>
        <div class="col-md-4">
          ${FormField.render({
            label: 'Vagas',
            name: 'maxAlunos',
            type: 'number',
            min: '1',
            value: '1',
            required: true
          })}
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          ${FormField.render({
            label: 'Data/Hora',
            name: 'dataHora',
            type: 'datetime-local',
            required: true
          })}
        </div>
        <div class="col-md-6">
          ${FormField.render({
            label: 'Status',
            name: 'status',
            type: 'select',
            options: [
              { value: 'disponivel', label: 'Disponível' },
              { value: 'lotada', label: 'Lotada' },
              { value: 'cancelada', label: 'Cancelada' }
            ]
          })}
        </div>
      </div>
      ${FormField.render({
        label: 'Observações',
        name: 'observacoes',
        type: 'textarea',
        rows: 3
      })}
    `;

    const footer = `
      ${Button.render({
        text: 'Cancelar',
        type: 'button',
        variant: 'secondary',
        className: 'me-2'
      })}
      ${Button.render({
        text: 'Salvar',
        type: 'submit',
        variant: 'primary'
      })}
    `;

    return Modal.renderFormModal({
      id: 'modalNovaAula',
      title: 'Nova Aula',
      content,
      footer,
      formId: 'formNovaAula',
      size: 'lg'
    });
  }

  static renderEditarAula(aulaData: AulaModalData): string {
    const content = `
      <input type="hidden" name="aulaId" id="editAulaId" value="${aulaData.titulo || ''}">
      <div class="row">
        <div class="col-md-6">
          ${FormField.render({
            label: 'Título',
            name: 'titulo',
            type: 'text',
            value: aulaData.titulo || '',
            required: true,
            id: 'editTitulo'
          })}
        </div>
        <div class="col-md-6">
          ${FormField.render({
            label: 'Conteúdo',
            name: 'conteudo',
            type: 'text',
            value: aulaData.conteudo || '',
            required: true,
            id: 'editConteudo'
          })}
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          ${FormField.render({
            label: 'Valor (R$)',
            name: 'valor',
            type: 'number',
            value: aulaData.valor || '',
            step: '0.01',
            required: true,
            id: 'editValor'
          })}
        </div>
        <div class="col-md-4">
          ${FormField.render({
            label: 'Duração (minutos)',
            name: 'duracao',
            type: 'number',
            value: aulaData.duracao || '',
            required: true,
            id: 'editDuracao'
          })}
        </div>
        <div class="col-md-4">
          ${FormField.render({
            label: 'Vagas',
            name: 'maxAlunos',
            type: 'number',
            value: aulaData.maxAlunos || '',
            min: '1',
            required: true,
            id: 'editMaxAlunos'
          })}
        </div>
      </div>
      <div class="row">
        <div class="col-md-6">
          ${FormField.render({
            label: 'Data/Hora',
            name: 'dataHora',
            type: 'datetime-local',
            value: aulaData.dataHora || '',
            required: true,
            id: 'editDataHora'
          })}
        </div>
        <div class="col-md-6">
          ${FormField.render({
            label: 'Status',
            name: 'status',
            type: 'select',
            value: aulaData.status || 'disponivel',
            options: [
              { value: 'disponivel', label: 'Disponível' },
              { value: 'lotada', label: 'Lotada' },
              { value: 'cancelada', label: 'Cancelada' }
            ],
            id: 'editStatus'
          })}
        </div>
      </div>
      ${FormField.render({
        label: 'Observações',
        name: 'observacoes',
        type: 'textarea',
        value: aulaData.observacoes || '',
        rows: 3,
        id: 'editObservacoes'
      })}
    `;

    const footer = `
      ${Button.render({
        text: 'Cancelar',
        type: 'button',
        variant: 'secondary',
        className: 'me-2'
      })}
      ${Button.render({
        text: 'Salvar Alterações',
        type: 'submit',
        variant: 'primary'
      })}
    `;

    return Modal.renderFormModal({
      id: 'modalEditarAula',
      title: 'Editar Aula',
      content,
      footer,
      formId: 'formEditarAula',
      size: 'lg'
    });
  }
} 