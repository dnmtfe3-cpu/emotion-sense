# Emotion Sense

Aplicativo mobile-first para check-ins de bem-estar e acompanhamento de sinais faciais com câmera.

## Interface

- Tipografia principal: **DM Sans** — escolhida para deixar a experiência mais calma, serena e limpa.
- Fluxo inicial: **Splash → Boas-vindas → Criar conta / Entrar → Home**.
- Navegação principal: **Início / Analisar / Histórico / Perfil**.

## O que já funciona

- Splash animada do Emotion Sense.
- Boas-vindas com entrada e criação de conta.
- Conta local de protótipo com senha armazenada como hash SHA-256 no dispositivo.
- Sessão local e botão de sair da conta.
- Perfil com nome, e-mail e foto.
- Câmera frontal com `getUserMedia`.
- MediaPipe Face Landmarker para acompanhar blendshapes faciais.
- Sense Scan de 10 segundos.
- Resultado apresentado como **ativação facial estimada**, sem diagnóstico de ansiedade ou previsão de crise.
- Check-in manual para contextualizar a leitura.
- Histórico local de scans e check-ins.
- PWA básico com service worker.

## Importante

A autenticação atual é somente para o protótipo e funciona no próprio dispositivo. Antes de publicar como produto real, deve ser substituída por autenticação e banco de dados no servidor.

O Emotion Sense não é instrumento médico. A análise facial não deve ser apresentada como diagnóstico, previsão de crise ou certeza sobre o estado emocional de alguém.
