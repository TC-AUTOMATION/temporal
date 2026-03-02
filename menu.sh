#!/bin/bash

# Temporal Menu
# Usage: menu (interactif) ou menu <commande>

PROJECT_DIR="/home/debian/temporal"
VPS_IP="51.83.43.117"
DEV_PORT=3002
DOCKER_PORT=3010
DB_PORT=5434

# Couleurs
R='\033[0;31m'
G='\033[0;32m'
Y='\033[1;33m'
P='\033[0;35m'
C='\033[0;36m'
W='\033[1;37m'
M='\033[0;90m'
NC='\033[0m'

DOT_UP="${G}●${NC}"
DOT_DOWN="${R}●${NC}"

# ─────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────

is_port_up() { lsof -i :"$1" -t &>/dev/null; }

docker_running() { docker compose -f "$PROJECT_DIR/docker-compose.yml" ps --status running 2>/dev/null | grep -q "temporal"; }
docker_pg_running() { docker compose -f "$PROJECT_DIR/docker-compose.yml" ps --status running 2>/dev/null | grep -q "postgres"; }

count_node_orphans() {
  ps aux | grep -E "[n]ode.*temporal|[n]ext.*temporal" | grep -v "vscode-server\|\.claude" | wc -l
}

progress_bar() {
  local pct=$1 width=18 filled
  filled=$((pct * width / 100))
  local empty=$((width - filled))
  local bar=""
  for ((i=0; i<filled; i++)); do bar+="█"; done
  for ((i=0; i<empty; i++)); do bar+="░"; done
  local color="${G}"
  [[ $pct -ge 70 ]] && color="${Y}"
  [[ $pct -ge 90 ]] && color="${R}"
  echo -e "${color}${bar}${NC} ${pct}%"
}

format_bytes() {
  local val=$1
  if [[ $val -ge 1073741824 ]]; then
    echo "$(awk "BEGIN{printf \"%.1f\", $val/1073741824}")Gi"
  elif [[ $val -ge 1048576 ]]; then
    echo "$(awk "BEGIN{printf \"%.0f\", $val/1048576}")Mi"
  else
    echo "${val}B"
  fi
}

wait_key() {
  echo ""
  echo -e "  ${M}Appuyez sur une touche...${NC}"
  read -n 1 -s
}

# ─────────────────────────────────────────
# Status
# ─────────────────────────────────────────

get_status() {
  # Dev
  if is_port_up $DEV_PORT; then
    DEV_STATUS="${DOT_UP} Dev         ${G}UP${NC}   :${DEV_PORT}"
  else
    DEV_STATUS="${DOT_DOWN} Dev         ${R}DOWN${NC}"
  fi

  # Docker (prod)
  if docker_running; then
    DOCKER_STATUS="${DOT_UP} Docker      ${G}UP${NC}   :${DOCKER_PORT}"
  elif is_port_up $DOCKER_PORT; then
    DOCKER_STATUS="${DOT_UP} Docker      ${G}UP${NC}   :${DOCKER_PORT}"
  else
    DOCKER_STATUS="${DOT_DOWN} Docker      ${R}DOWN${NC}"
  fi

  # PostgreSQL (docker)
  if is_port_up $DB_PORT || docker_pg_running; then
    PG_STATUS="${DOT_UP} PostgreSQL  ${G}UP${NC}"
  else
    PG_STATUS="${DOT_DOWN} PostgreSQL  ${R}DOWN${NC}"
  fi

  # Resources
  local mem_info
  mem_info=$(free -b | awk '/Mem:/{printf "%d %d", $3, $2}')
  local mem_used mem_total
  read -r mem_used mem_total <<< "$mem_info"
  local mem_pct=$((mem_used * 100 / mem_total))
  MEM_BAR="$(progress_bar $mem_pct)  $(format_bytes $mem_used)/$(format_bytes $mem_total)"

  local swap_info
  swap_info=$(free -b | awk '/Swap:/{printf "%d %d", $3, $2}')
  local swap_used swap_total
  read -r swap_used swap_total <<< "$swap_info"
  if [[ $swap_total -gt 0 ]]; then
    local swap_pct=$((swap_used * 100 / swap_total))
    SWAP_BAR="$(progress_bar $swap_pct)  $(format_bytes $swap_used)/$(format_bytes $swap_total)"
  else
    SWAP_BAR="${M}Pas de swap${NC}"
  fi

  local disk_info
  disk_info=$(df / | awk 'NR==2{gsub(/%/,"",$5); printf "%s %s %s", $3, $2, $5}')
  local disk_used disk_total disk_pct
  read -r disk_used disk_total disk_pct <<< "$disk_info"
  DISK_BAR="$(progress_bar $disk_pct)  $((disk_used/1024/1024))G/$((disk_total/1024/1024))G"

  NODE_ORPHANS=$(count_node_orphans)
}

# ─────────────────────────────────────────
# Display
# ─────────────────────────────────────────

show_menu() {
  clear
  get_status

  echo ""
  echo -e "  ${C}⧖ Services${NC}"
  echo -e "  ${M}┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄${NC}"
  echo -e "  ${DEV_STATUS}"
  echo -e "  ${DOCKER_STATUS}"
  echo -e "  ${PG_STATUS}"

  echo ""
  echo -e "  ${C}⧗ Ressources${NC}"
  echo -e "  ${M}┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄${NC}"
  echo -e "  RAM   ${MEM_BAR}"
  echo -e "  Swap  ${SWAP_BAR}"
  echo -e "  Disk  ${DISK_BAR}"

  if [[ $NODE_ORPHANS -gt 2 ]]; then
    echo ""
    echo -e "  ${Y}! ${NODE_ORPHANS} processus Node${NC} ${M}→ z pour nettoyer${NC}"
  fi

  echo ""
  echo -e "  ${W}╭──────────────────────────────────────╮${NC}"
  echo -e "  ${W}│${NC}  ${C}⧖${NC} ${W}Temporal${NC}                         ${W}│${NC}"
  echo -e "  ${W}╰──────────────────────────────────────╯${NC}"

  echo ""
  echo -e "  ${G}DEV${NC}  http://${VPS_IP}:${DEV_PORT}"
  echo -e "    ${Y}d)${NC}  Lancer dev            ${M}clean + start${NC}"
  echo -e "    ${Y}ds)${NC} Arrêter dev"
  echo -e "    ${Y}dl)${NC} Logs dev"

  echo ""
  echo -e "  ${G}DOCKER${NC}  :${DOCKER_PORT}"
  echo -e "    ${Y}up)${NC} Docker up"
  echo -e "    ${Y}dn)${NC} Docker down"
  echo -e "    ${Y}rb)${NC} Rebuild               ${M}no-cache${NC}"
  echo -e "    ${Y}rs)${NC} Restart"
  echo -e "    ${Y}lg)${NC} Logs"

  echo ""
  echo -e "  ${G}BASE DE DONNÉES${NC}"
  echo -e "    ${Y}mg)${NC} Prisma generate"
  echo -e "    ${Y}mm)${NC} Prisma migrate"
  echo -e "    ${Y}ms)${NC} Prisma studio           ${M}:5555${NC}"
  echo -e "    ${Y}mp)${NC} Prisma db push"
  echo -e "    ${Y}sd)${NC} Seed"

  echo ""
  echo -e "  ${G}OUTILS${NC}"
  echo -e "    ${Y}b)${NC}  Build                   ${M}next build${NC}"
  echo -e "    ${Y}c)${NC}  Vider cache              ${M}.next${NC}"
  echo -e "    ${Y}n)${NC}  npm install"
  echo -e "    ${Y}z)${NC}  Kill Node orphelins"

  echo ""
  echo -e "    ${R}q)${NC} Quitter"
  echo ""
}

# ─────────────────────────────────────────
# Actions
# ─────────────────────────────────────────

action_start() {
  if is_port_up $DEV_PORT; then
    echo -e "  ${Y}Dev déjà en cours sur :${DEV_PORT}${NC}"
    wait_key
    return
  fi
  cd "$PROJECT_DIR" || return
  echo -e "  ${Y}Nettoyage .next...${NC}"
  rm -rf .next
  echo -e "  ${G}► Démarrage Next.js...${NC}"
  nohup npm run dev > /tmp/temporal-dev.log 2>&1 &
  sleep 4
  if is_port_up $DEV_PORT; then
    echo -e "  ${G}✓ Dev démarré${NC}"
    echo -e "  ${C}http://${VPS_IP}:${DEV_PORT}${NC}"
  else
    echo -e "  ${R}✗ Échec${NC} ${M}→ dl pour voir les logs${NC}"
  fi
  wait_key
}

action_stop() {
  local pids
  pids=$(lsof -i :$DEV_PORT -t 2>/dev/null)
  if [[ -n "$pids" ]]; then
    echo "$pids" | xargs kill 2>/dev/null
    sleep 1
    echo -e "  ${G}✓ Dev arrêté${NC}"
  else
    echo -e "  ${M}Dev pas en cours${NC}"
  fi
  wait_key
}

action_logs() {
  echo -e "  ${G}Logs dev (Ctrl+C pour quitter)${NC}"
  echo ""
  tail -f /tmp/temporal-dev.log 2>/dev/null || echo -e "  ${R}Logs introuvables${NC}"
}

action_docker_up() {
  cd "$PROJECT_DIR" || return
  echo -e "  ${G}► Docker up...${NC}"
  docker compose up -d
  echo -e "  ${G}✓ OK${NC}"
  wait_key
}

action_docker_down() {
  cd "$PROJECT_DIR" || return
  echo -e "  ${Y}► Docker down...${NC}"
  docker compose down
  echo -e "  ${G}✓ OK${NC}"
  wait_key
}

action_docker_rebuild() {
  cd "$PROJECT_DIR" || return
  echo -e "  ${R}⚠ Rebuild complet${NC}"
  echo -e "  ${Y}Continuer ? (y/N)${NC}"
  read -n 1 -r; echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker compose down -v
    docker compose build --no-cache
    docker compose up -d
    echo -e "  ${G}✓ Rebuild terminé${NC}"
  else
    echo -e "  ${M}Annulé${NC}"
  fi
  wait_key
}

action_docker_restart() {
  cd "$PROJECT_DIR" || return
  docker compose restart
  echo -e "  ${G}✓ Redémarré${NC}"
  wait_key
}

action_docker_logs() {
  cd "$PROJECT_DIR" || return
  echo -e "  ${G}Logs Docker (Ctrl+C pour quitter)${NC}"
  echo ""
  docker compose logs -f
}

action_build() {
  cd "$PROJECT_DIR" || return
  echo -e "  ${G}► Build...${NC}"
  npm run build
  local s=$?
  echo ""
  if [[ $s -eq 0 ]]; then
    local size; size=$(du -sh "$PROJECT_DIR/.next" 2>/dev/null | awk '{print $1}')
    echo -e "  ${G}✓ Build OK${NC} ${M}(${size})${NC}"
  else
    echo -e "  ${R}✗ Build échoué${NC}"
  fi
  wait_key
}

action_prisma_generate() {
  cd "$PROJECT_DIR" || return
  echo -e "  ${G}► Prisma generate...${NC}"
  npx prisma generate
  wait_key
}

action_prisma_migrate() {
  cd "$PROJECT_DIR" || return
  echo -e "  ${G}► Prisma migrate dev...${NC}"
  npx prisma migrate dev
  wait_key
}

action_prisma_studio() {
  cd "$PROJECT_DIR" || return
  echo -e "  ${G}► Prisma Studio :5555${NC}"
  echo -e "  ${C}http://${VPS_IP}:5555${NC}"
  npx prisma studio
}

action_prisma_push() {
  cd "$PROJECT_DIR" || return
  echo -e "  ${G}► Prisma db push...${NC}"
  npx prisma db push
  wait_key
}

action_seed() {
  cd "$PROJECT_DIR" || return
  echo -e "  ${G}► Seed...${NC}"
  npm run db:seed
  local s=$?
  [[ $s -eq 0 ]] && echo -e "  ${G}✓ OK${NC}" || echo -e "  ${R}✗ Erreur${NC}"
  wait_key
}

action_clean() {
  rm -rf "$PROJECT_DIR/.next"
  echo -e "  ${G}✓ Cache vidé${NC}"
  wait_key
}

action_npm() {
  cd "$PROJECT_DIR" || return
  echo -e "  ${G}► npm install...${NC}"
  npm install
  echo -e "  ${G}✓ OK${NC}"
  wait_key
}

action_kill() {
  local pids
  pids=$(ps aux | grep -E "[n]ode.*temporal|[n]ext.*temporal" | grep -v "vscode-server\|\.claude" | awk '{print $2}')
  if [[ -z "$pids" ]]; then
    echo -e "  ${G}✓ Aucun orphelin${NC}"
  else
    local count; count=$(echo "$pids" | wc -l)
    echo -e "  ${Y}${count} processus. Kill ? (y/N)${NC}"
    read -n 1 -r; echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "$pids" | xargs kill 2>/dev/null
      sleep 1
      echo -e "  ${G}✓ Nettoyé${NC}"
    fi
  fi
  wait_key
}

# ─────────────────────────────────────────
# Router
# ─────────────────────────────────────────

handle_choice() {
  case "$1" in
    d)    action_start ;;
    ds)   action_stop ;;
    dl)   action_logs ;;
    up)   action_docker_up ;;
    dn)   action_docker_down ;;
    rb)   action_docker_rebuild ;;
    rs)   action_docker_restart ;;
    lg)   action_docker_logs ;;
    mg)   action_prisma_generate ;;
    mm)   action_prisma_migrate ;;
    ms)   action_prisma_studio ;;
    mp)   action_prisma_push ;;
    sd)   action_seed ;;
    b)    action_build ;;
    c)    action_clean ;;
    n)    action_npm ;;
    z)    action_kill ;;
    q|Q)  echo -e "  ${C}⧖ À bientôt !${NC}"; exit 0 ;;
    *)    echo -e "  ${R}Option inconnue: $1${NC}"; wait_key ;;
  esac
}

# ─────────────────────────────────────────
# Main
# ─────────────────────────────────────────

main() {
  cd "$PROJECT_DIR" || exit 1
  if [[ $# -ge 1 ]]; then
    handle_choice "$1"
  else
    while true; do
      show_menu
      read -rp "  ⧖ " choice
      [[ -z "$choice" ]] && continue
      handle_choice "$choice"
    done
  fi
}

main "$@"
