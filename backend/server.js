const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, 'users.json');

// Cria o arquivo se não existir
if (!fs.existsSync(DATA_PATH)) {
  fs.writeFileSync(DATA_PATH, JSON.stringify({ agendamentos: [] }, null, 2));
}

// Contas fixas de ADM
const ADM_ACCOUNTS = [
  { user: 'adm1', pass: '123' },
  { user: 'adm2', pass: '123' },
  { user: 'adm3', pass: '123' },
  { user: 'adm4', pass: '123' },
  { user: 'adm5', pass: '123' }
];

// Utilitários
function lerDados() {
  const content = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(content);
}

function salvarDados(dados) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(dados, null, 2));
}

// Rotas

// 🔐 Login
app.post('/loginAdm', (req, res) => {
  const { user, pass } = req.body;
  const valido = ADM_ACCOUNTS.find(a => a.user === user && a.pass === pass);
  if (valido) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: 'Login inválido' });
  }
});

// 📋 Listagem por CPF
app.get('/agendamentos/:cpf', (req, res) => {
  const { cpf } = req.params;
  const dados = lerDados();
  const agendamentos = dados.agendamentos.filter(a => a.cpf === cpf);
  res.json(agendamentos);
});

// 📋 Todos os agendamentos (ADM)
app.get('/agendamentos', (req, res) => {
  const dados = lerDados();
  res.json(dados.agendamentos);
});

// ✅ Novo agendamento
app.post('/agendar', (req, res) => {
  const { nome, cpf, telefone, descricao, data, hora, atendimento, posto } = req.body;

  if (!nome || !cpf || !telefone || !descricao || !data || !hora || !atendimento || !posto) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });
  }

  const dados = lerDados();

  const mesmoHorario = dados.agendamentos.find(a =>
    a.posto === posto &&
    a.data === data &&
    a.hora === hora
  );

  if (mesmoHorario) {
    return res.status(409).json({ success: false, message: 'Horário já agendado. Escolha outro.' });
  }

  const agendamento = {
    nome,
    cpf,
    telefone,
    descricao,
    data,
    hora,
    atendimento,
    posto,
    status: 'Pendente',
    criadoEm: new Date().toISOString()
  };

  dados.agendamentos.push(agendamento);
  salvarDados(dados);

  res.json({ success: true, agendamento });
});

// Rota padrão
app.get('/', (req, res) => {
  res.send('API de Agendamento do SUS está ativa!');
});

// Porta adaptável ao Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
