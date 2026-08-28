# Emotion Sense

Protótipo mobile-first inspirado na mesma estrutura visual e de navegação usada no Hydra Agro, adaptado para acompanhamento de sinais faciais e check-ins de bem-estar.

## O que já funciona

- Bottom navigation: **Início / Analisar / Histórico / Perfil**.
- Perfil com nome, e-mail, foto e preferências salvos em `localStorage`.
- Câmera frontal com `getUserMedia`.
- Integração com **MediaPipe Face Landmarker** (`@mediapipe/tasks-vision@1.0.1`) para acompanhar blendshapes faciais.
- Leitura de 10 segundos com média de sinais de sobrancelhas, olhos, boca e sorriso.
- Resultado exibido como **ativação facial estimada**, sem chamar isso de diagnóstico ou previsão de ansiedade.
- Check-in do próprio usuário para dar contexto à leitura.
- Histórico local de scans e check-ins.
- PWA básico com manifest e service worker.

## Rodar localmente

A câmera exige contexto seguro. Em desenvolvimento, `localhost` funciona.

```bash
python3 -m http.server 4173
```

Abra `http://localhost:4173` a partir da pasta do projeto.

Também pode ser hospedado diretamente como site estático no Vercel. Em produção use HTTPS para acesso à câmera.

## Como a análise funciona

O app usa o Face Landmarker para obter blendshapes. O índice mostrado combina ativações de alguns movimentos do rosto para criar um indicador visual de **atividade facial**. Ele não é um instrumento médico e não deve ser interpretado como probabilidade de crise, ansiedade ou diagnóstico.

Os frames de câmera não são adicionados ao histórico. Nesta versão, o histórico guarda somente números resumidos e o check-in escolhido pelo usuário.

## Próximos passos recomendados

1. Migrar o estado local para autenticação + banco real.
2. Criar uma linha de base individual por usuário antes de comparar padrões.
3. Validar qualquer heurística de bem-estar com profissionais da área antes de apresentar como recurso de saúde.
4. Adicionar notificações e widgets para check-ins sem precisar navegar pelo app.
5. Se virar APK com Capacitor, revisar permissões de câmera e política de privacidade.
