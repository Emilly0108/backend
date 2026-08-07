import {prisma} from "../lib/prisma.ts"
import bcrypt from 'bcrypt'

export function professores(server) {
  server.get('/professores', async (request, reply) => {
   return 'hello word - professores'
})

  server.post('/professores', async (request, reply) => {
    const {nome, email, senha, tipo} = request.body

    // Criptografa a senha antes de salvar
  const senhaCriptografada = await bcrypt.hash(senha, 10)

    const professor = await prisma.professor.create({
      data:{
        nome,
        email,
        senha: senhaCriptografada,
        tipo
      }
    })
    return reply.status(201).send(professor)
})

  server.put('/professores:id', async (request, reply)=>{
    return 'atualizar professor'
  })

  server.delete('/professores:id', async (request, reply) =>{
    return 'deletar professor'
  })
}