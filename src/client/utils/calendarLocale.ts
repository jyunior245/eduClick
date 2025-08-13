// Configuração de localização em português para o FullCalendar
export const calendarLocale = {
  code: 'pt-br',
  week: {
    dow: 1, // Segunda-feira como primeiro dia da semana
    doy: 4  // A semana que contém Jan 4th é a primeira semana do ano
  },
  buttonText: {
    prev: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    list: 'Lista'
  },
  weekText: 'Sem',
  allDayText: 'Dia inteiro',
  moreLinkText: function(n: number) {
    return '+mais ' + n;
  },
  noEventsText: 'Não há eventos para mostrar',
  dayNames: ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
  dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  monthNames: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthNamesShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ]
}; 