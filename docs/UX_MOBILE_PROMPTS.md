# 🤖 PROMPTS PARA OBTER BOAS SUGESTÕES DE UX MOBILE

## 📋 COMO USAR

1. **Copie** o conteúdo de `UX_MOBILE_CONTEXT.md`
2. **Cole** na IA (Claude, GPT-4, etc.)
3. **Use** os prompts abaixo

---

## 🎯 PROMPTS ESPECÍFICOS

### Prompt 1: Análise Geral
```
Lendo o contexto do projeto BIZCONTROL 360 ERP, faça uma análise completa da experiência do usuário mobile atual.

Por favor:
1. Liste os TOP 5 problemas de UX mobile mais críticos
2. Para cada problema, explique o impacto nos usuários (GESTOR e VENDEDOR)
3. Sugira soluções com:
   - Descrição visual (mockup ASCII se possível)
   - Justificativa clara
   - Estimativa de esforço (baixo/médio/alto)
   - Métricas de sucesso

Priorize por impacto vs esforço.
```

---

### Prompt 2: Melhorias de Navegação
```
Considerando que o BottomNav foi removido e agora a navegação mobile é feita apenas via Sidebar (3 toques), sugira como melhorar a experiência de navegação mobile.

Foco especial em:
- Como reduzir toques para ações comuns?
- Como dar acesso rápido ao PDV (ação #1 dos vendedores)?
- Como manter consistência com desktop sem duplicação?

Dê 3 soluções diferentes com prós/contras.
```

---

### Prompt 3: Tabelas em Mobile
```
O projeto tem tabelas em várias páginas (vendas, inventário) que são muito difíceis de usar em mobile.

Sugira como tornar essas tabelas usáveis em celulares.

Considere:
- Tabela de vendas (muitas colunas: ID, data, vendedor, pagamento, total)
- Tabela de inventário (muitos dados: nome, categoria, preço, stock, status)
- Usuários com celulares de tela pequena (375px largura)

Dê exemplos visuais de como ficaria a versão mobile.
```

---

### Prompt 4: Acesso Rápido no Dashboard
```
Estou considerando adicionar botões de acesso rápido no dashboard para melhorar a navegação mobile.

Sugira:
1. Quais ações devem ter botões de acesso rápido? (Top 5)
2. Como deve ser o layout desses botões? (grid, lista, cards?)
3. Onde posicionar na tela? (topo, meio, fundo?)
4. Como devem ser visualmente? (tamanho, cor, ícones?)

Considere que:
- GESTOR precisa ver KPIs rapidamente
- VENDEDOR precisa iniciar vendas rapidamente
- Tela mobile tem espaço limitado

Dê um mockup visual completo do dashboard com essas melhorias.
```

---

### Prompt 5: PDV Mobile
```
Analisando a página de Ponto de Venda (PDV) atual em mobile:

PROBLEMAS ATUAIS:
- Produtos em tela cheia, carrinho escondido em modal
- Botão flutuante pequeno para abrir carrinho
- Sem atalhos para produtos frequentes

Sugira como melhorar o PDV mobile para:
1. Aumentar velocidade de vendas
2. Facilitar acesso ao carrinho
3. Reduzir toques para finalizar venda

Dê um redesign completo da tela de PDV mobile com:
- Layout visual
- Fluxo de uso
- Melhorias específicas

Considere contexto de vendedor: pressão, ambiente barulhento, celular em mão.
```

---

### Prompt 6: Priorização de Melhorias
```
Com base no contexto do projeto, crie um roadmap de melhorias de UX mobile.

Por favor:
1. Liste 10 possíveis melhorias
2. Para cada uma, dê:
   - Impacto (alto/médio/baixo)
   - Esforço (alto/médio/baixo)
   - Usuário mais beneficiado (GESTOR ou VENDEDOR)
3. Ordene por prioridade (maior impacto / menor esforço primeiro)
4. Sugira quais implementar no próximo sprint (Top 3)

Use uma matriz de impacto/esforço visual.
```

---

### Prompt 7: Design System Mobile
```
O projeto usa um design system com:
- Cores: Primary orange, Success green, Error red
- Componentes: NeuCard, NeuButton, NeuInput
- Estilo: Neumorphism (sombras suaves)

Sugira como adaptar/otimizar este design system especificamente para mobile:

1. Tamanhos de componentes (botões, inputs, cards)
2. Touch targets (mínimo 44x44px?)
3. Espaçamentos e padding
4. Tamanhos de texto legíveis
5. Contraste para uso em luz solar

Dê diretrizes específicas com valores em px/rem.
```

