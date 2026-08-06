export function professores(server) {
  server.get('/professores', async (request, reply) => {
   return 'hello word - professores'
})

  server.post('/professores', async (request, reply) => {
    return 'criar professor'
})

  server.put('/professores:id', async (request, reply)=>{
    return 'atualizar professor'
  })

  server.delete('/professores:id', async (request, reply) =>{
    return 'deletar professor'
  })
}