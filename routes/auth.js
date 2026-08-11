import { prisma } from "../lib/prisma.ts"
import bcrypt from 'bcrypt'



export function auth(server){
    server.post('/login', async(request,reply) => {
        const { email, senha } = request.body || {}

        if (!email || !senha) {
            return reply.status(400).send({error: "Email e senha são obrgatórios"})
        }

        const professor = await prisma.professor.findUnique({
            where: {email}
        })

        if (!professor){
            return reply.status(401).send({error: `Email ou senha inválidos`})

        }

        const senhaValida = await bcrypt.compare(senha, professor.senha)

        if (!senhaValida){
            return reply.status(401).send({error: `Email ou senha inválidos`})

        }

        const token = server.jwt.sign(
            { id: professor.id, email: professor.email, tipo: professor.tipo },
            { expiresIn: '7d' }
        )

        return reply.send({
            token,
            professor: {
                id: professor.id,
                nome: professor.nome,
                email: professor.email,
                tipo: professor.tipo

            }
        })


    })
}