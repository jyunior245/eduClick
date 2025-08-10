// Script de teste para verificar o endpoint de edição de perfil
// Execute este script após iniciar o servidor

const testData = {
  telefone: "(11) 99999-9999",
  especialidade: "Matemática",
  formacao: "Licenciatura em Matemática",
  experiencia: "10 anos de ensino",
  linkUnico: "professor-teste"
};

console.log('Dados de teste:', testData);

// Simular uma requisição PUT para o endpoint
fetch('http://localhost:3000/api/professores/me', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer SEU_TOKEN_AQUI' // Substitua pelo token real
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('Resposta:', data);
})
.catch(error => {
  console.error('Erro:', error);
});


