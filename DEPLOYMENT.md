# Deployment Guide - Bilingual Interactive Resume

Este guia fornece instruções completas para fazer o deploy da aplicação no Netlify.

## 🚀 Visão Geral do Deployment

A aplicação está configurada para deployment automático no Netlify usando:
- **Static Site Generation (SSG)** com Next.js
- **CI/CD** com GitHub Actions
- **Performance monitoring** com Lighthouse
- **Error tracking** com Google Analytics

## 📋 Pré-requisitos

### 1. Contas Necessárias
- [ ] Conta no GitHub (para código)
- [ ] Conta no Netlify (para hosting)
- [ ] Google Analytics (opcional, para analytics)

### 2. Variáveis de Ambiente
Configure as seguintes variáveis no Netlify:

```bash
# Obrigatórias
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://marcelonegrini.netlify.app

# Opcionais (Analytics)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX

# Build Info (preenchidas automaticamente pelo CI)
NEXT_PUBLIC_BUILD_TIME=
NEXT_PUBLIC_BUILD_ID=
```

## 🔧 Configuração do Netlify

### 1. Conectar Repositório
1. Acesse [Netlify Dashboard](https://app.netlify.com)
2. Clique em "New site from Git"
3. Conecte seu repositório GitHub
4. Configure as seguintes opções:

```
Build command: npm run build
Publish directory: out
Node version: 18
```

### 2. Configurar Domínio
1. Vá para "Domain settings"
2. Configure seu domínio personalizado (se aplicável)
3. Ative HTTPS automático
4. Configure redirects se necessário

### 3. Configurar Deploy Hooks
1. Vá para "Build & deploy" > "Deploy hooks"
2. Crie um hook para deploys manuais se necessário

## 🔄 CI/CD com GitHub Actions

O workflow está configurado em `.github/workflows/deploy.yml` e executa:

1. **Testes** - Unit tests, linting, type checking
2. **Build** - Compilação para produção
3. **Deploy** - Deploy automático no Netlify
4. **E2E Tests** - Testes end-to-end no site deployado

### Secrets Necessários no GitHub

Configure os seguintes secrets no GitHub:

```
NETLIFY_AUTH_TOKEN=your_netlify_auth_token
NETLIFY_SITE_ID=your_netlify_site_id
LHCI_GITHUB_APP_TOKEN=your_lighthouse_token (opcional)
```

## 🧪 Validação Pré-Deploy

Execute a validação completa antes do deploy:

```bash
# Validação completa
npm run test:all

# Validação final (inclui build e testes)
node scripts/final-validation.js

# Build de produção
npm run build:prod
```

## 📊 Monitoramento Pós-Deploy

### 1. Smoke Tests
Execute após cada deploy:

```bash
# Teste básico de funcionamento
SITE_URL=https://marcelonegrini.netlify.app node scripts/smoke-test.js
```

### 2. Performance Monitoring
- **Lighthouse CI** - Executa automaticamente no CI/CD
- **Core Web Vitals** - Monitorados via Google Analytics
- **Error Tracking** - Erros JavaScript são reportados automaticamente

### 3. Métricas Importantes
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Accessibility Score**: > 95%
- **SEO Score**: > 95%

## 🔍 Troubleshooting

### Build Failures

```bash
# Limpar cache e reinstalar dependências
rm -rf node_modules package-lock.json .next out
npm install
npm run build
```

### Deploy Issues

1. **Verifique os logs** no Netlify Dashboard
2. **Confirme as variáveis de ambiente** estão configuradas
3. **Teste localmente** com `npm run build:prod`
4. **Verifique o netlify.toml** está correto

### Performance Issues

```bash
# Análise do bundle
npm run build:analyze

# Lighthouse local
npm run lighthouse:local

# Teste de performance
npm run test:e2e
```

## 📁 Estrutura de Deploy

```
out/                          # Build output (static files)
├── index.html               # Homepage (English)
├── pt/
│   └── index.html          # Portuguese version
├── _next/
│   └── static/             # Static assets
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Search engine directives
├── manifest.json           # PWA manifest
└── build-report.json       # Build information
```

## 🌐 URLs e Redirects

### Estrutura de URLs
- **Homepage**: `/` (English)
- **Portuguese**: `/pt/`
- **Sitemap**: `/sitemap.xml`
- **Robots**: `/robots.txt`
- **Manifest**: `/manifest.json`

### Redirects Configurados
- Fallback para SPA routing
- Language-specific redirects
- SEO-friendly URLs

## 🔒 Segurança

### Headers de Segurança
Configurados automaticamente via `netlify.toml`:
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy`

### HTTPS
- Certificado SSL automático via Netlify
- Redirect HTTP → HTTPS
- HSTS headers

## 📈 Otimizações

### Performance
- **Static Generation** - Páginas pré-renderizadas
- **Image Optimization** - Formatos WebP/AVIF
- **Code Splitting** - Carregamento sob demanda
- **Caching** - Headers de cache otimizados

### SEO
- **Meta tags** completas
- **Structured data** (JSON-LD)
- **Sitemap XML** com hreflang
- **Open Graph** e Twitter Cards

### Accessibility
- **WCAG 2.1 AA** compliance
- **Keyboard navigation**
- **Screen reader** support
- **Focus management**

## 🚨 Checklist de Deploy

### Antes do Deploy
- [ ] Todos os testes passando
- [ ] Build de produção funcionando
- [ ] Variáveis de ambiente configuradas
- [ ] Domínio configurado (se aplicável)
- [ ] Analytics configurado (se aplicável)

### Após o Deploy
- [ ] Smoke tests executados
- [ ] Ambas as versões de idioma funcionando
- [ ] SEO files acessíveis (sitemap, robots)
- [ ] Performance metrics dentro dos targets
- [ ] Accessibility score > 95%
- [ ] Error tracking funcionando

### Monitoramento Contínuo
- [ ] Core Web Vitals monitorados
- [ ] Error rates baixas
- [ ] Uptime monitoring
- [ ] Performance regression alerts

## 📞 Suporte

Para problemas de deployment:
1. Verifique os logs do Netlify
2. Execute validação local
3. Consulte a documentação do Netlify
4. Verifique issues conhecidos no GitHub

---

**Última atualização**: Dezembro 2024
**Versão**: 1.0.0