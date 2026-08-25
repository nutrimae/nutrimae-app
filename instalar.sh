#!/usr/bin/env bash
set -euo pipefail

# instalar.sh — infra do NutriBot (Postgres + n8n + Evolution API + Redis)
#
# Uso no servidor (Hetzner):
#   scp instalar.sh root@SEU_IP:~/               # ou cole o conteúdo via Console web
#   ssh root@SEU_IP
#   chmod +x instalar.sh
#   ./instalar.sh [dominio-ou-ip]
#
# Se você não passar domínio/IP como argumento, o script tenta detectar o
# IP público do próprio servidor automaticamente.
#
# Todas as senhas/segredos (Postgres, n8n basic auth, n8n encryption key,
# Evolution API key) são GERADOS AQUI, na hora, com `openssl rand` — nunca
# ficam hardcoded neste arquivo nem em nenhum log. Depois de rodar, eles
# ficam salvos em ~/nutribot-infra/.env (permissão 600) — é ali que você
# consulta se precisar, não neste script.

INFRA_DIR="$HOME/nutribot-infra"
PUBLIC_HOST="${1:-}"

echo "==> Verificando Docker..."
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker não encontrado — instalando via get.docker.com..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
else
  echo "Docker já instalado: $(docker --version)"
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "ERRO: plugin 'docker compose' não disponível mesmo após instalar o Docker." >&2
  echo "Rode 'apt-get install -y docker-compose-plugin' e tente de novo." >&2
  exit 1
fi

if [ -z "$PUBLIC_HOST" ]; then
  echo "==> Nenhum domínio/IP informado, detectando IP público (forçando IPv4)..."
  # -4 força IPv4: em servidores com IPv6 habilitado (padrão na Hetzner),
  # sem isso o curl pode devolver o endereço IPv6, que quebra qualquer URL
  # montada com ele mais adiante (IPv6 em URL precisa de colchetes,
  # "http://HOST:porta" sem colchetes vira uma URL inválida de verdade —
  # foi exatamente isso que gerou o erro "Invalid URL" no n8n).
  PUBLIC_HOST="$(curl -4 -fsSL https://ifconfig.me || curl -4 -fsSL https://icanhazip.com || echo "")"
  if [ -z "$PUBLIC_HOST" ]; then
    echo "ERRO: não consegui detectar o IP público automaticamente." >&2
    echo "Rode de novo assim: ./instalar.sh SEU_IP_OU_DOMINIO" >&2
    exit 1
  fi
  if printf '%s' "$PUBLIC_HOST" | grep -q ':'; then
    echo "ERRO: o host detectado ('$PUBLIC_HOST') parece IPv6, não IPv4." >&2
    echo "Rode de novo informando o IPv4 manualmente: ./instalar.sh SEU_IP_V4" >&2
    exit 1
  fi
fi
echo "==> Usando host: $PUBLIC_HOST"

echo "==> Criando $INFRA_DIR ..."
mkdir -p "$INFRA_DIR"
cd "$INFRA_DIR"

if [ -f .env ]; then
  echo "==> .env já existe — mantendo o que já está lá (não sobrescrevo segredos existentes)."
else
  echo "==> Gerando segredos novos..."
  POSTGRES_PASSWORD="$(openssl rand -base64 24)"
  N8N_ENCRYPTION_KEY="$(openssl rand -base64 32)"
  N8N_BASIC_AUTH_PASSWORD="$(openssl rand -base64 18)"
  EVOLUTION_API_KEY="$(openssl rand -hex 24)"

  cat > .env <<EOF
POSTGRES_USER=nutribot
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=n8n

N8N_HOST=${PUBLIC_HOST}
N8N_PROTOCOL=http
N8N_WEBHOOK_URL=http://${PUBLIC_HOST}:5678/
N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
TIMEZONE=America/Sao_Paulo

