# Remaz Pharm Mobile

Aplicativo cliente da Remaz Pharm, feito com Expo/React Native e consumindo a
API Django do projeto `remaz-pharm-site`.

## Arquitetura

- O aplicativo nunca conecta diretamente no PostgreSQL/Supabase.
- O Django carrega o `.env`, acessa o mesmo banco do site e publica `/api/`.
- O token de login e salvo no armazenamento seguro do dispositivo.
- O app possui somente fluxos de comprador: conta, catalogo, carrinho,
  endereco, receita PDF, checkout e pedidos.

## Desenvolvimento Android

1. No backend, aplique migracoes e inicie a API:

   ```powershell
   .\.venv\Scripts\python.exe manage.py migrate
   .\.venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
   ```

2. No app, instale dependencias e configure a URL:

   ```powershell
   npm.cmd ci
   Copy-Item .env.example .env
   ```

3. Para Android Emulator, mantenha:

   ```text
   EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api
   ```

4. Execute:

   ```powershell
   npx.cmd expo start --android
   ```

Em aparelho fisico, substitua `10.0.2.2` pelo IP local da maquina que executa
o Django. Em producao, use apenas uma URL HTTPS.

## Validacao

```powershell
npm.cmd exec tsc -- --noEmit
npm.cmd run lint
npx.cmd expo export --platform android
```
