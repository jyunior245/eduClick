"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const core_1 = require("@fullcalendar/core");
const daygrid_1 = __importDefault(require("@fullcalendar/daygrid"));
const timegrid_1 = __importDefault(require("@fullcalendar/timegrid"));
const interaction_1 = __importDefault(require("@fullcalendar/interaction"));
const list_1 = __importDefault(require("@fullcalendar/list"));
const calendarLocale_1 = require("../utils/calendarLocale");
class CalendarService {
    static initializeCalendar(containerId, aulas) {
        // Carregamento lazy - só inicializar quando necessário
        if (this.isInitialized && this.calendar) {
            this.updateEvents(aulas);
            return this.calendar;
        }
        // Destruir calendário existente se houver
        if (this.calendar) {
            this.calendar.destroy();
        }
        const events = this.convertAulasToEvents(aulas);
        const options = {
            plugins: [daygrid_1.default, timegrid_1.default, interaction_1.default, list_1.default],
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
            },
            initialView: 'dayGridMonth',
            locale: calendarLocale_1.calendarLocale,
            height: 'auto',
            events: events,
            eventClick: this.handleEventClick.bind(this),
            eventDidMount: this.handleEventDidMount.bind(this),
            dayMaxEvents: true,
            moreLinkClick: 'popover',
            eventTimeFormat: {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            },
            slotMinTime: '06:00:00',
            slotMaxTime: '22:00:00',
            slotDuration: '00:30:00',
            selectable: true,
            selectMirror: true,
            weekends: true,
            editable: false,
            selectConstraint: 'businessHours',
            businessHours: {
                daysOfWeek: [1, 2, 3, 4, 5, 6, 0], // Segunda a domingo
                startTime: '06:00',
                endTime: '22:00',
            }
        };
        try {
            this.calendar = new core_1.Calendar(document.getElementById(containerId), options);
            this.calendar.render();
            this.isInitialized = true;
            return this.calendar;
        }
        catch (error) {
            console.error('Erro ao inicializar calendário:', error);
            throw error;
        }
    }
    static convertAulasToEvents(aulas) {
        return aulas.map(aula => {
            const startDate = new Date(aula.dataHora);
            const endDate = new Date(startDate.getTime() + (aula.duracao * 60000)); // duração em minutos
            const { backgroundColor, borderColor, textColor } = this.getEventColors(aula.status);
            return {
                id: aula.id,
                title: aula.titulo,
                start: startDate,
                end: endDate,
                backgroundColor,
                borderColor,
                textColor,
                extendedProps: {
                    aulaId: aula.id,
                    status: aula.status,
                    reservas: aula.reservas || [],
                    professorId: aula.professorId,
                    conteudo: aula.conteudo,
                    valor: aula.valor,
                    maxAlunos: aula.maxAlunos,
                    observacoes: aula.observacoes
                }
            };
        });
    }
    static getEventColors(status) {
        switch (status) {
            case 'disponivel':
                return {
                    backgroundColor: '#28a745',
                    borderColor: '#1e7e34',
                    textColor: '#ffffff'
                };
            case 'lotada':
                return {
                    backgroundColor: '#007bff',
                    borderColor: '#0056b3',
                    textColor: '#ffffff'
                };
            case 'cancelada':
                return {
                    backgroundColor: '#dc3545',
                    borderColor: '#c82333',
                    textColor: '#ffffff'
                };
            case 'reagendada':
                return {
                    backgroundColor: '#ffc107',
                    borderColor: '#e0a800',
                    textColor: '#212529'
                };
            default:
                return {
                    backgroundColor: '#6c757d',
                    borderColor: '#545b62',
                    textColor: '#ffffff'
                };
        }
    }
    static handleEventClick(info) {
        try {
            const event = info.event;
            const aulaId = event.extendedProps.aulaId;
            // Disparar evento customizado para abrir modal de detalhes
            const customEvent = new CustomEvent('aulaCalendarClick', {
                detail: {
                    aulaId,
                    event: event.toPlainObject()
                }
            });
            document.dispatchEvent(customEvent);
        }
        catch (error) {
            console.error('Erro ao lidar com clique no evento:', error);
        }
    }
    static handleEventDidMount(info) {
        var _a;
        try {
            const event = info.event;
            const reservas = event.extendedProps.reservas || [];
            if (info.el) {
                const tooltipContent = `
          <div class="calendar-tooltip">
            <strong>${event.title}</strong><br>
            <small>Status: ${event.extendedProps.status}</small><br>
            <small>Reservas: ${reservas.length}/${event.extendedProps.maxAlunos}</small><br>
            <small>Valor: R$ ${((_a = event.extendedProps.valor) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || '0.00'}</small>
          </div>
        `;
                info.el.setAttribute('title', tooltipContent);
                info.el.setAttribute('data-bs-toggle', 'tooltip');
                info.el.setAttribute('data-bs-html', 'true');
                // Inicializar tooltip Bootstrap manualmente
                if (window.bootstrap && window.bootstrap.Tooltip) {
                    new window.bootstrap.Tooltip(info.el);
                }
            }
        }
        catch (error) {
            console.error('Erro ao montar evento:', error);
        }
    }
    static updateEvents(aulas) {
        try {
            if (this.calendar) {
                const events = this.convertAulasToEvents(aulas);
                this.calendar.removeAllEvents();
                this.calendar.addEventSource(events);
            }
        }
        catch (error) {
            console.error('Erro ao atualizar eventos:', error);
        }
    }
    static destroy() {
        try {
            if (this.calendar) {
                this.calendar.destroy();
                this.calendar = null;
                this.isInitialized = false;
            }
        }
        catch (error) {
            console.error('Erro ao destruir calendário:', error);
        }
    }
    static getCalendar() {
        return this.calendar;
    }
}
exports.CalendarService = CalendarService;
CalendarService.calendar = null;
CalendarService.isInitialized = false;
