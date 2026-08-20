# Acesso exclusivo após compra

O NutriMãe usa três camadas de proteção:

1. O login não possui cadastro e o link mágico usa `shouldCreateUser: false`.
2. Middleware e layouts privados exigem `user_products.product_id = 'nutrimae_assinatura'` com `status = 'active'` (administradores são a única exceção).
3. O webhook autenticado da Cartpanda cria/convida a conta e grava a permissão usando a service role.

## Configuração obrigatória no Supabase hospedado

No painel do projeto, acesse **Authentication → Providers → Email** e desligue **Allow new users to sign up**. Mantenha o provedor de e-mail habilitado para login.

Essa configuração impede que alguém contorne a interface e chame diretamente a API pública de cadastro. Convites administrativos feitos pelo webhook continuam sendo operações de servidor.

Também mantenha **Allow anonymous sign-ins** desligado.

## Teste de aceite

- E-mail sem compra: não cria conta pela tela nem por link mágico.
- Conta existente sem `nutrimae_assinatura: active`: é enviada para `/acesso-pendente`.
- Compra ativa: entra no app e no onboarding normalmente.
- Compra cancelada ou atrasada: perde acesso ao conteúdo, sem apagar dados.
- Administrador: mantém acesso para suporte e revisão.
