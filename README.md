# Emotion Sense

Aplicativo mobile-first para check-ins de bem-estar e acompanhamento de sinais faciais estimados com câmera.

## Interface

- Tipografia principal: **DM Sans**.
- Fluxo inicial: **Boas-vindas → Criar conta / Entrar → Home**.
- Navegação principal: **Início / Analisar / Histórico / Perfil**.
- Identidade oficial roxa/lavanda com a logo Emotion Sense.

## O que já funciona

- Cadastro e login com Supabase Auth.
- Perfil e registros sincronizados no Supabase com RLS.
- Onboarding com objetivo, frequência de check-ins e consentimento da câmera.
- Câmera frontal com `getUserMedia`.
- MediaPipe Face Landmarker para acompanhar sinais faciais.
- Sense Scan de 10 segundos.
- Resultado apresentado como **ativação facial estimada**, sem diagnóstico ou certeza sobre emoções.
- Check-in manual para contextualizar a leitura.
- Histórico de scans e check-ins.
- PWA com favicon, Apple Touch Icon e atalhos.

## Android com Capacitor

O projeto usa **Capacitor 8.5** para gerar a versão Android.

- App ID: `com.dnmtfe3.emotionsense`
- Nome: `Emotion Sense`
- Permissão `CAMERA` adicionada para o Sense Scan.
- O pedido de câmera acontece quando o usuário ativa a análise.
- Ícone Android usa a identidade oficial do Emotion Sense.
- Sem splash customizada do app.

### Build local

```bash
npm install
npm run build
npx cap add android
node scripts/configure-android.mjs
npx cap sync android
npm run android:debug
```

O APK debug fica em:

`android/app/build/outputs/apk/debug/app-debug.apk`

## Build automático

O workflow `.github/workflows/android-apk.yml` gera um APK instalável a cada push na `main` e também pode ser executado manualmente. O artifact é publicado com o nome **EmotionSense-Android-APK**.

## Importante

O Emotion Sense é voltado a autoconsciência e acompanhamento de padrões. A análise facial é aproximada e não deve ser apresentada como diagnóstico médico, previsão de crise ou certeza sobre o estado emocional de alguém.
