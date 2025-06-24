# 📦 s3-image-optimizer

[![Node.js](https://img.shields.io/badge/node-%3E=20.10.0-brightgreen.svg)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/code-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Sharp](https://img.shields.io/badge/image%20processor-sharp-yellow.svg)](https://sharp.pixelplumbing.com/)

Script CLI em Node.js para **fazer backup**, **otimizar imagens** de um bucket S3 e **reenviá-las otimizadas** ao mesmo bucket.

## ✨ Funcionalidades

- 📥 Faz download das imagens de um bucket S3 para uma pasta local (`files/original`)
- 🧠 Otimiza imagens grandes e/ou pesadas com base no formato e tamanho
- 📤 Salva a imagem otimizada localmente (`files/optimized`)
- 🔁 Possibilidade de reenviar (substituir) as imagens otimizadas no bucket S3
- 🔧 Usa a biblioteca [Sharp](https://sharp.pixelplumbing.com/) para compressão e redimensionamento
- ✅ Operações seguras com tratamento de erros (`safeOperation`)

---

## 🚀 Tecnologias

- Node.js (>=20.10.0)
- TypeScript
- [Sharp](https://github.com/lovell/sharp)
- AWS SDK v3
- Zod (validação de variáveis de ambiente)
- Prettier

---

## ⚙️ Como usar

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/s3-image-optimizer.git
cd s3-image-optimizer
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o ambiente

Renomeie o arquivo `.env.example` para `.env` e preencha com as informações do seu bucket:

```dotenv
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_ACCESS_KEY=
S3_ENDPOINT=
S3_BUCKET_NAME=
```

### 4. Faça backup e otimize

```bash
npm run backup-and-optimize
```

As imagens serão baixadas e otimizadas nas pastas:

- Originais: `files/original/`
- Otimizadas: `files/optimized/`

### 5. Reenvie imagens otimizadas para o S3

```bash
npm run push-and-replace
```

> ⚠️ **ATENÇÃO:** Substitui as imagens originais do S3 pelas versões otimizadas.  
> Esta operação **é irreversível** e sobrescreve os arquivos existentes no bucket.  
> Certifique-se de ter um backup ou execute primeiro `npm run backup-and-optimize` para salvar as imagens originais localmente.

---

## 🛠 Scripts disponíveis

| Script                  | Descrição                                                      |
|-------------------------|----------------------------------------------------------------|
| `npm run backup-and-optimize` | Baixa e otimiza as imagens do bucket                      |
| `npm run push-and-replace`    | Substitui as imagens originais pelas otimizadas no bucket |
| `npm run lint`                | Executa Prettier em todos os arquivos                      |

---

## 🗂 Estrutura do projeto

```
.
├── files/
│   ├── original/          # Imagens originais do S3
│   └── optimized/         # Imagens otimizadas
├── src/
│   ├── s3/                # Instância do cliente S3
│   ├── utils/             # Funções auxiliares
│   └── backup-and-optimize.ts
│   └── push-and-replace.ts
├── .env.example
├── package.json
```

---

## 🧪 Otimizações aplicadas

- Redimensionamento para **máx. 1200px**
- Compressão com qualidade adequada por formato:
    - JPEG: qualidade 80, `mozjpeg: true`
    - PNG: compressão 9, `adaptiveFiltering: true`
    - WebP: qualidade 80
    - AVIF: qualidade 50

---

## 🔧 Possíveis melhorias

Dependendo do uso e escala da aplicação, o script pode ser adaptado com melhorias como:

- 🧪 **Dry run (modo de simulação):** Mostrar quais arquivos seriam alterados antes de sobrescrevê-los
- 📏 **Configuração de tamanhos e qualidade via `.env` ou linha de comando**
- 🖼 **Conversão de formatos:** Ex: converter tudo para WebP ou AVIF
- ⏱ **Execução paralela/assíncrona:** Processar múltiplas imagens ao mesmo tempo para maior performance.  
  Isso pode ser feito de forma segura com **limite de concorrência**, usando a biblioteca [`p-limit`](https://github.com/sindresorhus/p-limit).
- 📊 **Relatório de compressão:** Mostrar antes/depois de cada imagem (tamanho original vs. otimizado)
- 🛡 **Validação adicional:** Evitar sobrescrever arquivos caso não haja ganho significativo de tamanho

Sinta-se à vontade para adaptar ou contribuir com melhorias conforme sua necessidade.

## 👨‍💻 Autor

- **Bruno Menegidio** – [@bmenegidio](https://github.com/bmenegidio)

---

## 📄 Licença

Este projeto está licenciado sob a licença [MIT](LICENSE).
