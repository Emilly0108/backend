import {prisma} from "../lib/prisma.ts"

export function favoritos(server) {
  server.get('/favoritos', async (request, reply) => {
   const search = request.query.search

  const favoritos = await prisma.favorito.findMany({
    where: search ? {
      material: {
        titulo: { contains: search, mode: 'insensitive' }
      }
    } : undefined,
    include: {
      material: true // Traz os dados do material filtrado
    }
  })

  return reply.send(favoritos)

})

  server.post('/favoritos', async (request, reply) => {
    const {id_material} = request.body

    const favorito = await prisma.favorito.create({
    data: {
      id_material: Number(id_material), 
      data_salvo: new Date()           
    }
  })
  return reply.status(201).send(favorito)
})

  server.delete('/favoritos:id', async (request, reply) =>{
    const { id } = request.params

    await prisma.favorito.delete({
      where: { id_favorito: Number(id) }
    })

    return reply.status(204).send()
  })
}