---

### Prompt 8: Feedback e Micro-interações
```
O projeto precisa melhorar o feedback visual para ações do usuário em mobile.

Sugira como melhorar:
1. Feedback de carregamento (spinners, skeletons)
2. Feedback de sucesso (toasts, animações)
3. Feedback de erro (mensagens claras, cores)
4. Micro-interações (toque, swipe, scroll)

Dê exemplos específicos para:
- Adicionar produto ao carrinho
- Finalizar venda
- Erro de conexão
- Salvar produto no inventário

Considere que usuários podem ter internet instável.
```

---

### Prompt 9: Acessibilidade Mobile
```
Sugira como melhorar a acessibilidade do app mobile para:

1. Usuários com dificuldade visual (texto grande, contraste)
2. Usuários com dificuldade motora (botões grandes)
3. Usuários com daltonismo (cores alternativas)
4. Uso com uma mão (thumb zone)

Dê diretrizes específicas de implementação com código Tailwind CSS quando possível.
```

---

### Prompt 10: Performance Mobile
```
O app precisa funcionar bem em celulares de gama baixa em Moçambique.

Sugira otimizações de performance mobile:

1. Carregamento inicial (lazy loading, code splitting)
2. Animações (reduzir complexidade)
3. Imagens (compressão, lazy load)
4. Renderização (virtual lists, memoization)

Dê técnicas específicas para Next.js 14 + Tailwind CSS.

Métricas alvo:
- Time to Interactive: <3s em 3G
- First Contentful Paint: <1.5s
- Animações: 60fps
```

---

## 🎯 PROMPT "ALL-IN-ONE"

```
Lendo o contexto completo do BIZCONTROL 360 ERP, atue como consultor sênior de UX Mobile.

Seu objetivo: Criar um plano completo de melhorias de UX mobile para os próximos 3 meses.

Por favor, entregue:

1. **DIAGNÓSTICO**
   - Top 5 problemas críticos de UX mobile
   - Análise de dor de cada perfil (GESTOR, VENDEDOR)
   - Métricas atuais (estimadas) vs métricas alvo

2. **ROADMAP 3 MESES**

   MÊS 1 - Correções Críticas:
   - [ ] Melhoria 1 (descrição + mockup + esforço)
   - [ ] Melhoria 2 (descrição + mockup + esforço)
   - [ ] Melhoria 3 (descrição + mockup + esforço)

   MÊS 2 - Melhorias de Produtividade:
   - [ ] Melhoria 4 (descrição + mockup + esforço)
   - [ ] Melhoria 5 (descrição + mockup + esforço)
   - [ ] Melhoria 6 (descrição + mockup + esforço)

   MÊS 3 - Polimento e Otimizações:
   - [ ] Melhoria 7 (descrição + mockup + esforço)
   - [ ] Melhoria 8 (descrição + mockup + esforço)
   - [ ] Melhoria 9 (descrição + mockup + esforço)

3. **PRIORIZAÇÃO**
   - Matriz de impacto/esforço
   - Justificativa da ordem
   - Riscos e mitigações

4. **MÉTRICAS DE SUCESSO**
   - Como medir cada melhoria
   - KPIs a monitorar
   - Expectativa de impacto

Seja prático, específico e considere o contexto real de uso em Moçambique.
```

---

## 💡 DICAS PARA OBTER MELHORES RESPOSTAS

### ✅ FAÇA:
- Forneça contexto completo (use o documento UX_MOBILE_CONTEXT.md)
- Seja específico nas perguntas
- Peça exemplos visuais
- Peça priorização
- Peça código quando possível

### ❌ EVITE:
- Perguntas genéricas ("melhore o app")
- Pedir mudanças drásticas no design system
- Ignorar restrições técnicas
- Esquecer contexto de uso (Moçambique, internet instável)

---

## 📊 COMO MEDIR SUCESSO DAS SUGESTÕES

Após implementar uma sugestão da IA, meça:

1. **Tempo de tarefa:** Quanto tempo para completar ação?
2. **Taxa de erro:** Quantos usuários erraram?
3. **Satisfação:** Pesquisa NPS (1-10)
4. **Adoção:** Quantos usuários usam a feature?

Compare antes/depois para validar melhoria.

---

**FIM DOS PROMPTS**
