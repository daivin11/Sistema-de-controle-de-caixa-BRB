# BRB Caixa 🏦

Sistema web de controle de caixa desenvolvido para uso interno em conveniências do BRB (Banco de Brasília). O projeto nasceu de uma necessidade real: operadores realizavam a conferência de caixa manualmente ao fim do dia, sem visibilidade do que foi movimentado e sem nenhum aviso quando o sistema do banco ficava fora do ar.

---

## 📸 Screenshots

> **Painel vazio — início do dia**
> ![Painel vazio](img/brb.png)


> **Painel com operações registradas**
> ![Com operações](img/brb2.png)


---

## ✅ Funcionalidades

- Registro de operações em tempo real: **saque, depósito, boleto, recarga e outros**
- Seleção de operadora para recargas (Vivo, TIM, Claro, Oi)
- **Dashboard com totais do dia** agrupados por tipo de operação
- **Meta diária** com barra de progresso (azul → âmbar em 70% → verde ao bater)
- **Monitor de sistema** — verifica se o BRB está online a cada 60 segundos
- Navegação por datas anteriores para consulta de histórico
- Dados persistidos localmente em JSON — sem necessidade de banco de dados externo

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + Express |
| Frontend | HTML, CSS e JavaScript puro |
| Persistência | JSON local (arquivo `data/operacoes.json`) |
| Fontes | Google Fonts — Plus Jakarta Sans |

---

## 🚀 Como rodar localmente

**Pré-requisito:** ter o [Node.js](https://nodejs.org) instalado.

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/brb-caixa.git
cd brb-caixa

# 2. Instale as dependências
npm install

# 3. Inicie o servidor
npm start

# 4. Acesse no navegador
http://localhost:3000
```

Para desenvolvimento com reload automático:
```bash
npm run dev
```

---

## 📁 Estrutura do projeto

```
brb-caixa/
├── server.js           # API REST com Express (backend)
├── public/
│   └── index.html      # Interface completa (frontend)
├── data/
│   └── operacoes.json  # Dados gerados automaticamente
└── package.json
```

---

## 🔌 API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/operacoes?data=YYYY-MM-DD` | Lista operações de um dia |
| POST | `/api/operacoes` | Registra nova operação |
| DELETE | `/api/operacoes/:id` | Remove uma operação |
| GET | `/api/resumo?data=YYYY-MM-DD` | Totais agrupados por tipo |
| GET | `/api/meta` | Retorna a meta diária |
| POST | `/api/meta` | Define a meta diária |
| GET | `/api/status-sistema` | Verifica se o sistema BRB está online |
| GET | `/api/datas` | Lista datas com registros |

---

## 💡 Contexto

Projeto desenvolvido por um operador de conveniência BRB com conhecimento em programação, com o objetivo de automatizar processos internos e ganhar visibilidade sobre a movimentação diária. A escolha por uma stack simples (Node + JS puro) foi intencional — priorizando entrega, manutenibilidade e aprendizado real sobre o funcionamento de uma aplicação web completa do backend ao frontend.

---

## 📌 Próximas melhorias

- [ ] Exportar fechamento de caixa em PDF
- [ ] Notificação via WhatsApp quando o sistema cair
- [ ] Gráfico de evolução semanal
- [ ] Autenticação por senha

---

## 👤 Autor

Feito por **David** — operador de conveniência BRB e desenvolvedor em formação.  

