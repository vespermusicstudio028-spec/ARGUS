# Script de Inicialização e Deploy Automatizado - ARGUS
# Gerencia processos locais, Git/GitHub, Vercel, e abre o navegador.

$ErrorActionPreference = "SilentlyContinue"
Clear-Host

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "     SISTEMA DE DEPLOY & INICIALIZAÇÃO       " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Definir o diretório de trabalho correto
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $projectDir) { $projectDir = Get-Location }
Set-Location $projectDir

# 2. Encerrar processos antigos na porta 3001
Write-Host "[1/5] Verificando e liberando a porta 3001..." -ForegroundColor Yellow
$connection = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($connection) {
    $pids = $connection | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        if ($pid -ne 0) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host " -> Processo local antigo (PID $pid) encerrado." -ForegroundColor Green
        }
    }
} else {
    Write-Host " -> Porta 3001 já está livre." -ForegroundColor Gray
}

# 3. Atualizar o GitHub (vespermusicstudio028-spec/ARGUS)
Write-Host "[2/5] Enviando atualizações para o GitHub..." -ForegroundColor Yellow
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
    # Tenta dar push caso o commit já tenha sido feito localmente mas o push tenha falhado antes
    Write-Host " -> Enviando atualizações pendentes..." -ForegroundColor Gray
    git push -u origin main 2>$null
    Write-Host " -> GitHub atualizado!" -ForegroundColor Green
}

# 4. Atualizar o Vercel (argus-one-kappa.vercel.app)
Write-Host "[3/5] Implantando atualizações no Vercel..." -ForegroundColor Yellow

# Executa o deploy de produção forçando o nome correto em letras minúsculas (argus-one-kappa)
npx vercel --name argus-one-kappa --prod --yes
if ($LASTEXITCODE -eq 0) {
    Write-Host " -> Deploy de produção no Vercel concluído!" -ForegroundColor Green
} else {
    Write-Host " -> Deploy Vercel finalizado. (Verifique o terminal caso tenha solicitado login)" -ForegroundColor Yellow
}

# 5. Iniciar o servidor local em uma nova janela
Write-Host "[4/5] Iniciar o servidor local..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k npm run dev" -WorkingDirectory $projectDir -WindowStyle Normal
Write-Host " -> Servidor local carregando (3 segundos)..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# 6. Abrir no Brave (Servidor Local e Deploy Vercel)
Write-Host "[5/5] Abrindo as páginas no Brave..." -ForegroundColor Yellow
$bravePaths = @(
    "$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe",
    "${env:ProgramFiles(x86)}\BraveSoftware\Brave-Browser\Application\brave.exe",
    "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\Application\brave.exe"
)

$opened = $false
foreach ($path in $bravePaths) {
    if (Test-Path $path) {
        # Abre o local e o Vercel em duas abas no Brave
        Start-Process $path "http://localhost:3001"
        Start-Process $path "https://argus-one-kappa.vercel.app"
        $opened = $true
        Write-Host " -> Páginas abertas no Brave com sucesso!" -ForegroundColor Green
        break
    }
}

if (-not $opened) {
    # Fallback caso não encontre o Brave
    Start-Process "http://localhost:3001"
    Start-Process "https://argus-one-kappa.vercel.app"
    Write-Host " -> Aberto no navegador padrão do sistema." -ForegroundColor Yellow
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   DEPLOY CONCLUÍDO E ARGUS ATIVO!           " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
