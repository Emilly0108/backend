import { professoresRoutes } from './professores.js' //importa a função que tá no arquivo professores.js
import { disciplinasRoutes } from './disciplinas.js'//importa a função que tá no disciplinas.js
import { materiaisRoutes } from './materiais.js'//importa a função que tá no arquivo materiais.js
import { favoritosRoutes } from './favoritos.js'//importa a função que tá no arquivo favoritoss.js

export async function router(server) { // vai deixar essa função seja exportável para o server e cria a função router
  server.register(professoresRoutes) // registra as rotas de professor e ativa no fastify
  server.register(disciplinasRoutes) // registra as rotas de disciplina e ativa no fastify
  server.register(materiaisRoutes) //registra as rotas de materiais e ativa no fastify
  server.register(favoritosRoutes) //registra as rotas de favoritos e ativa no fastify
}