git pull
NODE_ENV="${1:-production}" yarn run webpack
command -v pm2 && pm2 restart blog
