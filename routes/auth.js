import { prisma } from "../lib/prisma.ts"
import bcrypt from "bcrypt"
import crypto from "crypto"
import { enviarEmailRecuperacao } from "../lib/email.js"

console.log(">>> AUTH.JS FOI CARREGADO")

export function auth(server) {
    // =========================
    // Cadastro
    // =========================
    server.post('/cadastro', async(request, reply)=>{
        try{
            const {nome,email,senha} = request.body || {}

            if (!nome || !email || !senha){
                return reply.status(400).send({error: "Nome, email e senha dão obrigatórios."})
            }

            const usuarioExistente = await prisma.professor.findUnique({
                where:{
                    email
                }
            })

            if(usuarioExistente){
                return reply.status(409).send({ error: "este e-mail já está cadastrado no sistema"})
            }

            const senhaHash = await bcrypt.hash(senha, 10)

            const novoProfessor = await prisma.professor.create({
                data: {
                    nome, 
                    email,
                    senha: senhaHash,
                    tipo: "Professor"
                },
                select:{
                    id: true,
                    nome: true,
                    email: true
                }
            })

            return reply.status(201).send({
                message: "Cadastro realizado com sucesso!",
                user: novoProfessor
            })
        }catch (error){
            console.error("ERRO NO CADASTRO", error)
            return reply.status(500).send({
                error: "erro interno no servidor ao realizar cadastro"
            })
        }

    })
    // =========================
    // LOGIN
    // =========================
    server.post('/login', async (request, reply) => {

        const { email, senha } = request.body || {}

        if (!email || !senha) {
            return reply.status(400).send({
                error: "Email e senha são obrigatórios"
            })
        }

        const professor = await prisma.professor.findUnique({
            where: { email }
        })

        if (!professor) {
            return reply.status(401).send({
                error: "Email ou senha inválidos"
            })
        }

        const senhaValida = await bcrypt.compare(
            senha,
            professor.senha
        )

        if (!senhaValida) {
            return reply.status(401).send({
                error: "Email ou senha inválidos"
            })
        }

        const token = server.jwt.sign(
            {
                id: professor.id,
                email: professor.email,
                tipo: professor.tipo
            },
            {
                expiresIn: '7d'
            }
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


    // =========================
    // ESQUECI A SENHA
    // =========================
server.post('/esqueci-senha', async (request, reply) => {

    console.log(">>> 1. ROTA /esqueci-senha FOI CHAMADA")

    try {

        const { email } = request.body || {}

        console.log(">>> 2. Email recebido:", email)

        if (!email) {
            return reply.status(400).send({
                error: "Email é obrigatório"
            })
        }

        console.log(">>> 3. Buscando professor no banco...")

        const professor = await prisma.professor.findUnique({
            where: { email }
        })

        console.log(">>> 4. Professor encontrado:", professor ? professor.id : "NÃO ENCONTRADO")

        if (!professor) {
            return reply.send({
                message: "Se o email estiver cadastrado, você receberá um link para redefinir sua senha."
            })
        }

        console.log(">>> 5. Gerando token...")

        const resetToken = crypto.randomBytes(32).toString("hex")

        const resetTokenExpira = new Date(
            Date.now() + 60 * 60 * 1000
        )

        console.log(">>> 6. Token gerado")

        console.log(">>> 7. Salvando token no banco...")

        await prisma.professor.update({
            where: {
                id: professor.id
            },
            data: {
                resetToken,
                resetTokenExpira
            }
        })

        console.log(">>> 8. Token salvo no banco")

        const link = `http://127.0.0.1:5500/login/redefinir_senha.html?token=${resetToken}`

        console.log(">>> 9. Link criado:", link)

        console.log(">>> 10. Enviando email...")

        await enviarEmailRecuperacao(
            professor.email,
            link
        )

        console.log(">>> 11. Email enviado com sucesso!")

        return reply.send({
            message: "Se o email estiver cadastrado, você receberá um link para redefinir sua senha."
        })

    } catch (error) {

        console.error(">>> ERRO NA RECUPERAÇÃO DE SENHA:")
        console.error(error)

        return reply.status(500).send({
            error: "Erro interno ao solicitar recuperação de senha."
        })
    }
})

    // =========================
    // REDEFINIR SENHA
    // =========================
    server.post('/redefinir-senha', async (request, reply) => {

        const { token, novaSenha } = request.body || {}

        if (!token || !novaSenha) {
            return reply.status(400).send({
                error: "Token e nova senha são obrigatórios"
            })
        }

        // Procura o professor pelo token
        const professor = await prisma.professor.findFirst({
            where: {
                resetToken: token
            }
        })

        if (!professor) {
            return reply.status(400).send({
                error: "Token inválido ou expirado"
            })
        }

        // Verifica se o token expirou
        if (
            !professor.resetTokenExpira ||
            professor.resetTokenExpira < new Date()
        ) {
            return reply.status(400).send({
                error: "Token inválido ou expirado"
            })
        }

        // Criptografa a nova senha
        const novaSenhaHash = await bcrypt.hash(
            novaSenha,
            10
        )

        // Atualiza a senha e limpa o token
        await prisma.professor.update({
            where: {
                id: professor.id
            },
            data: {
                senha: novaSenhaHash,
                resetToken: null,
                resetTokenExpira: null
            }
        })

        return reply.send({
            message: "Senha redefinida com sucesso!"
        })
    })


    // =========================
    // ME
    // =========================
    server.get(
        "/me",
        {
            onRequest: [server.authenticate]
        },
        async (request, reply) => {

            const professorId = request.user.id

            const professor = await prisma.professor.findUnique({
                where: {
                    id: professorId
                },
                select: {
                    id: true,
                    nome: true,
                    email: true,
                    tipo: true
                }
            })

            if (!professor) {
                return reply.status(404).send({
                    message: "Professor não encontrado"
                })
            }

            return reply.send(professor)
        }
    )
}