import { SafaDevServer } from './src/DevServer.js'

const server = new SafaDevServer({
  port: 3050,
  root: './test-app',
  basePath: '/test-app',
  watch: true,
  srcDirs: ['./src'],
  watchDirs: ['./test-app/html-pages', './test-app/components'],
})

server.start()
