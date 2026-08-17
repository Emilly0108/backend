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
      material: {
        include: {
          disciplina: true
        }
      } 
    }
  })

  return reply.send(favoritos)

})

  server.post('/favoritos', async (request, reply) => {
    const {id_material} = request.body

    const favorito = await prisma.favorito.create({
    data: {
     material: {
        connect: { id: Number(id_material) }
      }
    }
  })
   return reply.status(201).send(favorito)
  })

   server.get('/favoritos/:id', async (request, reply) => {
    const{id} = request.params

    const favorito = await prisma.favorito.findUnique({
      where:{
        id: Number(id)
      }
    })

    if(!favorito){
     return reply.status(404).send({message: "professor não encontrado"})
    }

    return reply.send(favorito)
  })
 

  server.delete('/favoritos/:id', async (request, reply) =>{
    const { id } = request.params

    await prisma.favorito.delete({
      where: { id: Number(id) }
    })

    return reply.status(204).send()
  })
}