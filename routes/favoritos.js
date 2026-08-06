export function favoritos(server) {
  server.get('/favoritos', () => {
   return 'hello word - favoritos'
})

  server.post('/favoritos', () => {
    return 'criar professor'
})

  server.put('/favoritos/:id', () =>{
    return 'atualizar favoritos'
  })

  server.delete('/favoritos/:id', () =>{
    return 'deletar favoritos'
  })
}