EVOLUTION_API_KEY=${EVOLUTION_API_KEY}
EVOLUTION_DB=evolution
EVOLUTION_SERVER_URL=http://${PUBLIC_HOST}:8080
EOF
  chmod 600 .env
  echo "==> Segredos gerados e salvos em $INFRA_DIR/.env (chmod 600)."
fi

echo "==> Escrevendo docker-compose.yml ..."
cat > docker-compose.yml <<'EOF'
version: "3.8"

networks:
  nutribot-net:
    driver: bridge

volumes:
  postgres-data:
  n8n-data:
  evolution-instances:
  redis-data:

services:
  postgres:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - nutribot-net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis-data:/data
    networks:
      - nutribot-net

  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      N8N_HOST: ${N8N_HOST}
      N8N_PORT: "5678"
      N8N_PROTOCOL: ${N8N_PROTOCOL:-http}
      WEBHOOK_URL: ${N8N_WEBHOOK_URL}
      N8N_ENCRYPTION_KEY: ${N8N_ENCRYPTION_KEY}
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: "5432"
      DB_POSTGRESDB_DATABASE: ${POSTGRES_DB}
      DB_POSTGRESDB_USER: ${POSTGRES_USER}
      DB_POSTGRESDB_PASSWORD: ${POSTGRES_PASSWORD}
      N8N_BASIC_AUTH_ACTIVE: "true"
      N8N_BASIC_AUTH_USER: ${N8N_BASIC_AUTH_USER}
      N8N_BASIC_AUTH_PASSWORD: ${N8N_BASIC_AUTH_PASSWORD}
      GENERIC_TIMEZONE: ${TIMEZONE:-America/Sao_Paulo}
    ports:
      - "127.0.0.1:5678:5678"
    volumes:
      - n8n-data:/home/node/.n8n
    networks:
      - nutribot-net

  evolution-api:
    image: evoapicloud/evolution-api:v2.3.7
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      AUTHENTICATION_API_KEY: ${EVOLUTION_API_KEY}
      DATABASE_ENABLED: "true"
      DATABASE_PROVIDER: postgresql
      DATABASE_CONNECTION_URI: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${EVOLUTION_DB:-evolution}
      CACHE_REDIS_ENABLED: "true"
      CACHE_REDIS_URI: redis://redis:6379/1
      SERVER_URL: ${EVOLUTION_SERVER_URL}
    ports:
      - "127.0.0.1:8080:8080"
    volumes:
      - evolution-instances:/evolution/instances
    networks:
      - nutribot-net
EOF

echo "==> Subindo os contêineres (docker compose up -d) ..."
docker compose up -d

echo "==> Esperando o Postgres ficar pronto..."
for i in $(seq 1 30); do
  if docker compose exec -T postgres pg_isready -U nutribot -d n8n >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

echo "==> Criando o banco 'evolution' (se ainda não existir)..."
docker compose exec -T postgres psql -U nutribot -d n8n -tc \
  "SELECT 1 FROM pg_database WHERE datname = 'evolution'" | grep -q 1 \
  || docker compose exec -T postgres psql -U nutribot -d n8n -c "CREATE DATABASE evolution;"

echo "==> Reiniciando evolution-api para pegar o banco novo..."
docker compose restart evolution-api

echo ""
echo "==> Pronto. Status dos contêineres:"
docker compose ps

echo ""
echo "n8n:          http://${PUBLIC_HOST}:5678  (só acessível de dentro do servidor por enquanto — ver nota abaixo)"
echo "Evolution API: http://${PUBLIC_HOST}:8080"
echo ""
echo "As portas 5678/8080 estão publicadas só em 127.0.0.1 de propósito"
echo "(não expostas na internet sem TLS). Para acessar de fora, configure"
echo "um reverse proxy (Caddy/Nginx + Certbot) na frente."
echo ""
echo "Credenciais geradas (usuário/senha do n8n, chave da Evolution API,"
echo "senha do Postgres) estão em: $INFRA_DIR/.env"
