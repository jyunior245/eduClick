import { Calendar, CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { calendarLocale } from '../utils/calendarLocale';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  extendedProps: {
    aulaId: string;
    status: string;
    reservas: any[];
    professorId: string;
  };
}

export class CalendarService {
  private static calendar: Calendar | null = null;
  private static isInitialized = false;

  static initializeCalendar(containerId: string, aulas: any[]): Calendar {
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
    
    const options: CalendarOptions = {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      initialView: 'dayGridMonth',
      locale: calendarLocale,
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
      this.calendar = new Calendar(document.getElementById(containerId)!, options);
      this.calendar.render();
      this.isInitialized = true;
      
      return this.calendar;
    } catch (error) {
      console.error('Erro ao inicializar calendário:', error);
      throw error;
    }
  }

  static convertAulasToEvents(aulas: any[]): EventInput[] {
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

  static getEventColors(status: string): { backgroundColor: string; borderColor: string; textColor: string } {
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

  static handleEventClick(info: any): void {
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
    } catch (error) {
      console.error('Erro ao lidar com clique no evento:', error);
    }
  }

  static handleEventDidMount(info: any): void {
    try {
      const event = info.event;
      const reservas = event.extendedProps.reservas || [];
      
      // Adicionar tooltip com informações da aula
      if (info.el) {
        const tooltipContent = `
          <div class="calendar-tooltip">
            <strong>${event.title}</strong><br>
            <small>Status: ${event.extendedProps.status}</small><br>
            <small>Reservas: ${reservas.length}/${event.extendedProps.maxAlunos}</small><br>
            <small>Valor: R$ ${event.extendedProps.valor?.toFixed(2) || '0.00'}</small>
          </div>
        `;
        
        info.el.setAttribute('title', tooltipContent);
        info.el.setAttribute('data-bs-toggle', 'tooltip');
        info.el.setAttribute('data-bs-html', 'true');
      }
    } catch (error) {
      console.error('Erro ao montar evento:', error);
    }
  }

  static updateEvents(aulas: any[]): void {
    try {
      if (this.calendar) {
        const events = this.convertAulasToEvents(aulas);
        this.calendar.removeAllEvents();
        this.calendar.addEventSource(events);
      }
    } catch (error) {
      console.error('Erro ao atualizar eventos:', error);
    }
  }

  static destroy(): void {
    try {
      if (this.calendar) {
        this.calendar.destroy();
        this.calendar = null;
        this.isInitialized = false;
      }
    } catch (error) {
      console.error('Erro ao destruir calendário:', error);
    }
  }

  static getCalendar(): Calendar | null {
    return this.calendar;
  }
} 