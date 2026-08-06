export function professores(server) {
  server.get('/professores', () => {
   return 'hello word - professores'
})

  server.post('/professores', () => {
    return 'criar professor'
})

  server.put('/professores/:id', () =>{
    return 'atualizar professor'
  })

  server.delete('/professores/:id', () =>{
    return 'deletar professor'
  })
}