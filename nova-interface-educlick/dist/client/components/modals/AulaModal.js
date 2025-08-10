"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AulaModal = void 0;
const Modal_1 = require("./Modal");
const FormField_1 = require("../forms/FormField");
const Button_1 = require("../ui/Button");
class AulaModal {
    static renderNovaAula() {
        const content = `
      <input type="hidden" name="aulaId">
      <div class="row">
        <div class="col-md-6">
          ${FormField_1.FormField.render({
            label: 'Título',
            name: 'titulo',
            type: 'text',
            required: true
        })}
        </div>
        <div class="col-md-6">
          ${FormField_1.FormField.render({
            label: 'Conteúdo',
            name: 'conteudo',
            type: 'text',
            required: true
        })}
        </div>
      </div>
      <div class="row">
        <div class="col-md-4">
          ${FormField_1.FormField.render({
            label: 'Valor (R$)',
            name: 'valor',
            type: 'number',
            step: '0.01',
            required: true
        })}
        </div>
        <div class="col-md-4">
          ${FormField_1.FormField.render({
            label: 'Duração (minutos)',
            name: 'duracao',
            type: 'number',
            required: true
        })}
        </div>
        <div class="col-md-4">
          ${FormField_1.FormField.render({
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
          ${FormField_1.FormField.render({
            label: 'Data/Hora',
            name: 'dataHora',
            type: 'datetime-local',
            required: true
        })}
        </div>
        <div class="col-md-6">
          ${FormField_1.FormField.render({
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
      ${FormField_1.FormField.render({
            label: 'Observações',
            name: 'observacoes',
            type: 'textarea',
            rows: 3
        })}
    `;
        const footer = `
      ${Button_1.Button.render({
            text: 'Cancelar',
            type: 'button',
            variant: 'secondary',
            className: 'me-2'
        })}
      ${Button_1.Button.render({
            text: 'Salvar',
            type: 'submit',
            variant: 'primary'
        })}
    `;
        return Modal_1.Modal.renderFormModal({
            id: 'modalNovaAula',
            title: 'Nova Aula',
            content,
            footer,
            formId: 'formNovaAula',
            size: 'lg'
        });
    }
    static renderEditarAula(aulaData) {
        const content = `
      <input type="hidden" name="aulaId" id="editAulaId" value="${aulaData.titulo || ''}">
      <div class="row">
        <div class="col-md-6">
          ${FormField_1.FormField.render({
            label: 'Título',
            name: 'titulo',
            type: 'text',
            value: aulaData.titulo || '',
            required: true,
            id: 'editTitulo'
        })}
        </div>
        <div class="col-md-6">
          ${FormField_1.FormField.render({
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
          ${FormField_1.FormField.render({
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
          ${FormField_1.FormField.render({
            label: 'Duração (minutos)',
            name: 'duracao',
            type: 'number',
            value: aulaData.duracao || '',
            required: true,
            id: 'editDuracao'
        })}
        </div>
        <div class="col-md-4">
          ${FormField_1.FormField.render({
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
          ${FormField_1.FormField.render({
            label: 'Data/Hora',
            name: 'dataHora',
            type: 'datetime-local',
            value: aulaData.dataHora || '',
            required: true,
            id: 'editDataHora'
        })}
        </div>
        <div class="col-md-6">
          ${FormField_1.FormField.render({
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
      ${FormField_1.FormField.render({
            label: 'Observações',
            name: 'observacoes',
            type: 'textarea',
            value: aulaData.observacoes || '',
            rows: 3,
            id: 'editObservacoes'
        })}
    `;
        const footer = `
      ${Button_1.Button.render({
            text: 'Cancelar',
            type: 'button',
            variant: 'secondary',
            className: 'me-2'
        })}
      ${Button_1.Button.render({
            text: 'Salvar Alterações',
            type: 'submit',
            variant: 'primary'
        })}
    `;
        return Modal_1.Modal.renderFormModal({
            id: 'modalEditarAula',
            title: 'Editar Aula',
            content,
            footer,
            formId: 'formEditarAula',
            size: 'lg'
        });
    }
}
exports.AulaModal = AulaModal;
