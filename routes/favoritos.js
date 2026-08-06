export function favoritos(server) {
  server.get('/favoritos', async (request, reply) => {
   return 'hello word - favoritos'
})

  server.post('/favoritos', async (request, reply) => {
    return 'criar favoritos'
})

  server.put('/favoritos:id', async (request, reply) =>{
    return 'atualizar favoritos'
  })

  server.delete('/favoritos:id', async (request, reply) =>{
    return 'deletar favoritos'
  })
}