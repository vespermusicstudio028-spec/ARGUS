---
name: criando-skills
description: Cria novas skills para Antigravity seguindo padrão estruturado. Use quando o usuário mencionar skill, habilidade, automação, agente, workflow, criar skill ou desenvolver skill.
---

# Criador de Skills para Antigravity

## Quando usar esta skill

- Quando o usuário pedir para criar uma nova Skill.
- Quando o usuário pedir automações reutilizáveis.
- Quando o usuário pedir estruturas para agentes IA.
- Quando o usuário mencionar Antigravity, Agent ou Workflow.

## Fluxo de Trabalho (Workflow)

### Checklist

- [ ] Identificar objetivo da Skill
- [ ] Definir nome da pasta
- [ ] Criar frontmatter YAML
- [ ] Criar SKILL.md
- [ ] Criar exemplos opcionais
- [ ] Criar scripts opcionais
- [ ] Validar estrutura final

### Planejar

1. Entender a necessidade do usuário.
2. Escolher um nome curto e claro.
3. Criar descrição em terceira pessoa.

### Validar

Verificar:

- Nome em minúsculo.
- Uso de hífens.
- Sem espaços.
- Estrutura correta de pastas.

### Executar

Gerar:

.agents/skills/nome-da-skill/

com:

- SKILL.md
- scripts/
- examples/
- resources/

## Estrutura Obrigatória

```text
nome-da-skill/
├── SKILL.md
├── scripts/
├── examples/
└── resources/
```

## Regras

- Sempre usar Markdown.
- Sempre usar YAML Frontmatter.
- Sempre usar "/" em caminhos.
- Nunca ultrapassar 500 linhas no arquivo principal.
- Descrição em terceira pessoa.
- Nome em gerúndio.

## Tratamento de Erros

Caso exista script:

```bash
./script.sh --help
```

ou

```bash
python script.py --help
```

antes de executar qualquer ação.

## Template de Saída

### [Nome da Pasta]

**Caminho:** `.agents/skills/[nome-da-skill]/`

### SKILL.md

```markdown
---
name: nome-da-skill
description: Descrição da skill em terceira pessoa.
---

# Título da Skill

## Quando usar esta skill

- Gatilho 1
- Gatilho 2

## Fluxo de Trabalho

Checklist e etapas.

## Instruções

Regras da skill.

## Recursos

Links ou referências.
```

## Resultado Esperado

Toda skill gerada deve seguir exatamente esta estrutura e padrão.