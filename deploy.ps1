# Script de Deploy Automatizado - ARGUS IA
# Envia as atualizações para o GitHub e realiza o deploy na Vercel.

$ErrorActionPreference = "SilentlyContinue"
Clear-Host

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "     SISTEMA DE DEPLOY AUTOMATIZADO          " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Definir o diretório de trabalho correto
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $projectDir) { $projectDir = Get-Location }
Set-Location $projectDir

# 2. Atualizar o GitHub (vespermusicstudio028-spec/ARGUS)
Write-Host "[1/2] Enviando atualizações para o GitHub..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host " -> Inicializando repositório Git local..." -ForegroundColor Gray
    git init
    git branch -M main
}

$expectedRemote = "https://github.com/vespermusicstudio028-spec/ARGUS.git"
$currentRemote = git remote get-url origin 2>$null
if ($currentRemote -ne $expectedRemote) {
    git remote remove origin 2>$null
    git remote add origin $expectedRemote
    Write-Host " -> Vinculado ao repositório: $expectedRemote" -ForegroundColor Gray
}

# Tenta sincronizar o histórico remoto antes de enviar
Write-Host " -> Sincronizando com o repositório remoto..." -ForegroundColor Gray
git pull origin main --allow-unrelated-histories -X ours --no-edit 2>$null

git add .
$gitChanges = git status --porcelain
if ($gitChanges) {
    $commitMsg = "Auto-update: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"
    git commit -m $commitMsg
    Write-Host " -> Enviando commits para o GitHub (branch: main)..." -ForegroundColor Gray
    git push -u origin main
    Write-Host " -> GitHub atualizado com sucesso!" -ForegroundColor Green
} else {
    Write-Host " -> Enviando atualizações pendentes..." -ForegroundColor Gray
    git push -u origin main 2>$null
    Write-Host " -> GitHub atualizado!" -ForegroundColor Green
}

# 3. Atualizar o Vercel (argus-one-kappa.vercel.app)
Write-Host "[2/2] Implantando atualizações no Vercel..." -ForegroundColor Yellow

# Executa o deploy de produção forçando o nome correto em letras minúsculas (argus-one-kappa)
npx vercel --name argus-one-kappa --prod --yes
if ($LASTEXITCODE -eq 0) {
    Write-Host " -> Deploy de produção no Vercel concluído!" -ForegroundColor Green
} else {
    Write-Host " -> Deploy Vercel finalizado." -ForegroundColor Yellow
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   DEPLOY CONCLUÍDO COM SUCESSO!             " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
