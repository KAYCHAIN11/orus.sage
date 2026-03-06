@echo off
REM ORUS SAGE - Essential Commands for Windows

echo.
echo ========================================
echo   ORUS SAGE - QUICK COMMANDS
echo ========================================
echo.
echo Setup:
echo   setup-project.cmd          - Criar estrutura completa
echo   pnpm install               - Instalar dependências
echo.
echo Development:
echo   pnpm dev                   - Rodar em modo desenvolvimento
echo   pnpm build                 - Build de produção
echo   pnpm test                  - Rodar testes
echo.
echo Code Quality:
echo   pnpm lint                  - Verificar lint
echo   pnpm format                - Formatar código
echo   pnpm type-check            - Verificar tipos
echo.
echo Arquivo locations:
echo   Componentes: apps\api-gateway\src\trinity-core\*
echo   Testes: apps\api-gateway\tests\*
echo   Config: tsconfig.json, .env
echo.
pause
