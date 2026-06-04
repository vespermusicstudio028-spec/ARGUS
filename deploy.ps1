# Script de Inicialização Automatizada - ARGUS
# Executa a limpeza de portas, inicia o servidor e abre no Brave.

$ErrorActionPreference = "SilentlyContinue"
Clear-Host

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "       INICIALIZANDO SISTEMA ARGUS           " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# 1. Definir o diretório de trabalho correto
$projectDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not $projectDir) { $projectDir = Get-Location }
Set-Location $projectDir

# 2. Encerrar processos antigos na porta 3001
Write-Host "[1/4] Verificando e liberando a porta 3001..." -ForegroundColor Yellow
$connection = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($connection) {
    $pids = $connection | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($pid in $pids) {
        if ($pid -ne 0) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host " -> Processo antigo (PID $pid) encerrado." -ForegroundColor Green
        }
    }
} else {
    Write-Host " -> Porta 3001 já está livre." -ForegroundColor Gray
}

# 3. Instalar pacotes se a pasta node_modules não existir
if (-not (Test-Path "node_modules")) {
    Write-Host "[2/4] Pasta node_modules não encontrada. Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# 4. Iniciar o servidor em uma nova janela para poder ver os logs
Write-Host "[3/4] Iniciando o servidor de desenvolvimento..." -ForegroundColor Yellow
Start-Process cmd.exe -ArgumentList "/k npm run dev" -WorkingDirectory $projectDir -WindowStyle Normal

# 5. Aguardar o servidor inicializar
Write-Host " -> Aguardando inicialização (3 segundos)..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# 6. Procurar e abrir no Brave
Write-Host "[4/4] Abrindo o projeto no Brave..." -ForegroundColor Yellow
$bravePaths = @(
    "$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe",
    "${env:ProgramFiles(x86)}\BraveSoftware\Brave-Browser\Application\brave.exe",
    "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\Application\brave.exe"
)

$opened = $false
foreach ($path in $bravePaths) {
    if (Test-Path $path) {
        Start-Process $path "http://localhost:3001"
        $opened = $true
        Write-Host " -> Projeto aberto no Brave com sucesso!" -ForegroundColor Green
        break
    }
}

if (-not $opened) {
    # Fallback para o navegador padrão caso o Brave não seja encontrado nos locais padrão
    Start-Process "http://localhost:3001"
    Write-Host " -> Brave não encontrado nos locais padrão. Aberto no navegador padrão." -ForegroundColor Yellow
}

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   ARGUS ONLINE E PRONTO PARA USO!           " -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan
