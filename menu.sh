#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Variables
VPS_IP="51.83.43.117"
DEV_PORT="3002"
DOCKER_PORT="3010"

# Fonction pour afficher le logo
show_logo() {
    clear
    echo -e "${PURPLE}"
    echo "╔════════════════════════════════════════╗"
    echo "║         TEMPORAL - MENU ADMIN          ║"
    echo "║              VPS: $VPS_IP       ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Fonction pour afficher le menu
show_menu() {
    show_logo
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}  DÉVELOPPEMENT${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "  ${YELLOW}1${NC} - Démarrer serveur dev (http://$VPS_IP:$DEV_PORT)"
    echo -e "  ${YELLOW}2${NC} - Démarrer serveur dev (clean cache .next)"
    echo -e "  ${YELLOW}3${NC} - Build du projet"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}  DOCKER${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "  ${YELLOW}4${NC} - Démarrer Docker Compose"
    echo -e "  ${YELLOW}5${NC} - Arrêter Docker Compose"
    echo -e "  ${YELLOW}6${NC} - Rebuild Docker (suppression + rebuild complet)"
    echo -e "  ${YELLOW}7${NC} - Restart Docker"
    echo -e "  ${YELLOW}8${NC} - Voir les logs Docker (live)"
    echo -e "  ${YELLOW}9${NC} - Voir les logs Docker (dernières 100 lignes)"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}  BASE DE DONNÉES${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "  ${YELLOW}10${NC} - Prisma Generate"
    echo -e "  ${YELLOW}11${NC} - Prisma DB Push"
    echo -e "  ${YELLOW}12${NC} - Prisma Migrate"
    echo -e "  ${YELLOW}13${NC} - Prisma Studio"
    echo -e "  ${YELLOW}14${NC} - Seed Database"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}  MAINTENANCE${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "  ${YELLOW}15${NC} - Nettoyer .next et node_modules"
    echo -e "  ${YELLOW}16${NC} - Nettoyer .next uniquement"
    echo -e "  ${YELLOW}17${NC} - Réinstaller node_modules"
    echo -e "  ${YELLOW}18${NC} - Voir l'utilisation disque"
    echo -e "  ${YELLOW}19${NC} - Voir les processus Node/Docker"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "${GREEN}  GIT${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "  ${YELLOW}20${NC} - Git status"
    echo -e "  ${YELLOW}21${NC} - Git pull"
    echo -e "  ${YELLOW}22${NC} - Git log (5 derniers commits)"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo -e "  ${RED}0${NC} - Quitter"
    echo -e "${CYAN}═══════════════════════════════════════════${NC}"
    echo ""
}

# Fonction pour attendre une touche
wait_key() {
    echo ""
    echo -e "${BLUE}Appuyez sur une touche pour continuer...${NC}"
    read -n 1 -s
}

# Fonction pour exécuter une commande avec affichage
run_command() {
    local cmd="$1"
    local desc="$2"
    echo -e "${GREEN}► $desc${NC}"
    echo -e "${CYAN}Commande: $cmd${NC}"
    echo ""
    eval "$cmd"
    local status=$?
    echo ""
    if [ $status -eq 0 ]; then
        echo -e "${GREEN}✓ Succès${NC}"
    else
        echo -e "${RED}✗ Erreur (code: $status)${NC}"
    fi
}

# Actions du menu
action_1() {
    show_logo
    run_command "npm run dev" "Démarrage du serveur de développement sur http://$VPS_IP:$DEV_PORT"
}

action_2() {
    show_logo
    echo -e "${YELLOW}Nettoyage du cache .next...${NC}"
    rm -rf .next
    echo -e "${GREEN}✓ Cache supprimé${NC}"
    echo ""
    run_command "npm run dev" "Démarrage du serveur de développement"
}

action_3() {
    show_logo
    run_command "npm run build" "Build du projet Next.js"
    wait_key
}

action_4() {
    show_logo
    run_command "docker compose up -d" "Démarrage de Docker Compose en mode détaché"
    echo ""
    echo -e "${GREEN}Application disponible sur: http://$VPS_IP:$DOCKER_PORT${NC}"
    wait_key
}

action_5() {
    show_logo
    run_command "docker compose down" "Arrêt de Docker Compose"
    wait_key
}

action_6() {
    show_logo
    echo -e "${RED}⚠ REBUILD COMPLET - Suppression de tous les conteneurs et images${NC}"
    echo -e "${YELLOW}Voulez-vous continuer ? (y/N)${NC}"
    read -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        run_command "docker compose down -v" "Arrêt et suppression des volumes"
        echo ""
        run_command "docker compose build --no-cache" "Rebuild sans cache"
        echo ""
        run_command "docker compose up -d" "Démarrage des conteneurs"
        echo ""
        echo -e "${GREEN}Application disponible sur: http://$VPS_IP:$DOCKER_PORT${NC}"
    else
        echo -e "${YELLOW}Opération annulée${NC}"
    fi
    wait_key
}

action_7() {
    show_logo
    run_command "docker compose restart" "Redémarrage de Docker Compose"
    wait_key
}

action_8() {
    show_logo
    echo -e "${GREEN}Affichage des logs en temps réel (Ctrl+C pour quitter)${NC}"
    echo ""
    docker compose logs -f
}

action_9() {
    show_logo
    run_command "docker compose logs --tail=100" "Affichage des 100 dernières lignes de logs"
    wait_key
}

action_10() {
    show_logo
    run_command "npm run db:generate" "Génération du client Prisma"
    wait_key
}

action_11() {
    show_logo
    run_command "npm run db:push" "Push du schéma Prisma vers la DB"
    wait_key
}

action_12() {
    show_logo
    run_command "npm run db:migrate" "Migration de la base de données"
    wait_key
}

action_13() {
    show_logo
    echo -e "${GREEN}Démarrage de Prisma Studio...${NC}"
    echo -e "${CYAN}Accessible sur: http://localhost:5555${NC}"
    npm run db:studio
}

action_14() {
    show_logo
    run_command "npm run db:seed" "Seed de la base de données"
    wait_key
}

action_15() {
    show_logo
    echo -e "${RED}⚠ Suppression de .next et node_modules${NC}"
    echo -e "${YELLOW}Voulez-vous continuer ? (y/N)${NC}"
    read -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Suppression de .next...${NC}"
        rm -rf .next
        echo -e "${YELLOW}Suppression de node_modules...${NC}"
        rm -rf node_modules
        echo -e "${GREEN}✓ Nettoyage terminé${NC}"
    else
        echo -e "${YELLOW}Opération annulée${NC}"
    fi
    wait_key
}

action_16() {
    show_logo
    echo -e "${YELLOW}Suppression de .next...${NC}"
    rm -rf .next
    echo -e "${GREEN}✓ Cache .next supprimé${NC}"
    wait_key
}

action_17() {
    show_logo
    echo -e "${YELLOW}Suppression de node_modules...${NC}"
    rm -rf node_modules
    echo ""
    run_command "npm install" "Réinstallation des dépendances"
    wait_key
}

action_18() {
    show_logo
    echo -e "${GREEN}Utilisation du disque:${NC}"
    echo ""
    df -h /
    echo ""
    echo -e "${GREEN}Taille des dossiers du projet:${NC}"
    echo ""
    du -sh .next node_modules 2>/dev/null || echo "Dossiers non trouvés"
    echo ""
    echo -e "${GREEN}Espace utilisé par Docker:${NC}"
    echo ""
    docker system df
    wait_key
}

action_19() {
    show_logo
    echo -e "${GREEN}Processus Node.js:${NC}"
    echo ""
    ps aux | grep -E "node|next" | grep -v grep || echo "Aucun processus Node.js"
    echo ""
    echo -e "${GREEN}Conteneurs Docker:${NC}"
    echo ""
    docker ps -a
    wait_key
}

action_20() {
    show_logo
    run_command "git status" "État du dépôt Git"
    wait_key
}

action_21() {
    show_logo
    run_command "git pull" "Pull des dernières modifications"
    wait_key
}

action_22() {
    show_logo
    run_command "git log --oneline -5" "5 derniers commits"
    wait_key
}

# Fonction principale
main() {
    # Vérifier si un argument est passé (mode menu 1, menu 2, etc.)
    if [ $# -eq 1 ]; then
        case $1 in
            1) action_1 ;;
            2) action_2 ;;
            3) action_3 ;;
            4) action_4 ;;
            5) action_5 ;;
            6) action_6 ;;
            7) action_7 ;;
            8) action_8 ;;
            9) action_9 ;;
            10) action_10 ;;
            11) action_11 ;;
            12) action_12 ;;
            13) action_13 ;;
            14) action_14 ;;
            15) action_15 ;;
            16) action_16 ;;
            17) action_17 ;;
            18) action_18 ;;
            19) action_19 ;;
            20) action_20 ;;
            21) action_21 ;;
            22) action_22 ;;
            0) exit 0 ;;
            *)
                echo -e "${RED}Option invalide: $1${NC}"
                echo "Usage: ./menu.sh [0-22]"
                exit 1
                ;;
        esac
    else
        # Mode interactif
        while true; do
            show_menu
            read -p "Choisissez une option: " choice
            case $choice in
                1) action_1 ;;
                2) action_2 ;;
                3) action_3 ;;
                4) action_4 ;;
                5) action_5 ;;
                6) action_6 ;;
                7) action_7 ;;
                8) action_8 ;;
                9) action_9 ;;
                10) action_10 ;;
                11) action_11 ;;
                12) action_12 ;;
                13) action_13 ;;
                14) action_14 ;;
                15) action_15 ;;
                16) action_16 ;;
                17) action_17 ;;
                18) action_18 ;;
                19) action_19 ;;
                20) action_20 ;;
                21) action_21 ;;
                22) action_22 ;;
                0)
                    echo -e "${GREEN}Au revoir!${NC}"
                    exit 0
                    ;;
                *)
                    echo -e "${RED}Option invalide${NC}"
                    wait_key
                    ;;
            esac
        done
    fi
}

# Lancer le script
main "$@"
